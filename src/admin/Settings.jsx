// ============================================================================
//  Settings — configuración del negocio: recepción de pedidos, capacidad,
//  tiempos, umbral de pago anticipado y horarios por día.
// ============================================================================

import { useState } from 'react'
import { FiSave, FiCheck } from 'react-icons/fi'
import { adminApi } from './adminApi'

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function Guardado({ visible }) {
  return visible ? (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-herb">
      <FiCheck /> Guardado
    </span>
  ) : null
}

export default function Settings({ config, horarios, onReload }) {
  const [cfg, setCfg] = useState({
    maxSimultaneos: config.maxSimultaneos,
    minutosExtraPorPedido: config.minutosExtraPorPedido,
    umbralPagoAnticipado: config.umbralPagoAnticipado,
  })
  const [hor, setHor] = useState(() =>
    [...horarios].sort((a, b) => ((a.dia + 6) % 7) - ((b.dia + 6) % 7))
  )
  const [okCfg, setOkCfg] = useState(false)
  const [okHor, setOkHor] = useState(false)
  const [okRec, setOkRec] = useState(false)

  const aceptando = config.aceptandoPedidos

  const toggleRecepcion = async () => {
    await adminApi.recepcion(!aceptando)
    setOkRec(true)
    setTimeout(() => setOkRec(false), 1200)
    onReload()
  }

  const guardarCfg = async () => {
    await adminApi.patchConfig(cfg)
    setOkCfg(true)
    setTimeout(() => setOkCfg(false), 1200)
    onReload()
  }

  const guardarHorarios = async () => {
    await adminApi.patchHorarios(hor)
    setOkHor(true)
    setTimeout(() => setOkHor(false), 1200)
    onReload()
  }

  const setDia = (dia, patch) =>
    setHor((prev) => prev.map((h) => (h.dia === dia ? { ...h, ...patch } : h)))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Recepción de pedidos */}
      <section className="rounded-2xl border-2 border-line bg-card p-6 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl uppercase text-cream">Recepción de pedidos</h3>
            <p className="mt-1 text-sm text-muted">
              Pausa temporalmente la entrada de pedidos sin cambiar el horario.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleRecepcion}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-wide shadow-hard transition-transform hover:-translate-y-0.5 ${
              aceptando ? 'bg-herb text-bg' : 'bg-flame text-cream'
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${aceptando ? 'bg-bg' : 'bg-cream'}`} />
            {aceptando ? 'Recibiendo pedidos' : 'Pedidos en pausa'}
          </button>
        </div>
        <Guardado visible={okRec} />
      </section>

      {/* Capacidad y tiempos */}
      <section className="rounded-2xl border-2 border-line bg-card p-6">
        <h3 className="font-display text-2xl uppercase text-cream">Capacidad y tiempos</h3>
        <div className="mt-4 space-y-4">
          <Campo
            label="Máximo de pedidos simultáneos"
            hint="Al alcanzarlo, no se aceptan nuevos pedidos."
          >
            <input
              type="number"
              min="1"
              value={cfg.maxSimultaneos}
              onChange={(e) => setCfg({ ...cfg, maxSimultaneos: e.target.value })}
              className="w-24 rounded-lg border-2 border-line bg-bg px-3 py-2 text-cream focus:border-amber focus:outline-none"
            />
          </Campo>
          <Campo
            label="Minutos extra por pedido en cola"
            hint="Se suman al tiempo estimado por cada pedido activo."
          >
            <input
              type="number"
              min="0"
              value={cfg.minutosExtraPorPedido}
              onChange={(e) => setCfg({ ...cfg, minutosExtraPorPedido: e.target.value })}
              className="w-24 rounded-lg border-2 border-line bg-bg px-3 py-2 text-cream focus:border-amber focus:outline-none"
            />
          </Campo>
          <Campo
            label="Umbral de pago anticipado (MXN)"
            hint="Pedidos de este monto o más exigen pago en línea. 0 = desactivado."
          >
            <input
              type="number"
              min="0"
              value={cfg.umbralPagoAnticipado}
              onChange={(e) => setCfg({ ...cfg, umbralPagoAnticipado: e.target.value })}
              className="w-24 rounded-lg border-2 border-line bg-bg px-3 py-2 text-cream focus:border-amber focus:outline-none"
            />
          </Campo>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button type="button" onClick={guardarCfg} className="btn-amber">
            <FiSave /> Guardar
          </button>
          <Guardado visible={okCfg} />
        </div>
      </section>

      {/* Horarios */}
      <section className="rounded-2xl border-2 border-line bg-card p-6">
        <h3 className="font-display text-2xl uppercase text-cream">Horario</h3>
        <p className="mt-1 text-sm text-muted">
          Si el cierre es después de medianoche (p. ej. 01:00), se maneja solo.
        </p>
        <div className="mt-4 space-y-2">
          {hor.map((h) => (
            <div key={h.dia} className="flex items-center gap-2">
              <span className="w-24 text-sm font-bold text-cream">{DIAS[h.dia]}</span>
              <input
                type="time"
                value={h.abre}
                disabled={h.cerrado}
                onChange={(e) => setDia(h.dia, { abre: e.target.value })}
                className="rounded-lg border-2 border-line bg-bg px-2 py-1.5 text-sm text-cream focus:border-amber focus:outline-none disabled:opacity-40"
              />
              <span className="text-muted">–</span>
              <input
                type="time"
                value={h.cierra}
                disabled={h.cerrado}
                onChange={(e) => setDia(h.dia, { cierra: e.target.value })}
                className="rounded-lg border-2 border-line bg-bg px-2 py-1.5 text-sm text-cream focus:border-amber focus:outline-none disabled:opacity-40"
              />
              <button
                type="button"
                onClick={() => setDia(h.dia, { cerrado: !h.cerrado })}
                className={`ml-auto rounded-full border-2 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-wide transition-colors ${
                  h.cerrado
                    ? 'border-flame bg-flame/15 text-flame'
                    : 'border-line text-muted hover:text-cream'
                }`}
              >
                {h.cerrado ? 'Cerrado' : 'Abierto'}
              </button>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button type="button" onClick={guardarHorarios} className="btn-amber">
            <FiSave /> Guardar horario
          </button>
          <Guardado visible={okHor} />
        </div>
      </section>
    </div>
  )
}

function Campo({ label, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-bold text-cream">{label}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      {children}
    </div>
  )
}
