/* CLICK TV STREAMING · Instalación como app en el celular (PWA).
 * El botón queda visible. Si el navegador todavía no tiene lista la instalación,
 * el primer toque queda pendiente y la ventana se abre en cuanto esté disponible. */
(() => {
  'use strict';
  const boton = document.getElementById('btn-instalar-app');
  if (!boton) return;

  const textoOriginal = boton.textContent;
  const estaInstalada = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (estaInstalada) {
    boton.hidden = true;
    return;
  }

  let evento = null;
  let pendiente = false;
  let esperaTimer = null;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* sin instalación */ });
  }

  function abrirInstalacion() {
    if (!evento) return;
    const e = evento;
    evento = null;
    pendiente = false;
    clearTimeout(esperaTimer);
    boton.textContent = textoOriginal;
    e.prompt();
    e.userChoice.catch(() => { /* el cliente cerró el aviso */ });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    evento = e;
    if (pendiente) abrirInstalacion();
  });

  boton.addEventListener('click', () => {
    if (evento) {
      abrirInstalacion();
      return;
    }
    // Aún no está lista: se abre apenas el navegador la ofrezca.
    pendiente = true;
    boton.textContent = '📲 Preparando instalación…';
    clearTimeout(esperaTimer);
    esperaTimer = setTimeout(() => {
      pendiente = false;
      boton.textContent = textoOriginal;
    }, 6000);
  });

  window.addEventListener('appinstalled', () => {
    boton.hidden = true;
  });
})();
