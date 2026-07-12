// ============================================================================
//  Rutas públicas: menú y estado del negocio (con stream SSE).
// ============================================================================
import { Router } from 'express'
import { ah } from '../lib/ApiError.js'
import { listarPublico } from '../services/menuService.js'
import { estadoNegocio } from '../services/configService.js'
import { suscribir } from '../services/realtime.js'

const router = Router()

// Menú público (sin ocultos; agotados marcados).
router.get(
  '/menu',
  ah(async (req, res) => {
    res.json({ productos: await listarPublico() })
  })
)

// Estado del negocio (abierto/aceptando/capacidad/estimado base).
router.get(
  '/estado',
  ah(async (req, res) => {
    res.json(await estadoNegocio())
  })
)

// Stream SSE del estado del negocio.
router.get('/estado/stream', (req, res) => {
  suscribir('estado', res)
})

export default router
