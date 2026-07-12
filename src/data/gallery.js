// ============================================================================
//  GALERÍA — Chicken and More
//  "src" apunta primero a un archivo local en /public/gallery.
//  Si no existe, SafeImage usa "fallback" (imagen remota) y, si también
//  falla, muestra un marcador con el nombre del negocio.
//  Para usar tus fotos: coloca 1.jpg … 6.jpg en /public/gallery/ y listo.
// ============================================================================

export const GALLERY = [
  {
    id: 'g1',
    src: '/gallery/1.jpg',
    fallback:
      'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=1200&q=80',
    alt: 'Orden de alitas bañadas en salsa buffalo.',
  },
  {
    id: 'g2',
    src: '/gallery/2.jpg',
    fallback:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
    alt: 'Hamburguesa doble con tocino y queso derretido.',
  },
  {
    id: 'g3',
    src: '/gallery/3.jpg',
    fallback:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
    alt: 'Pizza recién salida del horno con pepperoni.',
  },
  {
    id: 'g4',
    src: '/gallery/4.jpg',
    fallback:
      'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=1200&q=80',
    alt: 'Boneless crujiente con aderezo ranch.',
  },
  {
    id: 'g5',
    src: '/gallery/5.jpg',
    fallback:
      'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80',
    alt: 'Papas a la francesa con queso fundido y tocino.',
  },
  {
    id: 'g6',
    src: '/gallery/6.jpg',
    fallback:
      'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=80',
    alt: 'Mesa para compartir con alitas, papas y bebidas.',
  },
]
