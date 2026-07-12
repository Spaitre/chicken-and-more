// ============================================================================
//  Reseñas — tarjetas + botón "Déjanos tu reseña en Google" + seguir en redes.
//  Fuente: Google Sheets → fallback local.
// ============================================================================

import { FiStar } from 'react-icons/fi'
import { FaGoogle, FaInstagram, FaFacebookF } from 'react-icons/fa'
import { SHEETS, BUSINESS } from '../lib/config'
import { validateReviewRow } from '../lib/csv'
import { useSheetData } from '../hooks/useSheetData'
import { REVIEWS } from '../data/reviews'
import Reveal from './Reveal'

function Stars({ n }) {
  return (
    <div className="flex gap-0.5" aria-label={`${n} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar
          key={i}
          className={i < n ? 'fill-amber text-amber' : 'text-line'}
        />
      ))}
    </div>
  )
}

export default function Reviews() {
  const { data: reviews } = useSheetData(SHEETS.reviews, validateReviewRow, REVIEWS)

  return (
    <section id="resenas" className="scroll-mt-24 px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">⭐ Lo que dicen</p>
              <h2 className="mt-3 font-display text-5xl uppercase leading-none text-cream sm:text-6xl">
                Reseñas reales
              </h2>
              <div className="mt-4 flex items-center gap-3">
                <span className="font-display text-4xl text-amber">{BUSINESS.rating}</span>
                <div>
                  <Stars n={Math.round(BUSINESS.rating)} />
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-muted">
                    {BUSINESS.reviewCount} reseñas en Google
                  </p>
                </div>
              </div>
            </div>

            <a
              href={BUSINESS.googleReview}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-amber"
            >
              <FaGoogle /> Déjanos tu reseña
            </a>
          </div>
        </Reveal>

        {/* Tarjetas */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.id} delay={(i % 3) * 0.06}>
              <figure className="card flex h-full flex-col p-6">
                <Stars n={r.stars} />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-cream/90">
                  “{r.text}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t-2 border-line pt-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-line bg-card2 font-display text-lg text-amber">
                    {r.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-cream">{r.name}</span>
                    {r.date && (
                      <span className="block text-xs text-muted">{r.date}</span>
                    )}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        {/* Seguir en redes */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <span className="text-sm font-bold uppercase tracking-wide text-muted">
            Síguenos:
          </span>
          <a
            href={BUSINESS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border-2 border-line px-5 py-2.5 text-sm font-bold text-cream transition-colors hover:border-amber hover:text-amber"
          >
            <FaInstagram /> Instagram
          </a>
          <a
            href={BUSINESS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border-2 border-line px-5 py-2.5 text-sm font-bold text-cream transition-colors hover:border-amber hover:text-amber"
          >
            <FaFacebookF /> Facebook
          </a>
        </div>
      </div>
    </section>
  )
}
