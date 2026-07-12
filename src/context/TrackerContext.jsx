// ============================================================================
//  TrackerContext — controla el panel de seguimiento del pedido.
//  Guarda el último código en localStorage para "Seguir mi pedido".
// ============================================================================

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const TrackerContext = createContext(null)
const STORAGE_KEY = 'chickenandmore_ultimo_pedido'

export function TrackerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [pagoUrl, setPagoUrl] = useState(null)
  const [ultimo, setUltimo] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || ''
    } catch {
      return ''
    }
  })

  // Si la URL trae ?pedido=CODIGO (regreso de pago), abre el seguimiento.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const p = params.get('pedido')
    if (p) {
      setCodigo(p.toUpperCase())
      setIsOpen(true)
    }
  }, [])

  const value = useMemo(
    () => ({
      isOpen,
      codigo,
      pagoUrl,
      ultimo,
      open: (cod, url = null) => {
        const c = String(cod || '').toUpperCase()
        setCodigo(c)
        setPagoUrl(url)
        setIsOpen(true)
        if (c) {
          setUltimo(c)
          try {
            localStorage.setItem(STORAGE_KEY, c)
          } catch {
            /* noop */
          }
        }
      },
      close: () => setIsOpen(false),
      setCodigo: (c) => setCodigo(String(c || '').toUpperCase()),
    }),
    [isOpen, codigo, pagoUrl, ultimo]
  )

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>
}

export function useTracker() {
  const ctx = useContext(TrackerContext)
  if (!ctx) throw new Error('useTracker debe usarse dentro de <TrackerProvider>')
  return ctx
}
