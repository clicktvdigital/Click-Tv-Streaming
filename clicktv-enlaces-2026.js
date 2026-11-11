/* CLICK TV STREAMING · Enlaces directos a cada producto.
 * Ejemplo: https://click-tv-streaming.vercel.app/?producto=netflix-compartido
 * Al abrirlo, la tienda cambia a la categoría del producto, lo lleva a su tarjeta y lo resalta. */
(() => {
  'use strict';

  // Nombres que usamos al compartir y que se traducen al identificador interno del catálogo.
  const ALIAS = { 'netflix-normal': 'netflix-compartido' };

  // Evita que el navegador restaure la posición de desplazamiento y pise el destino del enlace.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

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

  const OFFSET_CABECERA = 170;

  function posicionarGrid(grid) {
    const desvio = grid.getBoundingClientRect().top - OFFSET_CABECERA;
    if (Math.abs(desvio) < 40) return;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({ top: Math.max(window.scrollY + desvio, 0), behavior: 'auto' });
  }

  function mostrarAviso(producto, grid) {
    document.getElementById('enlace-producto-aviso')?.remove();
    const aviso = document.createElement('div');
    aviso.id = 'enlace-producto-aviso';
    aviso.className = 'enlace-producto-aviso';
    aviso.innerHTML = `<span class="enlace-producto-aviso__titulo">🔗 Mostrando: <strong></strong></span><ol class="enlace-producto-aviso__pasos"><li>Elige el plan</li><li>Añade al carrito o compra por WhatsApp</li><li>Finaliza y paga</li></ol><button type="button" id="btn-ver-todo-catalogo">Ver todo el catálogo</button>`;
    aviso.querySelector('strong').textContent = producto.nombre;
    grid.parentNode.insertBefore(aviso, grid);
    document.getElementById('btn-ver-todo-catalogo').addEventListener('click', () => {
      if (typeof window.seleccionarCategoriaCatalogo === 'function') {
        window.seleccionarCategoriaCatalogo(producto.categoria);
      }
    });
  }

  function abrirProductoDesdeEnlace(id) {
    const producto = (typeof PRODUCTOS !== 'undefined' ? PRODUCTOS : []).find((p) => p.id === id);
    if (!producto || typeof window.seleccionarCategoriaCatalogo !== 'function') return;

    // Muestra solo el producto del enlace, dentro de su categoría.
    window.seleccionarCategoriaCatalogo(producto.categoria);
    window.productoEnfocado = id;
    window.renderCatalogo();

    const grid = document.getElementById('catalogo-grid');
    if (!grid) return;
    mostrarAviso(producto, grid);

    // Se lleva la vista al producto; la pantalla casi no cambia, así que una revisión basta.
    setTimeout(() => posicionarGrid(grid), 400);
    setTimeout(() => posicionarGrid(grid), 1400);
  }

  // Disponible para el asistente y otros accesos a un producto concreto.
  window.enfocarProducto = abrirProductoDesdeEnlace;

  const id = idDesdeEnlace();
  if (id) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => abrirProductoDesdeEnlace(id));
    } else {
      abrirProductoDesdeEnlace(id);
    }
    // Cuando termina de cargar todo (imágenes, partidos), se vuelve a llevar al producto.

  }
})();
