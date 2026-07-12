// ============================================================================
//  Rutas del panel administrativo. Todas exigen sesión salvo /login.
// ============================================================================
import { Router } from 'express'
import { ah } from '../lib/ApiError.js'
import { login, logout, requireAdmin, sesionValida } from '../services/adminAuthService.js'
import {
  listar,
  detalleAdmin,
  transicionar,
  overrideEstimado,
} from '../services/orderService.js'
import {
  obtenerConfig,
  actualizarConfig,
  obtenerHorarios,
  actualizarHorarios,
  estadoNegocio,
} from '../services/configService.js'
import { listarAdmin, actualizarProducto } from '../services/menuService.js'
import { suscribir } from '../services/realtime.js'
import { proveedorPago } from '../services/paymentService.js'

const router = Router()

// ---- Autenticación ----
router.post(
  '/login',
  ah(async (req, res) => {
    res.json(await login(req.body?.password))
  })
)

router.post(
  '/logout',
  requireAdmin,
  ah(async (req, res) => {
    res.json(await logout(req.adminToken))
  })
)

// Stream SSE del panel — EventSource no envía headers, así que el token va por
// query (?token=). Se coloca ANTES del guard global de header.
router.get(
  '/stream',
  ah(async (req, res) => {
    if (!(await sesionValida(req.query.token))) return res.sendStatus(401)
    suscribir('admin', res)
  })
)

// A partir de aquí, todo requiere sesión.
router.use(requireAdmin)

// ---- Resumen / estado ----
router.get(
  '/resumen',
  ah(async (req, res) => {
    res.json({
      estado: await estadoNegocio(),
      config: await obtenerConfig(),
      pago: proveedorPago(),
    })
  })
)

// ---- Pedidos ----
router.get(
  '/pedidos',
  ah(async (req, res) => {
    const historial = req.query.historial === '1' || req.query.historial === 'true'
    res.json({ pedidos: await listar({ historial }) })
  })
)

router.get(
  '/pedidos/:id',
  ah(async (req, res) => {
    res.json(await detalleAdmin(Number(req.params.id)))
  })
)

router.patch(
  '/pedidos/:id/estado',
  ah(async (req, res) => {
    res.json(await transicionar(Number(req.params.id), req.body?.estado))
  })
)

router.patch(
  '/pedidos/:id/estimado',
  ah(async (req, res) => {
    res.json(await overrideEstimado(Number(req.params.id), req.body?.minutos))
  })
)

// ---- Configuración y horarios ----
router.get(
  '/config',
  ah(async (req, res) => {
    res.json({ config: await obtenerConfig(), horarios: await obtenerHorarios() })
  })
)

router.patch(
  '/config',
  ah(async (req, res) => {
    res.json(await actualizarConfig(req.body || {}))
  })
)

router.patch(
  '/horarios',
  ah(async (req, res) => {
    res.json(await actualizarHorarios(req.body?.horarios || []))
  })
)

// Atajo: pausar/reanudar recepción de pedidos.
router.patch(
  '/recepcion',
  ah(async (req, res) => {
    res.json(await actualizarConfig({ aceptandoPedidos: !!req.body?.aceptando }))
  })
)

// ---- Productos / inventario ----
router.get(
  '/productos',
  ah(async (req, res) => {
    res.json({ productos: await listarAdmin() })
  })
)

router.patch(
  '/productos/:id',
  ah(async (req, res) => {
    res.json(await actualizarProducto(req.params.id, req.body || {}))
  })
)

export default router
