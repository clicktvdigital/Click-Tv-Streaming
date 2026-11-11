// CLICK TV STREAMING · Respuestas del asistente con Gemini (servidor).
// La clave se lee de la variable GEMINI_API_KEY en Vercel; nunca se envía al navegador.
const MODELO = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const LIMITE_MENSAJE = 300;

// Límite simple por IP para evitar abusos (se reinicia al reiniciar el servidor).
const usos = new Map();
const MAX_POR_HORA = 30;

const INSTRUCCIONES = `Eres el asistente de CLICK TV STREAMING (tienda en Ecuador).
Responde en español, en frases cortas y con emoji. Máximo 6 líneas.
Solo ayudas con: planes y servicios de la tienda, cómo comprar, formas de pago, renovaciones y problemas de acceso.
Datos de la tienda:
- Ventas y suscripciones: 08:00–20:00 (hora de Ecuador). Soporte y renovaciones: 08:00–18:00.
- La activación se hace después de verificar el pago. No es automática.
- Pagos: transferencia (cuenta en el carrito), PayPal, PayPhone, Deuna y Binance.
- Para precios exactos, indica que revisen el catálogo o escriban por WhatsApp de ventas: 0939166222.
- Para soporte: WhatsApp 0990056986.
Nunca pidas ni aceptes claves, contraseñas, códigos OTP ni datos de tarjetas.
Si la pregunta no es sobre la tienda, dilo amablemente y ofrece escribir a soporte.`;

function ipCliente(req) {
  const reenviada = req.headers["x-forwarded-for"];
  return (Array.isArray(reenviada) ? reenviada[0] : reenviada || req.socket?.remoteAddress || "desconocida").split(",")[0].trim();
}

function dentroDeLimite(ip) {
  const ahora = Date.now();
  const registro = (usos.get(ip) || []).filter((t) => ahora - t < 3600_000);
  if (registro.length >= MAX_POR_HORA) {
    usos.set(ip, registro);
    return false;
  }
  registro.push(ahora);
  usos.set(ip, registro);
  return true;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const clave = process.env.GEMINI_API_KEY;
  if (!clave) return res.status(503).json({ error: "Asistente no disponible" });

  let cuerpo = req.body;
  if (typeof cuerpo === "string") {
    try { cuerpo = JSON.parse(cuerpo); } catch { cuerpo = {}; }
  }
  const pregunta = String(cuerpo?.pregunta || "").trim().slice(0, LIMITE_MENSAJE);
  if (pregunta.length < 2) return res.status(400).json({ error: "Escribe tu pregunta" });

  if (!dentroDeLimite(ipCliente(req))) {
    return res.status(429).json({ error: "Has hecho muchas preguntas. Intenta más tarde o escribe a soporte." });
  }

  try {
    // Si Gemini tarda demasiado, se responde con un mensaje en lugar de dejar la pantalla esperando.
    const control = new AbortController();
    const corte = setTimeout(() => control.abort(), 20000);
    const respuesta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`,
      {
        signal: control.signal,
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": clave },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: INSTRUCCIONES }] },
          contents: [{ role: "user", parts: [{ text: pregunta }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.3 },
        }),
      }
    );
    clearTimeout(corte);
    if (!respuesta.ok) throw new Error(`Gemini HTTP ${respuesta.status}`);
    const datos = await respuesta.json();
    const texto = datos?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("").trim();
    if (!texto) throw new Error("Respuesta vacía");
    return res.status(200).json({ respuesta: texto });
  } catch (error) {
    // El detalle no incluye la clave: solo indica el código de respuesta de Gemini.
    return res.status(502).json({ error: "No pude responder ahora. Escribe a soporte por WhatsApp.", detalle: String(error.message).slice(0, 80) });
  }
}
