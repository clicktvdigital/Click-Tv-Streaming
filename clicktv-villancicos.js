/* CLICK TV STREAMING · Villancicos.
   Tres grabaciones de "We Wish You a Merry Christmas" (con permiso). Cada grabación suena completa
   y al terminar pasa a la siguiente. Se silencia con la radio o un video, y "Apagar" lo apaga del todo. */
(() => {
  'use strict';
  const PISTAS = [
    'assets/navidad/audio/villancico-1.mp3',
    'assets/navidad/audio/villancico-2.mp3',
    'assets/navidad/audio/villancico-3.mp3',
  ];

  const audio = new Audio();
  audio.preload = 'auto';
  audio.volume = 0.7;
  let sonando = false, paso = 0, timer = null, boton = null;

  // Reproduce cada grabación completa desde el inicio; al terminar pasa a la siguiente.
  function siguiente() {
    if (!sonando) return;
    const src = PISTAS[paso % PISTAS.length];
    paso++;
    boton.dataset.cancion = src.split('/').pop().replace('.mp3', '');
    audio.src = src;
    audio.currentTime = 0;
    audio.play().catch(() => { /* el navegador bloqueó el sonido */ });
  }

  function actualizar(activo) {
    boton.setAttribute('aria-pressed', String(activo));
    boton.textContent = activo ? '🔇 Apagar villancicos' : '🎵 Villancicos';
  }

  function encender() {
    sonando = true;
    actualizar(true);
    siguiente();
  }

  function apagar() {
    sonando = false;
    clearTimeout(timer);
    audio.pause();
    actualizar(false);
  }

  function iniciar() {
    boton = document.getElementById('btn-villancicos');
    if (!boton) return;
    boton.addEventListener('click', () => (sonando ? apagar() : encender()));
    audio.addEventListener('ended', () => { if (sonando) siguiente(); });
    // Radio o video en vivo: silencian los villancicos (el propio audio no cuenta).
    document.addEventListener('play', (e) => {
      if (e.target !== audio && e.target && (e.target.tagName === 'AUDIO' || e.target.tagName === 'VIDEO') && sonando) apagar();
    }, true);
    document.addEventListener('visibilitychange', () => { if (document.hidden && sonando) apagar(); });
  }

  iniciar();
})();
