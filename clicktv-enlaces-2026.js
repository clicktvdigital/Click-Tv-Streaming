/* CLICK TV STREAMING · Enlaces directos a cada producto.
 * Ejemplo: https://click-tv-streaming.vercel.app/?producto=netflix-compartido
 * Al abrirlo, la tienda cambia a la categoría del producto, lo lleva a su tarjeta y lo resalta. */
(() => {
  'use strict';

  // Nombres que usamos al compartir y que se traducen al identificador interno del catálogo.
  const ALIAS = { 'netflix-normal': 'netflix-compartido' };

  function idDesdeEnlace() {
    const valor = new URLSearchParams(window.location.search).get('producto');
    if (!valor || !/^[a-z0-9-]{2,60}$/.test(valor)) return null;
    return ALIAS[valor] || valor;
  }

  function enlaceDeProducto(id) {
    const base = window.location.origin + window.location.pathname;
    return `${base}?producto=${encodeURIComponent(id)}`;
  }

  window.enlaceDeProducto = enlaceDeProducto;

  window.copiarEnlaceProducto = async (id, boton) => {
    const texto = enlaceDeProducto(id);
    const original = boton ? boton.textContent : '';
    try {
      await navigator.clipboard.writeText(texto);
      if (boton) boton.textContent = '✅ Enlace copiado';
    } catch (error) {
      window.prompt('Copia este enlace:', texto);
    }
    if (boton) setTimeout(() => { boton.textContent = original; }, 2000);
  };

  function buscarTarjeta(id) {
    return document.querySelector(`.product-card[data-producto="${CSS.escape(id)}"]`);
  }

  function resaltar(tarjeta) {
    tarjeta.classList.add('catalogo-destacado');
    tarjeta.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => tarjeta.classList.remove('catalogo-destacado'), 4000);
  }

  function abrirProductoDesdeEnlace(id) {
    const producto = (typeof PRODUCTOS !== 'undefined' ? PRODUCTOS : []).find((p) => p.id === id);
    if (!producto) return;

    // Cambia a la categoría del producto para que su tarjeta exista en pantalla.
    if (typeof window.seleccionarCategoriaCatalogo === 'function') {
      window.seleccionarCategoriaCatalogo(producto.categoria);
    }

    // Espera a que el catálogo se pinte y luego lleva a la tarjeta.
    let intentos = 0;
    const timer = setInterval(() => {
      const tarjeta = buscarTarjeta(id);
      intentos += 1;
      if (tarjeta) {
        clearInterval(timer);
        setTimeout(() => resaltar(tarjeta), 250);
      } else if (intentos > 40) {
        clearInterval(timer);
      }
    }, 100);
  }

  const id = idDesdeEnlace();
  if (id) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => abrirProductoDesdeEnlace(id));
    } else {
      abrirProductoDesdeEnlace(id);
    }
  }
})();
