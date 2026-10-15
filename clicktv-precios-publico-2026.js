/* CLICK TV DIGITAL - catálogo público 2026.
   Complemento sin modificar datos privados ni eliminar productos recientes. */
(function () {
  'use strict';
  if (typeof PRODUCTOS === 'undefined' || !Array.isArray(PRODUCTOS)) {
    console.error('Click TV: no se encontró el catálogo original.');
    return;
  }
  const NUEVOS_PRECIOS = [
  { id: "netflix-normal", nombre: "Netflix Normal", categoria: "streaming", icono: "🔴", descripcion: "Perfil para ver series, películas, documentales y estrenos de Netflix con soporte durante el periodo contratado.", etiquetas: [
      "🔥 MÁS VENDIDO"
    ], planes: [
      { tipo: "1 mes", precio: 5 },
      { tipo: "3 meses", precio: 14.5 },
      { tipo: "6 meses", precio: 27 },
      { tipo: "12 meses", precio: 48 }
    ] },
  { id: "netflix-extra", nombre: "Netflix Perfil Extra", categoria: "streaming", icono: "🟡", descripcion: "Perfil extra con mejor estabilidad de uso para ver Netflix con una experiencia más ordenada.", etiquetas: [
      "⭐ RECOMENDADO",
      "💎 PREMIUM"
    ], planes: [
      { tipo: "1 mes", precio: 7 },
      { tipo: "3 meses", precio: 20 },
      { tipo: "6 meses", precio: 38 },
      { tipo: "12 meses", precio: 67 }
    ] },
  { id: "disney-premium", nombre: "Disney+ Premium", categoria: "streaming", icono: "🟣", descripcion: "Acceso premium para ver Disney, Marvel, Star Wars, Pixar y contenido familiar en alta calidad.", etiquetas: [
      "⭐ RECOMENDADO",
      "💎 PREMIUM"
    ], planes: [
      { tipo: "1 mes", precio: 6 },
      { tipo: "3 meses", precio: 17 },
      { tipo: "6 meses", precio: 32.5 },
      { tipo: "12 meses", precio: 57.5 },
      { tipo: "Cuenta completa · 1 mes", precio: 12 }
    ] },
  { id: "disney-plus", nombre: "Disney+ Estándar", categoria: "streaming", icono: "🏰", descripcion: "Plan enfocado en películas, series y contenido familiar de Disney.", etiquetas: [
      "⭐ RECOMENDADO"
    ], planes: [
      { tipo: "1 mes", precio: 4.5 },
      { tipo: "3 meses", precio: 13 },
      { tipo: "6 meses", precio: 24.5 },
      { tipo: "12 meses", precio: 43 },
      { tipo: "Cuenta completa · 1 mes", precio: 8 }
    ] },
  { id: "vix-premium", nombre: "ViX Premium", categoria: "streaming", icono: "⚫", descripcion: "Contenido latino con películas, novelas, series y entretenimiento en español.", etiquetas: [
      "🔥 MÁS VENDIDO"
    ], planes: [
      { tipo: "1 mes", precio: 4 },
      { tipo: "3 meses", precio: 11.5 },
      { tipo: "6 meses", precio: 21.5 },
      { tipo: "12 meses", precio: 38.5 },
      { tipo: "Cuenta completa · 1 mes", precio: 4.5 }
    ] },
  { id: "max", nombre: "HBO Max", categoria: "streaming", icono: "🟣", descripcion: "Series, películas, estrenos y documentales con contenido premium de entretenimiento.", etiquetas: [
      "⭐ RECOMENDADO"
    ], planes: [
      { tipo: "1 mes", precio: 4.5 },
      { tipo: "3 meses", precio: 13 },
      { tipo: "6 meses", precio: 24.5 },
      { tipo: "12 meses", precio: 43 },
      { tipo: "Cuenta completa Estándar · 1 mes", precio: 6.5 },
      { tipo: "Cuenta completa Platino · 1 mes", precio: 8.5 }
    ] },
  { id: "prime-video", nombre: "Prime Video", categoria: "streaming", icono: "🔵", descripcion: "Servicio para ver películas, series originales y contenido exclusivo de Amazon Prime Video.", etiquetas: [
      "🔥 MÁS VENDIDO"
    ], planes: [
      { tipo: "1 mes", precio: 4.5 },
      { tipo: "3 meses", precio: 13 },
      { tipo: "6 meses", precio: 24.5 },
      { tipo: "12 meses", precio: 43 },
      { tipo: "Cuenta completa · 1 mes", precio: 7 }
    ] },
  { id: "paramount-plus", nombre: "Paramount+", categoria: "streaming", icono: "🔵", descripcion: "Películas, series, realities, contenido familiar y deportes seleccionados.", etiquetas: [
      "⚽ IDEAL PARA EL MUNDIAL",
      "🔥 MÁS VENDIDO"
    ], planes: [
      { tipo: "1 mes", precio: 5 },
      { tipo: "3 meses", precio: 14.5 },
      { tipo: "6 meses", precio: 27 },
      { tipo: "12 meses", precio: 48 },
      { tipo: "Cuenta completa · 1 mes", precio: 7.5 }
    ] },
  { id: "crunchyroll", nombre: "Crunchyroll", categoria: "streaming", icono: "🟠", descripcion: "Servicio especializado en anime, estrenos, temporadas completas y contenido japonés.", etiquetas: [
      "⭐ RECOMENDADO"
    ], planes: [
      { tipo: "1 mes", precio: 4.5 },
      { tipo: "3 meses", precio: 13 },
      { tipo: "6 meses", precio: 24.5 },
      { tipo: "12 meses", precio: 43 },
      { tipo: "Cuenta completa · 1 mes", precio: 7.5 }
    ] },
  { id: "apple-tv", nombre: "Apple TV+", categoria: "streaming", icono: "⚪", descripcion: "Contenido original de Apple, series exclusivas y películas para dispositivos compatibles.", etiquetas: [
      "💎 PREMIUM"
    ], planes: [
      { tipo: "1 dispositivo · 1 mes", precio: 4.5 },
      { tipo: "3 meses", precio: 13 },
      { tipo: "6 meses", precio: 24.5 },
      { tipo: "12 meses", precio: 43 },
      { tipo: "Cuenta completa · 1 mes", precio: 8 }
    ] },
  { id: "viki-rakuten", nombre: "Viki Rakuten", categoria: "streaming", icono: "🎬", descripcion: "Plataforma para dramas, películas y series asiáticas con contenido subtitulado.", etiquetas: [
      "💎 PREMIUM"
    ], planes: [
      { tipo: "1 mes", precio: 4.5 },
      { tipo: "3 meses", precio: 13 },
      { tipo: "6 meses", precio: 24.5 },
      { tipo: "12 meses", precio: 43 },
      { tipo: "Cuenta completa · 1 mes", precio: 8 }
    ] },
  { id: "zapping-ligapro", nombre: "Zapping LigaPro", categoria: "deportes", icono: "📺", descripcion: "LigaPro Ecuador en vivo con más de 40 canales nacionales e internacionales.", etiquetas: [
      "⚽ LIGA PRO ECUADOR",
      "🔥 ZAPPING PRO"
    ], planes: [
      { tipo: "1 dispositivo · 1 mes", precio: 10.5, ivaIncluido: true },
      { tipo: "Cuenta completa · 1 mes", precio: 19.5, ivaIncluido: true }
    ] },
  { id: "dgo", nombre: "DGO / DIRECTV GO", categoria: "streaming", icono: "⚪", descripcion: "TV en vivo por internet con canales deportivos, entretenimiento y noticias.", etiquetas: [
      "💎 PREMIUM"
    ], planes: [
      { tipo: "1 dispositivo · 1 mes", precio: 10 },
      { tipo: "3 meses", precio: 28.5 },
      { tipo: "6 meses", precio: 54 },
      { tipo: "12 meses", precio: 96 },
      { tipo: "Cuenta completa · 1 mes", precio: 18 }
    ] },
  { id: "telelatino", nombre: "Telelatino", categoria: "iptv", icono: "📺", descripcion: "TV en vivo, películas, series y deportes desde apps compatibles.", etiquetas: [
      "📺 IPTV",
      "🔥 MÁS VENDIDO"
    ], planes: [
      { tipo: "1 dispositivo · 1 mes", precio: 5, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 3 meses", precio: 14.5, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 6 meses", precio: 27, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 12 meses", precio: 48, dispositivos: 1, ivaIncluido: true },
      { tipo: "2 dispositivos · 1 mes", precio: 9, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 3 meses", precio: 25.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 6 meses", precio: 48.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 12 meses", precio: 86.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "3 dispositivos · 1 mes", precio: 12.5, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 3 meses", precio: 35.5, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 6 meses", precio: 67.5, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 12 meses", precio: 120, dispositivos: 3, ivaIncluido: true }
    ] },
  { id: "xc-tv", nombre: "XC+ TV", categoria: "iptv", icono: "📺", descripcion: "Servicio IPTV con canales, películas, series y eventos en vivo.", etiquetas: [
      "📺 IPTV"
    ], planes: [
      { tipo: "1 dispositivo · 1 mes", precio: 5.5, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 3 meses", precio: 15.5, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 6 meses", precio: 29.5, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 12 meses", precio: 53, dispositivos: 1, ivaIncluido: true },
      { tipo: "2 dispositivos · 1 mes", precio: 10, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 3 meses", precio: 28.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 6 meses", precio: 54, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 12 meses", precio: 96, dispositivos: 2, ivaIncluido: true },
      { tipo: "3 dispositivos · 1 mes", precio: 14, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 3 meses", precio: 40, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 6 meses", precio: 75.5, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 12 meses", precio: 134.5, dispositivos: 3, ivaIncluido: true }
    ] },
  { id: "flujo-tv", nombre: "Flujo TV", categoria: "iptv", icono: "📺", descripcion: "Plataforma IPTV con entretenimiento, deportes, series y películas.", etiquetas: [
      "📺 IPTV"
    ], planes: [
      { tipo: "1 dispositivo · 1 mes", precio: 5, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 3 meses", precio: 14.5, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 6 meses", precio: 27, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 12 meses", precio: 48, dispositivos: 1, ivaIncluido: true },
      { tipo: "2 dispositivos · 1 mes", precio: 9, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 3 meses", precio: 25.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 6 meses", precio: 48.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 12 meses", precio: 86.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "3 dispositivos · 1 mes", precio: 12.5, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 3 meses", precio: 35.5, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 6 meses", precio: 67.5, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 12 meses", precio: 120, dispositivos: 3, ivaIncluido: true }
    ] },
  { id: "stella-tv", nombre: "Stella TV", categoria: "iptv", icono: "📺", descripcion: "Servicio IPTV con TV en vivo y contenido VOD.", etiquetas: [
      "📺 IPTV"
    ], planes: [
      { tipo: "1 dispositivo · 1 mes", precio: 5.5, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 3 meses", precio: 15.5, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 6 meses", precio: 29.5, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 12 meses", precio: 53, dispositivos: 1, ivaIncluido: true },
      { tipo: "2 dispositivos · 1 mes", precio: 10, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 3 meses", precio: 28.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 6 meses", precio: 54, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 12 meses", precio: 96, dispositivos: 2, ivaIncluido: true },
      { tipo: "3 dispositivos · 1 mes", precio: 14, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 3 meses", precio: 40, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 6 meses", precio: 75.5, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 12 meses", precio: 134.5, dispositivos: 3, ivaIncluido: true }
    ] },
  { id: "oleada-tv", nombre: "Oleada TV", categoria: "iptv", icono: "📺", descripcion: "Plataforma IPTV con canales, películas y series.", etiquetas: [
      "📺 IPTV"
    ], planes: [
      { tipo: "1 dispositivo · 1 mes", precio: 4.5, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 3 meses", precio: 13, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 6 meses", precio: 24.5, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 12 meses", precio: 43, dispositivos: 1, ivaIncluido: true },
      { tipo: "2 dispositivos · 1 mes", precio: 8, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 3 meses", precio: 23, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 6 meses", precio: 43, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 12 meses", precio: 77, dispositivos: 2, ivaIncluido: true },
      { tipo: "3 dispositivos · 1 mes", precio: 11.5, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 3 meses", precio: 33, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 6 meses", precio: 62, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 12 meses", precio: 110.5, dispositivos: 3, ivaIncluido: true }
    ] },
  { id: "vanna-tv", nombre: "Vanna TV", categoria: "iptv", icono: "📺", descripcion: "IPTV con TV en vivo, deportes y contenido VOD.", etiquetas: [
      "📺 IPTV"
    ], planes: [
      { tipo: "1 dispositivo · 1 mes", precio: 6, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 3 meses", precio: 17, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 6 meses", precio: 32.5, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 12 meses", precio: 57.5, dispositivos: 1, ivaIncluido: true },
      { tipo: "2 dispositivos · 1 mes", precio: 11, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 3 meses", precio: 31.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 6 meses", precio: 59.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 12 meses", precio: 105.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "3 dispositivos · 1 mes", precio: 15, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 3 meses", precio: 43, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 6 meses", precio: 81, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 12 meses", precio: 144, dispositivos: 3, ivaIncluido: true }
    ] },
  { id: "megax-tv", nombre: "MegaX TV", categoria: "iptv", icono: "📺", descripcion: "Plataforma IPTV con canales, películas, series y deportes.", etiquetas: [
      "📺 IPTV",
      "⭐ RECOMENDADO"
    ], planes: [
      { tipo: "1 dispositivo · 1 mes", precio: 6, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 3 meses", precio: 17, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 6 meses", precio: 32.5, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 12 meses", precio: 57.5, dispositivos: 1, ivaIncluido: true },
      { tipo: "2 dispositivos · 1 mes", precio: 11, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 3 meses", precio: 31.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 6 meses", precio: 59.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 12 meses", precio: 105.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "3 dispositivos · 1 mes", precio: 15, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 3 meses", precio: 43, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 6 meses", precio: 81, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 12 meses", precio: 144, dispositivos: 3, ivaIncluido: true }
    ] },
  { id: "oratv", nombre: "ORATV Anual Servidor", categoria: "iptv", icono: "🛰️", descripcion: "Acceso anual a ORATV con soporte según disponibilidad del servicio.", etiquetas: [
      "📺 IPTV",
      "🗓️ ANUAL"
    ], planes: [
      { tipo: "Anual · 1 dispositivo", precio: 7, ivaIncluido: true },
      { tipo: "Anual · 2 dispositivos", precio: 12, ivaIncluido: true },
      { tipo: "Anual · 3 dispositivos", precio: 17, ivaIncluido: true }
    ] },
  { id: "iptv-basico", nombre: "IPTV Básico", categoria: "iptv", icono: "📺", descripcion: "Servicio IPTV básico para TV en vivo y entretenimiento.", etiquetas: [
      "⚽ IDEAL PARA EL MUNDIAL"
    ], planes: [
      { tipo: "1 dispositivo · 1 mes", precio: 6, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 3 meses", precio: 17, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 6 meses", precio: 32.5, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 12 meses", precio: 57.5, dispositivos: 1, ivaIncluido: true },
      { tipo: "2 dispositivos · 1 mes", precio: 11, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 3 meses", precio: 31.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 6 meses", precio: 59.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 12 meses", precio: 105.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "3 dispositivos · 1 mes", precio: 15, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 3 meses", precio: 43, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 6 meses", precio: 81, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 12 meses", precio: 144, dispositivos: 3, ivaIncluido: true }
    ] },
  { id: "iptv-premium", nombre: "IPTV Premium", categoria: "iptv", icono: "📺", descripcion: "Paquete IPTV premium con canales en vivo, VOD, películas y deportes.", etiquetas: [
      "🔥 MÁS VENDIDO",
      "⚽ IDEAL PARA EL MUNDIAL"
    ], planes: [
      { tipo: "1 dispositivo · 1 mes", precio: 8, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 3 meses", precio: 23, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 6 meses", precio: 43, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 12 meses", precio: 77, dispositivos: 1, ivaIncluido: true },
      { tipo: "2 dispositivos · 1 mes", precio: 14.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 3 meses", precio: 41.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 6 meses", precio: 78.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 12 meses", precio: 139, dispositivos: 2, ivaIncluido: true },
      { tipo: "3 dispositivos · 1 mes", precio: 20, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 3 meses", precio: 57, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 6 meses", precio: 108, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 12 meses", precio: 192, dispositivos: 3, ivaIncluido: true }
    ] },
  { id: "iptv-ultra", nombre: "IPTV Ultra", categoria: "iptv", icono: "📺", descripcion: "Plan IPTV superior con más estabilidad y mejor experiencia.", etiquetas: [
      "💎 PREMIUM",
      "⚽ IDEAL PARA EL MUNDIAL"
    ], planes: [
      { tipo: "1 dispositivo · 1 mes", precio: 10, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 3 meses", precio: 28.5, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 6 meses", precio: 54, dispositivos: 1, ivaIncluido: true },
      { tipo: "1 dispositivo · 12 meses", precio: 96, dispositivos: 1, ivaIncluido: true },
      { tipo: "2 dispositivos · 1 mes", precio: 18, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 3 meses", precio: 51.5, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 6 meses", precio: 97, dispositivos: 2, ivaIncluido: true },
      { tipo: "2 dispositivos · 12 meses", precio: 173, dispositivos: 2, ivaIncluido: true },
      { tipo: "3 dispositivos · 1 mes", precio: 25, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 3 meses", precio: 71.5, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 6 meses", precio: 135, dispositivos: 3, ivaIncluido: true },
      { tipo: "3 dispositivos · 12 meses", precio: 240, dispositivos: 3, ivaIncluido: true }
    ] },
  { id: "ibo-player", nombre: "IBO Player", categoria: "iptv", icono: "📡", descripcion: "Licencia de reproductor IPTV compatible con múltiples dispositivos.", etiquetas: [
      "💎 PREMIUM"
    ], planes: [
      { tipo: "Licencia anual", precio: 10, ivaIncluido: true },
      { tipo: "Licencia permanente", precio: 20, ivaIncluido: true }
    ] },
  { id: "spotify-premium", nombre: "Spotify Premium", categoria: "musica", icono: "🎵", descripcion: "Música sin anuncios, descargas, reproducción offline y mejor experiencia para escuchar playlists, álbumes y podcasts.", etiquetas: [
      "⭐ RECOMENDADO"
    ], planes: [
      { tipo: "1 mes", precio: 6, ivaIncluido: true },
      { tipo: "2 meses", precio: 7.5, ivaIncluido: true },
      { tipo: "3 meses", precio: 9, ivaIncluido: true },
      { tipo: "6 meses", precio: 17, ivaIncluido: true },
      { tipo: "12 meses", precio: 30, ivaIncluido: true }
    ] },
  { id: "deezer", nombre: "Deezer", categoria: "musica", icono: "🎧", descripcion: "Servicio musical premium para escuchar canciones y playlists.", etiquetas: [
      "⭐ RECOMENDADO"
    ], planes: [
      { tipo: "1 dispositivo · 1 mes", precio: 6.5 },
      { tipo: "3 meses", precio: 18.5 },
      { tipo: "6 meses", precio: 35 },
      { tipo: "12 meses", precio: 62.5 }
    ] },
  { id: "canva-edu", nombre: "Canva Edu", categoria: "apps", icono: "🎨", descripcion: "Herramienta de diseño para crear flyers, logos, publicaciones y presentaciones.", etiquetas: [
      "💎 PREMIUM"
    ], planes: [
      { tipo: "1 dispositivo · 1 mes", precio: 4.5, ivaIncluido: true },
      { tipo: "3 meses", precio: 12.5, ivaIncluido: true },
      { tipo: "6 meses", precio: 23, ivaIncluido: true },
      { tipo: "12 meses", precio: 40, ivaIncluido: true }
    ] },
  { id: "capcut-pro", nombre: "CapCut Pro", categoria: "apps", icono: "🎬", descripcion: "Editor de video premium con herramientas, plantillas y funciones avanzadas.", etiquetas: [
      "💎 PREMIUM"
    ], planes: [
      { tipo: "1 mes", precio: 6 },
      { tipo: "3 meses", precio: 17 },
      { tipo: "6 meses", precio: 32.5 },
      { tipo: "12 meses", precio: 57.5 },
      { tipo: "Cuenta completa · 1 mes", precio: 10 }
    ] },
  { id: "duolingo", nombre: "Duolingo", categoria: "apps", icono: "🎓", descripcion: "Plan premium para aprender idiomas con funciones adicionales.", etiquetas: [
      "⭐ RECOMENDADO"
    ], planes: [
      { tipo: "1 mes", precio: 6 },
      { tipo: "3 meses", precio: 17 },
      { tipo: "6 meses", precio: 32.5 },
      { tipo: "12 meses", precio: 57.5 }
    ] },
  { id: "hola-vpn", nombre: "Hola VPN", categoria: "apps", icono: "🌐", descripcion: "VPN para navegar con otra ubicación y acceder a contenido según disponibilidad.", etiquetas: [
      "💎 PREMIUM"
    ], planes: [
      { tipo: "1 mes", precio: 6 },
      { tipo: "3 meses", precio: 17 },
      { tipo: "6 meses", precio: 32.5 },
      { tipo: "12 meses", precio: 57.5 }
    ] },
  { id: "chatgpt-plus", nombre: "ChatGPT Plus", categoria: "apps", icono: "🤖", descripcion: "Herramienta de inteligencia artificial para estudiar, redactar, resolver dudas y crear contenido.", etiquetas: [
      "💎 PREMIUM"
    ], planes: [
      { tipo: "1 dispositivo · 1 mes", precio: 7, ivaIncluido: true },
      { tipo: "3 meses", precio: 20, ivaIncluido: true },
      { tipo: "6 meses", precio: 38, ivaIncluido: true },
      { tipo: "12 meses", precio: 72, ivaIncluido: true }
    ] },
  { id: "dazn", nombre: "DAZN", categoria: "deportes", icono: "🔴", descripcion: "Servicio deportivo para ver eventos en vivo, fútbol internacional, boxeo y programación deportiva.", etiquetas: [
      "⚽ IDEAL PARA EL MUNDIAL"
    ], planes: [
      { tipo: "1 mes", precio: 10 },
      { tipo: "3 meses", precio: 28.5 },
      { tipo: "6 meses", precio: 54 },
      { tipo: "12 meses", precio: 96 }
    ] },
  { id: "deportes-pack", nombre: "Pack Deportes", categoria: "deportes", icono: "⚽", descripcion: "Paquetes deportivos con DAZN, Disney+, Paramount+, NBA, UFC, ECDF y Zapping según disponibilidad.", etiquetas: [
      "⚽ IDEAL PARA EL MUNDIAL",
      "🔥 MÁS VENDIDO"
    ], planes: [
      { tipo: "Consultar disponibilidad", precio: 0, consultar: true }
    ] },
  { id: "aumento-gigas-proneet", nombre: "Aumento de gigas PRONEET VPN", categoria: "proneet", icono: "📶", descripcion: "Aumento de megas para Android en Ecuador. Disponible para Claro, Movistar y Tuenti. No disponible para CNT.", etiquetas: [
      "🚀 AUMENTO DE MEGAS",
      "✅ ACEPTA CUPÓN",
      "⚡ ACTIVACIÓN RÁPIDA"
    ], planes: [
      { tipo: "PRONEET VPN Claro · aumento de megas", precio: 5, ivaIncluido: true },
      { tipo: "PRONEET VPN Movistar · aumento de megas", precio: 5, ivaIncluido: true },
      { tipo: "PRONEET VPN Tuenti · aumento de megas", precio: 5, ivaIncluido: true }
    ] },
  { id: "claro-paquetes-megas", nombre: "Claro Paquetes Megas", categoria: "recargas", icono: "🔴", descripcion: "Paquetes de megas Claro Ecuador según tabla enviada. Valores finales para activación por paquete.", etiquetas: [
      "🔴 CLARO",
      "📶 PAQUETES MEGAS",
      "🚫 SIN CUPÓN"
    ], planes: [
      { tipo: "1 GB · vigencia 1 día", precio: 1.05, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Redes ilimitadas · vigencia 1 día", precio: 1.5, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "2 GB · vigencia 2 días", precio: 2.05, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "5 GB · vigencia 3 días", precio: 2.5, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "7 GB · vigencia 3 días", precio: 3.1, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "9 GB · vigencia 7 días", precio: 3.5, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "10 GB · vigencia 10 días", precio: 4, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "8 GB · vigencia 15 días", precio: 5.15, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "10 GB · vigencia 15 días", precio: 5.5, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "12 GB · vigencia 25 días", precio: 8, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "16 GB · vigencia 30 días", precio: 10.5, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "19 GB · vigencia 30 días", precio: 12.5, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "22 GB · vigencia 30 días", precio: 15.5, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "27 GB · vigencia 30 días", precio: 20.5, ivaIncluido: true, bloquearDescuento: true }
    ] },
  { id: "movistar-combos", nombre: "Movistar Combos Prepago", categoria: "recargas", icono: "🔵", descripcion: "Combos Movistar Ecuador con precios finales publicados por operador. No aplican cupón de descuento.", etiquetas: [
      "🔵 MOVISTAR",
      "📲 COMBOS",
      "🚫 SIN CUPÓN"
    ], planes: [
      { tipo: "1 GB · vigencia 1 día", precio: 1.05, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "5 GB · vigencia 7 días", precio: 3, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "6 GB · vigencia 15 días", precio: 5, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "8 GB · vigencia 20 días", precio: 7, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "8 GB · vigencia 30 días", precio: 8, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "10 GB · vigencia 30 días", precio: 9, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "14 GB · vigencia 30 días", precio: 10.25, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "19 GB · vigencia 30 días", precio: 15.5, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Recarga normal Movistar · monto a confirmar", precio: 0, consultar: true }
    ] },
  { id: "tuenti-recargas-combos", nombre: "Tuenti Recargas y Combos", categoria: "recargas", icono: "🩵", descripcion: "Recargas y combos Tuenti Ecuador. Los precios finales de combos no aceptan cupón.", etiquetas: [
      "🩵 TUENTI",
      "💸 RECARGAS",
      "🚫 SIN CUPÓN"
    ], planes: [
      { tipo: "Recarga normal Tuenti $1", precio: 1, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Recarga normal Tuenti $4", precio: 4, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Recarga normal Tuenti $8", precio: 8, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Combo 1/2 GB · vigencia 15 días", precio: 1, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Combo 3 GB · vigencia 15 días", precio: 4, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Combo 5 GB · vigencia 30 días", precio: 7, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Combo 8 GB + 2 GB TikTok/Instagram · vigencia 30 días", precio: 8, ivaIncluido: true, bloquearDescuento: true }
    ] },
  { id: "cnt-paquetes-prepago", nombre: "CNT Paquetes Prepago", categoria: "recargas", icono: "🟣", descripcion: "Paquetes CNT Ecuador con precios finales. No aplican cupón de descuento.", etiquetas: [
      "🟣 CNT",
      "📲 PAQUETES",
      "🚫 SIN CUPÓN"
    ], planes: [
      { tipo: "Paquete Plus · vigencia 1 día", precio: 1, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Paquete Plus · vigencia 3 días", precio: 2, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Paquete Plus · vigencia 7 días", precio: 3, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Paquete Plus · vigencia 30 días", precio: 5, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Paquete Plus · vigencia 30 días", precio: 6, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Paquete Plus · vigencia 30 días", precio: 10, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Paquete Plus · vigencia 30 días", precio: 15, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Paquete Plus · vigencia 30 días", precio: 20, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Apps prepago · 1 GB para app · vigencia 1 día", precio: 1, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Herramientas colaboración · 5 GB", precio: 5, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Recarga normal CNT · monto a confirmar", precio: 0, consultar: true }
    ] },
  { id: "recargas-ilimitadas-operador", nombre: "Recargas ilimitadas por operador", categoria: "recargas", icono: "♾️", descripcion: "Gestión de recarga ilimitada o combo ilimitado por operador. Precio final sin IVA adicional y sin cupón.", etiquetas: [
      "♾️ ILIMITADAS",
      "✅ PRECIO FINAL",
      "🚫 SIN CUPÓN"
    ], planes: [
      { tipo: "Recarga ilimitada Claro · 1 mes", precio: 4, ivaIncluido: true },
      { tipo: "Recarga ilimitada Movistar · 1 mes", precio: 4, ivaIncluido: true },
      { tipo: "Recarga ilimitada Tuenti · 1 mes", precio: 4, ivaIncluido: true },
      { tipo: "Recarga ilimitada CNT · 1 mes", precio: 4, ivaIncluido: true }
    ] }
];
  const ALIAS_EXISTENTES = {
    'netflix-normal': 'netflix-compartido',
    'disney-plus': 'disney-estandar',
    'zapping-ligapro': 'zapping-pro',
    'dgo': 'directv-go',
    'chatgpt-plus': 'chatgpt'
  };
  for (const nuevo of NUEVOS_PRECIOS) {
    if (nuevo.categoria === 'recargas' || nuevo.categoria === 'proneet') {
      continue; // Tarifas de operadores y recargas existentes no se modifican
    }
    const alias = ALIAS_EXISTENTES[nuevo.id];
    let actual = PRODUCTOS.find(p => p.id === nuevo.id);
    if (!actual && alias) actual = PRODUCTOS.find(p => p.id === alias);
    if (actual) {
      actual.nombre = nuevo.nombre;
      actual.planes = nuevo.planes.map(p => ({...p}));
      actual.icono = nuevo.icono;
      actual.etiquetas = nuevo.etiquetas;
      // Conservar descripciones y propiedades particulares de la tienda actual.
    } else {
      PRODUCTOS.push({ ...nuevo, planes:nuevo.planes.map(p=>({...p})) });
    }
  }
})();
