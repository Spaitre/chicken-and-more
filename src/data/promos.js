// ============================================================================
//  PROMOCIONES LOCALES (fallback) — Chicken and More
//  La sección se OCULTA sola si no hay promos con active: true.
//  Pon active: false (o "no" en la hoja) para esconder una promo.
// ============================================================================

export const PROMOS = [
  {
    id: 'martes-alitas',
    title: 'Martes de Alitas',
    description:
      'Todas las alitas al 2x1 durante todo el día. Aplica solo en piezas del mismo tamaño.',
    tag: 'Cada martes',
    price: '2x1',
    active: true,
  },
  {
    id: 'combo-familiar',
    title: 'Combo Familiar',
    description:
      '1 kg de boneless + papas familiares + 4 refrescos. Para toda la banda.',
    tag: 'Para compartir',
    price: '$549',
    active: true,
  },
  {
    id: 'happy-hour',
    title: 'Happy Boneless',
    description:
      'De 3 a 6 pm, media orden de boneless por $89 con tu bebida. De lunes a viernes.',
    tag: '3 – 6 pm',
    price: '$89',
    active: true,
  },
  {
    id: 'noche-pizza',
    title: 'Jueves de Pizza',
    description:
      'Pizza grande de la casa a precio de mediana. Pídela boneless sin costo extra.',
    tag: 'Cada jueves',
    price: '-25%',
    active: true,
  },
]
