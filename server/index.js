// ============================================================================
//  Backend Chicken and More — API de pedidos para recoger.
//  Express + node:sqlite (síncrono) + SSE para tiempo real.
// ============================================================================
import './env.js' // carga .env ANTES que cualquier otro módulo (orden importa)
import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

import './db/schema.js' // inicializa la BD y la semilla al importar
import { closeDatabase } from './db/schema.js'
import { limpiarSesionesExpiradas } from './services/adminAuthService.js'
import { proveedorPago } from './services/paymentService.js'
import { ApiError } from './lib/ApiError.js'

import menuRoutes from './routes/menu.routes.js'
import ordersRoutes from './routes/orders.routes.js'
import adminRoutes from './routes/admin.routes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.set('trust proxy', 1)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false }))

const PORT = process.env.PORT || 3021

// Salud.
app.get('/api/health', (req, res) =>
  res.json({ ok: true, servicio: 'chicken-and-more-pedidos', pago: proveedorPago() })
)

// Rutas de dominio.
app.use('/api', menuRoutes) // /menu, /estado, /estado/stream
app.use('/api', ordersRoutes) // /pedidos, /pagos/*
app.use('/api/admin', adminRoutes)

// Producción: el mismo Express sirve el build del frontend (mismo origen).
const distDir = path.resolve(__dirname, '..', 'dist')
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  app.use(express.static(distDir))
  app.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(path.join(distDir, 'index.html')))
  console.log('[Chicken and More] Sirviendo build del frontend desde dist/.')
}

// Manejador de errores (después de las rutas).
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err)
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message, code: err.code })
  }
  console.error('[Chicken and More] Error no controlado:', err)
  res.status(500).json({ error: 'Error interno del servidor.' })
})

// Barrido de sesiones expiradas cada 5 min.
const barrido = setInterval(() => {
  limpiarSesionesExpiradas().catch((e) => console.warn('[Barrido sesiones]', e.message))
}, 5 * 60 * 1000)

// Escucha en 0.0.0.0 para que el contenedor (Railway/Docker) sea alcanzable.
const server = app.listen(PORT, '0.0.0.0', () => {
  const { proveedor, simulado } = proveedorPago()
  console.log(`[Chicken and More] API en http://localhost:${PORT}`)
  console.log(`[Chicken and More] Pago: ${proveedor}${simulado ? ' (modo simulado)' : ''}`)
})

function apagar() {
  clearInterval(barrido)
  server.close(() => {
    closeDatabase()
    process.exit(0)
  })
}
process.on('SIGINT', apagar)
process.on('SIGTERM', apagar)
