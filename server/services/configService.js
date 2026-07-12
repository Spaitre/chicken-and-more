// ============================================================================
//  configService — configuración operativa y horarios del negocio.
// ============================================================================
import { database } from '../db/database.js'
import { ApiError } from '../lib/ApiError.js'
import { computeOpenState } from '../lib/tiempo.js'

export async function obtenerConfig() {
  const c = await database.get(`SELECT * FROM config WHERE id = 1`)
  return {
    aceptandoPedidos: !!c.aceptando_pedidos,
    maxSimultaneos: c.max_simultaneos,
    minutosExtraPorPedido: c.minutos_extra_por_pedido,
    umbralPagoAnticipado: c.umbral_pago_anticipado,
    moneda: c.moneda,
  }
}

const CAMPOS = {
  aceptandoPedidos: 'aceptando_pedidos',
  maxSimultaneos: 'max_simultaneos',
  minutosExtraPorPedido: 'minutos_extra_por_pedido',
  umbralPagoAnticipado: 'umbral_pago_anticipado',
}

/** Actualiza campos de configuración (solo los presentes y válidos). */
export async function actualizarConfig(patch = {}) {
  const sets = []
  const params = []
  for (const [k, col] of Object.entries(CAMPOS)) {
    if (patch[k] === undefined) continue
    let v = patch[k]
    if (k === 'aceptandoPedidos') v = v ? 1 : 0
    else {
      v = Number(v)
      if (Number.isNaN(v) || v < 0) throw new ApiError(400, `Valor inválido para ${k}.`)
      if (k === 'maxSimultaneos' && v < 1) throw new ApiError(400, 'El máximo debe ser ≥ 1.')
    }
    sets.push(`${col} = ?`)
    params.push(v)
  }
  if (sets.length) {
    await database.run(`UPDATE config SET ${sets.join(', ')} WHERE id = 1`, params)
  }
  return obtenerConfig()
}

export async function obtenerHorarios() {
  const filas = await database.all(`SELECT * FROM horarios ORDER BY dia`)
  return filas.map((h) => ({
    dia: h.dia,
    abre: h.abre,
    cierra: h.cierra,
    cerrado: !!h.cerrado,
  }))
}

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/

/** Reemplaza el horario de uno o varios días. */
export async function actualizarHorarios(lista = []) {
  if (!Array.isArray(lista)) throw new ApiError(400, 'Horarios inválidos.')
  for (const h of lista) {
    const dia = Number(h.dia)
    if (Number.isNaN(dia) || dia < 0 || dia > 6) throw new ApiError(400, 'Día inválido.')
    const cerrado = h.cerrado ? 1 : 0
    if (!cerrado && (!HHMM.test(h.abre || '') || !HHMM.test(h.cierra || ''))) {
      throw new ApiError(400, 'Hora inválida (usa HH:MM de 00:00 a 23:59).')
    }
    await database.run(
      `UPDATE horarios SET abre = ?, cierra = ?, cerrado = ? WHERE dia = ?`,
      [h.abre || '13:00', h.cierra || '22:00', cerrado, dia]
    )
  }
  return obtenerHorarios()
}

/**
 * Estado combinado del negocio para el storefront.
 * { abierto, aceptando, motivo, proximoCambio, activos, maxSimultaneos, lleno }
 */
export async function estadoNegocio() {
  const [config, horarios] = await Promise.all([obtenerConfig(), obtenerHorarios()])
  const apertura = computeOpenState(horarios)

  const { n: activos } = await database.get(
    `SELECT COUNT(*) AS n FROM pedidos
     WHERE estado IN ('recibido','confirmado','en_preparacion')`
  )
  const lleno = activos >= config.maxSimultaneos

  // Se pueden hacer pedidos solo si: abierto + recepción activa + hay capacidad.
  let motivo = 'ok'
  if (!apertura.abierto) motivo = 'cerrado'
  else if (!config.aceptandoPedidos) motivo = 'pausado'
  else if (lleno) motivo = 'capacidad'

  return {
    abierto: apertura.abierto,
    aceptando: apertura.abierto && config.aceptandoPedidos && !lleno,
    motivo,
    proximoCambio: apertura.proximoCambio,
    activos,
    maxSimultaneos: config.maxSimultaneos,
    minutosExtraPorPedido: config.minutosExtraPorPedido,
    umbralPagoAnticipado: config.umbralPagoAnticipado,
    lleno,
    horarios,
  }
}
