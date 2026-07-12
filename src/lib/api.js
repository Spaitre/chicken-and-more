// ============================================================================
//  Cliente de la API pública (mismo origen; Vite hace proxy /api → :3021).
// ============================================================================

async function req(path, opts = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const err = new Error(data?.error || `Error ${res.status}`)
    err.code = data?.code
    err.status = res.status
    throw err
  }
  return data
}

export const api = {
  // Menú público (productos con stock y tiempos de preparación).
  menu: () => req('/menu'),

  // Estado del negocio (abierto/aceptando/capacidad/umbral pago).
  estado: () => req('/estado'),

  // Crear pedido. body = { nombre, telefono, comentarios, items:[{id,size,flavor,qty}] }
  crearPedido: (body) => req('/pedidos', { method: 'POST', body: JSON.stringify(body) }),

  // Consultar un pedido por su código.
  pedido: (codigo) => req(`/pedidos/${encodeURIComponent(codigo)}`),

  // URLs de streams SSE.
  estadoStreamUrl: () => `/api/estado/stream`,
  pedidoStreamUrl: (codigo) => `/api/pedidos/${encodeURIComponent(codigo)}/stream`,
}
