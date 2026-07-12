// Indicador "Abierto / Cerrado" en vivo. Punto pulsante + texto.
import { prettyTime } from '../lib/time'

export default function OpenStatus({ state, className = '' }) {
  const open = state.open
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${className}`}
      aria-live="polite"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
            open ? 'animate-ping bg-herb' : 'bg-flame/70'
          }`}
        />
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
            open ? 'bg-herb' : 'bg-flame'
          }`}
        />
      </span>
      <span className={open ? 'text-herb' : 'text-muted'}>
        {open ? 'Abierto ahora' : 'Cerrado'}
        {state.nextChange && (
          <span className="text-muted">
            {open ? ' · cierra ' : ' · abre '}
            {prettyTime(state.nextChange)}
          </span>
        )}
      </span>
    </span>
  )
}
