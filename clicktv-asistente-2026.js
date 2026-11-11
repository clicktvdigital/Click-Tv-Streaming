/* CLICK TV STREAMING · Asistente guiado (sin inteligencia artificial externa).
 * Ayuda a comprar, pagar, renovar, resolver problemas y llegar a un agente.
 * No pide datos de tarjetas, claves ni códigos. */
(() => {
  'use strict';

  const WA_VENTAS = '593939166222';
  const WA_SOPORTE = '593990056986';
  const TG = 'https://t.me/clicktvdigital';

  const enlaceWA = (numero, texto) =>
    `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

  // Cada nodo tiene un texto (líneas separadas), opciones y, si aplica, enlaces.
  const nodos = {
    inicio: {
      texto: ['👋 Hola, soy el asistente de CLICK TV STREAMING.', '¿En qué te ayudo?'],
      opciones: [
        ['🛒 Quiero comprar', 'comprar'],
        ['💳 Formas de pago', 'pagos'],
        ['🔁 Renovar mi servicio', 'renovar'],
        ['🛠️ Tengo un problema', 'problema'],
        ['👤 Hablar con un agente', 'agente'],
      ],
    },
    comprar: {
      texto: [
        '🛒 Comprar es rápido:',
        '1️⃣ Ve al catálogo y elige tu servicio.',
        '2️⃣ Selecciona el plan y los meses o dispositivos.',
        '3️⃣ Pulsa «Añadir al carrito» o «Comprar por WhatsApp».',
        '4️⃣ Finaliza la compra y elige cómo pagar.',
      ],
      opciones: [
        ['📺 Ir al catálogo', 'ir:#streaming'],
        ['💳 Ver formas de pago', 'pagos'],
        ['⬅️ Volver', 'inicio'],
      ],
    },
    pagos: {
      texto: [
        '💳 Formas de pago:',
        '🏦 Transferencia bancaria (copia la cuenta en el carrito).',
        '🅿️ PayPal y PayPhone (enlaces en el carrito).',
        '📲 Deuna y Binance (QR en la ficha del plan).',
        '✅ La activación se hace después de verificar tu pago.',
        '📎 Envía el comprobante por WhatsApp.',
      ],
      opciones: [
        ['📎 Enviar comprobante', 'comprobante'],
        ['🕗 Horarios de atención', 'horario'],
        ['⬅️ Volver', 'inicio'],
      ],
    },
    comprobante: {
      texto: [
        '📎 Para avisar tu pago:',
        '📝 Indica la referencia de tu pedido (CTV-…).',
        '🧾 Adjunta la foto o PDF del comprobante.',
        '⏳ Te confirmamos cuando esté validado.',
      ],
      opciones: [
        ['📲 Enviar por WhatsApp de ventas', 'enlace:ventas:comprobante'],
        ['⬅️ Volver', 'pagos'],
      ],
    },
    horario: {
      texto: [
        '🕗 Horarios (hora de Ecuador):',
        '🛒 Ventas y suscripciones: 08:00–20:00.',
        '🛠️ Soporte y renovaciones: 08:00–18:00.',
      ],
      opciones: [['⬅️ Volver', 'inicio']],
    },
    renovar: {
      texto: [
        '🔁 Para renovar:',
        '1️⃣ Ten a la mano el nombre del servicio.',
        '2️⃣ Escribe a soporte con el servicio y la fecha de vencimiento.',
        '3️⃣ Te indicamos el importe y cómo pagar.',
      ],
      opciones: [
        ['📲 Renovar por WhatsApp', 'enlace:soporte:renovar'],
        ['⬅️ Volver', 'inicio'],
      ],
    },
    problema: {
      texto: ['🛠️ ¿Qué te pasa?'],
      opciones: [
        ['📺 El servicio no abre', 'prob:noabre'],
        ['🔑 No llegan los datos de acceso', 'prob:datos'],
        ['💳 Pagué y no activaron', 'prob:pago'],
        ['⬅️ Volver', 'inicio'],
      ],
    },
    'prob:noabre': {
      texto: [
        '📺 Prueba esto primero:',
        '🔄 Cierra la app y vuelve a abrirla.',
        '📶 Revisa tu conexión a internet.',
        '📱 Reinicia el dispositivo.',
        '💬 Si sigue igual, escribe a soporte con el servicio y el problema.',
      ],
      opciones: [
        ['📲 Escribir a soporte', 'enlace:soporte:problema'],
        ['⬅️ Volver', 'problema'],
      ],
    },
    'prob:datos': {
      texto: [
        '🔑 Los datos se envían después de confirmar el pago.',
        '🕗 La activación puede tardar unos minutos en horario de atención.',
        '💬 Si ya pasó ese tiempo, escribe a soporte.',
      ],
      opciones: [
        ['📲 Escribir a soporte', 'enlace:soporte:datos'],
        ['⬅️ Volver', 'problema'],
      ],
    },
    'prob:pago': {
      texto: [
        '💳 Si ya pagaste:',
        '🧾 Envía el comprobante con tu referencia de pedido.',
        '⏳ Validamos el pago y activamos tu servicio.',
      ],
      opciones: [
        ['📎 Enviar comprobante', 'comprobante'],
        ['⬅️ Volver', 'problema'],
      ],
    },
    agente: {
      texto: [
        '👤 Elige cómo quieres hablar con nosotros:',
        '💬 Ventas: compras y consultas de planes.',
        '🛠️ Soporte: problemas y renovaciones.',
      ],
      opciones: [
        ['🟢 WhatsApp de ventas', 'enlace:ventas:general'],
        ['🟢 WhatsApp de soporte', 'enlace:soporte:general'],
        ['✈️ Telegram oficial', 'enlace:telegram'],
        ['⬅️ Volver', 'inicio'],
      ],
    },
  };

  const mensajes = {
    comprobante: '🧾 Hola Click TV Streaming.\n\n📎 Deseo enviar mi comprobante de pago.\n\n📝 Mi referencia de pedido: ',
    general: '👋 Hola Click TV Streaming.\n\n💬 Tengo una consulta sobre sus servicios.',
    renovar: '🔁 Hola Click TV Streaming.\n\nDeseo renovar mi servicio. ¿Me indican el vencimiento y el importe?',
    problema: '🛠️ Hola Click TV Streaming.\n\nTengo un problema con mi servicio: ',
    datos: '🔑 Hola Click TV Streaming.\n\nNo me llegan los datos de acceso de mi servicio.',
  };

  function crearDom() {
    const boton = document.createElement('button');
    boton.id = 'ctv-asistente-btn';
    boton.type = 'button';
    boton.setAttribute('aria-controls', 'ctv-asistente');
    boton.setAttribute('aria-expanded', 'false');
    boton.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg> Ayuda';

    const panel = document.createElement('div');
    panel.id = 'ctv-asistente';
    panel.className = 'ctv-asistente';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Asistente de CLICK TV STREAMING');
    panel.hidden = true;
    panel.innerHTML = `
      <div class="ctv-asistente__cabecera">
        <strong>💬 Asistente</strong>
        <button type="button" class="ctv-asistente__cerrar" aria-label="Cerrar asistente">✕</button>
      </div>
      <div class="ctv-asistente__cuerpo" aria-live="polite"></div>
      <form class="ctv-asistente__pregunta">
        <input type="text" maxlength="300" placeholder="Escribe tu pregunta…" aria-label="Escribe tu pregunta" required>
        <button type="submit">Enviar</button>
      </form>
      <p class="ctv-asistente__aviso">🔒 No escribas claves, contraseñas ni datos de tarjetas.</p>`;

    document.body.appendChild(boton);
    document.body.appendChild(panel);
    return { boton, panel, cuerpo: panel.querySelector('.ctv-asistente__cuerpo') };
  }

  function abrirEnlace(tipo, clave) {
    if (tipo === 'telegram') return window.open(TG, '_blank', 'noopener,noreferrer');
    const numero = tipo === 'ventas' ? WA_VENTAS : WA_SOPORTE;
    const texto = mensajes[clave] || mensajes.general;
    window.open(enlaceWA(numero, texto), '_blank', 'noopener,noreferrer');
  }

  // Preguntas comunes: se muestra la guía correspondiente sin usar la IA.
  const PALABRAS = [
    [/agente|humano|persona|asesor|hablar con/i, 'agente'],
    [/horario|hora|a qu[eé] hora|atienden/i, 'horario'],
    [/no abre|no funciona|falla|error|problema|no me llega|no llega|datos de acceso|no activ/i, 'problema'],
    [/renov/i, 'renovar'],
    [/pag|transfer|paypal|deuna|binance|payphone|tarjeta/i, 'pagos'],
    [/compr|contrat|netflix|disney|hbo|prime|spotify|plan|precio|cuánto|cuanto/i, 'comprar'],
  ];

  const PALABRAS_VACIAS = ['como', 'compro', 'comprar', 'quiero', 'quisiera', 'de', 'del', 'el', 'la', 'un', 'una', 'que', 'precio', 'cuanto', 'cuánto', 'plan', 'planes', 'tienes', 'tiene', 'hay', 'con', 'para', 'por', 'en', 'me', 'puedo', 'pagar', 'pago', 'renovar', 'renuevo', 'es', 'y'];

  function normalizar(texto) {
    return String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  // Busca productos por el nombre que escribió el cliente (ej.: "netflix").
  function buscarProductos(texto) {
    const catalogo = typeof PRODUCTOS !== 'undefined' ? PRODUCTOS : [];
    const palabras = normalizar(texto).split(/[^a-z0-9+]+/).filter((w) => w.length > 2 && !PALABRAS_VACIAS.includes(w));
    if (!palabras.length) return [];
    return catalogo.filter((p) => {
      const nombre = normalizar(p.nombre);
      return palabras.some((w) => nombre.includes(w));
    }).slice(0, 6);
  }

  function renderProductos(cuerpo, productos) {
    cuerpo.innerHTML = '';
    const p0 = document.createElement('p');
    p0.textContent = '🔎 Encontré estas opciones. ¿Cuál quieres?';
    cuerpo.appendChild(p0);
    const opciones = document.createElement('div');
    opciones.className = 'ctv-asistente__opciones';
    productos.forEach((p) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ctv-asistente__op';
      b.textContent = (p.icono || '📺') + ' ' + p.nombre;
      b.addEventListener('click', () => {
        cerrarPanel();
        window.enfocarProducto?.(p.id);
      });
      opciones.appendChild(b);
    });
    cuerpo.appendChild(opciones);
  }

  let cerrarPanel = () => {};

  function guiaPara(texto) {
    const t = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const hallazgo = PALABRAS.find(([re]) => re.test(t));
    return hallazgo ? hallazgo[1] : null;
  }

  function render(cuerpo, clave) {
    const nodo = nodos[clave] || nodos.inicio;
    cuerpo.innerHTML = '';

    nodo.texto.forEach((linea) => {
      const p = document.createElement('p');
      p.textContent = linea;
      cuerpo.appendChild(p);
    });

    const opciones = document.createElement('div');
    opciones.className = 'ctv-asistente__opciones';
    nodo.opciones.forEach(([etiqueta, destino]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ctv-asistente__op';
      b.textContent = etiqueta;
      b.addEventListener('click', () => accion(destino, cuerpo));
      opciones.appendChild(b);
    });
    cuerpo.appendChild(opciones);
  }

  function accion(destino, cuerpo) {
    if (destino.startsWith('ir:')) {
      const sel = destino.slice(3);
      document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (destino.startsWith('enlace:')) {
      const [, tipo, clave] = destino.split(':');
      return abrirEnlace(tipo, clave);
    }
    render(cuerpo, destino);
  }

  function iniciar() {
    if (document.getElementById('ctv-asistente-btn')) return;
    const { boton, panel, cuerpo } = crearDom();
    render(cuerpo, 'inicio');

    // Preguntas libres: se responden con el servicio de IA a través de /api/asistente.
    const formulario = panel.querySelector('.ctv-asistente__pregunta');
    formulario.addEventListener('submit', async (e) => {
      e.preventDefault();
      const campo = formulario.querySelector('input');
      const pregunta = campo.value.trim();
      if (pregunta.length < 2) return;
      // Si el cliente nombra un producto, se abre directo; si hay varios, se elige.
      const hallados = buscarProductos(pregunta);
      if (hallados.length === 1) {
        campo.value = '';
        cerrarPanel();
        window.enfocarProducto?.(hallados[0].id);
        return;
      }
      if (hallados.length > 1) {
        campo.value = '';
        renderProductos(cuerpo, hallados);
        return;
      }
      const guia = guiaPara(pregunta);
      if (guia) {
        campo.value = '';
        render(cuerpo, guia);
        return;
      }
      const pregunta_p = document.createElement('p');
      pregunta_p.className = 'ctv-asistente__tu-pregunta';
      pregunta_p.textContent = '🙋 ' + pregunta;
      cuerpo.appendChild(pregunta_p);
      campo.value = '';
      const espera = document.createElement('p');
      espera.className = 'ctv-asistente__ia';
      espera.textContent = '⏳ Revisando tu pregunta…';
      cuerpo.appendChild(espera);
      cuerpo.scrollTop = cuerpo.scrollHeight;
      try {
        const r = await fetch('/api/asistente', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pregunta }),
        });
        const datos = await r.json().catch(() => ({}));
        espera.textContent = r.ok && datos.respuesta
          ? '🤖 ' + datos.respuesta
          : '💬 ' + (datos.error || 'No pude responder ahora. Escribe a soporte por WhatsApp.') + (datos.detalle ? ' (' + datos.detalle + ')' : '');
      } catch (error) {
        espera.textContent = '💬 Sin conexión. Escribe a soporte por WhatsApp.';
      }
      cuerpo.scrollTop = cuerpo.scrollHeight;
    });

    boton.addEventListener('click', () => {
      const abrir = panel.hidden;
      panel.hidden = !abrir;
      boton.setAttribute('aria-expanded', String(abrir));
      if (abrir) render(cuerpo, 'inicio');
    });
    panel.querySelector('.ctv-asistente__cerrar').addEventListener('click', () => {
      panel.hidden = true;
      boton.setAttribute('aria-expanded', 'false');
    });
    cerrarPanel = () => {
      panel.hidden = true;
      boton.setAttribute('aria-expanded', 'false');
    };
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) {
        panel.hidden = true;
        boton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
