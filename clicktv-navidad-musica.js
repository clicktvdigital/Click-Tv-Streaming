/* CLICK TV STREAMING · Reproductor de música navideña (opcional).
 * - Se reproduce solo cuando el cliente lo pide (los navegadores bloquean el sonido automático).
 * - Nunca suena a la vez que la radio: al reproducir la radio, la música navideña se pausa.
 * - Melodía original generada en el navegador (sin archivos de audio). */
(() => {
  'use strict';
  const boton = document.getElementById('btn-musica-navidad');
  const volumen = document.getElementById('volumen-navidad');
  const radio = document.getElementById('radio-player');
  if (!boton || !(window.AudioContext || window.webkitAudioContext)) {
    if (boton) boton.hidden = true;
    if (volumen) volumen.hidden = true;
    return;
  }

  const Ctx = window.AudioContext || window.webkitAudioContext;
  const BPM = 132;
  const tiempo = 60 / BPM;

  // Melodía: [frecuencia Hz, duración en tiempos]. 0 = silencio.
  const melodia = [
    [659.3, 1], [659.3, 1], [659.3, 2],
    [659.3, 1], [659.3, 1], [659.3, 2],
    [659.3, 1], [784.0, 1], [523.3, 1.5], [587.3, 0.5],
    [659.3, 3], [0, 1],
    [698.5, 1], [698.5, 1], [698.5, 1.5], [698.5, 0.5],
    [698.5, 1], [659.3, 1], [659.3, 1], [659.3, 0.5], [587.3, 0.5],
    [587.3, 1], [784.0, 1], [784.0, 1], [0, 1]
  ];
  // Bajo que acompaña: una nota cada dos tiempos.
  const bajo = [130.8, 130.8, 196.0, 196.0, 220.0, 220.0, 174.6, 174.6, 130.8, 130.8, 196.0, 196.0, 130.8];
  const duracionCiclo = melodia.reduce((acc, [, d]) => acc + d, 0) * tiempo;

  let ctx = null;
  let master = null;
  let timer = null;
  let activa = false;

  function asegurarAudio() {
    if (ctx) return;
    ctx = new Ctx();
    master = ctx.createGain();
    master.gain.value = volumen ? Number(volumen.value) : 0.6;
    master.connect(ctx.destination);
  }

  // Campana suave: fundamental + armónicos con caída rápida.
  function campana(freq, inicio, duracion, nivel) {
    [[1, 1], [2, 0.35], [3, 0.12]].forEach(([mult, peso]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * mult;
      g.gain.setValueAtTime(0.0001, inicio);
      g.gain.exponentialRampToValueAtTime(nivel * peso, inicio + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);
      osc.connect(g);
      g.connect(master);
      osc.start(inicio);
      osc.stop(inicio + duracion + 0.05);
    });
  }

  function bajoNota(freq, inicio, duracion) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, inicio);
    g.gain.exponentialRampToValueAtTime(0.16, inicio + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);
    osc.connect(g);
    g.connect(master);
    osc.start(inicio);
    osc.stop(inicio + duracion + 0.05);
  }

  function programarCiclo() {
    let t = ctx.currentTime + 0.05;
    melodia.forEach(([freq, dur]) => {
      if (freq) campana(freq, t, Math.max(dur * tiempo * 0.95, 0.12), 0.22);
      t += dur * tiempo;
    });
    let b = ctx.currentTime + 0.05;
    bajo.forEach((freq) => {
      bajoNota(freq, b, 2 * tiempo);
      b += 2 * tiempo;
    });
  }

  function encender() {
    // Nunca dos reproductores a la vez: si la radio está sonando, se pausa.
    if (radio && !radio.paused) radio.pause();
    asegurarAudio();
    if (ctx.state === 'suspended') ctx.resume();
    activa = true;
    programarCiclo();
    timer = setInterval(programarCiclo, duracionCiclo * 1000);
    actualizarBoton();
  }

  function apagar() {
    activa = false;
    clearInterval(timer);
    timer = null;
    if (ctx && ctx.state === 'running') ctx.suspend();
    actualizarBoton();
  }

  function actualizarBoton() {
    boton.setAttribute('aria-pressed', String(activa));
    boton.textContent = activa ? '⏸ Pausar música' : '🎶 Música navideña';
  }

  boton.addEventListener('click', () => (activa ? apagar() : encender()));

  if (volumen) {
    volumen.addEventListener('input', () => {
      if (master) master.gain.value = Number(volumen.value);
    });
  }

  // La radio tiene prioridad: al empezar a sonar, la música navideña se detiene.
  if (radio) {
    radio.addEventListener('play', () => {
      if (activa) apagar();
    });
  }
})();
