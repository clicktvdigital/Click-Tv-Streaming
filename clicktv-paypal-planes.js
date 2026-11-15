/* CLICK TV STREAMING · Planes mensuales de PayPal por producto.
   Este archivo lo genera scripts/crear-planes-paypal.mjs. Mientras esté vacío, no aparecen botones de suscripción. */
window.PAYPAL_PLANES = {};

// Vuelve de PayPal con ?suscripcion=ok o ?suscripcion=cancelada.
document.addEventListener('DOMContentLoaded', () => {
  const estado = new URLSearchParams(location.search).get('suscripcion');
  if (!estado) return;
  if (typeof mostrarToast === 'function') {
    if (estado === 'ok') mostrarToast('¡Suscripción enviada a PayPal! Recibirás la confirmación en tu correo.', 'exito');
    if (estado === 'cancelada') mostrarToast('Suscripción cancelada. Puedes intentarlo de nuevo cuando quieras.', 'info');
  }
  history.replaceState(null, '', location.pathname);
});
