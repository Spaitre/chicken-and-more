// ============================================================================
//  orderService — creación, cálculo de tiempo estimado, capacidad y estados.
//
//  Tiempo estimado = max(tiempo_prep de los productos del pedido)
//                    + (pedidos activos en cola) * minutos_extra_por_pedido
//  Reproduce el ejemplo del negocio: 20 → 30 → 40 → 50 (base 20, +10 por cola).
// ============================================================================
import { database } from '../db/database.js'
import { ApiError } from '../lib/ApiError.js'
import { generarCodigo } from '../lib/codigo.js'
import { validarTelefono } from '../lib/tiempo.js'
import { obtenerProducto } from './menuService.js'
import { obtenerConfig, estadoNegocio } from './configService.js'
import { iniciarPago } from './paymentService.js'
import { emitirAdmin, emitirPedido, emitirEstado } from './realtime.js'

export const ESTADOS = [
  'recibido',
  'confirmado',
  'en_preparacion',
  'listo',
  'entregado',
  'cancelado',
]

// Estados que ocupan capacidad (cuentan como "en cola o preparación").
const ACTIVOS = ['recibido', 'confirmado', 'en_preparacion']

export async function contarActivos(tx = database) {
  const { n } = await tx.get(
    `SELECT COUNT(*) AS n FROM pedidos WHERE estado IN ('recibido','confirmado','en_preparacion')`
  )
  return n
}

/**
 * Crea un pedido. payload = { nombre, telefono, comentarios, items: [{id,size,flavor,qty}] }
 */
export async function crear(payload = {}) {
  const nombre = String(payload.nombre || '').trim()
  if (nombre.length < 2) throw new ApiError(400, 'Escribe tu nombre.', 'nombre')

  const tel = validarTelefono(payload.telefono)
  if (!tel.valido) {
    throw new ApiError(400, 'El teléfono debe tener 10 dígitos válidos.', 'telefono')
  }

  const comentarios = String(payload.comentarios || '').trim().slice(0, 500)

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new ApiError(400, 'Tu pedido está vacío.', 'items')
  }

  // Estado del negocio (mensajes claros por motivo).
  const estado = await estadoNegocio()
  if (!estado.abierto) {
    throw new ApiError(409, 'La cocina está cerrada en este momento.', 'CERRADO')
  }
  if (estado.motivo === 'pausado') {
    throw new ApiError(409, 'No estamos recibiendo pedidos por ahora.', 'PAUSADO')
  }

  const config = await obtenerConfig()

  // Resolver y validar cada renglón contra el catálogo (precio del servidor).
  const lineas = []
  for (const it of payload.items) {
    const prod = await obtenerProducto(it.id)
    if (!prod || prod.oculto) {
      throw new ApiError(422, `Un producto ya no está disponible.`, 'NO_DISPONIBLE')
    }
    if (prod.agotado) {
      throw new ApiError(422, `"${prod.name}" está agotado.`, 'AGOTADO')
    }

    let precioUnit = prod.price
    let tamano = ''
    if (prod.sizes.length > 0) {
      const elegido = prod.sizes.find((s) => s.name === it.size)
      if (!elegido) throw new ApiError(422, `Elige un tamaño para "${prod.name}".`, 'TAMANO')
      precioUnit = elegido.price
      tamano = elegido.name
    }

    let sabor = ''
    if (prod.flavors.length > 0) {
      if (!it.flavor || !prod.flavors.includes(it.flavor)) {
        throw new ApiError(422, `Elige una opción para "${prod.name}".`, 'SABOR')
      }
      sabor = it.flavor
    }

    const cantidad = Math.max(1, Math.min(50, parseInt(it.qty, 10) || 1))
    lineas.push({
      producto_id: prod.id,
      nombre: prod.name,
      precio_unit: precioUnit,
      tamano,
      sabor,
      cantidad,
      subtotal: precioUnit * cantidad,
      tiempo_prep: prod.tiempoPrep,
    })
  }

  const total = lineas.reduce((s, l) => s + l.subtotal, 0)
  const maxPrep = Math.max(...lineas.map((l) => l.tiempo_prep))
  const requierePago =
    config.umbralPagoAnticipado > 0 && total >= config.umbralPagoAnticipado

  // Inserción atómica con verificación de capacidad DENTRO de la transacción.
  const creado = await database.withTransaction(async (tx) => {
    const activos = await contarActivos(tx)
    if (activos >= config.maxSimultaneos) {
      throw new ApiError(
        409,
        'La cocina está trabajando a máxima capacidad. Intenta de nuevo en unos minutos.',
        'CAPACIDAD'
      )
    }

    const tiempoEstimado = maxPrep + activos * config.minutosExtraPorPedido
    const codigo = await generarCodigo(tx)

    const { lastInsertRowid } = await tx.run(
      `INSERT INTO pedidos
        (codigo, nombre, telefono, comentarios, estado, total, tiempo_estimado_min,
         requiere_pago_anticipado, pago_estado)
       VALUES (?, ?, ?, ?, 'recibido', ?, ?, ?, ?)`,
      [
        codigo,
        nombre,
        tel.nacional,
        comentarios,
        total,
        tiempoEstimado,
        requierePago ? 1 : 0,
        requierePago ? 'pendiente' : 'no_requerido',
      ]
    )

    for (const l of lineas) {
      await tx.run(
        `INSERT INTO pedido_items
          (pedido_id, producto_id, nombre, precio_unit, tamano, sabor, cantidad, subtotal, tiempo_prep)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [lastInsertRowid, l.producto_id, l.nombre, l.precio_unit, l.tamano, l.sabor, l.cantidad, l.subtotal, l.tiempo_prep]
      )
    }

    return { id: Number(lastInsertRowid), codigo, tiempoEstimado }
  })

  // Pago anticipado (fuera de la transacción; puede llamar a un proveedor externo).
  let pago = null
  if (requierePago) {
    pago = await iniciarPago({ codigo: creado.codigo, total, nombre })
    await database.run(
      `UPDATE pedidos SET pago_metodo = ?, pago_ref = ?, pago_estado = ? WHERE id = ?`,
      [pago.metodo, pago.ref || '', pago.estado, creado.id]
    )
  }

  // Notificaciones en vivo.
  emitirAdmin({ tipo: 'nuevo', codigo: creado.codigo })
  emitirPedido(creado.codigo, { estado: 'recibido' })
  emitirEstadoNegocio()

  const detalle = await obtenerPorCodigo(creado.codigo)
  return { ...detalle, pagoUrl: pago?.url || null }
}

/** Vista pública (por código) — la que ve el cliente. */
export async function obtenerPorCodigo(codigo) {
  const p = await database.get(`SELECT * FROM pedidos WHERE codigo = ?`, [codigo])
  if (!p) throw new ApiError(404, 'No encontramos ese pedido.', 'NO_ENCONTRADO')
  const items = await database.all(
    `SELECT nombre, precio_unit, tamano, sabor, cantidad, subtotal FROM pedido_items WHERE pedido_id = ?`,
    [p.id]
  )
  return {
    codigo: p.codigo,
    nombre: p.nombre,
    estado: p.estado,
    total: p.total,
    tiempoEstimado: p.estimado_override ?? p.tiempo_estimado_min,
    comentarios: p.comentarios,
    requierePago: !!p.requiere_pago_anticipado,
    pagoEstado: p.pago_estado,
    items: items.map((i) => ({
      nombre: i.nombre,
      tamano: i.tamano,
      sabor: i.sabor,
      cantidad: i.cantidad,
      subtotal: i.subtotal,
    })),
    creadoEn: p.creado_en,
    actualizadoEn: p.actualizado_en,
  }
}

/** Vista admin de un pedido (incluye teléfono). */
export async function detalleAdmin(id) {
  const p = await database.get(`SELECT * FROM pedidos WHERE id = ?`, [id])
  if (!p) throw new ApiError(404, 'Pedido no encontrado.')
  const items = await database.all(
    `SELECT * FROM pedido_items WHERE pedido_id = ?`,
    [p.id]
  )
  return mapAdmin(p, items)
}

function mapAdmin(p, items = []) {
  return {
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    telefono: p.telefono,
    comentarios: p.comentarios,
    estado: p.estado,
    total: p.total,
    tiempoEstimado: p.estimado_override ?? p.tiempo_estimado_min,
    estimadoBase: p.tiempo_estimado_min,
    estimadoOverride: p.estimado_override,
    requierePago: !!p.requiere_pago_anticipado,
    pagoEstado: p.pago_estado,
    creadoEn: p.creado_en,
    actualizadoEn: p.actualizado_en,
    items: items.map((i) => ({
      nombre: i.nombre,
      tamano: i.tamano,
      sabor: i.sabor,
      cantidad: i.cantidad,
      subtotal: i.subtotal,
    })),
  }
}

/** Lista para el panel: activos (por defecto) o historial (terminados). */
export async function listar({ historial = false } = {}) {
  const cond = historial
    ? `estado IN ('entregado','cancelado')`
    : `estado IN ('recibido','confirmado','en_preparacion','listo')`
  const orden = historial ? `creado_en DESC` : `creado_en ASC`
  const filas = await database.all(`SELECT * FROM pedidos WHERE ${cond} ORDER BY ${orden} LIMIT 200`)
  const ids = filas.map((f) => f.id)
  let itemsPorPedido = {}
  if (ids.length) {
    const items = await database.all(
      `SELECT * FROM pedido_items WHERE pedido_id IN (${ids.map(() => '?').join(',')})`,
      ids
    )
    for (const it of items) {
      ;(itemsPorPedido[it.pedido_id] ||= []).push(it)
    }
  }
  return filas.map((p) => mapAdmin(p, itemsPorPedido[p.id] || []))
}

/** Cambia el estado de un pedido (acción del panel). */
export async function transicionar(id, nuevoEstado) {
  if (!ESTADOS.includes(nuevoEstado)) throw new ApiError(400, 'Estado inválido.')
  const p = await database.get(`SELECT codigo FROM pedidos WHERE id = ?`, [id])
  if (!p) throw new ApiError(404, 'Pedido no encontrado.')

  await database.run(
    `UPDATE pedidos SET estado = ?, actualizado_en = datetime('now') WHERE id = ?`,
    [nuevoEstado, id]
  )

  emitirPedido(p.codigo, { estado: nuevoEstado })
  emitirAdmin({ tipo: 'estado', id, estado: nuevoEstado })
  emitirEstadoNegocio() // la capacidad puede cambiar al terminar/cancelar
  return detalleAdmin(id)
}

/** Ajusta manualmente el tiempo estimado (minutos) o lo limpia con null. */
export async function overrideEstimado(id, minutos) {
  const p = await database.get(`SELECT codigo FROM pedidos WHERE id = ?`, [id])
  if (!p) throw new ApiError(404, 'Pedido no encontrado.')
  let valor = null
  if (minutos !== null && minutos !== undefined && minutos !== '') {
    valor = parseInt(minutos, 10)
    if (Number.isNaN(valor) || valor < 0) throw new ApiError(400, 'Minutos inválidos.')
  }
  await database.run(
    `UPDATE pedidos SET estimado_override = ?, actualizado_en = datetime('now') WHERE id = ?`,
    [valor, id]
  )
  const detalle = await detalleAdmin(id)
  emitirPedido(p.codigo, { estado: detalle.estado, tiempoEstimado: detalle.tiempoEstimado })
  emitirAdmin({ tipo: 'estimado', id })
  return detalle
}

/** Marca un pedido como pagado (desde webhook o simulación). */
export async function marcarPagado(codigo, ref = '', metodo = '') {
  const p = await database.get(`SELECT id, pago_metodo FROM pedidos WHERE codigo = ?`, [codigo])
  if (!p) throw new ApiError(404, 'Pedido no encontrado.')
  await database.run(
    `UPDATE pedidos SET pago_estado = 'pagado', pago_ref = ?, pago_metodo = COALESCE(NULLIF(?,''), pago_metodo), actualizado_en = datetime('now') WHERE id = ?`,
    [ref, metodo, p.id]
  )
  emitirPedido(codigo, { pagoEstado: 'pagado' })
  emitirAdmin({ tipo: 'pago', codigo })
  return obtenerPorCodigo(codigo)
}

// Emite el estado del negocio al storefront (import diferido para evitar ciclos).
async function emitirEstadoNegocio() {
  try {
    const estado = await estadoNegocio()
    emitirEstado(estado)
  } catch {
    /* noop */
  }
}
