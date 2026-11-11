/* CLICK TV STREAMING · Instalación como app en el celular (PWA).
 * El botón aparece de inmediato. Si el navegador todavía no permite instalar
 * con un toque, el botón indica cómo hacerlo desde el menú del navegador. */
(() => {
  'use strict';
  const boton = document.getElementById('btn-instalar-app');
  if (!boton) return;

  const textoOriginal = boton.textContent;
  let evento = null;
  let avisoTimer = null;

  const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const estaInstalada = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  if (estaInstalada) {
    boton.hidden = true;
    return;
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* sin instalación */ });
  }

  function mostrarAviso(texto) {
    boton.textContent = texto;
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => { boton.textContent = textoOriginal; }, 7000);
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    evento = e;
  });

  boton.addEventListener('click', async () => {
    if (evento) {
      evento.prompt();
      try { await evento.userChoice; } catch (error) { /* el cliente cerró el aviso */ }
      evento = null;
      boton.hidden = true;
      return;
    }
    if (esIOS) {
      mostrarAviso('Toca Compartir ⬆️ y luego «Añadir a pantalla de inicio»');
    } else {
      mostrarAviso('Abre el menú ⋮ del navegador y elige «Instalar app»');
    }
  });

  window.addEventListener('appinstalled', () => {
    boton.hidden = true;
  });
})();
