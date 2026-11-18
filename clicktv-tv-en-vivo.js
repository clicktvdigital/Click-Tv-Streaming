/* CLICK TV STREAMING · Mini reproductor de TV en vivo (HLS / .m3u8) · 18/11/2026
   - No descarga nada hasta que el cliente pulsa «Ver»: hls.js (SRI) y el video se piden en ese momento.
   - Safari / iPhone reproducen HLS de forma nativa; el resto usa hls.js con buffers cortos (equipos de 1 GB).
   - Al bajar por la tienda, el video sigue en una ventana pequeña; ✕ lo cierra y libera la memoria.
   - Se pausa con la pestaña oculta para no gastar datos ni batería. */
(() => {
  'use strict';

  const HLS_JS = {
    src: 'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.20/hls.min.js',
    integridad: 'sha384-V5ruNBgmYcC3SJRUQeNykAAAgde5gOFq/Hu0CZj7bygDP0yRIhkvX8+w0u/7mRvr'
  };

  let cargaHls = null;
  function cargarHlsJs() {
    if (window.Hls) return Promise.resolve(window.Hls);
    cargaHls ||= new Promise((resolver, rechazar) => {
      const script = document.createElement('script');
      script.src = HLS_JS.src;
      script.integrity = HLS_JS.integridad;
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      script.onload = () => (window.Hls ? resolver(window.Hls) : rechazar(new Error('hls.js no disponible')));
      script.onerror = () => { cargaHls = null; script.remove(); rechazar(new Error('No se pudo cargar el reproductor')); };
      document.head.append(script);
    });
    return cargaHls;
  }

  function iniciar() {
    const tarjeta = document.getElementById('ctv-tv-prueba');
    const video = document.getElementById('ctv-tv-video');
    const play = document.getElementById('ctv-tv-play');
    const estado = document.getElementById('ctv-tv-estado');
    if (!tarjeta || !video || !play) return;
    const canal = (typeof CONFIG !== 'undefined' && CONFIG.tvPrueba) || null;
    if (!canal?.url) { tarjeta.hidden = true; return; }

    let hls = null;
    let activo = false;
    let usandoRespaldo = false;
    const avisar = (texto) => { if (estado) estado.textContent = texto; };

    function liberar() {
      if (hls) { hls.destroy(); hls = null; }
      video.pause();
      video.removeAttribute('src');
      video.load();
    }

    async function sintonizar(url) {
      liberar();
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else {
        const Hls = await cargarHlsJs();
        if (!Hls.isSupported()) throw new Error('Este navegador no reproduce TV en vivo');
        hls = new Hls({ maxBufferLength: 12, maxMaxBufferLength: 20, backBufferLength: 10, capLevelToPlayerSize: true });
        hls.on(Hls.Events.ERROR, (_evento, datos) => {
          if (!datos?.fatal) return;
          if (!usandoRespaldo && canal.respaldo) { usandoRespaldo = true; avisar('La señal principal no responde: probando la señal de respaldo…'); sintonizar(canal.respaldo).catch(fallo); }
          else fallo(new Error('Señal no disponible'));
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      }
      await video.play().catch(() => { /* el usuario puede pulsar play en los controles */ });
    }

    function fallo(error) {
      activo = false;
      liberar();
      tarjeta.classList.remove('ctv-tv--activo', 'ctv-tv--mini');
      tarjeta.style.minHeight = '';
      play.hidden = false;
      play.disabled = false;
      avisar(`⚠️ ${error?.message || 'No se pudo conectar'}. Revisa tu conexión e inténtalo de nuevo.`);
    }

    play.addEventListener('click', async () => {
      play.disabled = true;
      avisar('⏳ Conectando con el canal de prueba…');
      document.getElementById('radio-player')?.pause();
      usandoRespaldo = false;
      try {
        await sintonizar(canal.url);
        activo = true;
        play.hidden = true;
        tarjeta.classList.add('ctv-tv--activo');
        avisar(`🔴 ${canal.nombre}. Puedes seguir navegando: el video se queda en una ventana pequeña.`);
      } catch (error) {
        fallo(error);
      }
    });

    function cerrar() {
      activo = false;
      liberar();
      tarjeta.classList.remove('ctv-tv--activo', 'ctv-tv--mini');
      tarjeta.style.minHeight = '';
      play.hidden = false;
      play.disabled = false;
      avisar('Reproductor cerrado. Pulsa «Ver» para volver a sintonizar.');
    }
    document.getElementById('ctv-tv-cerrar')?.addEventListener('click', cerrar);
    document.getElementById('ctv-tv-volver')?.addEventListener('click', () => {
      tarjeta.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    });

    // Ventana pequeña cuando la tarjeta sale de pantalla con el video activo.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entrada]) => {
        const mini = activo && !entrada.isIntersecting;
        if (mini && !tarjeta.classList.contains('ctv-tv--mini')) tarjeta.style.minHeight = `${tarjeta.offsetHeight}px`;
        tarjeta.classList.toggle('ctv-tv--mini', mini);
        if (!mini) tarjeta.style.minHeight = '';
      }, { threshold: 0 }).observe(tarjeta);
    }

    // Con HLS nativo (Safari y algunos Chrome) los fallos de señal llegan como error del <video>.
    let conectando = false;
    video.addEventListener('error', () => {
      if (hls || !(activo || conectando) || !video.getAttribute('src')) return;
      if (!usandoRespaldo && canal.respaldo) {
        usandoRespaldo = true;
        avisar('La señal principal no responde: probando la señal de respaldo…');
        video.src = canal.respaldo;
        video.play().catch(() => {});
      } else {
        fallo(new Error('Señal no disponible'));
      }
    });
    play.addEventListener('click', () => { conectando = true; setTimeout(() => { conectando = false; }, 15000); }, { capture: true });

    document.addEventListener('visibilitychange', () => { if (document.hidden && activo) video.pause(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
})();
