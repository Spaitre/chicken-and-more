// ============================================================================
//  Utilidades de tiempo en la zona horaria del negocio (America/Tijuana).
//  Usa Intl para obtener la hora local del negocio sin importar dónde esté
//  el visitante.
// ============================================================================

/** Devuelve { day: 0-6, minutes: minutos desde medianoche } en la zona dada. */
export function nowInZone(timezone) {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)

  const map = {}
  for (const p of parts) map[p.type] = p.value

  const weekdayIndex = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  }[map.weekday]

  let hour = parseInt(map.hour, 10)
  if (hour === 24) hour = 0 // algunos entornos devuelven "24" a medianoche
  const minute = parseInt(map.minute, 10)

  return { day: weekdayIndex, minutes: hour * 60 + minute }
}

/** "13:30" → 810 minutos. */
export function toMinutes(hhmm) {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10))
  if (Number.isNaN(h)) return null
  return h * 60 + (Number.isNaN(m) ? 0 : m)
}

/** "13:00" → "1:00 p.m." (formato amable en español-MX). */
export function prettyTime(hhmm) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10))
  const period = h >= 12 ? 'p.m.' : 'a.m.'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

/**
 * Calcula el estado del negocio a partir del horario y la hora local.
 * Soporta cierres pasada la medianoche (close < open).
 * Devuelve { open: bool, nextChange: 'HH:MM'|null, reason }.
 */
export function computeOpenState(hours, timezone) {
  const { day, minutes } = nowInZone(timezone)

  // Caso especial: puede seguir abierto por un turno que cruzó la medianoche
  // (p. ej. viernes que cierra a la 01:00 y hoy ya es sábado 00:30).
  const prevDay = (day + 6) % 7
  const yesterday = hours.find((h) => h.day === prevDay)
  if (yesterday && !yesterday.closed) {
    const yOpen = toMinutes(yesterday.open)
    const yClose = toMinutes(yesterday.close)
    if (yOpen != null && yClose != null && yClose < yOpen && minutes < yClose) {
      return { open: true, reason: 'open', nextChange: yesterday.close }
    }
  }

  const today = hours.find((h) => h.day === day)
  if (!today || today.closed) {
    return { open: false, reason: 'closed_today', nextChange: null }
  }

  const openM = toMinutes(today.open)
  const closeM = toMinutes(today.close)
  if (openM == null || closeM == null) {
    return { open: false, reason: 'no_hours', nextChange: null }
  }

  let isOpen
  if (closeM > openM) {
    isOpen = minutes >= openM && minutes < closeM
  } else {
    // cruza medianoche
    isOpen = minutes >= openM || minutes < closeM
  }

  return {
    open: isOpen,
    reason: isOpen ? 'open' : 'outside_hours',
    nextChange: isOpen ? today.close : today.open,
  }
}
