// ============================================================================
//  Autenticación del panel administrativo.
//  Acceso con UNA contraseña compartida (env ADMIN_PASSWORD). Al iniciar sesión
//  se emite un token con caducidad guardado en la tabla sesiones_admin
//  (sobrevive reinicios del servidor).
// ============================================================================
import { randomUUID, timingSafeEqual } from 'node:crypto'
import { database } from '../db/database.js'
import { ApiError } from '../lib/ApiError.js'

const HORAS_SESION = 12
const PASSWORD = process.env.ADMIN_PASSWORD || 'chicken2024'

/** Comparación en tiempo constante (evita fugas por temporización). */
function iguales(a, b) {
  const ba = Buffer.from(String(a))
  const bb = Buffer.from(String(b))
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

/** Verifica la contraseña y crea una sesión. Devuelve { token, expiraEnHoras }. */
export async function login(password) {
  if (!iguales(password || '', PASSWORD)) {
    throw new ApiError(401, 'Contraseña incorrecta.', 'password_incorrecta')
  }
  const token = randomUUID()
  await database.run(
    `INSERT INTO sesiones_admin (token, expira_en) VALUES (?, datetime('now', ?))`,
    [token, `+${HORAS_SESION} hours`]
  )
  return { token, expiraEnHoras: HORAS_SESION }
}

export async function logout(token) {
  if (token) await database.run(`DELETE FROM sesiones_admin WHERE token = ?`, [token])
  return { ok: true }
}

/** Middleware: exige un token de admin válido en Authorization: Bearer <token>. */
export async function requireAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) throw new ApiError(401, 'Sesión requerida.', 'no_auth')
    const fila = await database.get(
      `SELECT token FROM sesiones_admin WHERE token = ? AND expira_en > datetime('now')`,
      [token]
    )
    if (!fila) throw new ApiError(401, 'Sesión expirada. Inicia sesión de nuevo.', 'sesion_expirada')
    req.adminToken = token
    next()
  } catch (e) {
    next(e)
  }
}

/** ¿El token corresponde a una sesión vigente? (para SSE, que va por query). */
export async function sesionValida(token) {
  if (!token) return false
  const fila = await database.get(
    `SELECT token FROM sesiones_admin WHERE token = ? AND expira_en > datetime('now')`,
    [token]
  )
  return !!fila
}

/** Limpia sesiones vencidas (se llama desde el barrido periódico). */
export async function limpiarSesionesExpiradas() {
  await database.run(`DELETE FROM sesiones_admin WHERE expira_en <= datetime('now')`)
}
