// ============================================================================
//  Promociones — se OCULTA sola si no hay promos activas.
//  Fuente: Google Sheets → fallback local. Filtro por columna "activo".
//  Presentación tipo bento: la primera promo ocupa una caja más grande.
// ============================================================================

import { FaWhatsapp } from 'react-icons/fa'
import { SHEETS } from '../lib/config'
import { validatePromoRow } from '../lib/csv'
import { useSheetData } from '../hooks/useSheetData'
import { PROMOS } from '../data/promos'
import { BUSINESS } from '../lib/config'
import { buildMessageLink } from '../lib/whatsapp'
import Reveal from './Reveal'

export default function Promos() {
  const { data } = useSheetData(SHEETS.promos, validatePromoRow, PROMOS)
  const active = data.filter((p) => p.active !== false)

  // Regla clave: sin promos activas → no se renderiza nada.
  if (active.length === 0) return null

  return (
    <section
      id="promos"
      className="scroll-mt-24 border-y-2 border-line bg-card/40 px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">🎉 Aprovecha</p>
              <h2 className="mt-3 font-display text-5xl uppercase leading-none text-cream sm:text-6xl">
                Promos de la semana
              </h2>
            </div>
            <p className="max-w-xs text-sm text-muted">
              Precios de tienda, sujetos a disponibilidad. No acumulables con
              otras promociones.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((promo, i) => {
            const featured = i === 0
            return (
              <Reveal
                key={promo.id}
                delay={i * 0.06}
                className={featured ? 'sm:col-span-2 lg:row-span-2' : ''}
              >
                <article
                  className={`group flex h-full flex-col justify-between rounded-2xl border-2 p-6 transition-all duration-200 hover:-translate-y-1 ${
                    featured
                      ? 'border-flame bg-flame text-cream shadow-flame'
                      : 'border-line bg-card text-cream hover:border-amber hover:shadow-hard'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      {promo.tag && (
                        <span
                          className={`rounded-full px-3 py-1 text-[0.62rem] font-bold uppercase tracking-wide ${
                            featured
                              ? 'bg-bg/25 text-cream'
                              : 'border-2 border-line text-amber'
                          }`}
                        >
                          {promo.tag}
                        </span>
                      )}
                      {promo.price && (
                        <span
                          className={`font-display uppercase leading-none ${
                            featured ? 'text-5xl text-cream' : 'text-3xl text-amber'
                          }`}
                        >
                          {promo.price}
                        </span>
                      )}
                    </div>
                    <h3
                      className={`mt-5 font-display uppercase leading-none ${
                        featured ? 'text-4xl sm:text-5xl' : 'text-2xl'
                      }`}
                    >
                      {promo.title}
                    </h3>
                    <p
                      className={`mt-3 text-sm leading-relaxed ${
                        featured ? 'text-cream/90' : 'text-muted'
                      }`}
                    >
                      {promo.description}
                    </p>
                  </div>

                  {featured && (
                    <a
                      href={buildMessageLink(
                        `¡Hola ${BUSINESS.name}! Quiero aprovechar la promo "${promo.title}".`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex w-max items-center gap-2 rounded-full bg-bg px-5 py-3 text-sm font-bold uppercase tracking-wide text-cream shadow-hard transition-transform hover:-translate-y-0.5"
                    >
                      <FaWhatsapp /> La quiero
                    </a>
                  )}
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
