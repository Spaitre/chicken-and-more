// ============================================================================
//  Hero — Variante Local Bold.
//  Titular gigante condensado, badge de rating, estado en vivo y doble CTA.
//  Composición asimétrica con foto enmarcada (borde grueso + sombra dura) y
//  un sticker rotado. Debajo, marquesina de categorías.
// ============================================================================

import { motion } from 'framer-motion'
import { FiArrowRight, FiStar, FiShoppingBag } from 'react-icons/fi'
import { GiChickenLeg, GiFullPizza, GiHamburger } from 'react-icons/gi'
import { BUSINESS } from '../lib/config'
import { useCart } from '../context/CartContext'
import OpenStatus from './OpenStatus'
import SafeImage from './SafeImage'

const ease = [0.16, 1, 0.3, 1]

export default function Hero({ openState }) {
  const { openCart } = useCart()

  return (
    <section id="inicio" className="relative overflow-hidden px-5 pb-16 pt-24 sm:px-8 lg:pb-24 lg:pt-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ---- Texto ---- */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 rounded-full border-2 border-line bg-card px-4 py-2"
          >
            <FiStar className="text-amber" />
            <span className="text-xs font-bold uppercase tracking-wide text-cream">
              {BUSINESS.rating} · {BUSINESS.reviewCount} reseñas en Google
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="mt-6 font-display text-6xl uppercase leading-[0.92] tracking-tight text-cream sm:text-7xl lg:text-[5.5rem]"
          >
            Alitas que se
            <br />
            <span className="text-flame">defienden</span> solas.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease }}
            className="mt-5 max-w-md text-base leading-relaxed text-muted"
          >
            Boneless crujiente, pizzas al horno y hamburguesas de la parrilla,
            bañadas en las salsas de la casa. Aquí en Mexicali: pídelo en línea
            y recógelo en el local, con seguimiento en vivo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <a href="#menu" className="btn-flame">
              Ver el menú <FiArrowRight className="text-base" />
            </a>
            <button type="button" onClick={openCart} className="btn-outline">
              <FiShoppingBag className="text-base" /> Mi pedido
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-8"
          >
            <OpenStatus state={openState} />
          </motion.div>
        </div>

        {/* ---- Visual ---- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="overflow-hidden rounded-3xl border-2 border-line shadow-hard-lg">
            <SafeImage
              src="/gallery/hero.jpg"
              fallback="https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=1000&q=80"
              alt="Orden de alitas bañadas en salsa buffalo con papas."
              className="aspect-[4/5] w-full object-cover"
            />
          </div>

          {/* Sticker rotado */}
          <div className="absolute -left-3 -top-4 rotate-[-8deg] rounded-2xl border-2 border-bg bg-amber px-4 py-2 shadow-hard">
            <span className="font-display text-lg uppercase tracking-wide text-bg">
              +10 salsas
            </span>
          </div>

          {/* Chip inferior con iconos */}
          <div className="absolute -bottom-4 right-4 flex items-center gap-3 rounded-2xl border-2 border-line bg-card px-4 py-3 shadow-hard">
            <GiChickenLeg className="text-xl text-flame" />
            <GiFullPizza className="text-xl text-amber" />
            <GiHamburger className="text-xl text-ember" />
          </div>
        </motion.div>
      </div>

      {/* ---- Marquesina de categorías ---- */}
      <div className="relative mt-14 overflow-hidden border-y-2 border-line py-3 sm:mt-20">
        <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap">
          {Array.from({ length: 2 }).flatMap((_, dup) =>
            ['Boneless', 'Alitas', 'Pizzas', 'Hamburguesas', 'Papas con queso', 'Salsas de la casa', 'Para compartir'].map(
              (word) => (
                <span
                  key={`${dup}-${word}`}
                  className="flex items-center gap-8 font-display text-2xl uppercase tracking-wide text-cream/80"
                >
                  {word}
                  <span className="text-flame">●</span>
                </span>
              )
            )
          )}
        </div>
      </div>
    </section>
  )
}
