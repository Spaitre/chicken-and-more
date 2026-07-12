// ============================================================================
//  MenuItem — tarjeta de producto con selector de cantidad y opciones.
//  · Cantidad seleccionable antes de agregar.
//  · Estado "Agotado" (no pedible) y bloqueo cuando no se aceptan pedidos.
// ============================================================================

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiPlus, FiMinus, FiCheck, FiChevronDown } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { currency } from '../lib/whatsapp'

function QtyStepper({ qty, setQty, small = false }) {
  return (
    <div className={`inline-flex items-center rounded-full border-2 border-line ${small ? '' : 'bg-card2'}`}>
      <button
        type="button"
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        aria-label="Menos"
        className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:text-flame"
      >
        <FiMinus className="text-sm" />
      </button>
      <span className="min-w-7 text-center text-sm font-bold text-cream">{qty}</span>
      <button
        type="button"
        onClick={() => setQty((q) => Math.min(50, q + 1))}
        aria-label="Más"
        className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:text-herb"
      >
        <FiPlus className="text-sm" />
      </button>
    </div>
  )
}

export default function MenuItem({ item, puedePedir = true }) {
  const { addItem } = useCart()
  const hasOptions = item.sizes.length > 0 || item.flavors.length > 0
  const agotado = !!item.agotado
  const bloqueado = agotado || !puedePedir

  const [expanded, setExpanded] = useState(false)
  const [added, setAdded] = useState(false)
  const [qty, setQty] = useState(1)
  const [size, setSize] = useState(item.sizes[0] || null)
  const [flavor, setFlavor] = useState(item.flavors[0] || null)

  const minPrice = item.sizes.length
    ? Math.min(...item.sizes.map((s) => s.price))
    : item.price

  const flashAdded = () => {
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  const handleMainButton = () => {
    if (bloqueado) return
    if (hasOptions) {
      setExpanded((e) => !e)
    } else {
      addItem(item, null, null, qty)
      setQty(1)
      flashAdded()
    }
  }

  const confirmAdd = () => {
    addItem(item, size, flavor, qty)
    setExpanded(false)
    setQty(1)
    flashAdded()
  }

  return (
    <motion.article
      layout
      className={`card flex flex-col p-5 transition-all duration-200 ${
        agotado
          ? 'opacity-60'
          : 'hover:-translate-y-1 hover:border-amber hover:shadow-hard'
      }`}
    >
      {/* Encabezado: nombre + etiquetas */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-sans text-lg font-bold leading-tight text-cream">
          {item.name}
        </h3>
        {agotado ? (
          <span className="shrink-0 rounded-full border-2 border-flame px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wide text-flame">
            Agotado
          </span>
        ) : (
          (item.featured || item.tag) && (
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wide ${
                item.featured ? 'bg-flame text-cream' : 'border-2 border-line text-amber'
              }`}
            >
              {item.tag || '★ Top'}
            </span>
          )
        )}
      </div>

      {item.description && (
        <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
      )}

      {/* Precio + cantidad + botón */}
      <div className="mt-4 flex items-center justify-between gap-3 pt-1">
        <div className="leading-none">
          {item.sizes.length > 0 && (
            <span className="mr-1 text-[0.65rem] font-bold uppercase tracking-wide text-muted">
              desde
            </span>
          )}
          <span className="font-display text-2xl text-amber">{currency(minPrice)}</span>
        </div>

        <div className="flex items-center gap-2">
          {!hasOptions && !bloqueado && <QtyStepper qty={qty} setQty={setQty} small />}
          <button
            type="button"
            onClick={handleMainButton}
            disabled={bloqueado}
            aria-expanded={hasOptions ? expanded : undefined}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all duration-200 ${
              bloqueado
                ? 'cursor-not-allowed border-2 border-line text-muted'
                : added
                  ? 'bg-herb text-bg'
                  : 'bg-flame text-cream shadow-hard hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
            }`}
          >
            {agotado ? (
              'Agotado'
            ) : bloqueado ? (
              'No disponible'
            ) : added ? (
              <>
                <FiCheck /> Agregado
              </>
            ) : hasOptions ? (
              <>
                Elegir <FiChevronDown className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </>
            ) : (
              <>
                <FiPlus /> Agregar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Opciones (tamaño / sabor / cantidad) */}
      <AnimatePresence initial={false}>
        {expanded && hasOptions && !bloqueado && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-5 flex flex-col gap-4 border-t-2 border-line pt-4">
              {item.sizes.length > 0 && (
                <div>
                  <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wide text-muted">
                    Tamaño
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.sizes.map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition-colors duration-200 ${
                          size?.name === s.name
                            ? 'border-amber bg-amber text-bg'
                            : 'border-line text-muted hover:border-amber hover:text-cream'
                        }`}
                      >
                        {s.name} · {currency(s.price)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {item.flavors.length > 0 && (
                <div>
                  <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wide text-muted">
                    {item.flavors.length > 3 ? 'Salsa / sabor' : 'Opción'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.flavors.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFlavor(f)}
                        className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition-colors duration-200 ${
                          flavor === f
                            ? 'border-flame bg-flame text-cream'
                            : 'border-line text-muted hover:border-flame hover:text-cream'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted">
                  Cantidad
                </p>
                <QtyStepper qty={qty} setQty={setQty} />
              </div>

              <button type="button" onClick={confirmAdd} className="btn-flame w-full">
                <FiPlus /> Agregar {qty > 1 ? `${qty} ` : ''}al pedido
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}
