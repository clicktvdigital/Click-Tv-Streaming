/* CLICK TV STREAMING · Villancicos sintetizados con el navegador (melodías de dominio público, sin audio con licencia).
   Cada villancico tiene armonía (acordes), bajo y melodía con campanas. Cada vuelta cambia de instrumentos,
   registro y tempo, para que no suene igual. Cambia cada 5 segundos. Se silencia con la radio o un video. */
(() => {
  'use strict';
  const NOTA = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const mIDI = (n, oct) => 12 * (oct + 1) + n;
  // Acordes por compás: [raíz (semitonos desde Do), tipo] → tríada.
  const ACORDES = {
    C: [0, 4, 7], G: [7, 11, 14], F: [5, 9, 12], Am: [9, 12, 16], Dm: [2, 5, 9], Em: [4, 7, 11], G7: [7, 11, 14, 17], D: [2, 6, 9]
  };

  // Melodías de dominio público. Duración en tiempos (1 = negra). Tonalidad de Do.
  const CANCIONES = [
    { nombre: 'Jingle Bells', tempo: 124, oct: 4,
      melodia: [[64,1],[64,1],[64,2],[64,1],[64,1],[64,2],[64,1],[67,1],[60,1],[62,1],[64,4],
                [65,1],[65,1],[65,1],[65,1],[65,1],[64,1],[64,1],[64,1],[64,1],[62,1],[62,1],[64,1],[62,2],[67,2]],
      acordes: ['C','C','C','C','C','C','C','C','F','F','C','C','G7','G7','C','C'] },
    { nombre: 'We Wish You a Merry Christmas', tempo: 104, oct: 4,
      melodia: [[60,1],[65,1],[65,1],[67,1],[65,1],[64,1],[62,2],
                [60,1],[65,1],[65,1],[67,1],[65,1],[64,1],[62,2],
                [62,1],[67,1],[67,1],[69,1],[67,1],[65,1],[64,2],
                [60,1],[60,1],[60,1],[60,1],[62,1],[64,1],[65,4]],
      acordes: ['C','C','F','C','G','G','C','C','F','F','C','G','C','C','G','C'] },
    { nombre: 'Campanas de Navidad', tempo: 96, oct: 5,
      melodia: [[67,1],[67,1],[69,1],[67,1],[64,2],[62,1],[62,1],[64,1],[62,1],[59,2],
                [60,1],[60,1],[62,1],[64,1],[60,2],[67,1],[67,1],[69,1],[67,1],[64,2],
                [62,1],[62,1],[64,1],[62,1],[59,2],[60,4]],
      acordes: ['C','Am','F','G','C','Am','Dm','G7','C','Am','F','G','C','G','C','C'] },
  ];

  // Variaciones: cada vuelta cambia el instrumento de la voz, el registro y el tempo.
  const VARIACIONES = [
    { voz: 'campana', armonia: 'piano', tempoMult: 1.0, transporte: 0 },
    { voz: 'flauta', armonia: 'pad', tempoMult: 0.92, transporte: 0 },
    { voz: 'campana', armonia: 'pad', tempoMult: 1.08, transporte: 5 },
    { voz: 'celesta', armonia: 'piano', tempoMult: 0.96, transporte: -3 },
  ];

  const CAMBIO_MS = 5000;
  const frecuencia = midi => 440 * Math.pow(2, (midi - 69) / 12);

  let ctx = null, sonando = false, paso = 0, timer = null, nodoActual = null, boton = null;

  function tono(t, midi, dur, tipo, vol, decay) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = tipo;
    osc.frequency.value = frecuencia(midi);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (decay || dur) );
    osc.connect(g);
    osc.start(t);
    osc.stop(t + (decay || dur) + 0.05);
    return g;
  }

  // Campana: fundamental + armónicos con caída rápida (suena a campanas, no a sintetizador).
  function campana(t, midi, dur, vol, dest) {
    [[1, 1], [2.01, 0.35], [3.02, 0.15]].forEach(([m, f], i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = frecuencia(midi) * m;
      const pico = vol * f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(pico, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur * 1.6, 0.6) / (1 + i * 0.6));
      osc.connect(g).connect(dest);
      osc.start(t);
      osc.stop(t + 2);
    });
  }

  function flauta(t, midi, dur, vol, dest) {
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frecuencia(midi);
    lfo.frequency.value = 5.5;
    lfoG.gain.value = 3;
    lfo.connect(lfoG).connect(osc.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.08);
    g.gain.setValueAtTime(vol, t + dur * 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.98);
    osc.connect(g).connect(dest);
    osc.start(t); lfo.start(t);
    osc.stop(t + dur); lfo.stop(t + dur);
  }

  function celesta(t, midi, dur, vol, dest) {
    campana(t, midi + 12, dur * 0.6, vol * 0.8, dest);
  }

  function pad(t, midis, dur, vol, dest) {
    midis.forEach((m, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = frecuencia(m);
      osc.detune.value = (i - 1) * 6;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.95);
      osc.connect(g).connect(dest);
      osc.start(t); osc.stop(t + dur);
    });
  }

  function piano(t, midis, dur, vol, dest) {
    midis.forEach(m => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = frecuencia(m);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.9);
      osc.connect(g).connect(dest);
      osc.start(t); osc.stop(t + dur);
    });
  }

  function sonar(cancion, variacion) {
    const t0 = ctx.currentTime + 0.05;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, t0);
    master.gain.exponentialRampToValueAtTime(0.9, t0 + 0.25);
    master.connect(ctx.destination);
    const bpm = cancion.tempo * variacion.tempoMult;
    const beat = 60 / bpm;
    const oct = cancion.oct;
    const T = variacion.transporte;

    // Melodía
    let t = t0;
    for (const [nota, dur] of cancion.melodia) {
      const midi = nota + (oct - 4) * 12 + T;
      const len = dur * beat;
      if (variacion.voz === 'campana') campana(t, midi, len, 0.22, master);
      else if (variacion.voz === 'flauta') flauta(t, midi, len, 0.16, master);
      else celesta(t, midi, len, 0.2, master);
      t += len;
    }
    // Armonía y bajo: un acorde por tiempo y medio, bajo en la fundamental.
    const duracionTotal = cancion.melodia.reduce((a, [, d]) => a + d, 0) * beat;
    const compas = beat * 4;
    let tc = t0;
    let i = 0;
    while (tc < t0 + duracionTotal - 0.01) {
      const acorde = ACORDES[cancion.acordes[i % cancion.acordes.length]];
      const notas = acorde.map(n => mIDI(0, oct - 1) + n + T);
      const bajo = notas[0] - 12;
      const dur = Math.min(compas, t0 + duracionTotal - tc);
      if (variacion.armonia === 'piano') piano(tc, notas, dur, 0.05, master);
      else pad(tc, notas, dur, 0.035, master);
      tono(tc, bajo, dur, 'sine', 0.12, dur * 0.9);
      tc += compas;
      i++;
    }
    return { nodo: master, duracion: duracionTotal };
  }

  function quitarActual() {
    if (!nodoActual) return;
    const ahora = ctx.currentTime;
    const viejo = nodoActual;
    viejo.gain.cancelScheduledValues(ahora);
    viejo.gain.setValueAtTime(viejo.gain.value, ahora);
    viejo.gain.exponentialRampToValueAtTime(0.0001, ahora + 0.3);
    setTimeout(() => { try { viejo.disconnect(); } catch (e) { /* ya desconectado */ } }, 500);
    nodoActual = null;
  }

  function siguiente() {
    if (!sonando || !ctx) return;
    quitarActual();
    const cancion = CANCIONES[paso % CANCIONES.length];
    const variacion = VARIACIONES[Math.floor(paso / CANCIONES.length) % VARIACIONES.length];
    nodoActual = sonar(cancion, variacion).nodo;
    boton.dataset.cancion = cancion.nombre;
    paso++;
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

  function apagar() {
    sonando = false;
    clearTimeout(timer);
    quitarActual();
    actualizar(false);
  }

  function silenciarPorMedio() { if (sonando) apagar(); }

  function iniciar() {
    boton = document.getElementById('btn-villancicos');
    if (!boton || !(window.AudioContext || window.webkitAudioContext)) { if (boton) boton.hidden = true; return; }
    boton.addEventListener('click', () => (sonando ? apagar() : encender()));
    document.addEventListener('play', (e) => {
      if (e.target && (e.target.tagName === 'AUDIO' || e.target.tagName === 'VIDEO')) silenciarPorMedio();
    }, true);
    document.addEventListener('visibilitychange', () => { if (document.hidden) silenciarPorMedio(); });
  }

  iniciar();
})();
