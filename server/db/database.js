// ============================================================================
//  Adaptador de datos async sobre node:sqlite (síncrono por dentro).
//  Interfaz mínima y agnóstica del motor: get / all / run / exec / withTransaction.
//  Placeholders posicionales '?'. Migrar a Postgres = reescribir solo este archivo.
// ============================================================================
import { db } from './schema.js'

const cache = new Map()
function prep(sql) {
  let stmt = cache.get(sql)
  if (!stmt) {
    stmt = db.prepare(sql)
    cache.set(sql, stmt)
  }
  return stmt
}

const ejecutor = {
  async get(sql, params = []) {
    return prep(sql).get(...params)
  },
  async all(sql, params = []) {
    return prep(sql).all(...params)
  },
  async run(sql, params = []) {
    const r = prep(sql).run(...params)
    return { changes: r.changes, lastInsertRowid: r.lastInsertRowid }
  },
  async exec(sql) {
    db.exec(sql)
  },
}

// Serializa transacciones sobre la única conexión SQLite.
let cadena = Promise.resolve()
async function withTransaction(fn) {
  const corrida = cadena.then(async () => {
    db.exec('BEGIN IMMEDIATE')
    try {
      const r = await fn(ejecutor)
      db.exec('COMMIT')
      return r
    } catch (e) {
      db.exec('ROLLBACK')
      throw e
    }
  })
  cadena = corrida.then(
    () => {},
    () => {}
  )
  return corrida
}

export const database = { ...ejecutor, withTransaction }
