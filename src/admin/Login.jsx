// Pantalla de acceso al panel administrativo.
import { useState } from 'react'
import { GiChickenLeg } from 'react-icons/gi'
import { FiLock } from 'react-icons/fi'
import { adminApi } from './adminApi'

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try {
      await adminApi.login(password)
      onLogin()
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form
        onSubmit={enviar}
        className="w-full max-w-sm rounded-3xl border-2 border-line bg-card p-8 shadow-hard-lg"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-flame bg-flame/15 text-flame">
            <GiChickenLeg className="text-2xl" />
          </span>
          <div>
            <p className="font-display text-xl uppercase leading-none text-cream">
              Chicken<span className="text-flame"> &amp; </span>More
            </p>
            <p className="text-xs font-bold uppercase tracking-wide text-amber">Panel</p>
          </div>
        </div>

        <h1 className="mt-6 font-display text-3xl uppercase text-cream">Acceso</h1>
        <p className="mt-1 text-sm text-muted">Ingresa la contraseña del negocio.</p>

        <label className="mt-6 block">
          <span className="mb-1.5 flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-muted">
            <FiLock className="text-amber" /> Contraseña
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full rounded-xl border-2 border-line bg-bg px-3 py-2.5 text-cream focus:border-amber focus:outline-none"
          />
        </label>

        {error && (
          <p className="mt-3 rounded-xl border-2 border-flame bg-flame/10 px-3 py-2 text-sm font-bold text-cream">
            {error}
          </p>
        )}

        <button type="submit" disabled={cargando} className="btn-flame mt-6 w-full">
          {cargando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
