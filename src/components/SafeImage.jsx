// ============================================================================
//  SafeImage — <img> con fallback en cascada.
//  1) intenta "src" (archivo local)
//  2) si falla, intenta "fallback" (imagen remota)
//  3) si también falla, muestra un marcador con el nombre del negocio
// ============================================================================

import { useState } from 'react'

export default function SafeImage({ src, fallback, alt = '', className = '', ...rest }) {
  const [stage, setStage] = useState(0) // 0=src, 1=fallback, 2=placeholder
  const current = stage === 0 ? src : stage === 1 ? fallback : null

  if (stage >= 2 || !current) {
    return (
      <div
        className={`flex items-center justify-center bg-card2 text-line ${className}`}
        role="img"
        aria-label={alt}
      >
        <span className="select-none px-4 text-center font-display text-xl uppercase tracking-wider text-line">
          Chicken&nbsp;and&nbsp;More
        </span>
      </div>
    )
  }

  return (
    <img
      src={current}
      alt={alt}
      loading="lazy"
      onError={() => setStage((s) => s + 1)}
      className={className}
      {...rest}
    />
  )
}
