// CLICK TV STREAMING · Suscripción mensual con PayPal.
// Crea la suscripción en PayPal y devuelve el enlace para aprobarla. Las credenciales solo viven en
// variables de entorno de Vercel: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET y PAYPAL_ENV (sandbox o live).
const ORIGEN = "https://click-tv-streaming.vercel.app";
const BASE = { sandbox: "https://api-m.sandbox.paypal.com", live: "https://api-m.paypal.com" };
const PLAN_VALIDO = /^P-[A-Z0-9]{10,40}$/;

function entorno() {
  return process.env.PAYPAL_ENV === "sandbox" ? "sandbox" : "live";
}

async function obtenerToken() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secreto = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secreto) throw new Error("PayPal no configurado");
  const respuesta = await fetch(`${BASE[entorno()]}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secreto}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const datos = await respuesta.json();
  if (!respuesta.ok || !datos.access_token) throw new Error("Sin token de PayPal");
  return datos.access_token;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const planId = String(req.body?.planId || "");
  if (!PLAN_VALIDO.test(planId)) return res.status(400).json({ error: "Plan no válido" });

  try {
    const token = await obtenerToken();
    const respuesta = await fetch(`${BASE[entorno()]}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify({
        plan_id: planId,
        application_context: {
          brand_name: "Click TV Streaming",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${ORIGEN}/?suscripcion=ok`,
          cancel_url: `${ORIGEN}/?suscripcion=cancelada`,
        },
      }),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) return res.status(502).json({ error: "PayPal no aceptó la suscripción" });

    const aprobar = (datos.links || []).find((enlace) => enlace.rel === "approve")?.href;
    if (!aprobar) return res.status(502).json({ error: "Sin enlace de aprobación" });
    return res.status(200).json({ approveUrl: aprobar });
  } catch {
    return res.status(503).json({ error: "Suscripción no disponible en este momento" });
  }
}
