/* CLICK TV STREAMING · Villancicos sintetizados (melodía de dominio público, sin audio con licencia).
   El navegador no permite sonido sin una acción del visitante: empieza apagado y suena al pulsar el botón. */
(() => {
  'use strict';
  const CLAVE = 'clicktv_villancicos';
  // Frases de "Noche de paz" (dominio público): [nota MIDI, duración en tiempos].
  const MELODIA = [
    [67, 1.5], [69, 0.5], [67, 1], [64, 2],
    [67, 1.5], [69, 0.5], [67, 1], [64, 2],
    [74, 2], [74, 2],
    [71, 1.5], [71, 0.5], [67, 2],
    [72, 1.5], [72, 0.5], [69, 1], [67, 2],
    [64, 2], [67, 2], [62, 4]
  ];
  const TEMPO = 84; // tiempos por minuto
  const DURACION_TOTAL = MELODIA.reduce((a, [, d]) => a + d, 0) * (60 / TEMPO);
  const frecuencia = midi => 440 * Math.pow(2, (midi - 69) / 12);

  let ctx = null;
  let timer = null;
  let sonando = false;

  function tocarFrase(inicio) {
    let t = inicio;
    for (const [nota, dur] of MELODIA) {
      const len = dur * (60 / TEMPO);
      // Voz principal suave y un tono de campana una octava arriba.
      for (const [tipo, vol, mult] of [['triangle', 0.09, 1], ['sine', 0.035, 2]]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = tipo;
        osc.frequency.value = frecuencia(nota) * mult;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(vol, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + len * 0.95);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + len);
      }
      t += len;
    }
  }

  function programar() {
    if (!sonando || !ctx) return;
    tocarFrase(ctx.currentTime + 0.05);
    timer = setTimeout(programar, (DURACION_TOTAL - 0.2) * 1000);
  }

  function encender(boton) {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    sonando = true;
    programar();
    actualizar(boton, true);
    try { localStorage.setItem(CLAVE, '1'); } catch (e) { /* sin almacenamiento */ }
  }

  function apagar(boton) {
    sonando = false;
    clearTimeout(timer);
    actualizar(boton, false);
    try { localStorage.setItem(CLAVE, '0'); } catch (e) { /* sin almacenamiento */ }
  }

  function actualizar(boton, activo) {
    boton.setAttribute('aria-pressed', String(activo));
    boton.textContent = activo ? '🔇 Apagar villancicos' : '🎵 Villancicos';
  }

  function iniciar() {
    const boton = document.getElementById('btn-villancicos');
    if (!boton || !(window.AudioContext || window.webkitAudioContext)) { if (boton) boton.hidden = true; return; }
    boton.addEventListener('click', () => (sonando ? apagar(boton) : encender(boton)));
    // Si se cambia de pestaña, se pausa para no sonar en segundo plano.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && sonando) apagar(boton);
    });
  }

  iniciar();
})();
