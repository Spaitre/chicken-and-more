// ============================================================================
//  Nosotros — historia breve + stats en cajas (bento). Foto enmarcada.
// ============================================================================

import { GiChickenLeg, GiChiliPepper } from 'react-icons/gi'
import { BUSINESS } from '../lib/config'
import Reveal from './Reveal'
import SafeImage from './SafeImage'

export default function About() {
  return (
    <section id="nosotros" className="scroll-mt-24 px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        {/* Texto + stats */}
        <div>
          <Reveal>
            <p className="eyebrow">🍗 Nosotros</p>
            <h2 className="mt-3 font-display text-5xl uppercase leading-none text-cream sm:text-6xl">
              Nacidos del antojo
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              Empezamos con una freidora, una parrilla y la idea fija de hacer
              las mejores alitas de Mexicali. Hoy servimos boneless, pizzas y
              hamburguesas con la misma obsesión: producto fresco, salsas
              hechas en casa y porciones para compartir sin miramientos.
            </p>
            <p className="mt-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber">
              <GiChiliPepper /> Salsas de suave a “sí pica de verdad”
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {BUSINESS.stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border-2 border-line bg-card p-4 text-center transition-colors duration-200 hover:border-amber"
                >
                  <p className="font-display text-3xl uppercase text-flame">{s.value}</p>
                  <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-wide text-muted">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Foto */}
        <Reveal delay={0.05}>
          <div className="relative mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-3xl border-2 border-line shadow-hard-lg">
              <SafeImage
                src="/gallery/nosotros.jpg"
                fallback="https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1000&q=80"
                alt="Cocina de Chicken and More preparando alitas y hamburguesas."
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-3 flex items-center gap-2 rotate-[6deg] rounded-2xl border-2 border-bg bg-flame px-4 py-2 shadow-hard">
              <GiChickenLeg className="text-lg text-cream" />
              <span className="font-display text-lg uppercase tracking-wide text-cream">
                Hecho en casa
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
