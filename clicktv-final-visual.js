/* Navegación visual sin duplicar productos ni cambiar carrito/pasarelas. */
(() => {
  'use strict';
  function init() {
    // Las tarjetas [data-ctv-category] las atiende clicktv-navegacion-movil.js (filtro + scroll).
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
