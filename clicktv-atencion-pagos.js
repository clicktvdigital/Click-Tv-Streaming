/* CLICK TV STREAMING — rutas diferenciadas de compra, renovación y soporte.
 * No envía claves, PIN, OTP, tarjetas ni datos bancarios del comprador. */
(() => {
  'use strict';
  const init = () => {
    if (typeof CONFIG === 'undefined') return;
    const numeroNuevo = String(CONFIG.whatsappNumero || '').replace(/\D/g, '');
    const numeroSoporte = String(CONFIG.whatsappAlternativoNumero || '').replace(/\D/g, '');
    const construirEnlace = (numero, mensaje) => `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    const abrir = (numero, mensaje) => window.open(construirEnlace(numero,mensaje),'_blank','noopener,noreferrer');
    const textoNuevo = 'Hola CLICK TV STREAMING. Quiero contratar un servicio nuevo. ¿Me confirman disponibilidad, precio final y activación antes de pagar?';
    const textoSoporte = 'Hola CLICK TV STREAMING. Necesito soporte técnico de un servicio activo. Indicaré servicio y problema, sin compartir contraseñas ni códigos.';
    const renovarTexto = (servicio='') => `Hola CLICK TV STREAMING. Deseo renovar mi servicio${servicio ? ': '+servicio : ''}. Por favor, confirmen vencimiento, importe y disponibilidad antes de pagar.`;
    const aNuevo = document.getElementById('ctv-enlace-nuevo');
    const aSoporte = document.getElementById('ctv-enlace-soporte');
    const aRenovar = document.getElementById('ctv-enlace-renovar');
    if(aNuevo) aNuevo.href = construirEnlace(numeroNuevo,textoNuevo);
    if(aSoporte) aSoporte.href = construirEnlace(numeroSoporte,textoSoporte);
    if(aRenovar) aRenovar.href = construirEnlace(numeroSoporte,renovarTexto());
    const linkAntiguo = document.getElementById('link-renovar-servicio');
    if(linkAntiguo){ linkAntiguo.href = construirEnlace(numeroSoporte,renovarTexto()); linkAntiguo.textContent='🔁 Renovar por WhatsApp de soporte'; }
    const botonRenovar = document.getElementById('ctv-renovar-enviar');
    const nombreServicio = document.getElementById('ctv-renovar-servicio');
    if (botonRenovar) botonRenovar.addEventListener('click', () => {
      const servicio = (nombreServicio?.value || '').trim().slice(0,75);
      abrir(numeroSoporte,renovarTexto(servicio));
    });
    const marcarNuevo = document.getElementById('ctv-nuevo-ayuda');
    if(marcarNuevo) marcarNuevo.addEventListener('click',()=>abrir(numeroNuevo,textoNuevo));
    const bankMap = [
      {selector:'ctv-banco-pichincha', num:String(CONFIG.bancoPichincha || ''),nombre:'Banco Pichincha'},
      {selector:'ctv-banco-guayaquil', num:String(CONFIG.bancoGuayaquil || ''),nombre:'Banco Guayaquil'}
    ];
    bankMap.forEach(bank => {
      const label = document.getElementById(bank.selector+'-numero');
      const copy = document.getElementById(bank.selector+'-copiar');
      if (label) label.textContent = bank.num || 'Consultar por WhatsApp';
      if (copy) {
        copy.disabled = !bank.num;
        copy.addEventListener('click', async () => {
          const info=document.getElementById('ctv-estado-copia');
          try {
            if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(bank.num);
            else if (typeof copiarTexto === 'function') { await copiarTexto(bank.num,'Cuenta copiada'); }
            else throw new Error('Sin portapapeles');
            if(info) info.textContent = '✅ Número de '+bank.nombre+' copiado. Verifica titular y cuenta antes de transferir.';
          } catch(e) {
            if(info) info.textContent = 'No se pudo copiar. Mantén pulsado el número para copiarlo manualmente.';
          }
        });
      }
    });
    for (const [id,key] of [['ctv-pago-deuna','deunaUrl'],['ctv-pago-payphone','payphoneUrl'],['ctv-pago-paypal','paypalUrl']]) {
      const link=document.getElementById(id);
      if(link){ const url=CONFIG[key];if(typeof url ==='string' && /^https:\/\//i.test(url)) link.href=url; else link.hidden=true; }
    }
    // Las funciones existentes mantienen la compra nueva al WhatsApp principal.
    // Si el usuario prepara una renovación en el carrito, el mensaje se dirige a soporte.
    if(typeof window.enviarPedidoWhatsApp === 'function'){
      const original = window.enviarPedidoWhatsApp;
      window.enviarPedidoWhatsApp = function (...args){
        try {
          if (Array.isArray(carrito) && carrito.some(item=>item.operacion==='renovacion') && typeof generarResumenPedido==='function') {
            return abrir(numeroSoporte, generarResumenPedido() + '\n\nSolicitud de renovación/gestión de servicio existente.');
          }
        } catch(e){ console.warn('[Click TV] Revisión de renovación:',e); }
        return original.apply(this,args);
      };
    }
    if(typeof window.renovarServicio === 'function'){
      const original=window.renovarServicio;
      window.renovarServicio=function(id,plan,agregar=false){
        if(agregar) return original.call(this,id,plan,true);
        try {
          const producto=PRODUCTOS.find(p=>p.id===id);
          const p=producto?.planes?.[Number(plan)];
          return abrir(numeroSoporte, renovarTexto(producto ? `${producto.nombre} · ${p?.tipo || ''}`: ''));
        } catch(e){return abrir(numeroSoporte,renovarTexto());}
      };
    }
    if(typeof window.renovarItemWhatsApp === 'function'){
      window.renovarItemWhatsApp=function(id){
        if(!Array.isArray(carrito)) return;
        const item=carrito.find(i=>i.itemId===id);
        if(!item) return;
        return abrir(numeroSoporte, renovarTexto(`${item.nombre} · ${item.plan}`));
      };
    }
    if(typeof window.contactarPlanWhatsApp === 'function'){
      const original = window.contactarPlanWhatsApp;
      window.contactarPlanWhatsApp = function(id,idx,operacion='compra'){
        if(operacion !== 'renovacion') return original.call(this,id,idx,operacion);
        const producto=PRODUCTOS.find(p=>p.id===id);
        const plan=producto?.planes?.[Number(idx)];
        return abrir(numeroSoporte,renovarTexto(producto ? `${producto.nombre} · ${plan?.tipo||''}` : ''));
      };
    }
    // Renovación visible dentro de cada tarjeta sin obligar a pasar por el carrito.
    const grid=document.getElementById('catalogo-grid');
    if(grid) grid.addEventListener('click',e=>{
      const boton=e.target.closest('button[onclick^="marcarPlanRenovacion("]');
      if(!boton || !grid.contains(boton)) return;
      const card=boton.closest('.product-card'); const row=boton.closest('.product-plan');
      const producto=Array.isArray(PRODUCTOS)?PRODUCTOS.find(p=>p.id===card?.dataset.producto):null;
      if(!producto || !row) return;
      const idx=[...card.querySelectorAll('.product-plan')].indexOf(row);
      const plan=producto.planes[idx];
      if(!plan) return;
      e.preventDefault(); e.stopImmediatePropagation();
      abrir(numeroSoporte,renovarTexto(`${producto.nombre} · ${plan.tipo}`));
    },true);
    const FAQ = document.querySelector('#ayuda .section-head p');
    if(FAQ) FAQ.textContent = 'Conoce los pasos de compra, renovación y soporte antes de realizar tu pago.';
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
