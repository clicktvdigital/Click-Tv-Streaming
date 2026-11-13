// CLICK TV STREAMING · Reseñas públicas guardadas en Upstash Redis (Vercel).
// Las credenciales llegan por variables de entorno de Vercel; nunca al navegador.
const CLAVE = "resenas:publicas";
const MAX_POR_DIA_POR_IP = 5;
const MAX_RESENAS = 200;

function configurado() {
  return Boolean(process.env.UPSTASH_REDIS_KV_REST_API_URL && process.env.UPSTASH_REDIS_KV_REST_API_TOKEN);
}

// Envía un comando a Upstash mediante su API REST.
async function redis(...comando) {
  const respuesta = await fetch(process.env.UPSTASH_REDIS_KV_REST_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(comando),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok || datos.error) throw new Error(datos.error || `Upstash ${respuesta.status}`);
  return datos.result;
}

function limpiar(valor, max) {
  return String(valor || "").replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max);
}

function validar(cuerpo) {
  const nombre = limpiar(cuerpo.nombre, 60);
  const pais = limpiar(cuerpo.pais, 60);
  const servicio = limpiar(cuerpo.servicio, 60);
  const comentario = limpiar(cuerpo.comentario, 350);
  const estrellas = Math.round(Number(cuerpo.estrellas));
  if (!nombre || !pais || !servicio || !comentario) return { error: "Completa nombre, ciudad, servicio y comentario." };
  if (!(estrellas >= 1 && estrellas <= 5)) return { error: "Las estrellas deben ser de 1 a 5." };
  return { reseña: { nombre, pais, servicio, comentario, estrellas, fecha: new Date().toISOString() } };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!configurado()) {
    return res.status(req.method === "GET" ? 200 : 503).json(req.method === "GET" ? { resenas: [] } : { error: "Las opiniones no están disponibles en este momento." });
  }

  try {
    if (req.method === "GET") {
      const filas = (await redis("LRANGE", CLAVE, 0, 99)) || [];
      const resenas = filas.map((f) => { try { return JSON.parse(f); } catch { return null; } }).filter(Boolean);
      return res.status(200).json({ resenas });
    }

    if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });

    const cuerpo = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    // Campo trampa: los formularios lo dejan vacío; un robot suele llenarlo.
    if (cuerpo.web) return res.status(200).json({ ok: true });

    const { reseña, error } = validar(cuerpo);
    if (error) return res.status(400).json({ error });

    const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "desconocida").split(",")[0].trim();
    const dia = new Date().toISOString().slice(0, 10);
    const clave = `rl:${ip}:${dia}`;
    const usos = await redis("INCR", clave);
    if (usos === 1) await redis("EXPIRE", clave, 86400);
    if (usos > MAX_POR_DIA_POR_IP) return res.status(429).json({ error: "Enviaste varias opiniones hoy. Vuelve mañana." });

    await redis("LPUSH", CLAVE, JSON.stringify(reseña));
    await redis("LTRIM", CLAVE, 0, MAX_RESENAS - 1);
    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error("resenas:", e.message);
    return res.status(500).json({ error: "No se pudo guardar tu opinión. Intenta de nuevo." });
  }
}
