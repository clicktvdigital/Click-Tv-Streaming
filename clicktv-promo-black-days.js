/* CLICK TV STREAMING · Promoción Black Days (del 15 al 20 de noviembre de 2026, hora de Ecuador).
   Meses gratis para 1, 2 o 3 dispositivos, calculados solo con los precios públicos del catálogo.
   Aplica EXCLUSIVAMENTE a IPTV Básico, IPTV Premium e IPTV Ultra. Flujo TV, Stella TV, GXTV y el resto
   de servicios de TV/IPTV quedan fuera y mantienen solo sus planes normales.
   Regla de precio (opción A aprobada):
   - Cobro: precio público del plan de N meses pagados; si no existe ese plan (2 meses), N × precio de 1 mes.
   - Ahorro: precio público del plan de la duración activada (3, 6 o 12 meses) menos el cobro.
   No se acumula con cupones. La activación sigue siendo manual tras verificar el pago. */
(function (raiz) {
  'use strict';

  // Ecuador continental usa UTC-5 todo el año (sin horario de verano).
  const INICIO = Date.UTC(2026, 10, 15, 5, 0, 0); // 15/11/2026 00:00 en Ecuador
  const FIN = Date.UTC(2026, 10, 21, 5, 0, 0);    // 21/11/2026 00:00 en Ecuador (fin exclusivo)
  const DISPOSITIVOS = [1, 2, 3];
  const PROMOS = [
    { id: 'bd-paga2', corto: 'Promo Especial', nombre: 'Promo Especial: Paga 2 meses y recibe 1 mes gratis', pagados: 2, gratis: 1 },
    { id: 'bd-paga3', corto: 'Más Beneficio', nombre: 'Más Beneficio: Paga 3 meses y recibe 3 meses gratis', pagados: 3, gratis: 3 },
    { id: 'bd-paga6', corto: 'Black Days', nombre: 'Black Days: Paga 6 meses y recibe 6 meses gratis', pagados: 6, gratis: 6 }
  ];
  // Lista blanca: ningún otro producto muestra el selector ni puede llegar al carrito con la promo.
  const PRODUCTOS_PROMO = Object.freeze(['iptv-basico', 'iptv-premium', 'iptv-ultra']);
  const PATRON_PLAN = /^([1-3]) dispositivos? · (\d+) mes(?:es)?$/;

  const redondear = (n) => Math.round(Number(n) * 100) / 100;
  const meses = (n) => `${n} ${n === 1 ? 'mes' : 'meses'}`;
  const dispositivosTexto = (n) => `${n} ${n === 1 ? 'dispositivo' : 'dispositivos'}`;
  const escapar = (t = '') => String(t).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  const precio = (n) => (typeof raiz.formatearPrecio === 'function' ? raiz.formatearPrecio(n) : `$${Number(n).toFixed(2)} USD`);
  const productos = () => (typeof PRODUCTOS !== 'undefined' && Array.isArray(PRODUCTOS) ? PRODUCTOS : []);

  function estaActiva(ahora = Date.now()) {
    const t = Number(ahora instanceof Date ? ahora.getTime() : ahora);
    return t >= INICIO && t < FIN;
  }

  // { dispositivos: { meses: precio } } a partir de planes como "2 dispositivos · 3 meses".
  function tablaPrecios(producto) {
    const tabla = {};
    for (const plan of producto?.planes || []) {
      if (plan.consultar) continue;
      const m = PATRON_PLAN.exec(String(plan.tipo || '').trim());
      const valor = Number(plan.precio);
      if (!m || !(valor > 0)) continue;
      (tabla[m[1]] ||= {})[m[2]] = valor;
    }
    return tabla;
  }

  function esElegible(producto) {
    if (!PRODUCTOS_PROMO.includes(producto?.id) || producto?.categoria !== 'iptv') return false;
    const tabla = tablaPrecios(producto);
    return DISPOSITIVOS.every((d) => tabla[d]?.[1] > 0);
  }

  const precioPorMeses = (fila, n) => (fila[n] > 0 ? fila[n] : fila[1] * n);

  function calcular(producto, dispositivos, promoId) {
    const promo = PROMOS.find((p) => p.id === promoId);
    const d = Number(dispositivos);
    if (!promo || !DISPOSITIVOS.includes(d) || !esElegible(producto)) return null;
    const fila = tablaPrecios(producto)[d];
    const activados = promo.pagados + promo.gratis;
    const cobro = redondear(precioPorMeses(fila, promo.pagados));
    const referencia = redondear(precioPorMeses(fila, activados));
    const ahorro = redondear(referencia - cobro);
    if (!(cobro > 0) || !(ahorro > 0)) return null;
    return {
      promoId: promo.id,
      corto: promo.corto,
      nombre: promo.nombre,
      dispositivos: d,
      mesesPagados: promo.pagados,
      mesesGratis: promo.gratis,
      mesesActivados: activados,
      precio: cobro,
      precioReferencia: referencia,
      ahorro,
      tipo: `Black Days · ${dispositivosTexto(d)} · Paga ${meses(promo.pagados)} + ${promo.gratis} gratis (${activados} meses)`
    };
  }

  // Plan listo para agregarAlCarrito(). null si la promoción no está vigente o no aplica.
  function planParaCarrito(producto, dispositivos, promoId, ahora = Date.now()) {
    if (!estaActiva(ahora)) return null;
    const c = calcular(producto, dispositivos, promoId);
    if (!c) return null;
    return {
      tipo: c.tipo,
      precio: c.precio,
      dispositivos: c.dispositivos,
      ivaIncluido: true,
      bloquearDescuento: true,
      promo: {
        promoId: c.promoId,
        nombre: c.nombre,
        dispositivos: c.dispositivos,
        mesesPagados: c.mesesPagados,
        mesesGratis: c.mesesGratis,
        mesesActivados: c.mesesActivados,
        precioReferencia: c.precioReferencia,
        ahorro: c.ahorro
      }
    };
  }

  // Líneas de texto para WhatsApp, Telegram, Signal y el resumen copiado.
  function lineasPedido(promo, cantidad = 1) {
    if (!promo) return [];
    const n = Math.max(1, Number(cantidad) || 1);
    return [
      `   🖤 Promoción: ${promo.nombre}`,
      `   📺 Dispositivos: ${promo.dispositivos}`,
      `   💳 Meses pagados: ${promo.mesesPagados} · 🎁 Meses gratis: ${promo.mesesGratis} · ✅ Meses activados: ${promo.mesesActivados}`,
      `   🏷️ Precio normal ${promo.mesesActivados} meses: $${(promo.precioReferencia * n).toFixed(2)} USD · 💸 Ahorro: $${(promo.ahorro * n).toFixed(2)} USD`
    ];
  }

  // ---------------------------------------------------------------- Interfaz
  function filaDesglose(etiqueta, valor, clase = '') {
    return `<div class="ctv-bd__fila${clase ? ` ${clase}` : ''}"><dt>${etiqueta}</dt><dd>${valor}</dd></div>`;
  }

  function htmlDesglose(c) {
    if (!c) return '<p>Esta combinación no está disponible. Elige otra opción.</p>';
    return `<dl class="ctv-bd__lista">
      ${filaDesglose('💳 Pagas', `${meses(c.mesesPagados)} · ${precio(c.precio)}`)}
      ${filaDesglose('🎁 Recibes gratis', meses(c.mesesGratis))}
      ${filaDesglose('✅ Se activan', `${meses(c.mesesActivados)} · ${dispositivosTexto(c.dispositivos)}`)}
      ${filaDesglose(`🏷️ Precio normal ${meses(c.mesesActivados)}`, `<s>${precio(c.precioReferencia)}</s>`)}
      ${filaDesglose('💸 Ahorras', precio(c.ahorro), 'ctv-bd__fila--ahorro')}
      ${filaDesglose('Total a pagar', precio(c.precio), 'ctv-bd__fila--total')}
    </dl>`;
  }

  function htmlSelector(producto, ahora = Date.now()) {
    if (!estaActiva(ahora) || !esElegible(producto)) return '';
    const id = String(producto.id).replace(/[^a-z0-9-]/gi, '');
    const inicial = calcular(producto, 1, PROMOS[0].id);
    const radiosDisp = DISPOSITIVOS.map((d, i) => `<label class="ctv-bd__chip"><input type="radio" name="ctv-bd-disp-${id}" value="${d}"${i === 0 ? ' checked' : ''}><span>${dispositivosTexto(d)}</span></label>`).join('');
    const radiosPromo = PROMOS.map((p, i) => {
      const [titulo, detalle] = p.nombre.split(': ');
      return `<label class="ctv-bd__opcion"><input type="radio" name="ctv-bd-promo-${id}" value="${p.id}"${i === 0 ? ' checked' : ''}><span><strong>${escapar(titulo)}</strong><small>${escapar(detalle)}</small></span></label>`;
    }).join('');
    return `<section class="ctv-bd" data-bd-producto="${escapar(producto.id)}" aria-labelledby="ctv-bd-titulo-${id}">
      <p class="ctv-bd__sello">🖤 Black Days · Del 15 al 20 de noviembre</p>
      <h4 id="ctv-bd-titulo-${id}" class="ctv-bd__titulo">Meses gratis en ${escapar(producto.nombre)}</h4>
      <fieldset class="ctv-bd__grupo"><legend>Dispositivos</legend><div class="ctv-bd__chips">${radiosDisp}</div></fieldset>
      <fieldset class="ctv-bd__grupo"><legend>Elige tu promoción</legend><div class="ctv-bd__opciones">${radiosPromo}</div></fieldset>
      <div class="ctv-bd__desglose" data-bd-desglose aria-live="polite" aria-atomic="true">${htmlDesglose(inicial)}</div>
      <div class="ctv-bd__acciones">
        <button type="button" class="btn btn--primary btn--small" data-bd-accion="carrito">🛒 Añadir promo al carrito</button>
        <button type="button" class="btn btn--outline btn--small" data-bd-accion="pagar">💳 Pagar esta promo</button>
      </div>
      <p class="ctv-bd__nota">IVA incluido. No se combina con cupones. Se activa después de verificar el pago.</p>
    </section>`;
  }

  function leerSeleccion(caja) {
    const producto = productos().find((p) => p.id === caja.dataset.bdProducto);
    const d = caja.querySelector('input[name^="ctv-bd-disp-"]:checked')?.value;
    const promoId = caja.querySelector('input[name^="ctv-bd-promo-"]:checked')?.value;
    return { producto, d, promoId };
  }

  function avisar(texto, tipo) {
    if (typeof raiz.mostrarToast === 'function') raiz.mostrarToast(texto, tipo);
  }

  function abrirTarjeta(dentro) {
    const planes = dentro.closest('.product-card')?.querySelector('details.product-plans-wrap');
    if (planes && !planes.open) planes.open = true;
  }

  const MENSAJE_WHATSAPP = [
    '🖤 Hola Click TV Streaming.',
    '',
    'Quiero aprovechar la promoción *Black Days* de IPTV (meses gratis, del 15 al 20 de noviembre).',
    '',
    '📺 Plan: IPTV Básico / Premium / Ultra',
    '📱 Dispositivos: 1 / 2 / 3',
    '🎁 Promoción: ',
    '',
    '✅ ¿Me ayudan a activarla? Gracias.'
  ].join('\n');

  // Barra inferior de celular: WhatsApp directo con el pedido de Black Days ya escrito.
  function iniciarBarraWhatsApp(vigente) {
    const barra = document.getElementById('ctv-bd-barra');
    if (!barra) return;
    const enlace = document.getElementById('ctv-bd-barra-whatsapp');
    const base = (typeof CONFIG !== 'undefined' && CONFIG.whatsappLink) || 'https://wa.me/593939166222';
    if (enlace) enlace.href = `${base}?text=${encodeURIComponent(MENSAJE_WHATSAPP)}`;
    const CLAVE = 'ctv-bd-barra-oculta';
    let oculta = false;
    try { oculta = sessionStorage.getItem(CLAVE) === '1'; } catch { /* sin almacenamiento */ }

    const medir = () => {
      const accesos = document.querySelector('.floating-actions');
      const caja = accesos?.getBoundingClientRect();
      const alto = caja && caja.height ? Math.max(0, Math.round(window.innerHeight - caja.top)) : 0;
      document.documentElement.style.setProperty('--ctv-alto-accesos', `${alto}px`);
    };
    const actualizar = () => {
      const mostrar = !oculta && (vigente = estaActiva());
      barra.hidden = !mostrar;
      document.body.classList.toggle('ctv-bd-barra-visible', mostrar);
      if (mostrar) medir();
    };
    document.getElementById('ctv-bd-barra-cerrar')?.addEventListener('click', () => {
      oculta = true;
      try { sessionStorage.setItem(CLAVE, '1'); } catch { /* sin almacenamiento */ }
      actualizar();
    });
    window.addEventListener('resize', () => { if (!barra.hidden) medir(); }, { passive: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) actualizar(); });
    actualizar();
  }

  function iniciarInterfaz() {
    const vigente = estaActiva();
    const aviso = document.getElementById('black-days-aviso');
    if (aviso) aviso.hidden = !vigente;
    document.querySelector('[data-bd-ver-iptv]')?.addEventListener('click', () => {
      if (typeof raiz.seleccionarCategoriaCatalogo === 'function') raiz.seleccionarCategoriaCatalogo('iptv');
      // En celular las tarjetas con promo están compactas: desde el aviso se abren con su selector a la vista.
      document.querySelectorAll('#catalogo-grid .ctv-bd').forEach(abrirTarjeta);
    });
    iniciarBarraWhatsApp(vigente);

    const grid = document.getElementById('catalogo-grid');
    if (!grid) return;
    grid.addEventListener('change', (e) => {
      const caja = e.target.closest('.ctv-bd');
      if (!caja) return;
      const { producto, d, promoId } = leerSeleccion(caja);
      const destino = caja.querySelector('[data-bd-desglose]');
      if (destino) destino.innerHTML = htmlDesglose(calcular(producto, d, promoId));
    });
    grid.addEventListener('click', (e) => {
      const sello = e.target.closest('.ctv-bd__sello');
      if (sello) abrirTarjeta(sello);
      const boton = e.target.closest('[data-bd-accion]');
      const caja = boton?.closest('.ctv-bd');
      if (!caja) return;
      const { producto, d, promoId } = leerSeleccion(caja);
      const plan = planParaCarrito(producto, d, promoId);
      if (!plan) {
        avisar('La promoción Black Days ya no está disponible. Revisa los planes normales.', 'error');
        if (typeof raiz.renderCatalogo === 'function') raiz.renderCatalogo();
        return;
      }
      if (boton.dataset.bdAccion === 'pagar' && typeof raiz.ctvAbrirPagoProducto === 'function') {
        raiz.ctvAbrirPagoProducto({ producto: producto.nombre, plan: plan.tipo, precio: plan.precio, promo: plan.promo });
        return;
      }
      if (typeof raiz.agregarAlCarrito !== 'function') {
        avisar('El carrito todavía no está disponible. Recarga la página.', 'error');
        return;
      }
      raiz.agregarAlCarrito(producto, { ...plan, operacion: 'compra' });
    });
  }

  raiz.PromoBlackDays = {
    INICIO, FIN, PROMOS, DISPOSITIVOS, PRODUCTOS_PROMO,
    estaActiva, tablaPrecios, esElegible, calcular, planParaCarrito, lineasPedido, htmlSelector
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciarInterfaz, { once: true });
    else iniciarInterfaz();
  }
})(typeof window !== 'undefined' ? window : globalThis);
