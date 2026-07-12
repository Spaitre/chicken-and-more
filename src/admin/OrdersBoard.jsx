// ============================================================================
//  OrdersBoard — pedidos activos en tiempo real. Cambiar estado, editar el
//  tiempo estimado y cancelar.
// ============================================================================

import { useState } from 'react'
import { FiPhone, FiClock, FiEdit2, FiCheck } from 'react-icons/fi'
import { currency } from '../lib/whatsapp'

export const ESTADOS_UI = {
  recibido: { label: 'Recibido', clase: 'border-amber text-amber' },
  confirmado: { label: 'Confirmado', clase: 'border-amber text-amber' },
  en_preparacion: { label: 'En preparación', clase: 'border-ember text-ember' },
  listo: { label: 'Listo', clase: 'border-herb text-herb' },
  entregado: { label: 'Entregado', clase: 'border-line text-muted' },
  cancelado: { label: 'Cancelado', clase: 'border-flame text-flame' },
}

const SIGUIENTE = {
  recibido: 'confirmado',
  confirmado: 'en_preparacion',
  en_preparacion: 'listo',
  listo: 'entregado',
}

function haceCuanto(iso) {
  const t = new Date(iso.replace(' ', 'T') + 'Z').getTime()
  const min = Math.max(0, Math.round((Date.now() - t) / 60000))
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  return `hace ${h} h ${min % 60} min`
}

function OrderCard({ pedido, onEstado, onEstimado }) {
  const [editando, setEditando] = useState(false)
  const [min, setMin] = useState(pedido.tiempoEstimado)
  const ui = ESTADOS_UI[pedido.estado] || ESTADOS_UI.recibido
  const sig = SIGUIENTE[pedido.estado]

  return (
    <article className="rounded-2xl border-2 border-line bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl uppercase text-amber">{pedido.codigo}</p>
          <p className="text-sm font-bold text-cream">{pedido.nombre}</p>
          <a
            href={`tel:+52${pedido.telefono}`}
            className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted hover:text-cream"
          >
            <FiPhone /> {pedido.telefono}
          </a>
        </div>
        <div className="text-right">
          <span
            className={`inline-block rounded-full border-2 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-wide ${ui.clase}`}
          >
            {ui.label}
          </span>
          <p className="mt-1 text-[0.7rem] text-muted">{haceCuanto(pedido.creadoEn)}</p>
        </div>
      </div>

      {/* Artículos */}
      <ul className="mt-3 space-y-1 border-y-2 border-line py-3 text-sm">
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

      {pedido.comentarios && (
        <p className="mt-2 rounded-lg bg-card2 px-3 py-2 text-xs text-muted">
          📝 {pedido.comentarios}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-cream">
          <FiClock className="text-amber" />
          {editando ? (
            <span className="flex items-center gap-1">
              <input
                type="number"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                className="w-16 rounded-lg border-2 border-line bg-bg px-2 py-1 text-cream focus:border-amber focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  onEstimado(pedido.id, min)
                  setEditando(false)
                }}
                className="grid h-7 w-7 place-items-center rounded-lg bg-amber text-bg"
                aria-label="Guardar estimado"
              >
                <FiCheck />
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="inline-flex items-center gap-1 hover:text-amber"
            >
              ~{pedido.tiempoEstimado} min <FiEdit2 className="text-xs" />
            </button>
          )}
        </div>
        <div className="text-right">
          <span className="font-display text-xl text-cream">{currency(pedido.total)}</span>
          {pedido.requierePago && (
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase ${
                pedido.pagoEstado === 'pagado'
                  ? 'bg-herb/20 text-herb'
                  : 'bg-flame/20 text-flame'
              }`}
            >
              {pedido.pagoEstado === 'pagado' ? 'Pagado' : 'Pago pendiente'}
            </span>
          )}
        </div>
      </div>

      {/* Acciones de estado */}
      <div className="mt-4 flex flex-wrap gap-2">
        {sig && (
          <button
            type="button"
            onClick={() => onEstado(pedido.id, sig)}
            className="rounded-full bg-flame px-4 py-2 text-xs font-bold uppercase tracking-wide text-cream shadow-hard transition-transform hover:-translate-y-0.5"
          >
            → {ESTADOS_UI[sig].label}
          </button>
        )}
        <select
          value={pedido.estado}
          onChange={(e) => onEstado(pedido.id, e.target.value)}
          className="rounded-full border-2 border-line bg-card2 px-3 py-2 text-xs font-bold uppercase tracking-wide text-cream focus:border-amber focus:outline-none"
        >
          {Object.entries(ESTADOS_UI).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        {pedido.estado !== 'cancelado' && (
          <button
            type="button"
            onClick={() => onEstado(pedido.id, 'cancelado')}
            className="rounded-full border-2 border-line px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted transition-colors hover:border-flame hover:text-flame"
          >
            Cancelar
          </button>
        )}
      </div>
    </article>
  )
}

export default function OrdersBoard({ pedidos, onEstado, onEstimado }) {
  if (pedidos.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-line py-16 text-center text-muted">
        No hay pedidos activos ahora mismo.
      </div>
    )
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {pedidos.map((p) => (
        <OrderCard key={p.id} pedido={p} onEstado={onEstado} onEstimado={onEstimado} />
      ))}
    </div>
  )
}
