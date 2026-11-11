/* CLICK TV STREAMING · Instalación como app en el celular (PWA).
 * Muestra el botón "Instalar app" solo cuando el navegador lo permite. */
(() => {
  'use strict';
  const boton = document.getElementById('btn-instalar-app');
  let evento = null;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* sin instalación */ });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    evento = e;
    if (boton) boton.hidden = false;
  });

  if (boton) {
    boton.addEventListener('click', async () => {
      if (!evento) return;
      evento.prompt();
      try { await evento.userChoice; } catch (error) { /* el cliente cerró el aviso */ }
      evento = null;
      boton.hidden = true;
    });
  }

  window.addEventListener('appinstalled', () => {
    if (boton) boton.hidden = true;
  });
})();
