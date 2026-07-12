// Historial de pedidos entregados/cancelados.
import { currency } from '../lib/whatsapp'
import { ESTADOS_UI } from './OrdersBoard'

export default function History({ pedidos }) {
  if (pedidos.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-line py-16 text-center text-muted">
        Aún no hay pedidos en el historial.
      </div>
    )
  }
  return (
    <div className="overflow-x-auto rounded-2xl border-2 border-line">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-card2 text-[0.65rem] uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3">Código</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Artículos</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-line">
          {pedidos.map((p) => {
            const ui = ESTADOS_UI[p.estado] || ESTADOS_UI.entregado
            return (
              <tr key={p.id} className="text-cream">
                <td className="px-4 py-3 font-display text-lg text-amber">{p.codigo}</td>
                <td className="px-4 py-3">
                  <span className="block font-bold">{p.nombre}</span>
                  <span className="text-xs text-muted">{p.telefono}</span>
                </td>
                <td className="px-4 py-3 text-muted">
                  {p.items.reduce((n, i) => n + i.cantidad, 0)} art.
                </td>
                <td className="px-4 py-3">{currency(p.total)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border-2 px-2.5 py-1 text-[0.6rem] font-bold uppercase ${ui.clase}`}>
                    {ui.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted">{p.creadoEn}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
