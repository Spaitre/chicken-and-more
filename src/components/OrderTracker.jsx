// ============================================================================
//  OrderTracker — seguimiento del pedido por código, en vivo (SSE).
//  Se abre tras confirmar un pedido o desde "Seguir pedido" en la navegación.
// ============================================================================

import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FiX,
  FiCheck,
  FiClock,
  FiSearch,
  FiCopy,
  FiXCircle,
} from 'react-icons/fi'
import { useTracker } from '../context/TrackerContext'
import { api } from '../lib/api'
import { currency } from '../lib/whatsapp'

const FLUJO = [
  { key: 'recibido', label: 'Recibido', desc: 'Recibimos tu pedido' },
  { key: 'confirmado', label: 'Confirmado', desc: 'La cocina lo aceptó' },
  { key: 'en_preparacion', label: 'En preparación', desc: 'Lo estamos cocinando' },
  { key: 'listo', label: 'Listo para recoger', desc: 'Pásalo a recoger' },
  { key: 'entregado', label: 'Entregado', desc: '¡Buen provecho!' },
]

export default function OrderTracker() {
  const { isOpen, codigo, close, setCodigo } = useTracker()
  const [pedido, setPedido] = useState(null)
  const [error, setError] = useState(null)
  const [buscar, setBuscar] = useState('')
  const [cargando, setCargando] = useState(false)

  const cargar = useCallback(async (cod) => {
    if (!cod) return
    setCargando(true)
    setError(null)
    try {
      setPedido(await api.pedido(cod))
    } catch (e) {
      setError(e.message || 'No encontramos ese pedido.')
      setPedido(null)
    } finally {
      setCargando(false)
    }
  }, [])

  // Carga inicial + recarga cuando cambia el código.
  useEffect(() => {
    if (isOpen && codigo) cargar(codigo)
    if (!isOpen) {
      setPedido(null)
      setError(null)
      setBuscar('')
    }
  }, [isOpen, codigo, cargar])

  // Suscripción SSE al pedido actual.
  useEffect(() => {
    if (!isOpen || !codigo) return
    let es
    try {
      es = new EventSource(api.pedidoStreamUrl(codigo))
      es.addEventListener('pedido', () => cargar(codigo))
      es.onerror = () => {}
    } catch {
      /* noop */
    }
    return () => es?.close()
  }, [isOpen, codigo, cargar])

  if (!isOpen) return null

  const cancelado = pedido?.estado === 'cancelado'
  const idxActual = pedido ? FLUJO.findIndex((s) => s.key === pedido.estado) : -1

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-end justify-center bg-bg/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      >
        <motion.div
          className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border-2 border-line bg-card sm:rounded-3xl"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-label="Seguimiento del pedido"
        >
          {/* Encabezado */}
          <div className="flex items-center justify-between border-b-2 border-line px-6 py-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-amber">Seguimiento</p>
              <p className="font-display text-2xl uppercase leading-none text-cream">Tu pedido</p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              className="grid h-10 w-10 place-items-center rounded-full border-2 border-line text-cream transition-colors hover:border-flame hover:text-flame"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* Buscador cuando no hay código (entrada manual). */}
            {!codigo && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setCodigo(buscar.trim())
                }}
                className="mb-2"
              >
                <p className="mb-2 text-sm text-muted">
                  Escribe tu código de pedido (por ejemplo, CM-AB12).
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value.toUpperCase())}
                    placeholder="CM-XXXX"
                    className="w-full rounded-xl border-2 border-line bg-bg px-3 py-2.5 font-bold tracking-wide text-cream placeholder:text-muted/60 focus:border-amber focus:outline-none"
                  />
                  <button type="submit" className="btn-amber shrink-0 px-4">
                    <FiSearch />
                  </button>
                </div>
              </form>
            )}

            {cargando && <p className="py-8 text-center text-muted">Buscando…</p>}

            {error && (
              <p className="rounded-xl border-2 border-flame bg-flame/10 px-4 py-3 text-center text-sm font-bold text-cream">
                {error}
              </p>
            )}

            {pedido && (
              <>
                {/* Código + resumen */}
                <div className="flex items-center justify-between rounded-2xl border-2 border-line bg-card2 px-4 py-3">
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted">Código</p>
                    <p className="font-display text-2xl uppercase text-amber">{pedido.codigo}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(pedido.codigo)}
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-line px-3 py-1.5 text-xs font-bold text-muted transition-colors hover:border-amber hover:text-amber"
                  >
                    <FiCopy /> Copiar
                  </button>
                </div>

                {/* Tiempo estimado / pago */}
                {!cancelado && (
                  <div className="mt-3 flex items-center gap-3 rounded-2xl border-2 border-amber bg-amber/10 px-4 py-3">
                    <FiClock className="text-xl text-amber" />
                    <p className="text-sm text-cream">
                      Tiempo estimado: <b>~{pedido.tiempoEstimado} min</b>
                    </p>
                  </div>
                )}

                {pedido.requierePago && (
                  <div
                    className={`mt-3 rounded-2xl border-2 px-4 py-3 text-sm ${
                      pedido.pagoEstado === 'pagado'
                        ? 'border-herb bg-herb/10 text-cream'
                        : 'border-flame bg-flame/10 text-cream'
                    }`}
                  >
                    {pedido.pagoEstado === 'pagado' ? (
                      <span className="font-bold">✅ Pago confirmado</span>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <span>Pago anticipado pendiente</span>
                        <a
                          href={`/api/pagos/simular?codigo=${encodeURIComponent(pedido.codigo)}`}
                          className="shrink-0 rounded-full bg-flame px-3 py-1.5 text-xs font-bold uppercase text-cream"
                        >
                          Completar pago
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Línea de tiempo de estados */}
                {cancelado ? (
                  <div className="mt-5 flex items-center gap-3 rounded-2xl border-2 border-flame bg-flame/10 px-4 py-4">
                    <FiXCircle className="text-2xl text-flame" />
                    <p className="font-bold text-cream">Pedido cancelado</p>
                  </div>
                ) : (
                  <ol className="mt-6 space-y-1">
                    {FLUJO.map((s, i) => {
                      const hecho = i <= idxActual
                      const actual = i === idxActual
                      return (
                        <li key={s.key} className="flex gap-4">
                          {/* Riel + punto */}
                          <div className="flex flex-col items-center">
                            <span
                              className={`grid h-8 w-8 place-items-center rounded-full border-2 ${
                                hecho
                                  ? 'border-herb bg-herb text-bg'
                                  : 'border-line bg-card text-muted'
                              } ${actual ? 'ring-4 ring-herb/25' : ''}`}
                            >
                              {hecho ? <FiCheck className="text-sm" /> : <span className="text-xs">{i + 1}</span>}
                            </span>
                            {i < FLUJO.length - 1 && (
                              <span className={`my-0.5 h-6 w-0.5 ${i < idxActual ? 'bg-herb' : 'bg-line'}`} />
                            )}
                          </div>
                          {/* Texto */}
                          <div className={`pb-2 ${actual ? '' : hecho ? 'opacity-90' : 'opacity-55'}`}>
                            <p className={`font-bold ${actual ? 'text-amber' : 'text-cream'}`}>
                              {s.label}
                            </p>
                            <p className="text-xs text-muted">{s.desc}</p>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                )}

                {/* Artículos */}
                <div className="mt-5 border-t-2 border-line pt-4">
                  <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wide text-muted">
                    Artículos ({pedido.items.length})
                  </p>
                  <ul className="space-y-1.5 text-sm">
                    {pedido.items.map((it, i) => (
                      <li key={i} className="flex justify-between gap-3 text-cream">
                        <span>
                          {it.cantidad}× {it.nombre}
                          {it.tamano ? ` (${it.tamano})` : ''}
                          {it.sabor ? ` · ${it.sabor}` : ''}
                        </span>
                        <span className="text-muted">{currency(it.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center justify-between border-t-2 border-line pt-3">
                    <span className="text-xs font-bold uppercase tracking-wide text-muted">Total</span>
                    <span className="font-display text-2xl text-cream">{currency(pedido.total)}</span>
                  </div>
                </div>

                <p className="mt-4 text-center text-xs text-muted">
                  🏪 Para recoger en el local · Se actualiza automáticamente
                </p>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
