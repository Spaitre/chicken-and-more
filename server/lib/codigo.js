// Genera un código de pedido corto y legible: CM-XXXX (sin caracteres ambiguos).
import { database } from '../db/database.js'

// Alfabeto sin 0/O/1/I/L para evitar confusiones al dictarlo por teléfono.
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function aleatorio(n = 4) {
  let s = ''
  for (let i = 0; i < n; i++) {
    s += ALFABETO[Math.floor(Math.random() * ALFABETO.length)]
  }
  return s
}

/** Devuelve un código único (verificado contra la BD). */
export async function generarCodigo(tx = database) {
  for (let intento = 0; intento < 12; intento++) {
    const codigo = `CM-${aleatorio(4)}`
    const existe = await tx.get(`SELECT 1 FROM pedidos WHERE codigo = ?`, [codigo])
    if (!existe) return codigo
  }
  // Improbable: agrega un dígito más para garantizar unicidad.
  return `CM-${aleatorio(6)}`
}
