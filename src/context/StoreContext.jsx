// ============================================================================
//  StoreContext — carga el menú y el estado del negocio desde la API y los
//  mantiene actualizados EN VIVO por SSE (canal 'estado' + evento 'menu').
//  Si el backend no responde, cae a los datos locales en modo "solo lectura".
// ============================================================================

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { api } from '../lib/api'
import { MENU } from '../data/menu'

const StoreContext = createContext(null)

// Estado por defecto cuando aún no carga o el backend está caído.
const ESTADO_INICIAL = {
  abierto: true,
  aceptando: true,
  motivo: 'ok',
  proximoCambio: null,
  activos: 0,
  maxSimultaneos: 8,
  minutosExtraPorPedido: 10,
  umbralPagoAnticipado: 400,
  lleno: false,
  horarios: [],
}

// Adapta los datos locales al shape del backend (fallback sin conexión).
const MENU_LOCAL = MENU.map((p) => ({ ...p, agotado: false, oculto: false }))

export function StoreProvider({ children }) {
  const [menu, setMenu] = useState(MENU_LOCAL)
  const [estado, setEstado] = useState(ESTADO_INICIAL)
  const [online, setOnline] = useState(true)
  const [loading, setLoading] = useState(true)

  const reloadMenu = useCallback(async () => {
    try {
      const { productos } = await api.menu()
      if (Array.isArray(productos) && productos.length) {
        setMenu(productos)
        setOnline(true)
      }
    } catch {
      setMenu(MENU_LOCAL)
      setOnline(false)
    }
  }, [])

  const reloadEstado = useCallback(async () => {
    try {
      const e = await api.estado()
      setEstado(e)
      setOnline(true)
    } catch {
      setOnline(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([reloadMenu(), reloadEstado()]).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [reloadMenu, reloadEstado])

  // Suscripción SSE al estado del negocio (+ evento 'menu' al cambiar productos).
  useEffect(() => {
    let es
    try {
      es = new EventSource(api.estadoStreamUrl())
      es.addEventListener('estado', (ev) => {
        try {
          setEstado(JSON.parse(ev.data))
          setOnline(true)
        } catch {
          /* noop */
        }
      })
      es.addEventListener('menu', () => reloadMenu())
      es.onerror = () => {
        /* EventSource reintenta solo; no marcamos offline por un corte breve */
      }
    } catch {
      /* sin SSE: seguimos con los datos ya cargados */
    }
    return () => es?.close()
  }, [reloadMenu])

  const value = {
    menu,
    estado,
    online,
    loading,
    reloadMenu,
    reloadEstado,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>')
  return ctx
}
