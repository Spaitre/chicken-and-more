// ============================================================================
//  CONFIGURACIÓN CENTRAL DEL NEGOCIO — Chicken and More (Mexicali)
//  Edita este archivo para cambiar datos de contacto, redes y horario base.
//  Los precios/menú/promos se editan en src/data/*.js o en Google Sheets.
// ============================================================================

export const BUSINESS = {
  name: 'Chicken and More',
  tagline: 'Alitas, boneless, pizzas y burgers',
  // Frases cortas para el hero. \n permite saltos de línea controlados.
  heroLine: 'Alitas que\nse defienden solas.',
  giro: 'Alitas · Boneless · Pizzas · Hamburguesas',
  tone: 'atrevido · antojo · para compartir',

  // ---- Contacto ---- (REEMPLAZA por los datos reales del negocio) ----
  phoneDisplay: '686 200 0000',
  phoneTel: '+526862000000',
  // WhatsApp con lada país (52) sin signos ni espacios.
  whatsapp: '526862000000',
  email: 'hola@chickenandmore.mx',

  // ---- Ubicación ----
  address: 'Av. Reforma 1200, Nueva',
  city: 'Mexicali, B.C.',
  postalCode: '21100',
  fullAddress: 'Av. Reforma 1200, Nueva, 21100 Mexicali, B.C.',
  timezone: 'America/Tijuana',

  // Mapa: embed real de Google Maps (sin API key). Cambia la consulta "q".
  mapsQuery: 'Chicken and More Mexicali',
  mapsEmbed:
    'https://www.google.com/maps?q=Chicken%20and%20More%20Mexicali&output=embed',
  // Link para "cómo llegar".
  mapsDirections:
    'https://www.google.com/maps/dir/?api=1&destination=Chicken%20and%20More%20Mexicali',
  // Link para dejar reseña en Google (reemplaza por tu place_id real).
  googleReview:
    'https://search.google.com/local/writereview?placeid=REEMPLAZA_PLACE_ID',

  // ---- Redes ----
  instagram: 'https://instagram.com/chickenandmore',
  facebook: 'https://facebook.com/chickenandmore',
  tiktok: 'https://tiktok.com/@chickenandmore',

  // Rating mostrado (coincide con JSON-LD en index.html).
  rating: 4.8,
  reviewCount: 342,

  // Datos rápidos que se muestran en la sección "Nosotros".
  stats: [
    { value: '10+', label: 'Salsas de la casa' },
    { value: '25', label: 'Minutos promedio' },
    { value: '4.8★', label: 'Calificación' },
    { value: '2015', label: 'Desde el año' },
  ],
}

// ============================================================================
//  GOOGLE SHEETS — URLs de CSV publicado.
//  Deja el valor vacío ('') para usar SIEMPRE los datos locales (src/data).
//  Para activar: en Google Sheets → Archivo → Compartir → Publicar en la web
//  → elige la hoja → formato "CSV" → copia el enlace aquí.
//  (Consulta /plantillas-google-sheets para el formato de columnas.)
// ============================================================================

const SHEET_BASE = '' // p. ej. 'https://docs.google.com/spreadsheets/d/e/XXXX/pub'

export const SHEETS = {
  menu: SHEET_BASE ? `${SHEET_BASE}?gid=0&single=true&output=csv` : '',
  promos: SHEET_BASE ? `${SHEET_BASE}?gid=1&single=true&output=csv` : '',
  hours: SHEET_BASE ? `${SHEET_BASE}?gid=2&single=true&output=csv` : '',
  reviews: '', // sin conectar: usa las reseñas locales
}

// Horario base (fallback y JSON-LD). day: 0=Domingo ... 6=Sábado.
// Se sobreescribe si la hoja "hours" está publicada y es válida.
// Nota: Vie y Sáb cierran pasada la medianoche (01:00) — soportado.
export const HOURS_FALLBACK = [
  { day: 1, open: '13:00', close: '23:00', closed: false }, // Lunes
  { day: 2, open: '13:00', close: '23:00', closed: false },
  { day: 3, open: '13:00', close: '23:00', closed: false },
  { day: 4, open: '13:00', close: '23:00', closed: false },
  { day: 5, open: '13:00', close: '01:00', closed: false }, // Viernes
  { day: 6, open: '13:00', close: '01:00', closed: false }, // Sábado
  { day: 0, open: '13:00', close: '22:00', closed: false }, // Domingo
]

export const DAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]
