// ============================================================================
//  Rutas de pedidos (crear, consultar por código, stream) y de pago.
// ============================================================================
import { Router } from 'express'
import { ah } from '../lib/ApiError.js'
import { crear, obtenerPorCodigo, marcarPagado } from '../services/orderService.js'
import { procesarWebhook } from '../services/paymentService.js'
import { suscribir } from '../services/realtime.js'

const router = Router()

// Crear pedido.
router.post(
  '/pedidos',
  ah(async (req, res) => {
    const pedido = await crear(req.body)
    res.status(201).json(pedido)
  })
)

// Consultar estado por código.
router.get(
  '/pedidos/:codigo',
  ah(async (req, res) => {
    res.json(await obtenerPorCodigo(req.params.codigo.toUpperCase()))
  })
)

// Stream SSE del estado de un pedido.
router.get('/pedidos/:codigo/stream', (req, res) => {
  suscribir(`pedido:${req.params.codigo.toUpperCase()}`, res)
})

// --------------------------- Pago anticipado ------------------------------

// Webhook del proveedor (MercadoPago).
router.post(
  '/pagos/webhook',
  ah(async (req, res) => {
    const aprobado = await procesarWebhook(req.query, req.body).catch(() => null)
    if (aprobado?.codigo) {
      await marcarPagado(aprobado.codigo, aprobado.ref, aprobado.metodo)
    }
    res.sendStatus(200) // el proveedor solo necesita 200
  })
)

// Retorno del checkout del proveedor → redirige al seguimiento del pedido.
router.get('/pagos/retorno', (req, res) => {
  const codigo = String(req.query.codigo || '')
  res.redirect(`/?pedido=${encodeURIComponent(codigo)}`)
})

// Simulación de pago (modo sin llaves): marca pagado y redirige al seguimiento.
router.get(
  '/pagos/simular',
  ah(async (req, res) => {
    const codigo = String(req.query.codigo || '').toUpperCase()
    if (codigo) await marcarPagado(codigo, `sim-${Date.now()}`, 'simulado').catch(() => {})
    res.redirect(`/?pedido=${encodeURIComponent(codigo)}&pago=ok`)
  })
)

export default router
