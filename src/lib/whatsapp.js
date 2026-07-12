// ============================================================================
//  Construcción del deep link de WhatsApp (wa.me) con el pedido formateado.
// ============================================================================

import { BUSINESS } from './config'

const currency = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

export { currency }

/** Precio unitario de un ítem del carrito (base + tamaño). */
export function lineUnitPrice(item) {
  return item.size ? item.size.price : item.price
}

/** Total de una línea del carrito. */
export function lineTotal(item) {
  return lineUnitPrice(item) * item.qty
}

/** Total general del carrito. */
export function cartTotal(items) {
  return items.reduce((sum, it) => sum + lineTotal(it), 0)
}

/** Genera el enlace wa.me con el pedido formateado y codificado. */
export function buildOrderLink(items, note = '') {
  const lines = []
  lines.push(`*Pedido — ${BUSINESS.name}* 🍗`)
  lines.push('')

  items.forEach((it) => {
    const parts = [`${it.qty}× ${it.name}`]
    if (it.size) parts.push(`(${it.size.name})`)
    if (it.flavor) parts.push(`· ${it.flavor}`)
    lines.push(`• ${parts.join(' ')} — ${currency(lineTotal(it))}`)
  })

  lines.push('')
  lines.push(`*Total: ${currency(cartTotal(items))}*`)

  if (note.trim()) {
    lines.push('')
    lines.push(`Nota: ${note.trim()}`)
  }

  lines.push('')
  lines.push('¡Gracias! 🔥')

  const text = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${BUSINESS.whatsapp}?text=${text}`
}

/** Enlace simple de WhatsApp con un mensaje predefinido. */
export function buildMessageLink(message) {
  return `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`
}
