// ============================================================================
//  Sidebar — Navegación LATERAL (rasgo distintivo de esta variante).
//  · Desktop (lg+): barra fija a la izquierda con scroll-spy, estado en vivo,
//    botón de pedido, redes y CTA de WhatsApp.
//  · Móvil: barra superior compacta + cajón (drawer) deslizante con los mismos
//    enlaces.
// ============================================================================

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FiHome,
  FiTag,
  FiInfo,
  FiImage,
  FiStar,
  FiMapPin,
  FiShoppingBag,
  FiMenu,
  FiX,
  FiRadio,
} from 'react-icons/fi'
import { GiChickenLeg } from 'react-icons/gi'
import { FaWhatsapp, FaInstagram, FaFacebookF, FaTiktok } from 'react-icons/fa'
import { useCart } from '../context/CartContext'
import { useTracker } from '../context/TrackerContext'
import { useScrollSpy } from '../hooks/useScrollSpy'
import { BUSINESS } from '../lib/config'
import { buildMessageLink } from '../lib/whatsapp'
import OpenStatus from './OpenStatus'

export const NAV_LINKS = [
  { id: 'inicio', label: 'Inicio', icon: FiHome },
  { id: 'menu', label: 'Menú', icon: GiChickenLeg },
  { id: 'promos', label: 'Promos', icon: FiTag },
  { id: 'nosotros', label: 'Nosotros', icon: FiInfo },
  { id: 'galeria', label: 'Galería', icon: FiImage },
  { id: 'resenas', label: 'Reseñas', icon: FiStar },
  { id: 'contacto', label: 'Contacto', icon: FiMapPin },
]

const SECTION_IDS = NAV_LINKS.map((l) => l.id)

function Logo({ compact = false }) {
  return (
    <a href="#inicio" className="group inline-flex items-center gap-3" aria-label={`${BUSINESS.name} — inicio`}>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-2 border-flame bg-flame/15 text-flame shadow-hard transition-transform duration-200 group-hover:-rotate-6">
        <GiChickenLeg className="text-2xl" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-xl uppercase tracking-wide text-cream">
          Chicken<span className="text-flame"> &amp; </span>More
        </span>
        {!compact && (
          <span className="mt-1 block text-[0.62rem] font-bold uppercase tracking-[0.25em] text-amber">
            Mexicali
          </span>
        )}
      </span>
    </a>
  )
}

function Socials({ className = '' }) {
  const items = [
    { href: BUSINESS.instagram, icon: FaInstagram, label: 'Instagram' },
    { href: BUSINESS.facebook, icon: FaFacebookF, label: 'Facebook' },
    { href: BUSINESS.tiktok, icon: FaTiktok, label: 'TikTok' },
  ]
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {items.map(({ href, icon: Icon, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="grid h-9 w-9 place-items-center rounded-full border-2 border-line text-muted transition-colors duration-200 hover:border-amber hover:text-amber focus-visible:border-amber focus-visible:text-amber"
        >
          <Icon className="text-sm" />
        </a>
      ))}
    </div>
  )
}

function NavList({ activeId, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_LINKS.map(({ id, label, icon: Icon }) => {
        const active = activeId === id
        return (
          <a
            key={id}
            href={`#${id}`}
            onClick={onNavigate}
            aria-current={active ? 'true' : undefined}
            className={`group flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors duration-200 ${
              active
                ? 'border-flame bg-flame text-cream shadow-hard'
                : 'border-transparent text-muted hover:border-line hover:bg-card2 hover:text-cream'
            }`}
          >
            <Icon className={`text-lg ${active ? 'text-cream' : 'text-amber'}`} />
            {label}
          </a>
        )
      })}
    </nav>
  )
}

export default function Sidebar({ openState }) {
  const { count, openCart } = useCart()
  const tracker = useTracker()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const activeId = useScrollSpy(SECTION_IDS)
  const waLink = buildMessageLink(`¡Hola ${BUSINESS.name}! Tengo una pregunta.`)

  const seguirPedido = () => {
    setDrawerOpen(false)
    tracker.open(tracker.ultimo || '')
  }

  // Bloquea el scroll del body mientras el cajón móvil está abierto.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const CartButton = ({ full = false }) => (
    <button
      type="button"
      onClick={() => {
        setDrawerOpen(false)
        openCart()
      }}
      className={`relative inline-flex items-center justify-center gap-2 rounded-full bg-amber font-bold uppercase tracking-wide text-bg shadow-hard transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ffc24d] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${
        full ? 'w-full px-5 py-3 text-sm' : 'h-11 w-11'
      }`}
      aria-label="Abrir carrito de pedido"
    >
      <FiShoppingBag className="text-lg" />
      {full && <span>Ver pedido</span>}
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-bg bg-flame px-1 text-[0.65rem] font-bold text-cream">
          {count}
        </span>
      )}
    </button>
  )

  return (
    <>
      {/* ===================== DESKTOP: barra lateral fija ===================== */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r-2 border-line bg-card/70 backdrop-blur-md lg:flex">
        <div className="px-6 py-7">
          <Logo />
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <NavList activeId={activeId} />
        </div>

        <div className="space-y-4 border-t-2 border-line px-6 py-6">
          <OpenStatus state={openState} />
          <CartButton full />
          <button
            type="button"
            onClick={seguirPedido}
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-line px-5 py-3 text-sm font-bold uppercase tracking-wide text-cream transition-colors duration-200 hover:border-amber hover:text-amber"
          >
            <FiRadio className="text-base" /> Seguir pedido
          </button>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-line px-5 py-3 text-sm font-bold uppercase tracking-wide text-cream transition-colors duration-200 hover:border-[#25D366] hover:text-[#25D366]"
          >
            <FaWhatsapp className="text-base" /> WhatsApp
          </a>
          <Socials />
        </div>
      </aside>

      {/* ===================== MÓVIL: barra superior ===================== */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b-2 border-line bg-bg/90 px-4 backdrop-blur-md lg:hidden">
        <Logo compact />
        <div className="flex items-center gap-3">
          <CartButton />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú de navegación"
            className="grid h-11 w-11 place-items-center rounded-full border-2 border-line text-cream transition-colors duration-200 hover:border-amber hover:text-amber"
          >
            <FiMenu className="text-xl" />
          </button>
        </div>
      </header>

      {/* ===================== MÓVIL: cajón deslizante ===================== */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[84%] max-w-xs flex-col border-r-2 border-line bg-card lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-label="Menú de navegación"
            >
              <div className="flex items-center justify-between border-b-2 border-line px-5 py-5">
                <Logo compact />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Cerrar menú"
                  className="grid h-10 w-10 place-items-center rounded-full border-2 border-line text-cream transition-colors hover:border-flame hover:text-flame"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5">
                <NavList activeId={activeId} onNavigate={() => setDrawerOpen(false)} />
              </div>

              <div className="space-y-4 border-t-2 border-line px-5 py-5">
                <OpenStatus state={openState} />
                <button
                  type="button"
                  onClick={seguirPedido}
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-line px-5 py-3 text-sm font-bold uppercase tracking-wide text-cream transition-colors hover:border-amber hover:text-amber"
                >
                  <FiRadio className="text-base" /> Seguir pedido
                </button>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-hard transition-transform hover:-translate-y-0.5"
                >
                  <FaWhatsapp className="text-base" /> Escríbenos
                </a>
                <Socials className="justify-center" />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
