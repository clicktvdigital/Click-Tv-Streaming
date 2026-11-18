/* CLICK TV STREAMING · Acordeones de la portada · 18/11/2026
   Las secciones largas (radio, TV en vivo, condiciones, contacto, reseña, combo y resumen) usan <details>.
   - Si un enlace, el buscador del menú o la URL apuntan a algo dentro de un desplegable cerrado, se abre solo.
   - El encabezado del combo muestra cuántos servicios lleva y el del resumen, el total estimado,
     para que la información clave se vea aunque el desplegable esté cerrado. */
(() => {
  'use strict';

  // Abre todos los <details> que contienen al elemento (o el propio, si es uno). Devuelve true si abrió alguno.
  function abrirAcordeones(el) {
    let abrio = false;
    for (let nodo = el; nodo && nodo !== document.body; nodo = nodo.parentElement) {
      if (nodo.tagName === 'DETAILS' && !nodo.open) { nodo.open = true; abrio = true; }
    }
    return abrio;
  }

  function destinoDeHash(hash) {
    if (!hash || hash.length < 2) return null;
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); } catch { return null; }
  }

  function abrirPorHash(hash, desplazar) {
    const destino = destinoDeHash(hash);
    if (!destino || !abrirAcordeones(destino) || !desplazar) return;
    const suave = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => destino.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' }));
  }

  // Copia el texto de un elemento a otro y lo mantiene sincronizado.
  function reflejar(origenId, copiaId) {
    const origen = document.getElementById(origenId);
    const copia = document.getElementById(copiaId);
    if (!origen || !copia) return;
    const copiar = () => { copia.textContent = origen.textContent.trim(); };
    copiar();
    new MutationObserver(copiar).observe(origen, { childList: true, characterData: true, subtree: true });
  }

  function iniciar() {
    // Antes del manejador de la página: así el destino ya está visible cuando se calcula el desplazamiento.
    document.addEventListener('click', (e) => {
      const enlace = e.target.closest?.('a[href^="#"]');
      if (enlace) abrirAcordeones(destinoDeHash(enlace.getAttribute('href')));
    }, true);
    window.addEventListener('hashchange', () => abrirPorHash(location.hash, true));
    abrirPorHash(location.hash, true);

    // Si algo enfoca un campo dentro de un desplegable cerrado (p. ej. un error de validación), se abre.
    document.addEventListener('invalid', (e) => abrirAcordeones(e.target), true);

    reflejar('combo-cuenta', 'combo-cuenta-resumen');
    reflejar('ahorro-total', 'ahorro-total-resumen');
  }

  window.ctvAcordeones = { abrir: abrirAcordeones };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
})();
