/* Navegación visual sin duplicar productos ni cambiar carrito/pasarelas. */
(() => {
  'use strict';
  function init() {
    document.querySelectorAll('[data-ctv-category]').forEach(link => {
      link.addEventListener('click', () => {
        const category = link.getAttribute('data-ctv-category');
        if (typeof window.seleccionarCategoriaCatalogo === 'function') {
          window.seleccionarCategoriaCatalogo(category);
        }
      });
    });
    const cart = document.getElementById('panel-carrito');
    if (cart) {
      cart.setAttribute('aria-label','Carrito de compras: revisa tu pedido, formas de pago y canales de ayuda');
      const h = cart.querySelector('.cart-contact-options > strong');
      if (h) h.textContent = '¿Dónde deseas enviar tu pedido o solicitar una renovación?';
      const note = cart.querySelector('.cart-contact-options > p');
      if (note) note.textContent = 'Compras: WhatsApp comercial. Renovaciones y soporte: WhatsApp de atención. También puedes enviar el pedido por Telegram.';
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
