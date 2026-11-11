/* CLICK TV STREAMING · Música navideña instrumental (opcional).
 * Los navegadores no permiten sonar sin que el cliente lo pida, así que
 * se activa con un botón. Melodía original generada en el navegador (sin archivos de audio). */
(() => {
  'use strict';
  const boton = document.getElementById('btn-musica-navidad');
  if (!boton || !(window.AudioContext || window.webkitAudioContext)) {
    if (boton) boton.hidden = true;
    return;
  }

  const Ctx = window.AudioContext || window.webkitAudioContext;
  const BPM = 150;
  const beat = 60 / BPM;
  // Notas: [frecuencia en Hz, duración en tiempos]. 0 = silencio.
  const melodia = [
    [659.3, 1], [659.3, 1], [659.3, 2],
    [659.3, 1], [659.3, 1], [659.3, 2],
    [659.3, 1], [784.0, 1], [523.3, 1.5], [587.3, 0.5],
    [659.3, 3], [0, 1],
    [698.5, 1], [698.5, 1], [698.5, 1.5], [698.5, 0.5],
    [698.5, 1], [659.3, 1], [659.3, 1], [659.3, 0.5], [587.3, 0.5],
    [587.3, 1], [784.0, 1], [784.0, 1], [0, 1]
  ];
  const duracionCiclo = melodia.reduce((acc, [, d]) => acc + d, 0) * beat;

  let ctx = null;
  let timer = null;
  let activa = false;

  function tocarNota(freq, inicio, duracion) {
    if (!freq) return;
    const osc = ctx.createOscillator();
    const brillo = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    brillo.type = 'sine';
    brillo.frequency.value = freq * 2;
    const nivel = ctx.createGain();
    nivel.gain.value = 0.08;
    brillo.connect(nivel);
    nivel.connect(gain);
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, inicio);
    gain.gain.exponentialRampToValueAtTime(0.18, inicio + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion * 0.95);
    osc.start(inicio);
    brillo.start(inicio);
    osc.stop(inicio + duracion);
    brillo.stop(inicio + duracion);
  }

  function programarCiclo() {
    let t = ctx.currentTime + 0.05;
    melodia.forEach(([freq, dur]) => {
      tocarNota(freq, t, dur * beat);
      t += dur * beat;
    });
  }

  function encender() {
    ctx = ctx || new Ctx();
    if (ctx.state === 'suspended') ctx.resume();
    activa = true;
    programarCiclo();
    timer = setInterval(programarCiclo, duracionCiclo * 1000);
    boton.setAttribute('aria-pressed', 'true');
    boton.textContent = '🔇 Pausar música';
  }

  function apagar() {
    activa = false;
    clearInterval(timer);
    timer = null;
    if (ctx && ctx.state === 'running') ctx.suspend();
    boton.setAttribute('aria-pressed', 'false');
    boton.textContent = '🎶 Música navideña';
  }

  boton.addEventListener('click', () => (activa ? apagar() : encender()));
})();
