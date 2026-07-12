// ============================================================================
//  Cliente de la API administrativa. El token de sesión se guarda en
//  localStorage y viaja en el header Authorization: Bearer.
// ============================================================================

const TOKEN_KEY = 'cam_admin_token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}
function setToken(t) {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* noop */
  }
}

async function req(path, opts = {}) {
  const res = await fetch(`/api/admin${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
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

export const adminApi = {
  hasToken: () => !!getToken(),

  async login(password) {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.error || 'No se pudo iniciar sesión.')
    setToken(data.token)
    return data
  },

  async logout() {
    try {
      await req('/logout', { method: 'POST' })
    } catch {
      /* ignora */
    }
    setToken('')
  },

  resumen: () => req('/resumen'),
  pedidos: (historial = false) => req(`/pedidos${historial ? '?historial=1' : ''}`),
  setEstado: (id, estado) =>
    req(`/pedidos/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) }),
  setEstimado: (id, minutos) =>
    req(`/pedidos/${id}/estimado`, { method: 'PATCH', body: JSON.stringify({ minutos }) }),

  config: () => req('/config'),
  patchConfig: (body) => req('/config', { method: 'PATCH', body: JSON.stringify(body) }),
  patchHorarios: (horarios) =>
    req('/horarios', { method: 'PATCH', body: JSON.stringify({ horarios }) }),
  recepcion: (aceptando) =>
    req('/recepcion', { method: 'PATCH', body: JSON.stringify({ aceptando }) }),

  productos: () => req('/productos'),
  patchProducto: (id, body) =>
    req(`/productos/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  streamUrl: () => `/api/admin/stream?token=${encodeURIComponent(getToken())}`,
}
