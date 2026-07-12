// ============================================================================
//  menuService — catálogo de productos (fuente de verdad para pedir).
// ============================================================================
import { database } from '../db/database.js'
import { ApiError } from '../lib/ApiError.js'
import { emitir, emitirAdmin } from './realtime.js'

function mapProducto(p) {
  return {
    id: p.id,
    category: p.categoria,
    name: p.nombre,
    description: p.descripcion,
    price: p.precio_base,
    tiempoPrep: p.tiempo_prep,
    sizes: safeJson(p.tamanos_json, []),
    flavors: safeJson(p.sabores_json, []),
    tag: p.etiqueta,
    featured: !!p.destacado,
    agotado: !!p.agotado,
    oculto: !!p.oculto,
    orden: p.orden,
  }
}

function safeJson(txt, fallback) {
  try {
    const v = JSON.parse(txt)
    return Array.isArray(v) ? v : fallback
  } catch {
    return fallback
  }
}

/** Menú público: excluye ocultos; incluye agotados (marcados, no pedibles). */
export async function listarPublico() {
  const filas = await database.all(
    `SELECT * FROM productos WHERE oculto = 0 ORDER BY orden, categoria`
  )
  return filas.map(mapProducto)
}

/** Menú completo para el panel admin. */
export async function listarAdmin() {
  const filas = await database.all(`SELECT * FROM productos ORDER BY orden, categoria`)
  return filas.map(mapProducto)
}

/** Devuelve un producto por id (para validar al crear pedidos). */
export async function obtenerProducto(id) {
  const p = await database.get(`SELECT * FROM productos WHERE id = ?`, [id])
  return p ? mapProducto(p) : null
}

const EDITABLES = {
  agotado: (v) => (v ? 1 : 0),
  oculto: (v) => (v ? 1 : 0),
  destacado: (v) => (v ? 1 : 0),
  precioBase: (v) => num(v, 'precio'),
  tiempoPrep: (v) => intPos(v, 'tiempo de preparación'),
  etiqueta: (v) => String(v).slice(0, 40),
  nombre: (v) => String(v).slice(0, 120),
  descripcion: (v) => String(v).slice(0, 400),
}
const COLS = {
  agotado: 'agotado',
  oculto: 'oculto',
  destacado: 'destacado',
  precioBase: 'precio_base',
  tiempoPrep: 'tiempo_prep',
  etiqueta: 'etiqueta',
  nombre: 'nombre',
  descripcion: 'descripcion',
}

function num(v, campo) {
  const n = Number(v)
  if (Number.isNaN(n) || n < 0) throw new ApiError(400, `Valor inválido para ${campo}.`)
  return n
}
function intPos(v, campo) {
  const n = parseInt(v, 10)
  if (Number.isNaN(n) || n < 0) throw new ApiError(400, `Valor inválido para ${campo}.`)
  return n
}

/** Actualiza campos editables de un producto (inventario y datos básicos). */
export async function actualizarProducto(id, patch = {}) {
  const existe = await database.get(`SELECT id FROM productos WHERE id = ?`, [id])
  if (!existe) throw new ApiError(404, 'Producto no encontrado.')

  const sets = []
  const params = []
  for (const [k, transform] of Object.entries(EDITABLES)) {
    if (patch[k] === undefined) continue
    sets.push(`${COLS[k]} = ?`)
    params.push(transform(patch[k]))
  }
  if (sets.length) {
    params.push(id)
    await database.run(`UPDATE productos SET ${sets.join(', ')} WHERE id = ?`, params)
    // Avisa al storefront (recarga menú) y al panel.
    emitir('estado', 'menu', { productoId: id })
    emitirAdmin({ tipo: 'producto', id })
  }
  return obtenerProducto(id)
}
