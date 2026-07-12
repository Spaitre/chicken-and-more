// ============================================================================
//  Conexión SQLite (node:sqlite) + esquema + datos semilla — Chicken and More.
//  Único lugar que conoce el DDL. La conexión cruda `db` se expone solo para el
//  adaptador async (./database.js).
//
//  La semilla toma el menú y el horario de los datos locales del frontend
//  (src/data/menu.js, src/lib/config.js) UNA sola vez; a partir de ahí la
//  fuente de verdad es esta base de datos (editable desde /admin).
// ============================================================================
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

import { MENU } from '../../src/data/menu.js'
import { HOURS_FALLBACK } from '../../src/lib/config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(__dirname, '..', '..', 'data')
const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(DATA_DIR, 'chicken.db')

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

export const db = new DatabaseSync(DB_PATH)

db.exec('PRAGMA foreign_keys = ON;')
db.exec('PRAGMA journal_mode = WAL;')
db.exec('PRAGMA busy_timeout = 5000;')
db.exec('PRAGMA synchronous = NORMAL;')

// ---------------------------------------------------------------------------
//  Esquema
// ---------------------------------------------------------------------------
db.exec(`
  -- Configuración operativa (fila única id = 1).
  CREATE TABLE IF NOT EXISTS config (
    id                        INTEGER PRIMARY KEY CHECK (id = 1),
    aceptando_pedidos         INTEGER NOT NULL DEFAULT 1,
    max_simultaneos           INTEGER NOT NULL DEFAULT 8,
    minutos_extra_por_pedido  INTEGER NOT NULL DEFAULT 10,
    umbral_pago_anticipado    REAL    NOT NULL DEFAULT 400,
    moneda                    TEXT    NOT NULL DEFAULT 'MXN'
  );

  -- Horario por día (0 = domingo … 6 = sábado). Soporta cierre tras medianoche.
  CREATE TABLE IF NOT EXISTS horarios (
    dia     INTEGER PRIMARY KEY CHECK (dia BETWEEN 0 AND 6),
    abre    TEXT NOT NULL DEFAULT '13:00',
    cierra  TEXT NOT NULL DEFAULT '22:00',
    cerrado INTEGER NOT NULL DEFAULT 0
  );

  -- Productos del menú: fuente de verdad para pedir (stock, tiempos, precios).
  CREATE TABLE IF NOT EXISTS productos (
    id            TEXT PRIMARY KEY,
    categoria     TEXT NOT NULL DEFAULT 'Otros',
    nombre        TEXT NOT NULL,
    descripcion   TEXT NOT NULL DEFAULT '',
    precio_base   REAL NOT NULL DEFAULT 0,
    tiempo_prep   INTEGER NOT NULL DEFAULT 15,
    tamanos_json  TEXT NOT NULL DEFAULT '[]',
    sabores_json  TEXT NOT NULL DEFAULT '[]',
    etiqueta      TEXT NOT NULL DEFAULT '',
    destacado     INTEGER NOT NULL DEFAULT 0,
    agotado       INTEGER NOT NULL DEFAULT 0,
    oculto        INTEGER NOT NULL DEFAULT 0,
    orden         INTEGER NOT NULL DEFAULT 0
  );

  -- Pedidos.
  CREATE TABLE IF NOT EXISTS pedidos (
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo                   TEXT NOT NULL UNIQUE,
    nombre                   TEXT NOT NULL,
    telefono                 TEXT NOT NULL,
    comentarios              TEXT NOT NULL DEFAULT '',
    estado                   TEXT NOT NULL DEFAULT 'recibido',
    total                    REAL NOT NULL DEFAULT 0,
    tiempo_estimado_min      INTEGER NOT NULL DEFAULT 0,
    estimado_override        INTEGER,
    requiere_pago_anticipado INTEGER NOT NULL DEFAULT 0,
    pago_estado              TEXT NOT NULL DEFAULT 'no_requerido',
    pago_metodo              TEXT NOT NULL DEFAULT '',
    pago_ref                 TEXT NOT NULL DEFAULT '',
    creado_en                TEXT NOT NULL DEFAULT (datetime('now')),
    actualizado_en           TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos (estado);
  CREATE INDEX IF NOT EXISTS idx_pedidos_creado ON pedidos (creado_en);

  -- Renglones del pedido.
  CREATE TABLE IF NOT EXISTS pedido_items (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id    INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id  TEXT NOT NULL,
    nombre       TEXT NOT NULL,
    precio_unit  REAL NOT NULL,
    tamano       TEXT NOT NULL DEFAULT '',
    sabor        TEXT NOT NULL DEFAULT '',
    cantidad     INTEGER NOT NULL DEFAULT 1,
    subtotal     REAL NOT NULL DEFAULT 0,
    tiempo_prep  INTEGER NOT NULL DEFAULT 15
  );

  CREATE INDEX IF NOT EXISTS idx_items_pedido ON pedido_items (pedido_id);

  -- Sesiones del panel administrativo.
  CREATE TABLE IF NOT EXISTS sesiones_admin (
    token     TEXT PRIMARY KEY,
    creado_en TEXT NOT NULL DEFAULT (datetime('now')),
    expira_en TEXT NOT NULL
  );
`)

// ---------------------------------------------------------------------------
//  Semilla (idempotente)
// ---------------------------------------------------------------------------

// Config: una sola fila.
db.exec(`INSERT OR IGNORE INTO config (id) VALUES (1);`)

// Horario: desde HOURS_FALLBACK del frontend.
{
  const insHorario = db.prepare(
    `INSERT OR IGNORE INTO horarios (dia, abre, cierra, cerrado) VALUES (?, ?, ?, ?)`
  )
  for (const h of HOURS_FALLBACK) {
    insHorario.run(h.day, h.open, h.close, h.closed ? 1 : 0)
  }
}

// Tiempo de preparación por categoría (min) para la semilla; editable en /admin.
const PREP_POR_CATEGORIA = {
  Boneless: 18,
  Alitas: 18,
  Hamburguesas: 12,
  Pizzas: 25,
  Complementos: 8,
  Bebidas: 3,
}

// Productos: desde el menú local, solo si la tabla está vacía.
{
  const { n } = db.prepare(`SELECT COUNT(*) AS n FROM productos`).get()
  if (n === 0) {
    const insProd = db.prepare(`
      INSERT INTO productos
        (id, categoria, nombre, descripcion, precio_base, tiempo_prep,
         tamanos_json, sabores_json, etiqueta, destacado, agotado, oculto, orden)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
    `)
    MENU.forEach((p, i) => {
      const prep = p.tiempoPrep ?? PREP_POR_CATEGORIA[p.category] ?? 15
      insProd.run(
        p.id,
        p.category,
        p.name,
        p.description || '',
        Number(p.price) || (p.sizes?.[0]?.price ?? 0),
        prep,
        JSON.stringify(p.sizes || []),
        JSON.stringify(p.flavors || []),
        p.tag || '',
        p.featured ? 1 : 0,
        i
      )
    })
    console.log(`[Chicken and More] Semilla: ${MENU.length} productos cargados.`)
  }
}

export function closeDatabase() {
  try {
    db.close()
  } catch {
    /* noop */
  }
}
