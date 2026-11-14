/* CLICK TV STREAMING · Ambiente navideño: fuegos artificiales y un trineo con Papá Noel que suelta regalos.
   Canvas ligero, sin imágenes pesadas. Se pausa si la pestaña no se ve y se apaga si el visitante reduce el movimiento. */
(() => {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'navidad-fx';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:930;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const COLORES = ['#f8d26a', '#ffffff', '#7ee9ff', '#ff6b6b', '#8be28b'];
  let ancho = 0, alto = 0, escala = 1;
  let cohetes = [], chispas = [], regalos = [], trineo = null;
  let proximoCohete = 1.5, proximoTrineo = 8, proximoRegalo = 0;
  let ultimo = performance.now();
  let activo = true;

  function ajustar() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ancho = window.innerWidth; alto = window.innerHeight;
    canvas.width = ancho * dpr; canvas.height = alto * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    escala = ancho < 680 ? 0.6 : 1; // menos partículas en celulares
  }

  function lanzarCohete() {
    cohetes.push({ x: ancho * (0.15 + Math.random() * 0.7), y: alto, vy: -(alto * (0.9 + Math.random() * 0.4)), objetivo: alto * (0.18 + Math.random() * 0.3), color: COLORES[(Math.random() * COLORES.length) | 0] });
  }

  function explotar(x, y, color) {
    const n = Math.round(54 * escala);
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.2;
      const v = (1.2 + Math.random() * 2.4) * (ancho / 900 + 0.4);
      chispas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 1, color: Math.random() < 0.3 ? '#ffffff' : color });
    }
  }

  function dibujarTrineo(t) {
    const x = trineo.x, y = trineo.y;
    ctx.save();
    ctx.globalAlpha = 0.95;
    // Renos (siluetas)
    ctx.fillStyle = '#2b1a10';
    for (let i = 0; i < 3; i++) {
      const rx = x - 70 - i * 34, ry = y - 6 + Math.sin(t * 8 + i) * 2;
      ctx.beginPath(); ctx.ellipse(rx, ry, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(rx + 13, ry - 8, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(rx - 10, ry + 5, 3, 10); ctx.fillRect(rx + 6, ry + 5, 3, 10);
    }
    // Trineo
    ctx.fillStyle = '#b3202a';
    ctx.beginPath(); ctx.roundRect(x - 26, y - 10, 52, 20, 6); ctx.fill();
    ctx.strokeStyle = '#f8d26a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 30, y + 14); ctx.lineTo(x + 30, y + 14); ctx.stroke();
    // Papá Noel
    ctx.fillStyle = '#c62828';
    ctx.beginPath(); ctx.arc(x - 2, y - 18, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(x - 2, y - 11, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x - 12, y - 21, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function frame(ahora) {
    const dt = Math.min((ahora - ultimo) / 1000, 0.05);
    ultimo = ahora;
    ctx.clearRect(0, 0, ancho, alto);

    proximoCohete -= dt;
    if (proximoCohete <= 0) { lanzarCohete(); proximoCohete = 3.5 + Math.random() * 3.5; }

    cohetes = cohetes.filter(c => {
      c.y += c.vy * dt; c.vy += 260 * dt;
      ctx.fillStyle = c.color; ctx.beginPath(); ctx.arc(c.x, c.y, 2.2, 0, Math.PI * 2); ctx.fill();
      if (c.vy >= -40 || c.y <= c.objetivo) { explotar(c.x, c.y, c.color); return false; }
      return true;
    });

    chispas = chispas.filter(p => {
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 26 * dt; p.x += p.vx; p.y += p.vy; p.vida -= dt * 0.55;
      if (p.vida <= 0) return false;
      ctx.globalAlpha = Math.max(0, p.vida); ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      return true;
    });

    proximoTrineo -= dt;
    if (!trineo && proximoTrineo <= 0) {
      trineo = { x: -120, y: alto * 0.1 + Math.random() * alto * 0.12, t: 0 };
      proximoRegalo = 0.8;
    }
    if (trineo) {
      trineo.x += (ancho + 240) / 11 * dt; trineo.t += dt;
      proximoRegalo -= dt;
      if (proximoRegalo <= 0) {
        regalos.push({ x: trineo.x - 6, y: trineo.y + 16, vy: 30, color: COLORES[(Math.random() * COLORES.length) | 0], vida: 1 });
        proximoRegalo = 1.4;
      }
      dibujarTrineo(trineo.t);
      if (trineo.x > ancho + 140) { trineo = null; proximoTrineo = 30 + Math.random() * 25; }
    }

    regalos = regalos.filter(g => {
      g.vy += 180 * dt; g.y += g.vy * dt; g.vida -= dt * 0.35;
      if (g.vida <= 0 || g.y > alto) return false;
      ctx.globalAlpha = Math.max(0, g.vida);
      ctx.fillStyle = g.color; ctx.fillRect(g.x - 6, g.y - 6, 12, 12);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(g.x - 1, g.y - 6, 2, 12);
      ctx.globalAlpha = 1;
      return true;
    });

    if (activo) requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', () => {
    activo = !document.hidden;
    if (activo) { ultimo = performance.now(); requestAnimationFrame(frame); }
  });
  window.addEventListener('resize', ajustar);
  ajustar();
  requestAnimationFrame(frame);
})();
