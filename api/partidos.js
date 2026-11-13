const FOOTBALL_DATA = "https://api.football-data.org/v4";
const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer";

const COMPETENCIAS = [
  { code: "WC", label: "Mundial 2026" },
  { code: "CLI", label: "Copa Libertadores" }
];

const ESPN_LIGAS = [
  { slug: "conmebol.libertadores", label: "Copa Libertadores" },
  { slug: "conmebol.sudamericana", label: "Copa Sudamericana" },
  { slug: "ecu.1", label: "LigaPro Ecuabet Ecuador" },
  // Amistosos internacionales: solo se muestran los partidos en los que juega Ecuador.
  { slug: "fifa.friendly", label: "Amistosos internacionales", soloEcuador: true }
];

function esEcuador(partido) {
  return /Ecuador/i.test(JSON.stringify([partido.homeTeam || {}, partido.awayTeam || {}]));
}

function fechaCompacta(valor = "") { return String(valor).replaceAll("-", ""); }

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.json();
  } finally { clearTimeout(timer); }
}

function normalizarEspnEvento(evento, etiqueta) {
  const competencia = evento.competitions?.[0] || {};
  const equipos = competencia.competitors || [];
  const local = equipos.find(e => e.homeAway === "home") || equipos[0] || {};
  const visita = equipos.find(e => e.homeAway === "away") || equipos[1] || {};
  const estado = competencia.status?.type || evento.status?.type || {};
  const status = estado.state === "in" ? "IN_PLAY" : estado.state === "post" ? "FINISHED" : "SCHEDULED";
  return {
    id: `espn-${evento.id}`,
    utcDate: evento.date,
    status,
    minute: competencia.status?.displayClock || "",
    stage: competencia.type?.text || competencia.type?.abbreviation || "REGULAR_SEASON",
    group: etiqueta,
    competition: { name: etiqueta, code: etiqueta.includes("Libertadores") ? "CLI" : etiqueta.includes("LigaPro") ? "EC1" : "CONMEBOL" },
    homeTeam: { name: local.team?.displayName || local.team?.name || "Local", shortName: local.team?.shortDisplayName, tla: local.team?.abbreviation, crest: local.team?.logo },
    awayTeam: { name: visita.team?.displayName || visita.team?.name || "Visitante", shortName: visita.team?.shortDisplayName, tla: visita.team?.abbreviation, crest: visita.team?.logo },
    score: { fullTime: { home: Number.isFinite(Number(local.score)) ? Number(local.score) : null, away: Number.isFinite(Number(visita.score)) ? Number(visita.score) : null } },
    venue: competencia.venue?.fullName || competencia.venue?.address?.city || ""
  };
}

async function cargarFootballData(dateFrom, dateTo) {
  const token = process.env.FOOTBALL_DATA_TOKEN || process.env.FOOTBALL_DATA_API_TOKEN;
  if (!token) return [];
  const resultados = await Promise.allSettled(COMPETENCIAS.map(async ({ code, label }) => {
    const url = new URL(`${FOOTBALL_DATA}/competitions/${code}/matches`);
    url.searchParams.set("dateFrom", dateFrom);
    url.searchParams.set("dateTo", dateTo);
    const data = await fetchJson(url, { headers: { "X-Auth-Token": token } });
    return (data.matches || []).map(m => ({ ...m, group: m.group || m.stage || label, competition: { ...(m.competition || {}), name: m.competition?.name || label } }));
  }));
  return resultados.flatMap(r => r.status === "fulfilled" ? r.value : []);
}

async function cargarEspn(dateFrom, dateTo) {
  const dates = `${fechaCompacta(dateFrom)}-${fechaCompacta(dateTo)}`;
  // ESPN devuelve 400 con algunos parámetros; se prueban formas más simples antes de rendirse.
  const intentos = [
    `${ESPN_BASE}/SLUG/scoreboard?dates=${dates}`,
    `${ESPN_BASE}/SLUG/scoreboard`
  ];
  const resultados = await Promise.allSettled(ESPN_LIGAS.map(async ({ slug, label, soloEcuador }) => {
    let ultimoError = null;
    for (const plantilla of intentos) {
      try {
        const data = await fetchJson(plantilla.replace("SLUG", slug));
        return (data.events || []).map(e => normalizarEspnEvento(e, label)).filter(m => !soloEcuador || esEcuador(m));
      } catch (error) {
        ultimoError = error;
      }
    }
    throw ultimoError;
  }));
  // Estado por liga, para que la web pueda informar qué competición respondió.
  const ligas = ESPN_LIGAS.map(({ label }, i) => {
    const r = resultados[i];
    if (r.status === "fulfilled") return { liga: label, fuente: "ESPN", estado: "ok", partidos: r.value.length };
    return { liga: label, fuente: "ESPN", estado: "error", partidos: 0, motivo: String(r.reason?.message || r.reason).slice(0, 120) };
  });
  return { matches: resultados.flatMap(r => r.status === "fulfilled" ? r.value : []), ligas };
}

function clave(m) {
  const dia = String(m.utcDate || "").slice(0, 10);
  const local = (m.homeTeam?.name || "").toLowerCase();
  const visita = (m.awayTeam?.name || "").toLowerCase();
  return `${dia}|${local}|${visita}`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");

  const token = process.env.FOOTBALL_DATA_TOKEN || process.env.FOOTBALL_DATA_API_TOKEN;

  // Detalle de un partido (marcador, goles) consultado solo desde el servidor.
  if (req.query.detalleId !== undefined) {
    const id = String(req.query.detalleId);
    if (!/^\d+$/.test(id)) return res.status(400).json({ error: "ID de partido no válido" });
    if (!token) return res.status(503).json({ error: "Detalle no disponible" });
    try {
      const detalle = await fetchJson(`${FOOTBALL_DATA}/matches/${id}`, { headers: { "X-Auth-Token": token } });
      return res.status(200).json(detalle);
    } catch (error) {
      return res.status(502).json({ error: "No fue posible consultar el detalle" });
    }
  }
  const hoy = new Date();
  const iso = d => d.toISOString().slice(0, 10);
  const dateFrom = /^\d{4}-\d{2}-\d{2}$/.test(req.query.dateFrom || "") ? req.query.dateFrom : iso(new Date(hoy.getTime() - 1*86400000));
  const dateTo = /^\d{4}-\d{2}-\d{2}$/.test(req.query.dateTo || "") ? req.query.dateTo : iso(new Date(hoy.getTime() + 30*86400000));

  try {
    const [footballData, espnRes] = await Promise.all([cargarFootballData(dateFrom, dateTo), cargarEspn(dateFrom, dateTo)]);
    const espn = espnRes.matches;
    const mapa = new Map();
    [...espn, ...footballData].forEach(m => mapa.set(clave(m), m));
    const matches = [...mapa.values()].sort((a,b) => new Date(a.utcDate)-new Date(b.utcDate));
    const fuentes = [];
    if (footballData.some(m => m.competition?.code === "WC")) fuentes.push("Mundial");
    if (matches.some(m => /Libertadores/i.test(m.competition?.name || m.group || ""))) fuentes.push("Libertadores");
    if (matches.some(m => /Sudamericana|CONMEBOL/i.test(m.competition?.name || m.group || ""))) fuentes.push("CONMEBOL");
    if (matches.some(m => /LigaPro|Ecuador/i.test(m.competition?.name || m.group || ""))) fuentes.push("LigaPro Ecuador");
    return res.status(200).json({ matches, total: matches.length, fuentes: [...new Set(fuentes)], ligas: espnRes.ligas, rango: { dateFrom, dateTo }, actualizado: new Date().toISOString() });
  } catch (error) {
    return res.status(200).json({ matches: [], total: 0, fuentes: [], warning: "No fue posible consultar los calendarios en este momento.", actualizado: new Date().toISOString() });
  }
}
