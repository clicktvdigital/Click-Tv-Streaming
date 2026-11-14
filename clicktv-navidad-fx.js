/* CLICK TV STREAMING · Ambiente navideño.
   Splash de bienvenida (fuegos y trineo con Papá Noel, unos 5 segundos al abrir la página) y después
   fuegos ocasionales y trineo de vez en cuando. Canvas ligero. Se pausa en segundo plano y se apaga con
   "reducir movimiento". */
(() => {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'navidad-fx';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:930;transition:opacity .8s ease;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const COLORES = ['#f8d26a', '#ffffff', '#7ee9ff', '#ff6b6b', '#8be28b', '#ffb86b'];
  let ancho = 0, alto = 0, escala = 1;
  let cohetes = [], chispas = [], regalos = [], trineo = null;
  let proximoCohete = 0.4, proximoTrineo = 1.2, proximoRegalo = 0;
  let splash = 5.2;               // segundos de splash al abrir
  let ultimo = performance.now();
  let activo = true;

  function ajustar() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ancho = window.innerWidth; alto = window.innerHeight;
    canvas.width = ancho * dpr; canvas.height = alto * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    escala = ancho < 680 ? 0.6 : 1;
  }

  function lanzarCohete() {
    cohetes.push({ x: ancho * (0.12 + Math.random() * 0.76), y: alto, vy: -(alto * (0.95 + Math.random() * 0.35)), objetivo: alto * (0.14 + Math.random() * 0.34), color: COLORES[(Math.random() * COLORES.length) | 0] });
  }

  function explotar(x, y, color) {
    const n = Math.round(70 * escala);
    const estilo = Math.random();
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.15;
      const v = (1.4 + Math.random() * 2.6) * (ancho / 900 + 0.45);
      chispas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 1, color: estilo < 0.25 ? '#ffffff' : color, cola: Math.random() < 0.5 });
    }
    // Destello central
    chispas.push({ x, y, vx: 0, vy: 0, vida: 0.6, color: '#ffffff', destello: true });
  }

  // Papá Noel en trineo, con detalle: traje con ribete, barba, gorro, renos con astas y nariz roja.
  function dibujarTrineo(t) {
    const x = trineo.x, y = trineo.y;
    ctx.save();
    // Renos
    for (let i = 0; i < 3; i++) {
      const rx = x - 74 - i * 36, ry = y - 4 + Math.sin(t * 9 + i * 1.3) * 2.2;
      const g = ctx.createLinearGradient(rx - 14, ry, rx + 14, ry);
      g.addColorStop(0, '#6b4226'); g.addColorStop(1, '#3a2213');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(rx, ry, 15, 9, -0.1, 0, Math.PI * 2); ctx.fill();          // cuerpo
      ctx.beginPath(); ctx.ellipse(rx + 13, ry - 9, 6, 5.5, 0, 0, Math.PI * 2); ctx.fill();   // cabeza
      ctx.fillRect(rx - 11, ry + 6, 3.5, 11); ctx.fillRect(rx + 6, ry + 6, 3.5, 11);          // patas
      ctx.strokeStyle = '#4a2c17'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(rx + 12, ry - 13); ctx.lineTo(rx + 8, ry - 22); ctx.lineTo(rx + 14, ry - 21); ctx.stroke(); // astas
      ctx.fillStyle = '#ff3b3b'; ctx.beginPath(); ctx.arc(rx + 19, ry - 9, 2, 0, Math.PI * 2); ctx.fill(); // nariz
    }
    // Riendas
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - 36, y - 2); ctx.lineTo(x - 66, y - 6); ctx.stroke();
    // Trineo: casco dorado con ribete
    const gt = ctx.createLinearGradient(x, y - 12, x, y + 10);
    gt.addColorStop(0, '#d7262e'); gt.addColorStop(1, '#7d0f14');
    ctx.fillStyle = gt;
    ctx.beginPath(); ctx.moveTo(x - 30, y - 10); ctx.quadraticCurveTo(x, y - 16, x + 30, y - 9); ctx.lineTo(x + 26, y + 8); ctx.quadraticCurveTo(x, y + 12, x - 26, y + 8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#f8d26a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 30, y - 10); ctx.quadraticCurveTo(x, y - 16, x + 30, y - 9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 34, y + 15); ctx.quadraticCurveTo(x, y + 20, x + 34, y + 14); ctx.stroke(); // patín
    // Regalos en el trineo
    ctx.fillStyle = '#2d7dd2'; ctx.fillRect(x - 18, y - 22, 12, 10);
    ctx.fillStyle = '#f8d26a'; ctx.fillRect(x - 13, y - 22, 2, 10);
    // Papá Noel: cuerpo, cinturón, barba y gorro
    const gs = ctx.createRadialGradient(x - 2, y - 26, 2, x - 2, y - 22, 14);
    gs.addColorStop(0, '#e53935'); gs.addColorStop(1, '#8e0d0d');
    ctx.fillStyle = gs;
    ctx.beginPath(); ctx.ellipse(x - 2, y - 13, 12, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1b1b1b'; ctx.fillRect(x - 13, y - 10, 24, 3);                          // cinturón
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(x - 2, y - 26, 7, 0, Math.PI * 2); ctx.fill();                  // cara
    ctx.beginPath(); ctx.ellipse(x - 2, y - 19, 7, 5, 0, 0, Math.PI); ctx.fill();            // barba
    ctx.fillStyle = '#e53935';
    ctx.beginPath(); ctx.moveTo(x - 9, y - 30); ctx.quadraticCurveTo(x + 8, y - 48, x + 14, y - 28); ctx.lineTo(x + 6, y - 31); ctx.closePath(); ctx.fill(); // gorro
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(x + 14, y - 28, 3, 0, Math.PI * 2); ctx.fill();                  // pompón
    ctx.beginPath(); ctx.arc(x - 9, y - 30, 2.4, 0, Math.PI * 2); ctx.fill();                  // ribete
    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(x + 1, y - 27, 1.1, 0, Math.PI * 2); ctx.fill(); // ojo
    ctx.restore();
  }

  function frame(ahora) {
    const dt = Math.min((ahora - ultimo) / 1000, 0.05);
    ultimo = ahora;
    ctx.clearRect(0, 0, ancho, alto);

    if (splash > 0) {
      splash -= dt;
      proximoCohete -= dt * 2.6;   // splash: más fuegos
      if (splash <= 0.9) canvas.style.opacity = String(Math.max(0, splash / 0.9));
      if (splash <= 0) canvas.style.opacity = '1';
    }
    proximoCohete -= dt;
    if (proximoCohete <= 0) { lanzarCohete(); proximoCohete = splash > 0 ? 0.35 + Math.random() * 0.25 : 4 + Math.random() * 4; }

    proximoTrineo -= dt;
    if (!trineo && proximoTrineo <= 0) {
      trineo = { x: -140, y: alto * (splash > 0 ? 0.16 : 0.1 + Math.random() * 0.12), t: 0 };
      proximoRegalo = 0.7;
    }
    if (trineo) {
      trineo.x += (ancho + 280) / (splash > 0 ? 6 : 11) * dt; trineo.t += dt;
      proximoRegalo -= dt;
      if (proximoRegalo <= 0) {
        regalos.push({ x: trineo.x - 4, y: trineo.y + 18, vy: 30, color: COLORES[(Math.random() * COLORES.length) | 0], vida: 1 });
        proximoRegalo = 1.3;
      }
      dibujarTrineo(trineo.t);
      if (trineo.x > ancho + 150) { trineo = null; proximoTrineo = 30 + Math.random() * 25; }
    }

    cohetes = cohetes.filter(c => {
      c.y += c.vy * dt; c.vy += 260 * dt;
      ctx.fillStyle = c.color; ctx.beginPath(); ctx.arc(c.x, c.y, 2.4, 0, Math.PI * 2); ctx.fill();
      if (c.vy >= -40 || c.y <= c.objetivo) { explotar(c.x, c.y, c.color); return false; }
      return true;
    });

    chispas = chispas.filter(p => {
      if (p.destello) {
        p.vida -= dt * 2.4;
        if (p.vida <= 0) return false;
        ctx.globalAlpha = p.vida * 0.5; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 16, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        return true;
      }
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 26 * dt; p.x += p.vx; p.y += p.vy; p.vida -= dt * 0.6;
      if (p.vida <= 0) return false;
      ctx.globalAlpha = Math.max(0, p.vida); ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.cola ? 2.1 : 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      return true;
    });

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
