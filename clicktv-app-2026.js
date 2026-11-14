/* CLICK TV STREAMING · Instalación como app (PWA).
 * Si el navegador ofrece la instalación, el botón la abre.
 * Si no la ofrece (iPhone, otros navegadores), muestra cómo instalarla en ese teléfono. */
(() => {
  'use strict';
  const boton = document.getElementById('btn-instalar-app');
  if (!boton) return;

  const textoOriginal = boton.textContent;
  const estaInstalada = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (estaInstalada) { boton.hidden = true; return; }

  const ENLACE = 'https://click-tv-streaming.vercel.app/';
  const esIphone = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const esAndroid = /Android/i.test(navigator.userAgent);
  let evento = null;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* sin instalación */ });
  }

  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); evento = e; });
  window.addEventListener('appinstalled', () => { boton.hidden = true; });

  function instrucciones() {
    if (esIphone) return 'Toca el botón Compartir de Safari (cuadro con flecha) y elige "Agregar a pantalla de inicio".';
    if (esAndroid) return 'Abre el menú ⋮ de tu navegador y toca "Instalar app" o "Agregar a pantalla de inicio".';
    return 'En la barra de direcciones, toca el ícono de instalar, o abre el menú del navegador y elige "Instalar Click TV".';
  }

  function mostrarPanel() {
    let panel = document.getElementById('panel-instalar');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'panel-instalar';
      panel.className = 'panel-instalar';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'Instalar Click TV');
      panel.innerHTML = `
        <div class="panel-instalar__card">
          <strong>📲 Instala Click TV en tu teléfono</strong>
          <p>${instrucciones()}</p>
          <p class="panel-instalar__enlace">Enlace de la tienda: <a href="${ENLACE}">${ENLACE}</a></p>
          <div class="panel-instalar__acciones">
            <button type="button" class="btn btn--primary" id="btn-copiar-enlace-app">Copiar enlace</button>
            <button type="button" class="btn btn--ghost" id="btn-cerrar-instalar">Cerrar</button>
          </div>
        </div>`;
      document.body.appendChild(panel);
      panel.querySelector('#btn-cerrar-instalar').addEventListener('click', () => { panel.hidden = true; });
      panel.querySelector('#btn-copiar-enlace-app').addEventListener('click', async (e) => {
        try { await navigator.clipboard.writeText(ENLACE); e.currentTarget.textContent = '✔ Copiado'; }
        catch (err) { e.currentTarget.textContent = ENLACE; }
      });
    }
    panel.hidden = false;
  }

  boton.addEventListener('click', async () => {
    if (evento) {
      const e = evento;
      evento = null;
      e.prompt();
      try { await e.userChoice; } catch (err) { /* el visitante cerró el aviso */ }
      return;
    }
    mostrarPanel();
  });
})();
