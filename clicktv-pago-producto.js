/* CLICK TV STREAMING · pago individual por producto y QR · 2026-10-15
   Los enlaces y QR NO son confirmacion automatica del pago. No se recopilan tarjetas, contraseñas ni comprobantes.
   Sin dependencias externas ni backend: se confirma manualmente por los canales comerciales.
*/
(() => {
  'use strict';
  const ID = 'clicktv-pago-producto-dialog';
  const QR = {
    payphone: { img: 'clicktv-qr-payphone.png', url: 'https://ppls.me/izAAuu8fptGHF6uZBV9L4Q' },
    deunaPichincha: { img: 'clicktv-qr-deuna-pichincha.png', url: 'https://pagar.deuna.app/H92p/person?id=v1e_WT373U4AKPZ46YWW' },
    deunaPersonal: { img: 'clicktv-qr-deuna.png', url: 'https://pagar.deuna.app/H92p/person/payment?id=858a7565a7fa5e9bc2302b7836e1fdf2d8635300' },
    binance: { img: 'clicktv-qr-binance.png', url: 'https://app.binance.com/uni-qr/RMqefYgh' }
  };
  const bancos = {
    pichincha: { nombre: 'Banco Pichincha', key: 'bancoPichincha', url: 'https://www.pichincha.com/banca-web' },
    guayaquil: { nombre: 'Banco Guayaquil', key: 'bancoGuayaquil', url: 'https://www.bancoguayaquil.com/' }
  };
  const opciones = [
    ['payphone', '📱 PayPhone', 'Escanear QR o abrir enlace de cobro'],
    ['deunaPichincha', '💜 Deuna / Pichincha', 'QR de Deuna facilitado por la tienda'],
    ['deunaPersonal', '💜 Deuna (otro QR)', 'Otra opción Deuna facilitada por la tienda'],
    ['deunaLink', '💜 Deuna enlace temporal', 'Válido hasta 14/11/2026 según el enlace recibido'],
    ['binance', '🟡 Binance', 'QR de Binance Pay; confirmar moneda y monto'],
    ['pichincha', '🏦 Banco Pichincha', 'Copiar número y abrir banca web'],
    ['guayaquil', '🏦 Banco Guayaquil', 'Copiar número y abrir banca web'],
    ['remesas', '🌍 Pichincha desde el exterior', 'Enlace facilitado para envíos internacionales'],
    ['paypal', '🅿️ PayPal', 'Abrir enlace; revisar importe y comisiones']
  ];
  let pedido = null;
  let lastFocus = null;
  const $ = id => document.getElementById(id);
  const formato = amount => `$${Number(amount).toFixed(2)} USD`;
  const esc = str => String(str || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function refPedido(){
    const d=new Date(), dia=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('');
    const bytes=new Uint8Array(4);
    if(window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes); else bytes.set([Math.random()*255,Math.random()*255,Math.random()*255,Math.random()*255]);
    return `CTV-${dia}-${Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('').slice(0,6).toUpperCase()}`;
  }
  const conf = key => typeof CONFIG!=='undefined' ? CONFIG[key] : null;
  const waNumero = soporte => {
    const first = String(conf(soporte?'whatsappAlternativoNumero':'whatsappNumero') || '').replace(/\D/g,'');
    const alt = String(conf(soporte?'whatsappNumero':'whatsappAlternativoNumero') || '').replace(/\D/g,'');
    return first || alt;
  };
  const detalle = () => pedido ? [
    'CLICK TV STREAMING - Solicitud de activacion / renovacion',
    `Pedido: ${pedido.ref}`,
    `Operación: ${pedido.operacion === 'renovacion' ? 'Renovación' : 'Cuenta nueva / activación'}`,
    `Producto: ${pedido.producto}`,
    `Plan: ${pedido.plan}`,
    `Importe mostrado: ${formato(pedido.precio)}`,
    `Método elegido: ${pedido.metodoNombre || 'Por seleccionar'}`,
    'Estado: PAGO PENDIENTE DE VERIFICAR',
    'Adjuntaré el comprobante desde WhatsApp si ya realicé el pago.',
    'Por favor, confirmen recepción, disponibilidad y activación.'
  ].join('\n') : '';
  function mensajeWhatsApp(soporte=false){
    const n=waNumero(soporte);
    if(!n){ $('ctv-pg-status').textContent='No hay WhatsApp configurado. Usa Telegram.';return; }
    window.open(`https://wa.me/${n}?text=${encodeURIComponent(detalle())}`,'_blank','noopener,noreferrer');
    $('ctv-pg-status').textContent='WhatsApp abierto. Adjunta manualmente la foto o PDF del comprobante con el icono de clip. No compartas claves ni códigos.';
  }
  function telegram(){
    const u=String(conf('telegramUsuario')||'').replace(/^@/,'');
    if(!u){ $('ctv-pg-status').textContent='No hay usuario de Telegram configurado.'; return; }
    // Copiar el resumen antes de abrir Telegram: los deep links no siempre admiten texto precargado.
    copiar(detalle(), 'Resumen copiado. Pégalo en Telegram y adjunta el comprobante.');
    window.open(`https://t.me/${encodeURIComponent(u)}`,'_blank','noopener,noreferrer');
  }
  function copiar(texto,msg){
    if(!texto) return;
    if(navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(texto).then(() => $('ctv-pg-status').textContent=msg).catch(() => mostrarTextoParaCopiar(texto));
    } else mostrarTextoParaCopiar(texto);
  }
  function mostrarTextoParaCopiar(v){
    const txt=$('ctv-pg-copiar-manual');
    txt.hidden=false;txt.value=v;txt.focus();txt.select();
    $('ctv-pg-status').textContent='Selecciona y copia el texto del cuadro que aparece.';
  }
  function linkOK(s,domains){
    try {const u=new URL(s);return u.protocol==='https:'&&domains.some(d=>u.hostname===d);}catch{return false;}
  }
  function urlMetodo(m){
    if(QR[m]) return QR[m].url;
    if(m==='paypal') return conf('paypalUrl') || 'https://www.paypal.com/';
    if(m==='deunaLink') return 'https://pagar.deuna.app/H92p/U2FsdGVkX1+d7h9/Vloewf7/9cA8KVnCeSq0jVHfPAEcMzUXIGCWZUdoUFWx0+hCMy0whtMOl1hTgF7jgRyZfzZstsoMrRrz6NnQP8/bS0V+kr/XlJUcJQOgsepVYMO7xeDkaaYWAiOKHiixWCY8frwAUSvAHjpgWScGzCsGwgSXkI3waGhRu0oUyZb9yqD9TOEP/eXYQvotO61uuXOLsQ==';
    if(m==='remesas') return 'https://envios.pichincha.com/l/Cb3V5Ja7';
    if(bancos[m]) return bancos[m].url;
    return '';
  }
  function nombreMetodo(id){return opciones.find(x=>x[0]===id)?.[1] || ''}
  function mostrarMetodo(){
    const value=document.querySelector('input[name="ctv-pg-metodo"]:checked')?.value;
    const container=$('ctv-pg-metodo-contenido');
    if(!value || !pedido){container.innerHTML='<p>Selecciona un método para continuar.</p>';return;}
    pedido.metodoNombre=nombreMetodo(value);
    let html='';
    if(QR[value]){
      const item=QR[value];
      html=`<p>Escanea este código con la aplicación correspondiente o pulsa «Abrir pago». <strong>Comprueba el titular y escribe o verifica ${formato(pedido.precio)} antes de confirmar.</strong></p><img class="ctv-pg-qr" src="${item.img}" alt="Código QR de ${esc(nombreMetodo(value))}. También disponible mediante el botón Abrir pago." width="250" height="250" loading="lazy">`;
    } else if(bancos[value]){
      const n=String(conf(bancos[value].key)||'').trim();
      html=`<p>Cuenta de ${esc(bancos[value].nombre)} para transferencia. Comprueba el titular y el importe en la banca oficial.</p><p class="ctv-pg-numero"><strong>${esc(n||'Consultar número por WhatsApp')}</strong></p>${n?'<button type="button" class="ctv-pg-btn ctv-pg-copiar" data-copiar-banco="'+esc(value)+'">📋 Copiar número de cuenta</button>':''}`;
    } else if(value==='deunaLink'){
      html='<p>Enlace de cobro facilitado por la tienda. Indica vencimiento el 14 de noviembre de 2026. Confirma el importe, beneficiario y vigencia en Deuna.</p>';
    } else if(value==='remesas') {
      html='<p>Enlace de cobro para pagos desde el exterior. El importe y las comisiones deben verificarse dentro de la plataforma.</p>';
    } else if(value==='paypal'){
      html=`<p>El enlace de PayPal puede no tener el valor precargado. Verifica el importe de ${formato(pedido.precio)} y cualquier comisión antes de completar el pago.</p>`;
    }
    html+='<p class="ctv-pg-note">🔒 No ingreses contraseñas, tarjetas ni códigos OTP dentro de CLICK TV STREAMING. Este botón abre un proveedor externo.</p>';
    const url=urlMetodo(value);
    const dominios = value==='paypal' ? ['paypal.me','www.paypal.com','paypal.com']
      : value==='remesas'?['envios.pichincha.com']
      : value==='pichincha'?['www.pichincha.com','pichincha.com']
      : value==='guayaquil'?['www.bancoguayaquil.com','bancoguayaquil.com']
      : value==='binance'?['app.binance.com']
      : value==='payphone'?['ppls.me'] : ['pagar.deuna.app'];
    const caducado=value==='deunaLink' && new Date().getTime()>new Date('2026-11-14T23:59:59-05:00').getTime();
    if(caducado) html+='<p><strong>Este enlace de cobro ha vencido. Solicita uno nuevo por WhatsApp.</strong></p>';
    else if(linkOK(url,dominios)) html+=`<a class="ctv-pg-btn ctv-pg-primary" href="${esc(url)}" target="_blank" rel="noopener noreferrer">↗ Abrir ${esc(nombreMetodo(value))}</a>`;
    else html+='<p>Enlace no disponible. Solicita información por WhatsApp.</p>';
    container.innerHTML=html;
  }
  function iniciar(){
    if($(ID)) return;
    const dlg=document.createElement('dialog');
    dlg.id=ID;dlg.className='ctv-pg-dialog';dlg.setAttribute('aria-labelledby','ctv-pg-title');
    dlg.innerHTML=`<form method="dialog" class="ctv-pg-close-form"><button type="submit" class="ctv-pg-close" aria-label="Cerrar opciones de pago">✕ Cerrar</button></form>
      <div class="ctv-pg-head"><h2 id="ctv-pg-title">💳 Pagar este plan</h2>
      <p class="ctv-pg-order" id="ctv-pg-resumen"></p>
      <p id="ctv-pg-ref"></p>
      <p class="ctv-pg-note">Elige la forma de pago. Primero confirma disponibilidad. El pedido no se activa sin comprobar el pago.</p></div>
      <fieldset class="ctv-pg-operaciones"><legend>¿Qué necesitas?</legend>
        <label><input type="radio" name="ctv-pg-operacion" value="nueva" checked> Cuenta nueva / activación</label>
        <label><input type="radio" name="ctv-pg-operacion" value="renovacion"> Renovar cuenta</label>
      </fieldset>
      <fieldset class="ctv-pg-metodos"><legend>Forma de pago</legend>${opciones.map(([id,n,description])=>`<label class="ctv-pg-option"><input type="radio" name="ctv-pg-metodo" value="${esc(id)}"><span><strong>${esc(n)}</strong><small>${esc(description)}</small></span></label>`).join('')}</fieldset>
      <div id="ctv-pg-metodo-contenido" class="ctv-pg-metodo-contenido" aria-live="polite"><p>Selecciona un método para continuar.</p></div>
      <div class="ctv-pg-comprobante"><h3>📨 Avisar pago y enviar comprobante</h3>
      <p>Envía la referencia de este pedido y adjunta manualmente tu comprobante. Si el WhatsApp principal no responde, usa soporte. El pago queda pendiente hasta que lo validemos.</p>
      <div class="ctv-pg-actions"><button type="button" data-ctv-pg-contacto="principal" class="ctv-pg-btn ctv-pg-primary">📲 WhatsApp ventas</button>
      <button type="button" data-ctv-pg-contacto="soporte" class="ctv-pg-btn">🛠 WhatsApp soporte / renovación</button>
      <button type="button" data-ctv-pg-contacto="telegram" class="ctv-pg-btn">✈️ Telegram (copiar pedido)</button>
      <button type="button" data-ctv-pg-contacto="copiar" class="ctv-pg-btn">📋 Copiar resumen</button></div>
      <textarea id="ctv-pg-copiar-manual" aria-label="Resumen o cuenta para copiar manualmente" rows="3" readonly hidden></textarea></div>
      <p class="ctv-pg-horario">🕗 <strong>Ventas y suscripciones:</strong> 08:00–20:00 · <strong>Soporte:</strong> 08:00–18:00 (hora de Ecuador).<br>⚡ Activación estimada desde 5 minutos <strong>después de verificar el pago</strong>, según disponibilidad y horario. No es automática.</p>
      <p id="ctv-pg-status" role="status" aria-live="polite" class="ctv-pg-status"></p>`;
    document.body.appendChild(dlg);
    dlg.addEventListener('change',e=>{
      if(e.target.name==='ctv-pg-metodo') mostrarMetodo();
      if(e.target.name==='ctv-pg-operacion'&&pedido) pedido.operacion=e.target.value==='renovacion'?'renovacion':'nueva';
    });
    dlg.addEventListener('click',e=>{
      const copy=e.target.closest('[data-copiar-banco]');
      if(copy){ const n=String(conf(bancos[copy.dataset.copiarBanco]?.key)||'').trim();copiar(n,'Número copiado. Confirma titular y monto antes de enviar.');return;}
      const what=e.target.closest('[data-ctv-pg-contacto]');if(!what)return;
      if(what.dataset.ctvPgContacto==='principal') mensajeWhatsApp(false);
      else if(what.dataset.ctvPgContacto==='soporte') mensajeWhatsApp(true);
      else if(what.dataset.ctvPgContacto==='telegram') telegram();
      else copiar(detalle(),'Resumen copiado. Pégalo al solicitar la activación.');
    });
    dlg.addEventListener('close',()=>{document.body.classList.remove('ctv-pg-open');lastFocus?.focus?.();});
    // Pone un botón en cada plan de compra, respetando los métodos preexistentes.
    const grid=$('catalogo-grid');
    if(grid){
      const enhance=()=>{
        grid.querySelectorAll('.product-card[data-producto]').forEach(card=>{
          card.querySelectorAll('.product-plan').forEach((row,index)=>{
            const actions=row.querySelector('.product-plan__actions');
            if(!actions || actions.querySelector('.ctv-pg-pay-button'))return;
            const producto=Array.isArray(PRODUCTOS) ? PRODUCTOS.find(p=>p.id===card.dataset.producto) : null;
            const plan=producto?.planes?.[index];
            if(!plan || plan.consultar || !Number.isFinite(Number(plan.precio)) || Number(plan.precio)<=0)return;
            const btn=document.createElement('button');btn.type='button';btn.className='ctv-pg-pay-button';
            btn.dataset.producto=card.dataset.producto;btn.dataset.plan=index;
            btn.textContent='💳 Pagar este plan';
            btn.setAttribute('aria-label',`Pagar ${producto.nombre}, ${plan.tipo}, ${formato(plan.precio)}`);
            actions.prepend(btn);
          });
        });
      };
      enhance();
      if('MutationObserver' in window){
        // Solo observa cambios al nivel de las tarjetas, no nuestros botones.
        const obs=new MutationObserver(enhance);obs.observe(grid,{childList:true,subtree:false});
      }
      grid.addEventListener('click',e=>{
        const btn=e.target.closest('.ctv-pg-pay-button');
        if(!btn || !grid.contains(btn))return;
        const product=Array.isArray(PRODUCTOS) ? PRODUCTOS.find(p=>p.id===btn.dataset.producto) : null;
        const plan=product?.planes?.[Number(btn.dataset.plan)];
        if(!product || !plan || plan.consultar) return;
        open({producto:product.nombre,plan:plan.tipo,precio:Number(plan.precio)});
      });
    }
  }
  function open(order){
    const dialog=$(ID); if(!dialog || !(Number(order?.precio)>0)) return;
    const referencia=refPedido();
    pedido={...order,ref:referencia,operacion:'nueva',metodoNombre:''};
    $('ctv-pg-resumen').textContent=`${order.producto} · ${order.plan} · ${formato(order.precio)}`;
    $('ctv-pg-ref').textContent=`Referencia del pedido: ${referencia}`;
    document.querySelectorAll('input[name="ctv-pg-metodo"]').forEach(i=>i.checked=false);
    const n=document.querySelector('input[name="ctv-pg-operacion"][value="nueva"]');if(n)n.checked=true;
    $('ctv-pg-metodo-contenido').innerHTML='<p>Selecciona un método para continuar.</p>';
    $('ctv-pg-copiar-manual').hidden=true;$('ctv-pg-status').textContent='';
    lastFocus=document.activeElement;
    if(typeof dialog.showModal==='function'){dialog.showModal();document.body.classList.add('ctv-pg-open');}
    else {dialog.setAttribute('open','');document.body.classList.add('ctv-pg-open');}
    dialog.querySelector('.ctv-pg-close').focus();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',iniciar,{once:true});
  else iniciar();
})();
