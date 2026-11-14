/* CLICK TV STREAMING · Papá Noel en trineo que cruza el fondo de la página mientras se navega.
   Imágenes ligeras (WebP) con transición suave. Se desactiva si el visitante reduce el movimiento. */
(() => {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const escena = document.createElement('div');
  escena.className = 'navidad-escena';
  escena.setAttribute('aria-hidden', 'true');
  ['santa-1', 'santa-2', 'santa-3'].forEach((nombre, i) => {
    const img = document.createElement('img');
    img.src = `assets/navidad/${nombre}.webp`;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.style.animationDelay = `${-i * 9}s`;
    escena.appendChild(img);
  });
  document.body.insertBefore(escena, document.body.firstChild);
})();
