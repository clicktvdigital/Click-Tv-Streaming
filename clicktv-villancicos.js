/* CLICK TV STREAMING · Villancicos sintetizados con el navegador (melodías de dominio público, sin audio con licencia).
   - Cambia de villancico cada 5 segundos.
   - Se silencia cuando suena la radio o un video en vivo, y se apaga del todo con el botón "Apagar". */
(() => {
  'use strict';

  // Melodías de dominio público: [nota MIDI, duración en tiempos]. 60 = Do central.
  const CANCIONES = [
    { nombre: 'Jingle Bells', tempo: 120, transporte: 0, notas: [
      [64,1],[64,1],[64,2],[64,1],[64,1],[64,2],[64,1],[67,1],[60,1],[62,1],[64,4],
      [65,1],[65,1],[65,1],[65,1],[65,1],[64,1],[64,1],[64,1],[64,1],[62,1],[62,1],[64,1],[62,2],[67,2] ] },
    { nombre: 'We Wish You a Merry Christmas', tempo: 100, transporte: 0, notas: [
      [60,1],[65,1],[65,1],[67,1],[65,1],[64,1],[62,2],
      [60,1],[65,1],[65,1],[67,1],[65,1],[64,1],[62,2],
      [62,1],[67,1],[67,1],[69,1],[67,1],[65,1],[64,2],
      [60,1],[60,1],[60,1],[60,1],[62,1],[64,1],[65,4] ] },
    { nombre: 'Jingle Bells (versión alta)', tempo: 132, transporte: 5, notas: [
      [64,1],[64,1],[64,2],[64,1],[64,1],[64,2],[64,1],[67,1],[60,1],[62,1],[64,4] ] },
  ];

  const CAMBIO_MS = 5000;
  const frecuencia = midi => 440 * Math.pow(2, (midi - 69) / 12);

  let ctx = null;
  let sonando = false;
  let indice = 0;
  let timer = null;
  let nodoActual = null;
  let boton = null;

  function sonar(cancion) {
    const t0 = ctx.currentTime + 0.05;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, t0);
    master.gain.exponentialRampToValueAtTime(1, t0 + 0.2);
    master.connect(ctx.destination);
    let t = t0;
    for (const [nota0, dur] of cancion.notas) {
      const nota = nota0 + cancion.transporte;
      const len = dur * (60 / cancion.tempo);
      for (const [tipo, vol, mult] of [['triangle', 0.10, 1], ['sine', 0.04, 2]]) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = tipo;
        osc.frequency.value = frecuencia(nota) * mult;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + len * 0.92);
        osc.connect(g).connect(master);
        osc.start(t);
        osc.stop(t + len);
      }
      t += len;
    }
    return master;
  }

  function quitarActual() {
    if (!nodoActual) return;
    const ahora = ctx.currentTime;
    nodoActual.gain.cancelScheduledValues(ahora);
    nodoActual.gain.setValueAtTime(nodoActual.gain.value, ahora);
    nodoActual.gain.exponentialRampToValueAtTime(0.0001, ahora + 0.25);
    const viejo = nodoActual;
    setTimeout(() => { try { viejo.disconnect(); } catch (e) { /* ya desconectado */ } }, 400);
    nodoActual = null;
  }

  function siguiente() {
    if (!sonando || !ctx) return;
    quitarActual();
    nodoActual = sonar(CANCIONES[indice]);
    boton.dataset.cancion = CANCIONES[indice].nombre;
    indice = (indice + 1) % CANCIONES.length;
    timer = setTimeout(siguiente, CAMBIO_MS);
  }

  function actualizar(activo) {
    boton.setAttribute('aria-pressed', String(activo));
    boton.textContent = activo ? '🔇 Apagar villancicos' : '🎵 Villancicos';
  }

  function encender() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    sonando = true;
    actualizar(true);
    siguiente();
  }

  // Apagado completo: no vuelve a sonar hasta que el visitante vuelva a pulsar el botón.
  function apagar() {
    sonando = false;
    clearTimeout(timer);
    quitarActual();
    actualizar(false);
  }

  // Silencio temporal: la radio o un video en vivo tienen prioridad; los villancicos no se reanudan solos.
  function silenciarPorMedio() {
    if (sonando) apagar();
  }

  function iniciar() {
    boton = document.getElementById('btn-villancicos');
    if (!boton || !(window.AudioContext || window.webkitAudioContext)) { if (boton) boton.hidden = true; return; }
    boton.addEventListener('click', () => (sonando ? apagar() : encender()));
    // Cualquier audio o video de la página (radio, transmisión) apaga los villancicos.
    document.addEventListener('play', (e) => {
      if (e.target && (e.target.tagName === 'AUDIO' || e.target.tagName === 'VIDEO')) silenciarPorMedio();
    }, true);
    document.addEventListener('visibilitychange', () => { if (document.hidden) silenciarPorMedio(); });
  }

  iniciar();
})();
