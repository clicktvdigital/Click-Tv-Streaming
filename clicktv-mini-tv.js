/* CLICK TV STREAMING · Mini TV con tráilers oficiales de YouTube · 18/11/2026
   - Tráilers en CONFIG.trailersYouTube: [{ id, titulo, canal, version }]. Solo videos de canales oficiales
     de los estudios, doblados o subtitulados al español, y que permitan insertarse en otras webs.
   - Antes de cargar se muestra solo la miniatura: el iframe (youtube-nocookie) se crea al llegar a la sección,
     en silencio y en bucle; ✕ lo elimina y libera la memoria (equipos de 1 GB).
   - Al bajar por la tienda sigue en una ventana pequeña con el CTA «🔥 Activa tu IPTV Premium».
   - Sin reproducción automática con «reducir movimiento» o «ahorro de datos»: el cliente pulsa ▶. */
(() => {
  'use strict';

  const ID_YOUTUBE = /^[A-Za-z0-9_-]{11}$/;

  // Solo entradas con id de YouTube válido (11 caracteres) y título; sin repetidos.
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

  window.ctvMiniTV = { trailersValidos, urlInsercion };
  if (typeof document === 'undefined' || !document.addEventListener) return;

  function iniciar() {
    const tarjeta = document.getElementById('ctv-tv-prueba');
    const zona = document.getElementById('ctv-tv-reproductor');
    const selector = document.getElementById('ctv-tv-trailer');
    const play = document.getElementById('ctv-tv-play');
    const estado = document.getElementById('ctv-tv-estado');
    if (!tarjeta || !zona) return;
    const trailers = trailersValidos(typeof CONFIG !== 'undefined' ? CONFIG.trailersYouTube : []);
    if (!trailers.length) { tarjeta.hidden = true; return; }

    let actual = trailers[0];
    let iframe = null;
    let cerradoPorCliente = false;
    const avisar = (t) => { if (estado) estado.textContent = t; };
    const sinAutoplay = () => matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData === true;

    selector?.replaceChildren(...trailers.map((t) => Object.assign(document.createElement('option'), {
      value: t.id, textContent: `${t.titulo}${t.version ? ` · ${t.version}` : ''}`
    })));

    function miniatura() {
      zona.replaceChildren(Object.assign(document.createElement('img'), {
        src: `https://i.ytimg.com/vi/${actual.id}/hqdefault.jpg`, alt: `Tráiler de ${actual.titulo}`,
        loading: 'lazy', decoding: 'async', className: 'ctv-tv__miniatura', width: 480, height: 360
      }));
      if (play) play.hidden = false;
    }

    function cargar() {
      iframe = Object.assign(document.createElement('iframe'), {
        src: urlInsercion(actual.id, location.origin),
        title: `Tráiler oficial: ${actual.titulo}${actual.version ? ` (${actual.version})` : ''}`,
        className: 'ctv-tv__iframe',
        allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
        referrerPolicy: 'strict-origin-when-cross-origin'
      });
      iframe.setAttribute('allowfullscreen', '');
      zona.replaceChildren(iframe);
      if (play) play.hidden = true;
      tarjeta.classList.add('ctv-tv--activo');
      avisar(`🎬 ${actual.titulo}${actual.canal ? ` · ${actual.canal}` : ''}. Sin sonido: actívalo en el video.`);
    }

    function cerrar() {
      iframe = null;
      cerradoPorCliente = true;
      tarjeta.classList.remove('ctv-tv--activo', 'ctv-tv--mini');
      tarjeta.style.minHeight = '';
      miniatura();
      avisar('Tráiler cerrado. Pulsa ▶ para verlo de nuevo.');
    }

    // Pausa o reanuda el video del iframe (API de YouTube por postMessage).
    const ordenar = (func) => iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), 'https://www.youtube-nocookie.com');

    play?.addEventListener('click', () => { cerradoPorCliente = false; cargar(); });
    selector?.addEventListener('change', () => {
      actual = trailers.find((t) => t.id === selector.value) || trailers[0];
      if (iframe) cargar(); else miniatura();
    });
    document.getElementById('ctv-tv-cerrar')?.addEventListener('click', cerrar);
    document.getElementById('ctv-tv-volver')?.addEventListener('click', () => {
      tarjeta.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    });
    document.getElementById('ctv-tv-cta')?.addEventListener('click', () => {
      if (window.ctvNavegacion?.irAProducto) window.ctvNavegacion.irAProducto('iptv-premium', 'iptv');
      else window.enfocarProducto?.('iptv-premium');
    });

    miniatura();
    avisar(sinAutoplay() ? 'Pulsa ▶ para ver el tráiler.' : 'El tráiler empieza solo y sin sonido al llegar aquí.');

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entrada]) => {
        // Primera vez en pantalla: se carga en silencio (salvo reducir movimiento / ahorro de datos).
        if (entrada.isIntersecting && !iframe && !cerradoPorCliente && !sinAutoplay()) cargar();
        // Fuera de pantalla con el tráiler activo: ventana pequeña persistente.
        const mini = !!iframe && !entrada.isIntersecting;
        if (mini && !tarjeta.classList.contains('ctv-tv--mini')) tarjeta.style.minHeight = `${tarjeta.offsetHeight}px`;
        tarjeta.classList.toggle('ctv-tv--mini', mini);
        if (!mini) tarjeta.style.minHeight = '';
      }, { threshold: 0.25 }).observe(tarjeta);
    }

    document.addEventListener('visibilitychange', () => ordenar(document.hidden ? 'pauseVideo' : 'playVideo'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
})();
