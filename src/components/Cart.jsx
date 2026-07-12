// ============================================================================
//  Cart — panel lateral del pedido con checkout en dos pasos.
//  Paso 1 (carrito): revisar artículos.  Paso 2 (datos): Checkout → crea el
//  pedido en el backend y abre el seguimiento. Bloquea si no se aceptan pedidos.
// ============================================================================

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight, FiClock } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useStore } from '../context/StoreContext'
import { useTracker } from '../context/TrackerContext'
import { currency, lineTotal } from '../lib/whatsapp'
import { prettyTime } from '../lib/time'
import Checkout from './Checkout'

const MENSAJE_BLOQUEO = {
  cerrado: 'La cocina está cerrada en este momento.',
  pausado: 'No estamos recibiendo pedidos por ahora.',
  capacidad: 'Estamos a máxima capacidad. Intenta de nuevo en unos minutos.',
}

export default function Cart() {
  const { items, isOpen, closeCart, inc, dec, remove, clear, total, count } = useCart()
  const { estado } = useStore()
  const tracker = useTracker()
  const [step, setStep] = useState('carrito')

  // Al abrir/cerrar el carrito, vuelve al primer paso.
  useEffect(() => {
    if (!isOpen) setStep('carrito')
  }, [isOpen])

  const aceptando = estado.aceptando
  const bloqueoMsg = !aceptando ? MENSAJE_BLOQUEO[estado.motivo] || 'No disponible por ahora.' : ''

  const onDone = (codigo, pagoUrl) => {
    clear()
    closeCart()
    if (pagoUrl) {
      // Pago anticipado: llevar directo a la pasarela (o simulación).
      window.location.href = pagoUrl
    } else {
      tracker.open(codigo)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-bg/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          <motion.aside
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l-2 border-line bg-card"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Tu pedido"
          >
            {step === 'datos' ? (
              <Checkout onBack={() => setStep('carrito')} onDone={onDone} />
            ) : (
              <>
                {/* Encabezado */}
                <div className="flex items-center justify-between border-b-2 border-line px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-flame text-cream">
                      <FiShoppingBag className="text-xl" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-amber">Tu pedido</p>
                      <p className="font-display text-2xl uppercase leading-none text-cream">
                        {count} {count === 1 ? 'artículo' : 'artículos'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeCart}
                    aria-label="Cerrar carrito"
                    className="grid h-10 w-10 place-items-center rounded-full border-2 border-line text-cream transition-colors hover:border-flame hover:text-flame"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>

                {/* Lista */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {items.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <span className="grid h-16 w-16 place-items-center rounded-2xl border-2 border-line text-3xl text-muted">
                        🍗
                      </span>
                      <p className="mt-5 font-display text-2xl uppercase text-cream">
                        Tu pedido está vacío
                      </p>
                      <p className="mt-2 max-w-xs text-sm text-muted">
                        Agrega tus alitas, boneless o pizzas favoritas.
                      </p>
                      <button type="button" onClick={closeCart} className="btn-flame mt-6">
                        Ver el menú
                      </button>
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {items.map((it) => (
                        <li key={it.key} className="rounded-2xl border-2 border-line bg-card2 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-cream">{it.name}</p>
                              <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-muted">
                                {it.size ? it.size.name : 'Único'}
                                {it.flavor ? ` · ${it.flavor}` : ''}
                              </p>
                            </div>
                            <span className="whitespace-nowrap font-display text-lg text-amber">
                              {currency(lineTotal(it))}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-1 rounded-full border-2 border-line">
                              <button
                                type="button"
                                onClick={() => dec(it.key)}
                                aria-label="Quitar uno"
                                className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:text-flame"
                              >
                                <FiMinus className="text-sm" />
                              </button>
                              <span className="min-w-6 text-center text-sm font-bold text-cream">
                                {it.qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => inc(it.key)}
                                aria-label="Agregar uno"
                                className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:text-herb"
                              >
                                <FiPlus className="text-sm" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => remove(it.key)}
                              aria-label="Eliminar del pedido"
                              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted transition-colors hover:text-flame"
                            >
                              <FiTrash2 /> Quitar
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Pie: total + continuar */}
                {items.length > 0 && (
                  <div className="border-t-2 border-line px-6 py-5">
                    {!aceptando && (
                      <div className="mb-4 flex items-start gap-2 rounded-xl border-2 border-flame bg-flame/10 px-4 py-3 text-sm text-cream">
                        <FiClock className="mt-0.5 shrink-0 text-flame" />
                        <span>
                          {bloqueoMsg}
                          {estado.motivo === 'cerrado' && estado.proximoCambio && (
                            <> Abrimos a las {prettyTime(estado.proximoCambio)}.</>
                          )}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wide text-muted">Total</span>
                      <span className="font-display text-3xl text-cream">{currency(total)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep('datos')}
                      disabled={!aceptando}
                      className={`mt-4 w-full ${aceptando ? 'btn-flame' : 'btn-flame cursor-not-allowed opacity-50'}`}
                    >
                      Continuar <FiArrowRight />
                    </button>
                    <button
                      type="button"
                      onClick={clear}
                      className="mt-3 w-full text-center text-xs font-bold uppercase tracking-wide text-muted transition-colors hover:text-flame"
                    >
                      Vaciar pedido
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
