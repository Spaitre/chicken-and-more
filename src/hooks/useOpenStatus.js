// ============================================================================
//  useOpenStatus — indicador "Abierto / Cerrado" en vivo.
//  Recalcula en la zona horaria del negocio y se actualiza solo cada 30 s.
// ============================================================================

import { useEffect, useState } from 'react'
import { computeOpenState } from '../lib/time'
import { BUSINESS } from '../lib/config'

export function useOpenStatus(hours) {
  const [state, setState] = useState(() =>
    computeOpenState(hours, BUSINESS.timezone)
  )

  useEffect(() => {
    const update = () => setState(computeOpenState(hours, BUSINESS.timezone))
    update()
    const id = setInterval(update, 30 * 1000) // refresco automático
    return () => clearInterval(id)
  }, [hours])

  return state
}
