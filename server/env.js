// Carga variables desde .env si existe (Node ≥ 20.12 / 22), sin dependencias.
// Debe importarse ANTES que cualquier módulo que lea process.env al cargar.
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

try {
  const envPath = path.resolve(process.cwd(), '.env')
  if (typeof process.loadEnvFile === 'function' && fs.existsSync(envPath)) {
    process.loadEnvFile(envPath)
  }
} catch {
  /* .env es opcional */
}
