// Capturas de revisión visual (CI): cada sección de la tienda en Android 360 px y escritorio 1280 px,
// más un informe de desbordes horizontales. Se suben como artefacto «capturas-visuales» del workflow.
// Uso: node tests/capturas-visuales.mjs [carpeta-salida]   (por defecto ./capturas)
import http from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SALIDA = process.argv[2] || join(ROOT, 'capturas');
const TIPOS = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml' };

const servidor = http.createServer(async (req, res) => {
  const ruta = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  try {
    const archivo = join(ROOT, ruta === '/' || ruta === '\\' ? 'index.html' : ruta);
    res.writeHead(200, { 'Content-Type': TIPOS[extname(archivo)] || 'application/octet-stream' });
    res.end(await readFile(archivo));
  } catch {
    res.writeHead(404).end('no encontrado');
  }
});
await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${servidor.address().port}/index.html`;
const ejecutable = process.env.CHROMIUM_PATH;
const navegador = await chromium.launch(ejecutable ? { executablePath: ejecutable, args: ['--no-sandbox'] } : {});
await mkdir(SALIDA, { recursive: true });

// Partidos de muestra con nombres largos reales para revisar la legibilidad.
const PARTIDOS = [
  ['Independiente del Valle', 'Liga Deportiva Universitaria de Quito', 'Estadio Banco Guayaquil'],
  ['Barcelona SC', 'Universidad Católica', 'Estadio Monumental Isidro Romero Carbo'],
  ['Ecuador', 'Argentina', ''],
  ['Deportivo Cuenca', 'Emelec', 'Estadio Alejandro Serrano Aguilar']
];

const SECCIONES = [
  ['01-cabecera-hero', 'header.header'],
  ['02-hero', '.hero'],
  ['03-explora', '#clicktv-explora'],
  ['04-player-radio-tv', '.ctvc-utilities'],
  ['05-como-comprar', '#como-comprar'],
  ['06-catalogo', '#streaming'],
  ['07-partidos', '#mundial'],
  ['08-black-days', '#promos'],
  ['09-atencion', '#clicktv-atencion'],
  ['10-pagos', '#clicktv-pagos-faciles'],
  ['11-ayuda', '#ayuda'],
  ['12-contacto', '#contacto'],
  ['13-resenas', '#resenas'],
  ['14-calculadora', '#calculadora-ahorro'],
  ['15-pie', 'footer.footer']
];

const informe = {};
for (const [nombre, vista] of [['android-360', { width: 360, height: 780 }], ['escritorio-1280', { width: 1280, height: 800 }]]) {
  const movil = vista.width < 600;
  const pagina = await navegador.newPage({ viewport: vista, isMobile: movil, hasTouch: movil, deviceScaleFactor: movil ? 2 : 1 });
  await pagina.clock.setFixedTime(new Date('2026-11-18T15:00:00-05:00')); // dentro de Black Days
  await pagina.emulateMedia({ reducedMotion: 'reduce' });
  await pagina.route(/\/api\/(resenas|partidos)/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"resenas":[],"matches":[],"ligas":[]}' }));
  await pagina.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await pagina.goto(base, { waitUntil: 'load' });
  await pagina.waitForTimeout(1200);
  await pagina.evaluate((datos) => {
    const base = normalizarPartidosLocales(MUNDIAL_2026)[0];
    const partidos = datos.map(([local, visitante, sede], i) => ({
      ...base, local, visitante, sede, codigoLocal: '', codigoVisitante: '', escudoLocal: '', escudoVisitante: '',
      fechaUTC: new Date(Date.parse('2026-11-19T01:00:00Z') + i * 7200000).toISOString()
    }));
    if (typeof crearBloquePartidos === 'function') {
      pintarMundial(document.getElementById('mundial-grid'), crearBloquePartidos('📅 Próximos partidos', partidos));
    }
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible', 'visible', 'revealed'));
  }, PARTIDOS);

  for (const [archivo, selector] of SECCIONES) {
    const el = pagina.locator(selector).first();
    if (!(await el.count())) continue;
    await el.scrollIntoViewIfNeeded();
    await pagina.waitForTimeout(250);
    await el.screenshot({ path: join(SALIDA, `${nombre}-${archivo}.png`), animations: 'disabled' }).catch((e) => console.warn(archivo, e.message));
  }

  // Carrito abierto con un producto.
  await pagina.evaluate(() => window.scrollTo(0, 0));
  const agregar = pagina.locator('#catalogo-grid [data-producto] button:has-text("Añadir")').first();
  if (await agregar.count()) await agregar.click().catch(() => {});
  if (!(await pagina.evaluate(() => document.body.classList.contains('cart-open')))) await pagina.click('#btn-abrir-carrito').catch(() => {});
  await pagina.waitForTimeout(400);
  await pagina.screenshot({ path: join(SALIDA, `${nombre}-16-carrito.png`) });
  await pagina.keyboard.press('Escape').catch(() => {});

  // Desbordes: elementos visibles cuyo borde derecho sale de la pantalla (excluye lo fijo y lo oculto a propósito).
  informe[nombre] = await pagina.evaluate(() => {
    const ancho = document.documentElement.clientWidth;
    const fuera = [];
    for (const el of document.querySelectorAll('main *, footer *, header *')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.position === 'fixed') continue;
      if (el.closest('[hidden], details:not([open]) > :not(summary), .nav-menu, .resenas-slider, .catalogo-grid--carrusel')) continue;
      if (r.right > ancho + 1 || r.left < -1) {
        let ruta = el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + (el.classList.length ? `.${[...el.classList].slice(0, 2).join('.')}` : '');
        fuera.push(`${ruta} → [${Math.round(r.left)}, ${Math.round(r.right)}] (ancho ${ancho})`);
      }
    }
    return { scrollWidth: document.documentElement.scrollWidth, ancho, fuera: fuera.slice(0, 60) };
  });
  await pagina.close();
}

await writeFile(join(SALIDA, 'desbordes.json'), JSON.stringify(informe, null, 2));
console.log(JSON.stringify(informe, null, 2));
await navegador.close();
servidor.closeAllConnections?.();
servidor.close();
