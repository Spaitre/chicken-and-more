// ============================================================================
//  Utilidades de tiempo del negocio (zona America/Tijuana) + validaciones.
//  Misma lógica que el frontend (src/lib/time.js), del lado servidor.
// ============================================================================

export const TIMEZONE = process.env.TZ_NEGOCIO || 'America/Tijuana'

/** { day: 0-6, minutes: minutos desde medianoche } en la zona del negocio. */
export function nowInZone(timezone = TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())

  const map = {}
  for (const p of parts) map[p.type] = p.value

  const weekdayIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[
    map.weekday
  ]
  let hour = parseInt(map.hour, 10)
  if (hour === 24) hour = 0
  const minute = parseInt(map.minute, 10)
  return { day: weekdayIndex, minutes: hour * 60 + minute }
}

export function toMinutes(hhmm) {
  if (!hhmm) return null
  const [h, m] = String(hhmm).split(':').map((n) => parseInt(n, 10))
  if (Number.isNaN(h)) return null
  return h * 60 + (Number.isNaN(m) ? 0 : m)
}

/**
 * Estado de apertura a partir del horario (filas {dia, abre, cierra, cerrado}).
 * Soporta cierres pasada la medianoche (cierra < abre).
 * Devuelve { abierto, motivo, proximoCambio }.
 */
export function computeOpenState(horarios, timezone = TIMEZONE) {
  const { day, minutes } = nowInZone(timezone)

  // ¿Sigue abierto por un turno de ayer que cruzó la medianoche?
  const prev = (day + 6) % 7
  const ayer = horarios.find((h) => h.dia === prev)
  if (ayer && !ayer.cerrado) {
    const a = toMinutes(ayer.abre)
    const c = toMinutes(ayer.cierra)
    if (a != null && c != null && c < a && minutes < c) {
      return { abierto: true, motivo: 'abierto', proximoCambio: ayer.cierra }
    }
  }

  const hoy = horarios.find((h) => h.dia === day)
  if (!hoy || hoy.cerrado) {
    return { abierto: false, motivo: 'cerrado_hoy', proximoCambio: null }
  }
  const abre = toMinutes(hoy.abre)
  const cierra = toMinutes(hoy.cierra)
  if (abre == null || cierra == null) {
    return { abierto: false, motivo: 'sin_horario', proximoCambio: null }
  }

  let abierto
  if (cierra > abre) abierto = minutes >= abre && minutes < cierra
  else abierto = minutes >= abre || minutes < cierra // cruza medianoche

  return {
    abierto,
    motivo: abierto ? 'abierto' : 'fuera_horario',
    proximoCambio: abierto ? hoy.cierra : hoy.abre,
  }
}

/**
 * Normaliza y valida un teléfono mexicano.
 * Acepta espacios, guiones, paréntesis y prefijo +52 / 52.
 * Devuelve { valido, e164, nacional } — nacional = 10 dígitos.
 */
export function validarTelefono(input) {
  const soloDigitos = String(input || '').replace(/\D/g, '')
  let nacional = soloDigitos
  if (nacional.length === 12 && nacional.startsWith('52')) nacional = nacional.slice(2)
  if (nacional.length === 13 && nacional.startsWith('521')) nacional = nacional.slice(3)
  if (nacional.length !== 10) return { valido: false }
  // Un teléfono MX no empieza con 0 o 1.
  if (/^[01]/.test(nacional)) return { valido: false }
  return { valido: true, nacional, e164: `+52${nacional}` }
}
