// ============================================================================
//  StatusBanner — aviso global cuando NO se pueden hacer pedidos:
//  cocina cerrada, recepción pausada o a máxima capacidad.
//  El menú sigue navegable; solo se comunica el bloqueo.
// ============================================================================

import { AnimatePresence, motion } from 'framer-motion'
import { FiClock, FiPauseCircle, FiAlertTriangle } from 'react-icons/fi'
import { useStore } from '../context/StoreContext'
import { prettyTime } from '../lib/time'

const INFO = {
  cerrado: {
    icon: FiClock,
    titulo: 'Cocina cerrada',
    texto: 'Ahora mismo no estamos abiertos.',
  },
  pausado: {
    icon: FiPauseCircle,
    titulo: 'Pedidos en pausa',
    texto: 'Dejamos de recibir pedidos por el momento. Vuelve en un rato.',
  },
  capacidad: {
    icon: FiAlertTriangle,
    titulo: 'A máxima capacidad',
    texto: 'La cocina está saturada. Los pedidos se reactivan en unos minutos.',
  },
}

export default function StatusBanner() {
  const { estado } = useStore()
  const mostrar = !estado.aceptando
  const info = INFO[estado.motivo]

  return (
    <AnimatePresence>
      {mostrar && info && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="sticky top-16 z-20 overflow-hidden border-b-2 border-flame bg-flame/15 backdrop-blur-md lg:top-0"
        >
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3 sm:px-8">
            <info.icon className="shrink-0 text-xl text-flame" />
            <p className="text-sm text-cream">
              <b className="uppercase tracking-wide">{info.titulo}.</b> {info.texto}
              {estado.motivo === 'cerrado' && estado.proximoCambio && (
                <> Abrimos a las {prettyTime(estado.proximoCambio)}.</>
              )}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
