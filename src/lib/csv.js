// ============================================================================
//  Parser de CSV + validadores por fila.
//  Soporta comillas dobles, comas dentro de comillas y saltos de línea.
// ============================================================================

/** Convierte un texto CSV en un arreglo de objetos usando la 1ª fila como headers. */
export function parseCSV(text) {
  const rows = tokenizeCSV(text)
  if (rows.length === 0) return []

  const headers = rows[0].map((h) => h.trim().toLowerCase())
  return rows
    .slice(1)
    .filter((cols) => cols.some((c) => c.trim() !== '')) // ignora filas vacías
    .map((cols) => {
      const obj = {}
      headers.forEach((h, i) => {
        obj[h] = (cols[i] ?? '').trim()
      })
      return obj
    })
}

/** Tokeniza respetando comillas dobles según RFC 4180 (simplificado). */
function tokenizeCSV(text) {
  const rows = []
  let field = ''
  let row = []
  let inQuotes = false

  const clean = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i]

    if (inQuotes) {
      if (char === '"') {
        if (clean[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  // último campo/fila
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

/** "no", "false", "0" → false. Todo lo demás (incl. vacío) → true. */
export function isActive(value) {
  if (value == null) return true
  const v = String(value).trim().toLowerCase()
  return !['no', 'false', '0', 'inactivo', 'off'].includes(v)
}

/** Parsea "6 pz:135|12 pz:245|24 pz:459" → [{name,price}]. */
export function parseSizes(value) {
  if (!value) return []
  return String(value)
    .split('|')
    .map((chunk) => {
      const idx = chunk.lastIndexOf(':')
      if (idx === -1) return null
      const name = chunk.slice(0, idx)
      const price = chunk.slice(idx + 1)
      const p = Number(String(price).replace(/[^0-9.]/g, ''))
      if (!name || Number.isNaN(p)) return null
      return { name: name.trim(), price: p }
    })
    .filter(Boolean)
}

/** Parsea "BBQ|Buffalo|Mango Habanero" → ['BBQ', ...]. */
export function parseList(value) {
  if (!value) return []
  return String(value)
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
}

// ---------------------------------------------------------------------------
//  Validadores por fila. Devuelven el objeto normalizado o null si es inválido.
// ---------------------------------------------------------------------------

export function validateMenuRow(row) {
  const nombre = row.nombre || row.name || ''
  const categoria = row.categoria || row.category || 'Otros'
  if (!nombre.trim()) return null

  const sizes = parseSizes(row.tamanos || row.tamaños || row.sizes || '')
  const basePrice = Number(
    String(row.precio || row.price || '').replace(/[^0-9.]/g, '')
  )

  // Debe tener al menos un precio base o tamaños válidos.
  if (sizes.length === 0 && Number.isNaN(basePrice)) return null

  return {
    id: slug(`${categoria}-${nombre}`),
    category: categoria.trim(),
    name: nombre.trim(),
    description: (row.descripcion || row.description || '').trim(),
    price: Number.isNaN(basePrice) ? sizes[0]?.price ?? 0 : basePrice,
    sizes,
    flavors: parseList(row.sabores || row.flavors || ''),
    tag: (row.etiqueta || row.tag || '').trim(),
    featured:
      isActive(row.destacado || row.featured) &&
      !!(row.destacado || row.featured),
    active: isActive(row.activo ?? row.active),
  }
}

export function validatePromoRow(row) {
  const titulo = row.titulo || row.title || ''
  if (!titulo.trim()) return null
  return {
    id: slug(titulo),
    title: titulo.trim(),
    description: (row.descripcion || row.description || '').trim(),
    tag: (row.etiqueta || row.tag || '').trim(),
    price: (row.precio || row.price || '').trim(),
    active: isActive(row.activo ?? row.active),
  }
}

export function validateReviewRow(row) {
  const nombre = row.nombre || row.name || ''
  const texto = row.texto || row.text || ''
  if (!nombre.trim() || !texto.trim()) return null
  let stars = Number(row.estrellas || row.stars || 5)
  if (Number.isNaN(stars) || stars < 1 || stars > 5) stars = 5
  return {
    id: slug(`${nombre}-${texto.slice(0, 8)}`),
    name: nombre.trim(),
    text: texto.trim(),
    stars: Math.round(stars),
    date: (row.fecha || row.date || '').trim(),
  }
}

export function validateHoursRow(row) {
  const dayRaw = row.dia ?? row.day ?? ''
  const day = Number(dayRaw)
  if (Number.isNaN(day) || day < 0 || day > 6) return null
  return {
    day,
    open: (row.abre || row.open || '').trim(),
    close: (row.cierra || row.close || '').trim(),
    closed:
      String(row.cerrado || '').toLowerCase() === 'si' ||
      String(row.cerrado || '').toLowerCase() === 'sí' ||
      String(row.cerrado || '').toLowerCase() === 'true',
  }
}

function slug(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
