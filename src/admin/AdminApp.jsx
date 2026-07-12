// ============================================================================
//  AdminApp — panel administrativo en /admin. Login + pestañas + tiempo real.
//  Pestañas: Pedidos (vivo) · Historial · Productos (inventario) · Ajustes.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import { GiChickenLeg } from 'react-icons/gi'
import { FiLogOut, FiRefreshCw, FiWifi } from 'react-icons/fi'
import { adminApi } from './adminApi'
import Login from './Login'
import OrdersBoard from './OrdersBoard'
import History from './History'
import Products from './Products'
import Settings from './Settings'

const TABS = [
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'historial', label: 'Historial' },
  { id: 'productos', label: 'Productos' },
  { id: 'ajustes', label: 'Ajustes' },
]

export default function AdminApp() {
  const [autenticado, setAutenticado] = useState(adminApi.hasToken())
  const [tab, setTab] = useState('pedidos')

  const [activos, setActivos] = useState([])
  const [historial, setHistorial] = useState([])
  const [productos, setProductos] = useState([])
  const [config, setConfig] = useState(null)
  const [horarios, setHorarios] = useState([])
  const [resumen, setResumen] = useState(null)
  const [conectado, setConectado] = useState(false)
  const esRef = useRef(null)

  const cargarTodo = useCallback(async () => {
    try {
      const [act, his, prods, cfg, res] = await Promise.all([
        adminApi.pedidos(false),
        adminApi.pedidos(true),
        adminApi.productos(),
        adminApi.config(),
        adminApi.resumen(),
      ])
      setActivos(act.pedidos)
      setHistorial(his.pedidos)
      setProductos(prods.productos)
      setConfig(cfg.config)
      setHorarios(cfg.horarios)
      setResumen(res)
    } catch (e) {
      if (e.status === 401) {
        setAutenticado(false)
      }
    }
  }, [])

  // Carga inicial + suscripción SSE al panel.
  useEffect(() => {
    if (!autenticado) return
    cargarTodo()

    let es
    try {
      es = new EventSource(adminApi.streamUrl())
      esRef.current = es
      es.addEventListener('update', () => cargarTodo())
      es.onopen = () => setConectado(true)
      es.onerror = () => setConectado(false)
    } catch {
      /* noop */
    }
    return () => es?.close()
  }, [autenticado, cargarTodo])

  const salir = async () => {
    esRef.current?.close()
    await adminApi.logout()
    setAutenticado(false)
  }

  const onEstado = async (id, estado) => {
    await adminApi.setEstado(id, estado)
    cargarTodo()
  }
  const onEstimado = async (id, minutos) => {
    await adminApi.setEstimado(id, minutos)
    cargarTodo()
  }

  if (!autenticado) return <Login onLogin={() => setAutenticado(true)} />

  return (
    <div className="min-h-screen">
      {/* Barra superior */}
      <header className="sticky top-0 z-20 border-b-2 border-line bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl border-2 border-flame bg-flame/15 text-flame">
              <GiChickenLeg className="text-xl" />
            </span>
            <div>
              <p className="font-display text-lg uppercase leading-none text-cream">
                Chicken<span className="text-flame"> &amp; </span>More
              </p>
              <p className="text-[0.65rem] font-bold uppercase tracking-wide text-amber">
                Panel de pedidos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {resumen?.estado && (
              <span
                className={`hidden items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-wide sm:inline-flex ${
                  resumen.estado.aceptando
                    ? 'border-herb text-herb'
                    : 'border-flame text-flame'
                }`}
              >
                {resumen.estado.aceptando
                  ? `Recibiendo · ${resumen.estado.activos}/${resumen.estado.maxSimultaneos}`
                  : `Bloqueado (${resumen.estado.motivo})`}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 text-[0.62rem] font-bold uppercase ${
                conectado ? 'text-herb' : 'text-muted'
              }`}
              title={conectado ? 'En vivo' : 'Reconectando…'}
            >
              <FiWifi /> {conectado ? 'Vivo' : '—'}
            </span>
            <button
              type="button"
              onClick={cargarTodo}
              className="grid h-9 w-9 place-items-center rounded-full border-2 border-line text-cream transition-colors hover:border-amber hover:text-amber"
              aria-label="Actualizar"
            >
              <FiRefreshCw />
            </button>
            <button
              type="button"
              onClick={salir}
              className="inline-flex items-center gap-2 rounded-full border-2 border-line px-4 py-2 text-xs font-bold uppercase tracking-wide text-cream transition-colors hover:border-flame hover:text-flame"
            >
              <FiLogOut /> Salir
            </button>
          </div>
        </div>

        {/* Pestañas */}
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 sm:px-8">
          {TABS.map((t) => {
            const on = tab === t.id
            const badge =
              t.id === 'pedidos' ? activos.length : t.id === 'historial' ? historial.length : null
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`relative whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
                  on ? 'border-flame text-cream' : 'border-transparent text-muted hover:text-cream'
                }`}
              >
                {t.label}
                {badge != null && badge > 0 && (
                  <span className="ml-2 rounded-full bg-flame px-2 py-0.5 text-[0.6rem] text-cream">
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </header>

      {/* Contenido */}
      <main className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
        {tab === 'pedidos' && (
          <OrdersBoard pedidos={activos} onEstado={onEstado} onEstimado={onEstimado} />
        )}
        {tab === 'historial' && <History pedidos={historial} />}
        {tab === 'productos' && <Products productos={productos} onReload={cargarTodo} />}
        {tab === 'ajustes' && config && (
          <Settings config={config} horarios={horarios} onReload={cargarTodo} />
        )}
      </main>
    </div>
  )
}
