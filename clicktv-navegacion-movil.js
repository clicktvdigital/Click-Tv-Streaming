/* CLICK TV STREAMING · Navegación del menú móvil y búsqueda maestra · 18/11/2026
   - Un solo manejador para los enlaces del menú y de categorías: cierra el menú, aplica el filtro
     real del catálogo y, ya pintado el catálogo, hace scroll suave al destino.
   - Búsqueda en tiempo real (catálogo, planes y secciones de ayuda) dentro del menú sándwich.
   - Ahorro de batería: pausa los adornos animados cuando la pestaña no está visible. */
(() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // Búsqueda: funciones puras (se prueban en tests/menu-busqueda.test.mjs)
  // ---------------------------------------------------------------------------
  const CATEGORIAS = {
    streaming: 'Streaming', iptv: 'IPTV · TV por internet', musica: 'Música', apps: 'Premium Apps',
    proneet: 'ProNeet VPN', recargas: 'Recargas y combos', deportes: 'Deportes'
  };

  const SECCIONES = [
    { destino: '#clicktv-atencion', titulo: 'Renovar o pedir soporte', icono: '🔁', claves: 'renovar renovacion soporte ayuda problema cuenta caida activar' },
    { destino: '#clicktv-pagos-faciles', titulo: 'Cómo pagar', icono: '🏦', claves: 'pagar pago pagos deuna payphone paypal binance transferencia banco pichincha guayaquil deposito qr' },
    { destino: '#como-comprar', titulo: 'Cómo comprar', icono: '🛒', claves: 'comprar compra pasos pedido carrito' },
    { destino: '#ayuda', titulo: 'Preguntas frecuentes', icono: '❓', claves: 'preguntas frecuentes faq dudas garantia' },
    { destino: '#contacto', titulo: 'Contacto', icono: '💬', claves: 'contacto whatsapp telegram signal escribir mensaje asesor' },
    { destino: '#promos', titulo: 'Promociones', icono: '🔥', claves: 'promociones promo ofertas descuento black days cupon' },
    { destino: '#mundial', titulo: 'Partidos en vivo', icono: '⚽', claves: 'partidos futbol calendario mundial liga en vivo' },
    { destino: '#calculadora-ahorro', titulo: 'Armar combo y calcular ahorro', icono: '🧩', claves: 'combo calculadora ahorro simulador' },
    { destino: '#resenas', titulo: 'Reseñas de clientes', icono: '⭐', claves: 'resenas opiniones comentarios clientes' },
    { destino: '#radio-app', titulo: 'Radio en vivo', icono: '📻', claves: 'radio la red emisora escuchar' }
  ];

  function normalizar(texto) {
    return String(texto ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\+/g, ' plus ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function precioDesde(producto) {
    const precios = (producto.planes || [])
      .filter((plan) => !plan.consultar && Number.isFinite(Number(plan.precio)) && Number(plan.precio) > 0)
      .map((plan) => Number(plan.precio));
    return precios.length ? Math.min(...precios) : null;
  }

  function crearIndice(productos = [], secciones = SECCIONES) {
    const indice = [];
    for (const [categoria, nombre] of Object.entries(CATEGORIAS)) {
      indice.push({ tipo: 'categoria', id: categoria, categoria, titulo: nombre, icono: '🗂️',
        detalle: 'Ver todos los planes de la categoría', nombreNorm: normalizar(nombre), texto: normalizar(`${nombre} ${categoria}`) });
    }
    for (const p of productos) {
      if (!p || !p.id) continue;
      const desde = precioDesde(p);
      const planes = (p.planes || []).length;
      const detalle = [CATEGORIAS[p.categoria] || 'Catálogo',
        desde !== null ? `desde $${desde.toFixed(2)} USD` : 'precio por consultar',
        `${planes} ${planes === 1 ? 'plan' : 'planes'}`].join(' · ');
      indice.push({
        tipo: 'producto', id: p.id, categoria: p.categoria || 'todos', titulo: p.nombre || p.id, icono: p.icono || '📺', detalle,
        nombreNorm: normalizar(p.nombre),
        texto: normalizar([p.nombre, p.id, p.descripcion, CATEGORIAS[p.categoria], p.categoria,
          ...(p.etiquetas || []), ...(p.planes || []).map((plan) => plan.tipo)].join(' '))
      });
    }
    for (const s of secciones) {
      indice.push({ tipo: 'seccion', id: s.destino, destino: s.destino, titulo: s.titulo, icono: s.icono,
        detalle: 'Ir a la sección', nombreNorm: normalizar(s.titulo), texto: normalizar(`${s.titulo} ${s.claves}`) });
    }
    return indice;
  }

  // Cada palabra de la consulta debe aparecer (como inicio de palabra o dentro del texto).
  function puntuar(entrada, palabras, consulta) {
    let total = 0;
    const palabrasTexto = entrada.texto.split(' ');
    const palabrasNombre = entrada.nombreNorm.split(' ');
    for (const palabra of palabras) {
      if (palabrasNombre.some((w) => w.startsWith(palabra))) total += 6;
      else if (palabrasTexto.some((w) => w.startsWith(palabra))) total += 3;
      else if (entrada.texto.includes(palabra)) total += 1;
      else return 0;
    }
    if (entrada.nombreNorm === consulta) total += 20;
    else if (entrada.nombreNorm.startsWith(consulta)) total += 10;
    if (entrada.tipo === 'producto') total += 0.5;
    return total;
  }

  function buscar(indice, consulta, limite = 8) {
    const q = normalizar(consulta);
    if (!q) return [];
    const palabras = q.split(' ').filter(Boolean);
    return indice
      .map((entrada, orden) => ({ entrada, orden, puntos: puntuar(entrada, palabras, q) }))
      .filter((r) => r.puntos > 0)
      .sort((a, b) => b.puntos - a.puntos || a.orden - b.orden)
      .slice(0, limite)
      .map((r) => r.entrada);
  }

  window.ctvBusqueda = { normalizar, crearIndice, buscar, precioDesde, CATEGORIAS, SECCIONES };

  if (typeof document === 'undefined' || !document.addEventListener) return;

  // ---------------------------------------------------------------------------
  // Navegación
  // ---------------------------------------------------------------------------
  const reducirMovimiento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const ANCLAS_CATEGORIA = { '#iptv': 'iptv', '#musica': 'musica', '#apps': 'apps' };

  function cerrarMenu() {
    if (typeof window.cerrarMenuMovil === 'function') window.cerrarMenuMovil();
  }

  // Espera a que el catálogo se pinte y el bloqueo de scroll del menú se libere.
  function despuesDelPintado(fn) {
    requestAnimationFrame(() => requestAnimationFrame(fn));
  }

  function enfocarSinScroll(el) {
    if (!el) return;
    if (!el.matches('a[href],button,input,select,textarea,[tabindex]')) el.setAttribute('tabindex', '-1');
    try { el.focus({ preventScroll: true }); } catch { /* navegadores antiguos */ }
  }

  function desplazarA(el, bloque = 'start') {
    if (!el) return;
    el.scrollIntoView({ behavior: reducirMovimiento() ? 'auto' : 'smooth', block: bloque });
  }

  function centrarFiltroActivo(categoria) {
    const fila = document.querySelector('#streaming .filter-tabs');
    const boton = fila?.querySelector(`.filter-btn[data-categoria="${categoria}"]`);
    if (!fila || !boton) return;
    const izquierda = boton.offsetLeft - (fila.clientWidth - boton.offsetWidth) / 2;
    fila.scrollTo({ left: Math.max(0, izquierda), behavior: 'auto' });
  }

  function irACategoria(categoria, { enfocar = true } = {}) {
    cerrarMenu();
    if (typeof window.seleccionarCategoriaCatalogo === 'function') window.seleccionarCategoriaCatalogo(categoria);
    despuesDelPintado(() => {
      centrarFiltroActivo(categoria);
      const fila = document.querySelector('#streaming .filter-tabs') || document.getElementById('streaming');
      desplazarA(fila);
      if (enfocar) enfocarSinScroll(document.querySelector(`#streaming .filter-btn[data-categoria="${categoria}"]`) || fila);
    });
  }

  function irAProducto(id, categoria) {
    cerrarMenu();
    if (typeof window.seleccionarCategoriaCatalogo === 'function') window.seleccionarCategoriaCatalogo(categoria || 'todos');
    despuesDelPintado(() => {
      centrarFiltroActivo(categoria || 'todos');
      const tarjeta = document.querySelector(`#catalogo-grid [data-producto="${CSS.escape(id)}"]`);
      if (!tarjeta) { desplazarA(document.getElementById('streaming')); return; }
      const planes = tarjeta.querySelector('details.product-plans-wrap');
      if (planes && !planes.open) planes.open = true;
      desplazarA(tarjeta, 'start');
      tarjeta.classList.add('product-card--highlight');
      setTimeout(() => tarjeta.classList.remove('product-card--highlight'), 2200);
      enfocarSinScroll(tarjeta.querySelector('h3') || tarjeta);
    });
  }

  function irASeccion(selector) {
    const destino = document.querySelector(selector);
    cerrarMenu();
    if (!destino) return;
    window.ctvAcordeones?.abrir(destino); // p. ej. la radio vive en un desplegable
    despuesDelPintado(() => { desplazarA(destino); enfocarSinScroll(destino); });
    try { history.replaceState(history.state, '', selector); } catch { /* sin history */ }
  }

  // Disponible para el asistente y otros accesos rápidos.
  window.ctvNavegacion = { irACategoria, irAProducto, irASeccion };

  document.addEventListener('click', (evento) => {
    if (evento.defaultPrevented || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
    const enlace = evento.target.closest?.('a[data-ir-categoria], a[data-ctv-category], #nav-menu a.nav-link[href^="#"]');
    if (!enlace) return;
    const categoria = enlace.dataset.irCategoria || enlace.dataset.ctvCategory || ANCLAS_CATEGORIA[enlace.getAttribute('href')];
    evento.preventDefault();
    if (categoria) irACategoria(categoria);
    else irASeccion(enlace.getAttribute('href'));
  });

  // Mantiene compatibles los enlaces antiguos compartidos: /#iptv, /#musica, /#apps.
  // También abre la categoría desde ?categoria=iptv (URLs del sitemap), sin pisar ?producto=.
  function aplicarHashInicial() {
    const params = new URLSearchParams(location.search);
    const desdeParametro = params.has('producto') ? null : params.get('categoria');
    const categoria = (desdeParametro && desdeParametro in CATEGORIAS ? desdeParametro : null) || ANCLAS_CATEGORIA[location.hash];
    if (categoria) irACategoria(categoria, { enfocar: false });
  }

  // Tarjetas del catálogo: en celular, una tarjeta abierta o con Black Days ocupa las 2 columnas.
  function marcarTarjetas() {
    document.querySelectorAll('#catalogo-grid .product-card').forEach((tarjeta) => {
      const planes = tarjeta.querySelector('details.product-plans-wrap');
      tarjeta.classList.toggle('product-card--abierta', !!planes?.open);
      tarjeta.classList.toggle('product-card--ancha', !!tarjeta.querySelector('.ctv-bd'));
    });
  }
  // Acordeón de precios: en listas de más de 5 planes se ven 4 y el resto se despliega con un botón.
  // Las tarjetas con filtros de dispositivos/meses (IPTV) ya muestran un solo plan: no se pliegan.
  const PLANES_VISIBLES = 4;
  function plegarPlanes() {
    document.querySelectorAll('#catalogo-grid .product-plans').forEach((lista) => {
      if (lista.dataset.plegado) return;
      const filas = lista.querySelectorAll(':scope > .product-plan');
      const conFiltros = !!lista.parentElement?.querySelector(':scope > .clicktv-plan-filters');
      if (conFiltros || filas.length <= PLANES_VISIBLES + 1) return;
      lista.dataset.plegado = '1';
      lista.classList.add('product-plans--plegada');
      const ocultos = filas.length - PLANES_VISIBLES;
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'planes-toggle';
      boton.setAttribute('aria-expanded', 'false');
      const pintar = () => {
        const abierto = !lista.classList.contains('product-plans--plegada');
        boton.setAttribute('aria-expanded', String(abierto));
        boton.textContent = abierto ? 'Ver menos precios ▴' : `Ver ${ocultos} ${ocultos === 1 ? 'precio más' : 'precios más'} ▾`;
      };
      boton.addEventListener('click', () => { lista.classList.toggle('product-plans--plegada'); pintar(); });
      pintar();
      lista.after(boton);
    });
  }
  const plegarDespuesDeFiltros = () => requestAnimationFrame(() => requestAnimationFrame(plegarPlanes));

  document.addEventListener('toggle', (evento) => {
    const planes = evento.target;
    if (planes?.matches?.('details.product-plans-wrap')) {
      planes.closest('.product-card')?.classList.toggle('product-card--abierta', planes.open);
    }
  }, true);

  // ---------------------------------------------------------------------------
  // Búsqueda maestra dentro del menú
  // ---------------------------------------------------------------------------
  function iniciarBusquedaMenu() {
    const input = document.getElementById('nav-busqueda-input');
    const limpiar = document.getElementById('nav-busqueda-limpiar');
    const lista = document.getElementById('nav-busqueda-resultados');
    const estado = document.getElementById('nav-busqueda-estado');
    if (!input || !lista || !estado) return;

    let indice = null;
    let espera = 0;
    const obtenerIndice = () => (indice ||= crearIndice(typeof PRODUCTOS !== 'undefined' ? PRODUCTOS : []));

    function pintar() {
      const consulta = input.value;
      if (limpiar) limpiar.hidden = !consulta;
      lista.textContent = '';
      if (!normalizar(consulta)) { estado.textContent = ''; lista.hidden = true; return; }
      const resultados = buscar(obtenerIndice(), consulta, 8);
      lista.hidden = false;
      if (!resultados.length) {
        estado.textContent = 'Sin resultados.';
        const li = document.createElement('li');
        li.className = 'nav-busqueda__vacio';
        const a = document.createElement('a');
        a.href = `https://wa.me/593939166222?text=${encodeURIComponent(`👋 Hola Click TV Streaming. Busco: ${consulta.slice(0, 80)}`)}`;
        a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.textContent = '💬 No lo encontré: preguntar por WhatsApp';
        li.append('No hay coincidencias. ', a);
        lista.append(li);
        return;
      }
      estado.textContent = `${resultados.length} ${resultados.length === 1 ? 'resultado' : 'resultados'}.`;
      const fragmento = document.createDocumentFragment();
      for (const r of resultados) {
        const li = document.createElement('li');
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'nav-busqueda__item';
        boton.dataset.tipo = r.tipo;
        boton.dataset.id = r.id;
        if (r.categoria) boton.dataset.categoria = r.categoria;
        const icono = document.createElement('span');
        icono.className = 'nav-busqueda__icono'; icono.setAttribute('aria-hidden', 'true'); icono.textContent = r.icono;
        const textos = document.createElement('span');
        textos.className = 'nav-busqueda__textos';
        const titulo = document.createElement('strong'); titulo.textContent = r.titulo;
        const detalle = document.createElement('small'); detalle.textContent = r.detalle;
        textos.append(titulo, detalle);
        boton.append(icono, textos);
        li.append(boton);
        fragmento.append(li);
      }
      lista.append(fragmento);
    }

    input.addEventListener('input', () => { clearTimeout(espera); espera = setTimeout(pintar, 80); });
    input.addEventListener('keydown', (evento) => {
      if (evento.key === 'Enter') {
        evento.preventDefault();
        clearTimeout(espera); pintar();
        lista.querySelector('.nav-busqueda__item')?.click();
      } else if (evento.key === 'Escape' && input.value) {
        evento.stopPropagation();
        input.value = ''; pintar();
      } else if (evento.key === 'ArrowDown') {
        const primero = lista.querySelector('.nav-busqueda__item');
        if (primero) { evento.preventDefault(); primero.focus(); }
      }
    });
    lista.addEventListener('keydown', (evento) => {
      if (!['ArrowDown', 'ArrowUp'].includes(evento.key)) return;
      const items = [...lista.querySelectorAll('.nav-busqueda__item')];
      const i = items.indexOf(document.activeElement);
      if (i < 0) return;
      evento.preventDefault();
      const siguiente = evento.key === 'ArrowDown' ? items[i + 1] : (items[i - 1] || input);
      siguiente?.focus();
    });
    limpiar?.addEventListener('click', () => { input.value = ''; pintar(); input.focus(); });
    lista.addEventListener('click', (evento) => {
      const boton = evento.target.closest('.nav-busqueda__item');
      if (!boton) return;
      if (boton.dataset.tipo === 'producto') irAProducto(boton.dataset.id, boton.dataset.categoria);
      else if (boton.dataset.tipo === 'categoria') irACategoria(boton.dataset.categoria);
      else irASeccion(boton.dataset.id);
    });
  }

  // ---------------------------------------------------------------------------
  // Ahorro de batería: adornos en pausa cuando la pestaña no se ve
  // ---------------------------------------------------------------------------
  function marcarVisibilidad() {
    document.documentElement.classList.toggle('pestana-oculta', document.hidden);
  }
  document.addEventListener('visibilitychange', marcarVisibilidad);

  // Portada: cada acceso de categoría muestra cuántos servicios tiene (dato real del catálogo).
  function contarCategorias() {
    const catalogo = typeof PRODUCTOS !== 'undefined' && Array.isArray(PRODUCTOS) ? PRODUCTOS : [];
    if (!catalogo.length) return;
    document.querySelectorAll('.home-categorias__btn[data-ir-categoria]').forEach((enlace) => {
      if (enlace.querySelector('.home-categorias__total')) return;
      const categoria = enlace.dataset.irCategoria;
      const total = categoria === 'todos' ? catalogo.length : catalogo.filter((p) => p.categoria === categoria).length;
      if (!total) return;
      const etiqueta = document.createElement('small');
      etiqueta.className = 'home-categorias__total';
      etiqueta.textContent = `${total} ${total === 1 ? 'servicio' : 'servicios'}`;
      enlace.append(etiqueta);
    });
  }

  function iniciar() {
    marcarVisibilidad();
    contarCategorias();
    iniciarBusquedaMenu();
    marcarTarjetas();
    const grid = document.getElementById('catalogo-grid');
    if (grid && 'MutationObserver' in window) new MutationObserver(() => { marcarTarjetas(); plegarDespuesDeFiltros(); }).observe(grid, { childList: true });
    plegarDespuesDeFiltros();
    aplicarHashInicial();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
})();
