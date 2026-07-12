// ============================================================================
//  Menú — grid filtrable con chips de categoría + buscador.
//  Fuente de datos: API (/api/menu) vía StoreContext, con fallback local.
// ============================================================================

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiSearch, FiX } from 'react-icons/fi'
import { useStore } from '../context/StoreContext'
import { MENU_CATEGORIES } from '../data/menu'
import MenuItem from './MenuItem'
import Reveal from './Reveal'

const norm = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export default function Menu() {
  const { menu, estado } = useStore()
  const puedePedir = estado.aceptando

  const categories = useMemo(() => {
    const present = [...new Set(menu.map((m) => m.category))]
    const ordered = MENU_CATEGORIES.filter((c) => present.includes(c))
    const extras = present.filter((c) => !ordered.includes(c))
    return [...ordered, ...extras]
  }, [menu])

  const [active, setActive] = useState('Todo')
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const q = norm(query.trim())
    return menu
      .filter((m) => active === 'Todo' || m.category === active)
      .filter(
        (m) =>
          !q ||
          norm(m.name).includes(q) ||
          norm(m.description).includes(q) ||
          norm(m.category).includes(q)
      )
  }, [menu, active, query])

  const chips = ['Todo', ...categories]

  return (
    <section id="menu" className="scroll-mt-24 px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">🔥 La carta</p>
              <h2 className="mt-3 font-display text-5xl uppercase leading-none text-cream sm:text-6xl">
                Nuestro menú
              </h2>
            </div>
            <div className="relative w-full sm:w-72">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca alitas, pizza…"
                aria-label="Buscar en el menú"
                className="w-full rounded-full border-2 border-line bg-card py-3 pl-11 pr-10 text-sm text-cream placeholder:text-muted/70 focus:border-amber focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-flame"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>
        </Reveal>

        {/* Chips de categoría */}
        <div className="mt-8 flex flex-wrap gap-2.5">
          {chips.map((cat) => {
            const on = active === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className={`chip ${
                  on
                    ? 'border-flame bg-flame text-cream shadow-hard'
                    : 'border-line text-muted hover:border-amber hover:text-cream'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Grid de tarjetas */}
        <motion.div layout className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <MenuItem item={item} puedePedir={puedePedir} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {visible.length === 0 && (
          <p className="mt-16 text-center text-muted">
            No encontramos nada con “{query}”. Prueba otra búsqueda.
          </p>
        )}

        <p className="mt-10 text-center text-xs font-bold uppercase tracking-wide text-muted">
          Precios en MXN · Solo para recoger en el local
        </p>
      </div>
    </section>
  )
}
