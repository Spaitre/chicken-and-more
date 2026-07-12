// ============================================================================
//  Checkout — paso de datos del cliente + tiempo estimado + aviso de pago.
//  Crea el pedido en el backend (solo para recoger). Reemplaza el envío por
//  WhatsApp del carrito anterior.
// ============================================================================

import { useMemo, useState } from 'react'
import { FiArrowLeft, FiClock, FiUser, FiPhone, FiMessageSquare, FiAlertTriangle } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useStore } from '../context/StoreContext'
import { api } from '../lib/api'
import { currency } from '../lib/whatsapp'

// Validación rápida de teléfono MX en el cliente (el servidor es la autoridad).
function telefonoOk(v) {
  let d = String(v || '').replace(/\D/g, '')
  if (d.length === 12 && d.startsWith('52')) d = d.slice(2)
  return d.length === 10 && !/^[01]/.test(d)
}

export default function Checkout({ onBack, onDone }) {
  const { items, total } = useCart()
  const { estado, menu } = useStore()

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [comentarios, setComentarios] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [tocado, setTocado] = useState(false)

  // Tiempo estimado (previo): mayor tiempo de prep + cola * minutos extra.
  const estimado = useMemo(() => {
    const prep = Object.fromEntries(menu.map((m) => [m.id, m.tiempoPrep ?? 15]))
    if (items.length === 0) return 0
    const maxPrep = Math.max(...items.map((it) => prep[it.id] ?? 15))
    return maxPrep + (estado.activos || 0) * (estado.minutosExtraPorPedido || 0)
  }, [items, menu, estado])

  const requierePago =
    estado.umbralPagoAnticipado > 0 && total >= estado.umbralPagoAnticipado

  const nombreOk = nombre.trim().length >= 2
  const telOk = telefonoOk(telefono)
  const puedeEnviar = nombreOk && telOk && items.length > 0 && !enviando

  const enviar = async () => {
    setTocado(true)
    setError(null)
    if (!puedeEnviar) return
    setEnviando(true)
    try {
      const payload = {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        comentarios: comentarios.trim(),
        items: items.map((it) => ({
          id: it.id,
          size: it.size?.name,
          flavor: it.flavor || undefined,
          qty: it.qty,
        })),
      }
      const pedido = await api.crearPedido(payload)
      onDone(pedido.codigo, pedido.pagoUrl)
    } catch (e) {
      setError(e.message || 'No se pudo enviar el pedido.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Encabezado */}
      <div className="flex items-center gap-3 border-b-2 border-line px-6 py-5">
        <button
          type="button"
          onClick={onBack}
          className="grid h-10 w-10 place-items-center rounded-full border-2 border-line text-cream transition-colors hover:border-amber hover:text-amber"
          aria-label="Volver al carrito"
        >
          <FiArrowLeft className="text-lg" />
        </button>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amber">Tus datos</p>
          <p className="font-display text-2xl uppercase leading-none text-cream">Para recoger</p>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Tiempo estimado */}
        <div className="flex items-center gap-3 rounded-2xl border-2 border-amber bg-amber/10 p-4">
          <FiClock className="text-2xl text-amber" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              Tiempo estimado
            </p>
            <p className="font-display text-2xl leading-none text-cream">
              ~{estimado} min
            </p>
          </div>
          <p className="ml-auto max-w-[9rem] text-right text-[0.7rem] text-muted">
            Aumenta según la cola. Se confirma al crear el pedido.
          </p>
        </div>

        {/* Aviso solo-recoger */}
        <p className="mt-4 rounded-xl border-2 border-line bg-card2 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-muted">
          🏪 Solo para recoger en el local
        </p>

        {/* Campos */}
        <div className="mt-5 space-y-4">
          <Field
            icon={FiUser}
            label="Nombre"
            error={tocado && !nombreOk ? 'Escribe tu nombre.' : ''}
          >
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="w-full bg-transparent text-cream placeholder:text-muted/60 focus:outline-none"
            />
          </Field>

          <Field
            icon={FiPhone}
            label="Teléfono"
            error={tocado && !telOk ? 'Teléfono de 10 dígitos válido.' : ''}
          >
            <input
              type="tel"
              inputMode="numeric"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="686 123 4567"
              className="w-full bg-transparent text-cream placeholder:text-muted/60 focus:outline-none"
            />
          </Field>

          <Field icon={FiMessageSquare} label="Comentarios (opcional)">
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Sin cebolla, extra salsa, alergias…"
              rows={2}
              className="w-full resize-none bg-transparent text-cream placeholder:text-muted/60 focus:outline-none"
            />
          </Field>
        </div>

        {/* Aviso de pago anticipado */}
        {requierePago && (
          <div className="mt-4 flex gap-3 rounded-2xl border-2 border-flame bg-flame/10 p-4">
            <FiAlertTriangle className="mt-0.5 shrink-0 text-flame" />
            <p className="text-sm text-cream">
              Los pedidos de {currency(estado.umbralPagoAnticipado)} o más requieren{' '}
              <b>pago anticipado</b>. Después de crear el pedido te llevaremos a pagar en
              línea para confirmarlo.
            </p>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-xl border-2 border-flame bg-flame/10 px-4 py-3 text-sm font-bold text-cream">
            {error}
          </p>
        )}
      </div>

      {/* Pie: total + confirmar */}
      <div className="border-t-2 border-line px-6 py-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-muted">Total</span>
          <span className="font-display text-3xl text-cream">{currency(total)}</span>
        </div>
        <button
          type="button"
          onClick={enviar}
          disabled={!puedeEnviar}
          className={`mt-4 w-full ${puedeEnviar ? 'btn-flame' : 'btn-flame cursor-not-allowed opacity-50'}`}
        >
          {enviando ? 'Enviando…' : requierePago ? 'Crear pedido y pagar' : 'Confirmar pedido'}
        </button>
        <p className="mt-3 text-center text-[0.7rem] text-muted">
          Al confirmar aceptas recoger tu pedido en el local.
        </p>
      </div>
    </div>
  )
}

function Field({ icon: Icon, label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-muted">
        <Icon className="text-amber" /> {label}
      </span>
      <div
        className={`rounded-xl border-2 bg-bg px-3 py-2.5 transition-colors focus-within:border-amber ${
          error ? 'border-flame' : 'border-line'
        }`}
      >
        {children}
      </div>
      {error && <span className="mt-1 block text-xs font-bold text-flame">{error}</span>}
    </label>
  )
}
