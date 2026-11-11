/* CLICK TV STREAMING · Instalación como app en el celular (PWA).
 * El botón queda visible. Al presionarlo se abre la ventana de instalación
 * del navegador en cuanto esté disponible. */
(() => {
  'use strict';
  const boton = document.getElementById('btn-instalar-app');
  if (!boton) return;

  const estaInstalada = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (estaInstalada) {
    boton.hidden = true;
    return;
  }

  let evento = null;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* sin instalación */ });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    evento = e;
  });

  boton.addEventListener('click', async () => {
    if (!evento) return;
    evento.prompt();
    try { await evento.userChoice; } catch (error) { /* el cliente cerró el aviso */ }
    evento = null;
  });

  window.addEventListener('appinstalled', () => {
    boton.hidden = true;
  });
})();
