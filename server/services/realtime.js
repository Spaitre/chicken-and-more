// ============================================================================
//  Hub de tiempo real por SSE (Server-Sent Events).
//  Canales:
//   · 'admin'          → cualquier cambio de pedidos/config (panel admin).
//   · 'estado'         → apertura/cierre, recepción, capacidad (storefront).
//   · 'pedido:<CODIGO>'→ cambios de estado de UN pedido (seguimiento cliente).
//  SSE (servidor→cliente) es suficiente: las acciones del cliente van por REST.
// ============================================================================

// Map<canal, Set<res>>
const canales = new Map()

/** Suscribe una respuesta HTTP (SSE) a un canal. Devuelve la función de cierre. */
export function suscribir(canal, res) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders?.()
  res.write(`event: ping\ndata: "conectado"\n\n`)

  if (!canales.has(canal)) canales.set(canal, new Set())
  canales.get(canal).add(res)

  const latido = setInterval(() => {
    try {
      res.write(`event: ping\ndata: "keepalive"\n\n`)
    } catch {
      /* noop */
    }
  }, 25000)

  const cerrar = () => {
    clearInterval(latido)
    canales.get(canal)?.delete(res)
    if (canales.get(canal)?.size === 0) canales.delete(canal)
  }
  res.on('close', cerrar)
  return cerrar
}

/** Emite un evento con datos a un canal. */
export function emitir(canal, evento = 'update', data = {}) {
  const set = canales.get(canal)
  if (!set) return
  const payload = JSON.stringify({ ...data, ts: Date.now() })
  for (const res of set) {
    try {
      res.write(`event: ${evento}\ndata: ${payload}\n\n`)
    } catch {
      /* conexión rota; se limpiará en 'close' */
    }
  }
}

/** Notifica al panel admin (lista de pedidos / config). */
export function emitirAdmin(data = {}) {
  emitir('admin', 'update', data)
}

/** Notifica el estado del negocio al storefront (abierto/cerrado/capacidad). */
export function emitirEstado(data = {}) {
  emitir('estado', 'estado', data)
}

/** Notifica el cambio de un pedido a quien lo esté siguiendo por su código. */
export function emitirPedido(codigo, data = {}) {
  emitir(`pedido:${codigo}`, 'pedido', data)
}
