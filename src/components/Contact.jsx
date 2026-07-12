// ============================================================================
//  Contacto — tarjetas de WhatsApp / llamar, horario en vivo y mapa real.
// ============================================================================

import { FiPhone, FiMapPin, FiClock, FiNavigation } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { BUSINESS, DAY_NAMES } from '../lib/config'
import { buildMessageLink } from '../lib/whatsapp'
import { prettyTime } from '../lib/time'
import OpenStatus from './OpenStatus'
import Reveal from './Reveal'

// Orden de lunes a domingo para la tabla de horarios.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

export default function Contact({ hours, openState }) {
  const { day: todayIdx } = { day: new Date().getDay() }
  const waLink = buildMessageLink(`¡Hola ${BUSINESS.name}! Tengo una pregunta.`)

  return (
    <section id="contacto" className="scroll-mt-24 px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="eyebrow">📍 Visítanos</p>
          <h2 className="mt-3 font-display text-5xl uppercase leading-none text-cream sm:text-6xl">
            Dónde y cómo
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Columna izquierda: acciones + horario */}
          <div className="flex flex-col gap-6">
            {/* Tarjetas de acción */}
            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="card group flex flex-col gap-3 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#25D366] hover:shadow-hard"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#25D366] text-white">
                  <FaWhatsapp className="text-xl" />
                </span>
                <span>
                  <span className="block font-display text-xl uppercase text-cream">WhatsApp</span>
                  <span className="text-sm text-muted">{BUSINESS.phoneDisplay}</span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wide text-amber">
                  Pedir ahora →
                </span>
              </a>

              <a
                href={`tel:${BUSINESS.phoneTel}`}
                className="card group flex flex-col gap-3 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-amber hover:shadow-hard"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber text-bg">
                  <FiPhone className="text-xl" />
                </span>
                <span>
                  <span className="block font-display text-xl uppercase text-cream">Llámanos</span>
                  <span className="text-sm text-muted">{BUSINESS.phoneDisplay}</span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wide text-amber">
                  Marcar →
                </span>
              </a>
            </div>

            {/* Dirección */}
            <div className="card flex items-start gap-4 p-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-flame/15 text-flame">
                <FiMapPin className="text-xl" />
              </span>
              <div>
                <p className="font-display text-lg uppercase text-cream">Dirección</p>
                <p className="mt-1 text-sm text-muted">{BUSINESS.fullAddress}</p>
                <a
                  href={BUSINESS.mapsDirections}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber hover:text-cream"
                >
                  <FiNavigation /> Cómo llegar
                </a>
              </div>
            </div>

            {/* Horario */}
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 font-display text-lg uppercase text-cream">
                  <FiClock className="text-amber" /> Horario
                </p>
                <OpenStatus state={openState} />
              </div>
              <ul className="mt-4 divide-y divide-line/70">
                {WEEK_ORDER.map((d) => {
                  const h = hours.find((x) => x.day === d)
                  const isToday = d === todayIdx
                  return (
                    <li
                      key={d}
                      className={`flex items-center justify-between py-2.5 text-sm ${
                        isToday ? 'font-bold text-cream' : 'text-muted'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {DAY_NAMES[d]}
                        {isToday && (
                          <span className="rounded-full bg-flame px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-cream">
                            Hoy
                          </span>
                        )}
                      </span>
                      <span>
                        {!h || h.closed
                          ? 'Cerrado'
                          : `${prettyTime(h.open)} – ${prettyTime(h.close)}`}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Columna derecha: mapa */}
          <Reveal delay={0.05} className="h-full">
            <div className="h-full min-h-[420px] overflow-hidden rounded-3xl border-2 border-line shadow-hard-lg">
              <iframe
                title={`Mapa de ${BUSINESS.name}`}
                src={BUSINESS.mapsEmbed}
                className="h-full min-h-[420px] w-full"
                style={{ border: 0, filter: 'grayscale(0.2) contrast(1.05)' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
