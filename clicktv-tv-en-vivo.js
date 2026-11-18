/* CLICK TV STREAMING · Mini TV multicanal (HLS / .m3u8) · 18/11/2026
   - Canales en CONFIG.canalesMiniTV: [{ id, nombre, url, respaldo? }]. Solo señales con derechos de emisión.
   - No descarga nada hasta que el cliente pulsa «Ver»: hls.js (con SRI) y el video se piden en ese momento.
   - Safari / iPhone reproducen HLS de forma nativa; el resto usa hls.js con buffers cortos (equipos de 1 GB).
   - Al bajar por la tienda sigue sonando en una ventana pequeña con selector de canal, reproducir/pausa,
     silencio y volumen; ✕ lo cierra y libera la memoria. Se pausa con la pestaña oculta. */
(() => {
  'use strict';

  const HLS_JS = {
    src: 'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.20/hls.min.js',
    integridad: 'sha384-V5ruNBgmYcC3SJRUQeNykAAAgde5gOFq/Hu0CZj7bygDP0yRIhkvX8+w0u/7mRvr'
  };

  // Lista de canales válida: id único, nombre y URL https que termina en .m3u8.
  function canalesValidos(lista) {
    const vistos = new Set();
    return (Array.isArray(lista) ? lista : []).filter((c) => {
      const ok = c && typeof c.id === 'string' && c.id && !vistos.has(c.id) && typeof c.nombre === 'string'
        && /^https:\/\/[^\s]+\.m3u8(\?[^\s]*)?$/i.test(String(c.url || ''));
      if (ok) vistos.add(c.id);
      return ok;
    });
  }
  window.ctvMiniTV = { canalesValidos };
  if (typeof document === 'undefined' || !document.addEventListener) return;

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
    const selector = document.getElementById('ctv-tv-canal');
    const pausa = document.getElementById('ctv-tv-pausa');
    const silencio = document.getElementById('ctv-tv-silencio');
    const volumen = document.getElementById('ctv-tv-volumen');
    if (!tarjeta || !video || !play) return;
    const canales = canalesValidos(typeof CONFIG !== 'undefined' ? CONFIG.canalesMiniTV : []);
    if (!canales.length) { tarjeta.hidden = true; return; }

    selector?.replaceChildren(...canales.map((c) => Object.assign(document.createElement('option'), { value: c.id, textContent: c.nombre })));

    let hls = null;
    let activo = false;
    let conectando = false;
    let canal = canales[0];
    let usandoRespaldo = false;
    // Un fallo puede llegar (evento error del <video> o de hls.js) antes de que termine ver():
    // si ocurre, ese intento no se marca como conectado y el aviso de error se mantiene.
    let fallido = false;
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
        hls.on(Hls.Events.ERROR, (_evento, datos) => { if (datos?.fatal) probarRespaldo(); });
        hls.loadSource(url);
        hls.attachMedia(video);
      }
      await video.play().catch(() => { /* el cliente puede pulsar ▶ en los controles */ });
    }

    function probarRespaldo() {
      if (!usandoRespaldo && canal.respaldo) {
        usandoRespaldo = true;
        avisar(`La señal de ${canal.nombre} no responde: probando la de respaldo…`);
        sintonizar(canal.respaldo).catch(fallo);
      } else {
        fallo(new Error(`${canal.nombre} no está disponible ahora`));
      }
    }

    function reiniciarInterfaz() {
      tarjeta.classList.remove('ctv-tv--activo', 'ctv-tv--mini');
      tarjeta.style.minHeight = '';
      video.controls = true;
      play.hidden = false;
      play.disabled = false;
    }

    function fallo(error) {
      fallido = true;
      activo = false;
      conectando = false;
      liberar();
      reiniciarInterfaz();
      avisar(`⚠️ ${error?.message || 'No se pudo conectar'}. Revisa tu conexión o elige otro canal.`);
    }

    async function ver(nuevoCanal = canal) {
      canal = nuevoCanal;
      if (selector) selector.value = canal.id;
      play.disabled = true;
      conectando = true;
      fallido = false;
      usandoRespaldo = false;
      avisar(`⏳ Conectando con ${canal.nombre}…`);
      document.getElementById('radio-player')?.pause();
      try {
        await sintonizar(canal.url);
        if (fallido) return;
        activo = true;
        play.hidden = true;
        tarjeta.classList.add('ctv-tv--activo');
        avisar(`🔴 ${canal.nombre}. Puedes seguir navegando: la TV se queda en una ventana pequeña.`);
      } catch (error) {
        fallo(error);
      } finally {
        conectando = false;
      }
    }

    play.addEventListener('click', () => ver());
    selector?.addEventListener('change', () => {
      const elegido = canales.find((c) => c.id === selector.value) || canales[0];
      if (activo || conectando) ver(elegido); else canal = elegido;
    });

    // Con HLS nativo (Safari y algunos Chrome) los fallos de señal llegan como error del <video>.
    video.addEventListener('error', () => {
      if (hls || !(activo || conectando) || !video.getAttribute('src')) return;
      probarRespaldo();
    });

    // Controles propios: sirven también en la ventana pequeña, donde los nativos no caben.
    const pintarControles = () => {
      if (pausa) { pausa.textContent = video.paused ? '▶' : '⏸'; pausa.setAttribute('aria-label', video.paused ? 'Reproducir' : 'Pausar'); }
      if (silencio) { silencio.textContent = video.muted || video.volume === 0 ? '🔇' : '🔊'; silencio.setAttribute('aria-label', video.muted ? 'Activar sonido' : 'Silenciar'); }
      if (volumen) volumen.value = String(video.muted ? 0 : video.volume);
    };
    pausa?.addEventListener('click', () => { if (video.paused) video.play().catch(() => {}); else video.pause(); });
    silencio?.addEventListener('click', () => { video.muted = !video.muted; if (!video.muted && video.volume === 0) video.volume = 0.6; });
    volumen?.addEventListener('input', () => { video.volume = Number(volumen.value); video.muted = video.volume === 0; });
    ['play', 'pause', 'volumechange'].forEach((tipo) => video.addEventListener(tipo, pintarControles));
    pintarControles();

    function cerrar() {
      activo = false;
      liberar();
      reiniciarInterfaz();
      avisar('Reproductor cerrado. Pulsa «Ver» para volver a sintonizar.');
    }
    document.getElementById('ctv-tv-cerrar')?.addEventListener('click', cerrar);
    document.getElementById('ctv-tv-volver')?.addEventListener('click', () => {
      tarjeta.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    });

    // Ventana pequeña persistente cuando la tarjeta sale de pantalla con la TV activa.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entrada]) => {
        const mini = activo && !entrada.isIntersecting;
        if (mini && !tarjeta.classList.contains('ctv-tv--mini')) tarjeta.style.minHeight = `${tarjeta.offsetHeight}px`;
        tarjeta.classList.toggle('ctv-tv--mini', mini);
        video.controls = !mini;
        if (!mini) tarjeta.style.minHeight = '';
      }, { threshold: 0 }).observe(tarjeta);
    }

    document.addEventListener('visibilitychange', () => { if (document.hidden && activo) video.pause(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
})();
