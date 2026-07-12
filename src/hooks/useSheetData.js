// ============================================================================
//  useSheetData — carga datos desde un CSV publicado de Google Sheets con
//  validación por fila y FALLBACK a datos locales.
//
//  - Si la URL está vacía → usa fallback local inmediatamente.
//  - Si el fetch falla, el CSV es inválido, o ninguna fila pasa la validación
//    → usa fallback local.
//  - Nunca deja la UI vacía por un error de la hoja.
// ============================================================================

import { useEffect, useState } from 'react'
import { parseCSV } from '../lib/csv'

export function useSheetData(url, validateRow, fallback) {
  const [data, setData] = useState(fallback)
  const [source, setSource] = useState('local') // 'local' | 'sheet'
  const [loading, setLoading] = useState(!!url)

  useEffect(() => {
    let cancelled = false

    if (!url) {
      setData(fallback)
      setSource('local')
      setLoading(false)
      return
    }

    setLoading(true)

    fetch(url, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then((text) => {
        if (cancelled) return
        const rows = parseCSV(text)
        const valid = rows.map(validateRow).filter(Boolean)

        if (valid.length === 0) {
          // Hoja vacía o inválida → fallback.
          setData(fallback)
          setSource('local')
        } else {
          setData(valid)
          setSource('sheet')
        }
      })
      .catch((err) => {
        if (cancelled) return
        console.warn(
          '[useSheetData] Fallo al cargar la hoja, usando datos locales:',
          err.message
        )
        setData(fallback)
        setSource('local')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [url])

  return { data, source, loading }
}
