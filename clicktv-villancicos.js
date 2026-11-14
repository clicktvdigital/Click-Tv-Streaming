/* CLICK TV STREAMING · Villancicos.
   Tres grabaciones de "We Wish You a Merry Christmas" (con permiso). Cada 5 segundos cambia a otra
   grabación y empieza desde un punto distinto. Se silencia con la radio o un video, y "Apagar" lo apaga del todo. */
(() => {
  'use strict';
  const PISTAS = [
    'assets/navidad/audio/villancico-1.mp3',
    'assets/navidad/audio/villancico-2.mp3',
    'assets/navidad/audio/villancico-3.mp3',
  ];
  const CAMBIO_MS = 5000;

  const audio = new Audio();
  audio.preload = 'auto';
  audio.volume = 0.7;
  let sonando = false, paso = 0, timer = null, boton = null;

  function siguiente() {
    if (!sonando) return;
    const src = PISTAS[paso % PISTAS.length];
    paso++;
    audio.onloadedmetadata = () => {
      const duracion = Number.isFinite(audio.duration) ? audio.duration : 30;
      audio.currentTime = Math.random() * Math.max(0, duracion - 7);
      audio.play().catch(() => { /* el navegador bloqueó el sonido */ });
    };
    boton.dataset.cancion = src.split('/').pop().replace('.mp3', '');
    audio.src = src;
    audio.load();
    timer = setTimeout(siguiente, CAMBIO_MS);
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
    // Radio o video en vivo: silencian los villancicos (el propio audio no cuenta).
    document.addEventListener('play', (e) => {
      if (e.target !== audio && e.target && (e.target.tagName === 'AUDIO' || e.target.tagName === 'VIDEO') && sonando) apagar();
    }, true);
    document.addEventListener('visibilitychange', () => { if (document.hidden && sonando) apagar(); });
  }

  iniciar();
})();
