// ============================================================================
//  useScrollSpy — resalta el enlace de la sección visible en la navegación
//  lateral. Observa cada sección con IntersectionObserver.
// ============================================================================

import { useEffect, useState } from 'react'

export function useScrollSpy(ids, options = {}) {
  const [activeId, setActiveId] = useState(ids[0] || '')

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Toma la sección visible más cercana a la parte superior.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        // La "línea" de detección está a ~40% desde arriba de la pantalla.
        rootMargin: options.rootMargin || '-40% 0px -55% 0px',
        threshold: 0,
      }
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [ids.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps

  return activeId
}
