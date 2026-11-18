/* v2.6: radio nativa estable, sin Web Audio/CORS silencioso. */
/* Catálogo multicanal Click TV Streaming */
(function () {
  const escapar = (texto = "") => String(texto).replace(/[&<>'"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  // Etiquetas en tipo oración y sin emoji decorativo: «🎄 IDEAL PARA FIN DE AÑO» → «Ideal para fin de año».
  // Las siglas y marcas conservan su forma (CNT, IPTV, Claro, Tigo, LigaPro…). Los datos no cambian.
  const FORMA_FIJA = {
    cnt: "CNT", iptv: "IPTV", vpn: "VPN", gb: "GB", wifi: "WiFi", proneet: "PRONEET",
    claro: "Claro", tigo: "Tigo", movistar: "Movistar", tuenti: "Tuenti", zapping: "Zapping",
    liga: "Liga", pro: "Pro", ecuador: "Ecuador", aki: "Aki", maxi: "Maxi", plus: "Plus"
  };
  function etiquetaLegible(texto = "") {
    const limpio = String(texto).replace(/^[^\p{L}\p{N}+]+/u, "").trim();
    if (!limpio) return String(texto).trim();
    const palabras = limpio.toLocaleLowerCase("es").split(/\s+/).map((p) => FORMA_FIJA[p] || p);
    const frase = palabras.join(" ");
    return frase.charAt(0).toLocaleUpperCase("es") + frase.slice(1);
  }
  window.ctvEtiquetaLegible = etiquetaLegible;
  let categoriaActual = "todos";

  window.seleccionarCategoriaCatalogo = function (categoria = "todos") {
    categoriaActual = categoria;
    window.productoEnfocado = null;
    document.getElementById('enlace-producto-aviso')?.remove();
    document.querySelectorAll("[data-categoria]").forEach((btn) => btn.classList.toggle("activo", btn.dataset.categoria === categoria));
    renderCatalogo();
  };

  window.renderCatalogo = function () {
    const grid = document.getElementById("catalogo-grid");
    if (!grid || typeof PRODUCTOS === "undefined") return;
    const enfocado = window.productoEnfocado;
    const productos = enfocado
      ? PRODUCTOS.filter((p) => p.id === enfocado)
      : (categoriaActual === "todos" ? PRODUCTOS : PRODUCTOS.filter((p) => p.categoria === categoriaActual));
    grid.innerHTML = productos.map(crearProducto).join("");
  };

  function crearProducto(producto) {
    const planes = (producto.planes || []).map((plan, i) => {
      const precio = plan.consultar ? "Consultar" : (typeof formatearPrecio === "function" ? formatearPrecio(plan.precio) : `$${Number(plan.precio).toFixed(2)} USD`);
      return `<div class="product-plan">
        <div class="product-plan__info"><strong>${escapar(plan.tipo)}</strong><span>${precio}</span></div>
        <div class="product-plan__actions">
          <button class="btn btn--primary btn--small" type="button" onclick="agregarPlanCatalogo('${producto.id}',${i},'compra')">🛒 Añadir al carrito</button>
          ${plan.tipo === "1 mes" && window.PAYPAL_PLANES?.[producto.id] ? `<button class="btn btn--outline btn--small" type="button" onclick="suscribirsePayPal('${producto.id}')">🔁 Suscripción mensual con PayPal</button>` : ""}
          <details class="plan-mas">
          <summary>Más opciones</summary>
          <div class="plan-mas__botones">
          <button class="btn btn--outline btn--small" type="button" onclick="contactarPlanWhatsApp('${producto.id}',${i},'compra')">🟢 Comprar por WhatsApp</button>
          <button class="btn btn--outline btn--small" type="button" onclick="contactarPlanTelegram('${producto.id}',${i},'compra')">✈️ Comprar por Telegram</button>
          <button class="btn btn--outline btn--small" type="button" onclick="contactarPlanSignal('${producto.id}',${i},'compra')">🔵 Comprar por Signal</button>
          <button class="btn btn--ghost btn--small" type="button" onclick="marcarPlanRenovacion('${producto.id}',${i})">🔄 Renovar</button>
          </div>
          </details>
        </div>
      </div>`;
    }).join("");
    // Con Black Days vigente, los precios normales se pliegan para no confundirse con la promo.
    const selectorPromo = typeof window.PromoBlackDays?.htmlSelector === "function" ? window.PromoBlackDays.htmlSelector(producto) : "";
    const totalPlanes = (producto.planes || []).length;
    const bloquePlanes = selectorPromo
      ? `<details class="ctv-bd-normales"><summary>Ver precios sin promoción (${totalPlanes} ${totalPlanes === 1 ? "plan" : "planes"})</summary><div class="product-plans">${planes}</div></details>`
      : `<div class="product-plans">${planes}</div>`;
    return `<article class="product-card reveal" data-producto="${escapar(producto.id)}">
      <button class="product-card__enlace" type="button" onclick="copiarEnlaceProducto('${escapar(producto.id)}', this)">🔗 Copiar enlace</button>
      <div class="product-card__head"><span class="product-card__icon">${producto.icono || "📺"}</span><div><h3>${escapar(producto.nombre)}</h3><div class="product-tags">${(producto.etiquetas||[]).map(e=>`<span>${escapar(etiquetaLegible(e))}</span>`).join("")}</div></div></div>
      <p>${escapar(producto.descripcion || "")}</p>
      ${selectorPromo}
      <details class="product-plans-wrap"${(window.productoEnfocado || window.matchMedia("(min-width: 681px)").matches) ? " open" : ""}>
        <summary>${selectorPromo ? "Ver promo y planes" : `Ver ${totalPlanes} ${totalPlanes === 1 ? "plan" : "planes"} y precios`}</summary>
        ${bloquePlanes}
      </details>
    </article>`;
  }

  function obtener(productoId, planIndex) {
    const producto = PRODUCTOS.find((p) => p.id === productoId);
    const plan = producto?.planes?.[Number(planIndex)];
    return producto && plan ? {producto, plan} : null;
  }
  function mensaje(productoId, planIndex, operacion) {
    const data = obtener(productoId, planIndex); if (!data) return "👋 Hola Click TV Streaming.\n\n📺 Deseo información sobre sus servicios.";
    const tipo = operacion === "renovacion" ? "renovar" : "comprar por primera vez";
    return `${operacion === "renovacion" ? "🔁" : "🛒"} Hola Click TV Streaming.\n\nDeseo ${tipo}.\n\n📺 Servicio: ${data.producto.nombre}\n📦 Plan: ${data.plan.tipo}\n💲 Precio: ${data.plan.consultar ? "Por consultar" : `$${Number(data.plan.precio).toFixed(2)} USD`}\n\n✅ Por favor, indíquenme disponibilidad y forma de pago.`;
  }
  window.contactarPlanWhatsApp = (p,i,o='compra') => window.open(`${CONFIG.whatsappLink}?text=${encodeURIComponent(mensaje(p,i,o))}`, '_blank', 'noopener,noreferrer');
  window.contactarPlanTelegram = (p,i,o='compra') => abrirTelegramConMensaje(mensaje(p,i,o));
  window.contactarPlanSignal = (p,i,o='compra') => abrirSignalConMensaje(mensaje(p,i,o));

  window.agregarPlanCatalogo = function (productoId, planIndex, operacion = 'compra') {
    const data = obtener(productoId, planIndex);
    if (!data) {
      if (typeof mostrarToast === 'function') mostrarToast('Producto no disponible.', 'error');
      return;
    }

    if (typeof agregarAlCarrito !== 'function') {
      if (typeof mostrarToast === 'function') mostrarToast('El carrito todavía no está disponible. Recarga la página.', 'error');
      return;
    }

    agregarAlCarrito(data.producto, {
      ...data.plan,
      operacion: operacion === 'renovacion' ? 'renovacion' : 'compra'
    });
  };

  window.marcarPlanRenovacion = (p,i) => agregarPlanCatalogo(p,i,'renovacion');

  // Crea la suscripción mensual en PayPal y lleva al visitante a aprobarla.
  window.suscribirsePayPal = async function (productoId) {
    const planId = window.PAYPAL_PLANES?.[productoId];
    if (!planId) return typeof mostrarToast === 'function' && mostrarToast('Esta suscripción todavía no está disponible.', 'error');
    try {
      const respuesta = await fetch('/api/paypal-suscripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const datos = await respuesta.json();
      if (!respuesta.ok || !datos.approveUrl) throw new Error(datos.error || 'No se pudo iniciar la suscripción.');
      window.location.href = datos.approveUrl;
    } catch (error) {
      if (typeof mostrarToast === 'function') mostrarToast(error.message || 'No se pudo iniciar la suscripción.', 'error');
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-categoria]').forEach(btn => btn.addEventListener('click', () => seleccionarCategoriaCatalogo(btn.dataset.categoria)));
    renderCatalogo();
  });
})();
