/* CLICK TV STREAMING · Mini TV orientada a ventas · 18/11/2026
   Pestañas:
   - «Click TV Oficial»: video promocional propio (CONFIG.videoPromo), en silencio, en bucle y con controles.
   - «Estrenos de Cine»: tráilers oficiales doblados de YouTube (CONFIG.trailersYouTube), vía youtube-nocookie.
   Sobre el video, un CTA lleva a los planes de IPTV Premium (con Black Days mientras esté vigente).
   Nada se descarga hasta llegar a la sección; al bajar por la tienda sigue en una ventana pequeña; ✕ la cierra
   y libera la memoria. Sin reproducción automática con «reducir movimiento» o «ahorro de datos». */
(() => {
  'use strict';

  const ID_YOUTUBE = /^[A-Za-z0-9_-]{11}$/;

  function trailersValidos(lista) {
    const vistos = new Set();
    return (Array.isArray(lista) ? lista : []).filter((t) => {
      const ok = t && ID_YOUTUBE.test(String(t.id || '')) && typeof t.titulo === 'string' && t.titulo.trim() && !vistos.has(t.id);
      if (ok) vistos.add(t.id);
      return ok;
    });
  }

  function urlInsercion(id, origen = '') {
    const p = new URLSearchParams({
      autoplay: '1', mute: '1', loop: '1', playlist: id, playsinline: '1',
      rel: '0', modestbranding: '1', controls: '1', enablejsapi: '1'
    });
    if (origen) p.set('origin', origen);
    return `https://www.youtube-nocookie.com/embed/${id}?${p}`;
  }

  // Mismo CTA y en el mismo lugar en ambas pestañas; durante Black Days menciona la promo.
  function textoCta(promoVigente) {
    return promoVigente ? '🔥 ¡Activa tu IPTV Premium con Black Days!' : '🔥 ¡Activa tu IPTV Premium!';
  }

  window.ctvMiniTV = { trailersValidos, urlInsercion, textoCta };
  if (typeof document === 'undefined' || !document.addEventListener) return;

  function iniciar() {
    const tarjeta = document.getElementById('ctv-tv-prueba');
    const marco = document.getElementById('ctv-tv-marco');
    const video = document.getElementById('ctv-tv-promo');
    const zonaCine = document.getElementById('ctv-tv-reproductor');
    const controlesCine = document.getElementById('ctv-tv-controles-cine');
    const selector = document.getElementById('ctv-tv-trailer');
    const play = document.getElementById('ctv-tv-play');
    const cta = document.getElementById('ctv-tv-cta');
    const estado = document.getElementById('ctv-tv-estado');
    const tabs = { oficial: document.getElementById('ctv-tv-tab-oficial'), cine: document.getElementById('ctv-tv-tab-cine') };
    if (!tarjeta || !marco || !video || !zonaCine) return;

    const config = typeof CONFIG !== 'undefined' ? CONFIG : {};
    const promo = config.videoPromo || {};
    const trailers = trailersValidos(config.trailersYouTube);
    if (!trailers.length && tabs.cine) tabs.cine.hidden = true;

    let pestana = 'oficial';
    let trailer = trailers[0] || null;
    let iframe = null;
    let enPantalla = false;
    let cerradoPorCliente = false;
    const avisar = (t) => { if (estado) estado.textContent = t; };
    const sinAutoplay = () => matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData === true;
    const promoVigente = () => typeof window.PromoBlackDays?.estaActiva === 'function' && window.PromoBlackDays.estaActiva();
    const activo = () => (pestana === 'oficial' ? !!video.getAttribute('src') && !video.paused : !!iframe);

    selector?.replaceChildren(...trailers.map((t) => Object.assign(document.createElement('option'), {
      value: t.id, textContent: `${t.titulo}${t.version ? ` · ${t.version}` : ''}`
    })));

    // --- Video promocional propio ---
    function prepararPromo() {
      if (!promo.url || video.getAttribute('src')) return;
      const automatico = !sinAutoplay() && !cerradoPorCliente;
      video.autoplay = automatico;
      video.src = promo.url;
      if (automatico) video.play().catch(() => {});
    }

    // --- Tráilers de YouTube ---
    function miniaturaCine() {
      if (!trailer) return;
      zonaCine.replaceChildren(Object.assign(document.createElement('img'), {
        src: `https://i.ytimg.com/vi/${trailer.id}/hqdefault.jpg`, alt: `Tráiler de ${trailer.titulo}`,
        loading: 'lazy', decoding: 'async', className: 'ctv-tv__miniatura', width: 480, height: 360
      }));
      if (play) play.hidden = false;
    }
    function cargarCine() {
      if (!trailer) return;
      iframe = Object.assign(document.createElement('iframe'), {
        src: urlInsercion(trailer.id, location.origin),
        title: `Tráiler oficial: ${trailer.titulo}${trailer.version ? ` (${trailer.version})` : ''}`,
        className: 'ctv-tv__iframe',
        allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
        referrerPolicy: 'strict-origin-when-cross-origin'
      });
      iframe.setAttribute('allowfullscreen', '');
      zonaCine.replaceChildren(iframe);
      if (play) play.hidden = true;
      avisar(`🎬 ${trailer.titulo}${trailer.canal ? ` · ${trailer.canal}` : ''}. Sin sonido: actívalo en el video.`);
      actualizarEstado();
    }
    function liberarCine() { iframe = null; miniaturaCine(); }

    // position: fixed queda atrapado si un ancestro tiene transform, filter, backdrop-filter, perspective,
    // contain o will-change (aquí .hero__panel.glass-card). En modo ventana pequeña esos ancestros están
    // fuera de pantalla: se neutralizan mientras dure y se restauran al volver, sin mover el iframe.
    const PROPIEDADES_ATRAPAN = ['transform', 'filter', 'backdrop-filter', '-webkit-backdrop-filter', 'perspective', 'contain', 'will-change'];
    let ancestrosLiberados = [];
    function liberarAncestros(liberar) {
      if (!liberar) {
        ancestrosLiberados.forEach(({ el, previos }) => previos.forEach(([prop, valor, prioridad]) => {
          if (valor) el.style.setProperty(prop, valor, prioridad); else el.style.removeProperty(prop);
        }));
        ancestrosLiberados = [];
        return;
      }
      if (ancestrosLiberados.length) return;
      for (let el = tarjeta.parentElement; el && el !== document.body; el = el.parentElement) {
        const cs = getComputedStyle(el);
        const atrapa = PROPIEDADES_ATRAPAN.filter((prop) => {
          const v = cs.getPropertyValue(prop);
          return v && !['none', 'auto', 'normal', ''].includes(v.trim());
        });
        if (!atrapa.length) continue;
        const previos = atrapa.map((prop) => [prop, el.style.getPropertyValue(prop), el.style.getPropertyPriority(prop)]);
        atrapa.forEach((prop) => el.style.setProperty(prop, prop === 'will-change' ? 'auto' : 'none', 'important'));
        ancestrosLiberados.push({ el, previos });
      }
    }

    function actualizarEstado() {
      tarjeta.classList.toggle('ctv-tv--activo', activo());
      if (cta) cta.textContent = textoCta(promoVigente());
      const mini = activo() && !enPantalla;
      if (mini && !tarjeta.classList.contains('ctv-tv--mini')) tarjeta.style.minHeight = `${tarjeta.offsetHeight}px`;
      liberarAncestros(mini);
      tarjeta.classList.toggle('ctv-tv--mini', mini);
      if (!mini) tarjeta.style.minHeight = '';
    }

    function cambiarPestana(nueva) {
      if (nueva === pestana || !tabs[nueva] || tabs[nueva].hidden) return;
      pestana = nueva;
      for (const [clave, tab] of Object.entries(tabs)) {
        if (!tab) continue;
        tab.setAttribute('aria-selected', String(clave === pestana));
        tab.tabIndex = clave === pestana ? 0 : -1;
      }
      marco.setAttribute('aria-labelledby', tabs[pestana].id);
      const oficial = pestana === 'oficial';
      video.hidden = !oficial;
      zonaCine.hidden = oficial;
      if (controlesCine) controlesCine.hidden = oficial;
      if (oficial) {
        if (play) play.hidden = true;
        liberarCine();
        if (play) play.hidden = true;
        prepararPromo();
        if (video.getAttribute('src') && !cerradoPorCliente) video.play().catch(() => {});
        avisar('📺 Video oficial de Click TV. Activa el sonido en los controles.');
      } else {
        video.pause();
        if (enPantalla && !cerradoPorCliente && !sinAutoplay()) cargarCine(); else miniaturaCine();
      }
      actualizarEstado();
    }

    Object.entries(tabs).forEach(([clave, tab]) => tab?.addEventListener('click', () => { cerradoPorCliente = false; cambiarPestana(clave); }));
    document.querySelector('.ctv-tv__pestanas')?.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      const siguiente = pestana === 'oficial' ? 'cine' : 'oficial';
      cambiarPestana(siguiente);
      tabs[siguiente]?.focus();
    });

    play?.addEventListener('click', () => { cerradoPorCliente = false; cargarCine(); });
    selector?.addEventListener('change', () => {
      trailer = trailers.find((t) => t.id === selector.value) || trailers[0];
      if (iframe) cargarCine(); else miniaturaCine();
    });
    ['play', 'pause'].forEach((tipo) => video.addEventListener(tipo, () => { if (tipo === 'play') cerradoPorCliente = false; actualizarEstado(); }));

    cta?.addEventListener('click', () => {
      if (window.ctvNavegacion?.irAProducto) window.ctvNavegacion.irAProducto('iptv-premium', 'iptv');
      else window.enfocarProducto?.('iptv-premium');
    });
    document.getElementById('ctv-tv-cerrar')?.addEventListener('click', () => {
      cerradoPorCliente = true;
      video.pause();
      if (iframe) liberarCine();
      tarjeta.classList.remove('ctv-tv--mini');
      tarjeta.style.minHeight = '';
      liberarAncestros(false);
      actualizarEstado();
      avisar('Mini TV cerrada. Pulsa ▶ para verla de nuevo.');
    });
    document.getElementById('ctv-tv-volver')?.addEventListener('click', () => {
      tarjeta.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    });

    // Estado inicial: pestaña oficial, solo el póster hasta llegar a la sección.
    if (play) play.hidden = true;
    zonaCine.hidden = true;
    miniaturaCine();
    if (play) play.hidden = true;
    avisar(sinAutoplay() ? 'Pulsa ▶ en el video para verlo.' : 'El video empieza solo y sin sonido al llegar aquí.');
    actualizarEstado();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entrada]) => {
        enPantalla = entrada.isIntersecting;
        if (enPantalla && !cerradoPorCliente) {
          if (pestana === 'oficial') prepararPromo();
          else if (!iframe && !sinAutoplay()) cargarCine();
        }
        actualizarEstado();
      }, { threshold: 0.25 }).observe(tarjeta);
    } else {
      enPantalla = true;
      prepararPromo();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        video.pause();
        iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), 'https://www.youtube-nocookie.com');
      } else if (pestana === 'oficial' && video.getAttribute('src') && !cerradoPorCliente && !sinAutoplay()) {
        video.play().catch(() => {});
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
})();
