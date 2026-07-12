// ============================================================================
//  Products — control de inventario: agotar, ocultar, reactivar; editar precio
//  base y tiempo de preparación.
// ============================================================================

import { useMemo, useState } from 'react'
import { FiCheck } from 'react-icons/fi'
import { currency } from '../lib/whatsapp'
import { adminApi } from './adminApi'

function Toggle({ on, onChange, label, colorOn = 'bg-flame' }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wide transition-colors ${
        on ? `${colorOn} border-transparent text-cream` : 'border-line text-muted hover:text-cream'
      }`}
      aria-pressed={on}
    >
      {label}
    </button>
  )
}

function Row({ prod, onPatch }) {
  const [precio, setPrecio] = useState(prod.price)
  const [prep, setPrep] = useState(prod.tiempoPrep)
  const [guardado, setGuardado] = useState(false)

  const sinTamanos = prod.sizes.length === 0

  const guardarNumeros = async () => {
    await onPatch(prod.id, { precioBase: Number(precio), tiempoPrep: Number(prep) })
    setGuardado(true)
    setTimeout(() => setGuardado(false), 1200)
  }

  return (
    <tr className={`text-cream ${prod.oculto ? 'opacity-50' : ''}`}>
      <td className="px-4 py-3">
        <span className="block font-bold">{prod.name}</span>
        <span className="text-xs text-muted">{prod.category}</span>
      </td>
      <td className="px-4 py-3">
        {sinTamanos ? (
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="w-24 rounded-lg border-2 border-line bg-bg px-2 py-1 text-cream focus:border-amber focus:outline-none"
          />
        ) : (
          <span className="text-xs text-muted">desde {currency(prod.price)} (varios tamaños)</span>
        )}
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          value={prep}
          onChange={(e) => setPrep(e.target.value)}
          className="w-16 rounded-lg border-2 border-line bg-bg px-2 py-1 text-cream focus:border-amber focus:outline-none"
        />
        <span className="ml-1 text-xs text-muted">min</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Toggle
            on={prod.agotado}
            onChange={(v) => onPatch(prod.id, { agotado: v })}
            label={prod.agotado ? 'Agotado' : 'Disponible'}
            colorOn="bg-flame"
          />
          <Toggle
            on={prod.oculto}
            onChange={(v) => onPatch(prod.id, { oculto: v })}
            label={prod.oculto ? 'Oculto' : 'Visible'}
            colorOn="bg-ember"
          />
        </div>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={guardarNumeros}
          className={`rounded-full px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wide ${
            guardado ? 'bg-herb text-bg' : 'bg-amber text-bg'
          }`}
        >
          {guardado ? (
            <span className="inline-flex items-center gap-1">
              <FiCheck /> Listo
            </span>
          ) : (
            'Guardar'
          )}
        </button>
      </td>
    </tr>
  )
}

export default function Products({ productos, onReload }) {
  const [filtro, setFiltro] = useState('')

  const patch = async (id, body) => {
    await adminApi.patchProducto(id, body)
    onReload()
  }

  const lista = useMemo(() => {
    const q = filtro.trim().toLowerCase()
    return productos.filter(
      (p) => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    )
  }, [productos, filtro])

  return (
    <div>
      <input
        type="text"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        placeholder="Filtrar productos…"
        className="mb-4 w-full max-w-xs rounded-full border-2 border-line bg-card px-4 py-2.5 text-sm text-cream placeholder:text-muted/70 focus:border-amber focus:outline-none"
      />
      <div className="overflow-x-auto rounded-2xl border-2 border-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-card2 text-[0.65rem] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Precio base</th>
              <th className="px-4 py-3">Prep.</th>
              <th className="px-4 py-3">Inventario</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-line">
            {lista.map((p) => (
              <Row key={p.id} prod={p} onPatch={patch} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
