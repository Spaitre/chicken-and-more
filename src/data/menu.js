// ============================================================================
//  MENÚ LOCAL (fallback) — Chicken and More
//  Se usa si Google Sheets no está configurado o falla.
//  Estructura idéntica a la que produce el validador de CSV.
//    sizes:   [{ name, price }]  (opcional; si existe, manda sobre "price")
//    flavors: ['BBQ', ...]       (opcional)
//    price:   precio base cuando no hay tamaños
//    tag:     etiqueta corta opcional (p. ej. "Picante", "Nuevo")
// ============================================================================

// Salsas de la casa disponibles para alitas y boneless.
const SALSAS = [
  'BBQ',
  'Buffalo',
  'Mango Habanero',
  'Lemon Pepper',
  'Teriyaki',
  'BBQ Chipotle',
  'Ajo Parmesano',
  'Habanero Extremo',
]

export const MENU = [
  // ---------------- Boneless ----------------
  {
    id: 'bon-clasico',
    category: 'Boneless',
    name: 'Boneless de la Casa',
    description:
      'Trozos de pechuga empanizados y crujientes, bañados en la salsa que elijas.',
    sizes: [
      { name: 'Media (250 g)', price: 119 },
      { name: 'Orden (500 g)', price: 199 },
      { name: 'Familiar (1 kg)', price: 359 },
    ],
    flavors: SALSAS,
    tag: 'El más pedido',
    featured: true,
    active: true,
  },
  {
    id: 'bon-mixto',
    category: 'Boneless',
    name: 'Boneless Bañado Doble',
    description:
      'Media orden con dos salsas distintas para no pelear con nadie. Elige tu favorita primero.',
    sizes: [
      { name: 'Orden (500 g)', price: 215 },
      { name: 'Familiar (1 kg)', price: 385 },
    ],
    flavors: SALSAS,
    tag: '2 salsas',
    featured: false,
    active: true,
  },

  // ---------------- Alitas ----------------
  {
    id: 'ali-clasicas',
    category: 'Alitas',
    name: 'Alitas de la Parrilla',
    description:
      'Alitas jugosas y crujientes, glaseadas en tu salsa. Acompañadas de aderezo ranch o azul.',
    sizes: [
      { name: '6 piezas', price: 135 },
      { name: '12 piezas', price: 245 },
      { name: '24 piezas', price: 459 },
    ],
    flavors: SALSAS,
    tag: 'Con aderezo',
    featured: true,
    active: true,
  },
  {
    id: 'ali-boneless-combo',
    category: 'Alitas',
    name: 'Combo Ala + Boneless',
    description:
      '6 alitas y 250 g de boneless para compartir, con papas a la francesa incluidas.',
    price: 289,
    sizes: [],
    flavors: SALSAS,
    tag: 'Para 2',
    featured: false,
    active: true,
  },

  // ---------------- Hamburguesas ----------------
  {
    id: 'burg-clasica',
    category: 'Hamburguesas',
    name: 'Burger Clásica',
    description:
      'Carne de res 150 g, queso amarillo, lechuga, jitomate y salsa de la casa en pan brioche.',
    price: 129,
    sizes: [],
    flavors: [],
    tag: '',
    featured: false,
    active: true,
  },
  {
    id: 'burg-bbq-bacon',
    category: 'Hamburguesas',
    name: 'BBQ Bacon Burger',
    description:
      'Doble tocino, aros de cebolla, queso cheddar y salsa BBQ ahumada. Para los que van con todo.',
    price: 165,
    sizes: [],
    flavors: [],
    tag: 'Recomendada',
    featured: true,
    active: true,
  },
  {
    id: 'burg-crispy',
    category: 'Hamburguesas',
    name: 'Crispy Chicken Burger',
    description:
      'Filete de pollo crujiente, mayo chipotle, pepinillos y lechuga. También la puedes pedir picante.',
    price: 149,
    sizes: [],
    flavors: ['Normal', 'Picante'],
    tag: '',
    featured: false,
    active: true,
  },
  {
    id: 'burg-doble',
    category: 'Hamburguesas',
    name: 'Doble Monster',
    description:
      'Doble carne, doble queso, tocino y cebolla caramelizada. Un reto de dos manos.',
    price: 189,
    sizes: [],
    flavors: [],
    tag: 'XL',
    featured: false,
    active: true,
  },

  // ---------------- Pizzas ----------------
  {
    id: 'pizza-pepperoni',
    category: 'Pizzas',
    name: 'Pizza Pepperoni',
    description:
      'Masa fresca del día, salsa de tomate de la casa, mozzarella y pepperoni generoso.',
    sizes: [
      { name: 'Personal', price: 99 },
      { name: 'Mediana', price: 169 },
      { name: 'Grande', price: 229 },
      { name: 'Familiar', price: 289 },
    ],
    flavors: [],
    tag: '',
    featured: false,
    active: true,
  },
  {
    id: 'pizza-boneless',
    category: 'Pizzas',
    name: 'Pizza Boneless',
    description:
      'Nuestra especialidad: boneless bañado en BBQ o buffalo sobre pizza con doble queso.',
    sizes: [
      { name: 'Mediana', price: 199 },
      { name: 'Grande', price: 259 },
      { name: 'Familiar', price: 319 },
    ],
    flavors: ['BBQ', 'Buffalo', 'Mango Habanero'],
    tag: 'De la casa',
    featured: true,
    active: true,
  },
  {
    id: 'pizza-suprema',
    category: 'Pizzas',
    name: 'Pizza Suprema',
    description:
      'Pepperoni, salchicha, champiñón, pimiento y cebolla. La de siempre, bien servida.',
    sizes: [
      { name: 'Mediana', price: 189 },
      { name: 'Grande', price: 249 },
      { name: 'Familiar', price: 309 },
    ],
    flavors: [],
    tag: '',
    featured: false,
    active: true,
  },
  {
    id: 'pizza-hawaiana',
    category: 'Pizzas',
    name: 'Pizza Hawaiana',
    description: 'Jamón y piña sobre mozzarella. Sí, aquí sí se vale.',
    sizes: [
      { name: 'Mediana', price: 169 },
      { name: 'Grande', price: 229 },
      { name: 'Familiar', price: 289 },
    ],
    flavors: [],
    tag: '',
    featured: false,
    active: true,
  },

  // ---------------- Complementos ----------------
  {
    id: 'comp-papas',
    category: 'Complementos',
    name: 'Papas a la Francesa',
    description: 'Doradas y crujientes, con sal de la casa.',
    sizes: [
      { name: 'Chica', price: 49 },
      { name: 'Grande', price: 79 },
    ],
    flavors: [],
    tag: '',
    featured: false,
    active: true,
  },
  {
    id: 'comp-papas-queso',
    category: 'Complementos',
    name: 'Papas Gajo con Queso',
    description: 'Papas gajo cubiertas de queso fundido y tocino en trozos.',
    price: 89,
    sizes: [],
    flavors: [],
    tag: 'Antojo',
    featured: true,
    active: true,
  },
  {
    id: 'comp-aros',
    category: 'Complementos',
    name: 'Aros de Cebolla',
    description: 'Empanizados crujientes, con aderezo chipotle.',
    price: 79,
    sizes: [],
    flavors: [],
    tag: '',
    featured: false,
    active: true,
  },
  {
    id: 'comp-dedos',
    category: 'Complementos',
    name: 'Dedos de Queso (6 pz)',
    description: 'Mozzarella empanizada con salsa marinara.',
    price: 89,
    sizes: [],
    flavors: [],
    tag: '',
    featured: false,
    active: true,
  },

  // ---------------- Bebidas ----------------
  {
    id: 'beb-refresco',
    category: 'Bebidas',
    name: 'Refresco',
    description: 'Servido bien frío. Elige tu sabor.',
    sizes: [
      { name: 'Vaso', price: 35 },
      { name: 'Jarra 1 L', price: 75 },
    ],
    flavors: ['Coca-Cola', 'Sprite', 'Fanta', 'Manzana', 'Sin azúcar'],
    tag: '',
    featured: false,
    active: true,
  },
  {
    id: 'beb-limonada',
    category: 'Bebidas',
    name: 'Limonada / Naranjada',
    description: 'Preparada al momento, natural o mineral.',
    sizes: [
      { name: 'Chica', price: 39 },
      { name: 'Grande', price: 59 },
    ],
    flavors: ['Limonada natural', 'Limonada mineral', 'Naranjada'],
    tag: '',
    featured: false,
    active: true,
  },
  {
    id: 'beb-agua',
    category: 'Bebidas',
    name: 'Agua Fresca del Día',
    description: 'Jamaica, horchata o el sabor de la temporada.',
    price: 39,
    sizes: [],
    flavors: ['Jamaica', 'Horchata', 'Del día'],
    tag: '',
    featured: false,
    active: true,
  },
  {
    id: 'beb-michelada',
    category: 'Bebidas',
    name: 'Michelada Preparada',
    description: 'Con chamoy, clamato y el toque picante de la casa. (Solo mayores de edad.)',
    price: 89,
    sizes: [],
    flavors: [],
    tag: '+18',
    featured: false,
    active: true,
  },
]

// Orden en que se muestran las categorías del menú.
export const MENU_CATEGORIES = [
  'Boneless',
  'Alitas',
  'Hamburguesas',
  'Pizzas',
  'Complementos',
  'Bebidas',
]
