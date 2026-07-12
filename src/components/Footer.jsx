// ============================================================================
//  Footer — cierre con logo, contacto rápido, redes y nota legal.
// ============================================================================

import { GiChickenLeg } from 'react-icons/gi'
import { FaWhatsapp, FaInstagram, FaFacebookF, FaTiktok } from 'react-icons/fa'
import { FiArrowUp } from 'react-icons/fi'
import { BUSINESS } from '../lib/config'
import { buildMessageLink } from '../lib/whatsapp'

export default function Footer() {
  const year = new Date().getFullYear()
  const waLink = buildMessageLink(`¡Hola ${BUSINESS.name}! Quiero hacer un pedido.`)

  return (
    <footer className="border-t-2 border-line bg-card/50 px-5 py-12 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        {/* Marca */}
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-flame bg-flame/15 text-flame">
              <GiChickenLeg className="text-2xl" />
            </span>
            <span className="font-display text-xl uppercase tracking-wide text-cream">
              Chicken<span className="text-flame"> &amp; </span>More
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted">{BUSINESS.tagline}. {BUSINESS.city}.</p>
          <div className="mt-5 flex gap-2">
            {[
              { href: BUSINESS.instagram, icon: FaInstagram, label: 'Instagram' },
              { href: BUSINESS.facebook, icon: FaFacebookF, label: 'Facebook' },
              { href: BUSINESS.tiktok, icon: FaTiktok, label: 'TikTok' },
              { href: waLink, icon: FaWhatsapp, label: 'WhatsApp' },
            ].map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-line text-muted transition-colors hover:border-amber hover:text-amber"
              >
                <Icon className="text-sm" />
              </a>
            ))}
          </div>
        </div>

        {/* Navegación */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amber">Explora</p>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ['Menú', '#menu'],
              ['Promos', '#promos'],
              ['Nosotros', '#nosotros'],
              ['Reseñas', '#resenas'],
              ['Contacto', '#contacto'],
            ].map(([label, href]) => (
              <li key={href}>
                <a href={href} className="text-muted transition-colors hover:text-cream">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amber">Contacto</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>{BUSINESS.fullAddress}</li>
            <li>
              <a href={`tel:${BUSINESS.phoneTel}`} className="transition-colors hover:text-cream">
                {BUSINESS.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${BUSINESS.email}`} className="transition-colors hover:text-cream">
                {BUSINESS.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-4 border-t-2 border-line pt-6 sm:flex-row">
        <p className="text-xs text-muted">
          © {year} {BUSINESS.name}. Hecho con antojo en {BUSINESS.city}.
        </p>
        <a
          href="#inicio"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted transition-colors hover:text-amber"
        >
          Volver arriba <FiArrowUp />
        </a>
      </div>
    </footer>
  )
}
