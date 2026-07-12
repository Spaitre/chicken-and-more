// ============================================================================
//  Galería — grid irregular (bento) con imágenes que hacen fallback.
// ============================================================================

import { GALLERY } from '../data/gallery'
import Reveal from './Reveal'
import SafeImage from './SafeImage'

// Tamaños de celda para el mosaico (se repiten si hay más fotos).
const SPANS = [
  'sm:col-span-2 sm:row-span-2',
  '',
  '',
  '',
  'sm:col-span-2',
  '',
]

export default function Gallery() {
  return (
    <section
      id="galeria"
      className="scroll-mt-24 border-y-2 border-line bg-card/40 px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="eyebrow">📸 El antojo</p>
          <h2 className="mt-3 font-display text-5xl uppercase leading-none text-cream sm:text-6xl">
            Directo de la cocina
          </h2>
        </Reveal>

        <div className="mt-10 grid auto-rows-[180px] grid-cols-2 gap-4 sm:grid-cols-4">
          {GALLERY.map((img, i) => (
            <Reveal
              key={img.id}
              delay={(i % 4) * 0.05}
              className={`group h-full ${SPANS[i % SPANS.length]}`}
            >
              <div className="h-full overflow-hidden rounded-2xl border-2 border-line">
                <SafeImage
                  src={img.src}
                  fallback={img.fallback}
                  alt={img.alt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
