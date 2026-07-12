// ============================================================================
//  CartContext — estado global del carrito/pedido.
//  Cada línea distingue producto + tamaño + sabor. Persiste en localStorage.
// ============================================================================

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { cartTotal } from '../lib/whatsapp'

const CartContext = createContext(null)

const STORAGE_KEY = 'chickenandmore_cart_v1'

/** Clave única por combinación producto+tamaño+sabor. */
function lineKey(product, size, flavor) {
  return [product.id, size?.name || '-', flavor || '-'].join('__')
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, size, flavor, qty = 1 } = action
      const add = Math.max(1, parseInt(qty, 10) || 1)
      const key = lineKey(product, size, flavor)
      const existing = state.find((it) => it.key === key)
      if (existing) {
        return state.map((it) =>
          it.key === key ? { ...it, qty: it.qty + add } : it
        )
      }
      return [
        ...state,
        {
          key,
          id: product.id,
          name: product.name,
          price: product.price,
          size: size || null,
          flavor: flavor || null,
          qty: add,
        },
      ]
    }
    case 'INC':
      return state.map((it) =>
        it.key === action.key ? { ...it, qty: it.qty + 1 } : it
      )
    case 'DEC':
      return state
        .map((it) => (it.key === action.key ? { ...it, qty: it.qty - 1 } : it))
        .filter((it) => it.qty > 0)
    case 'REMOVE':
      return state.filter((it) => it.key !== action.key)
    case 'CLEAR':
      return []
    case 'HYDRATE':
      return action.items
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [])
  const [isOpen, setIsOpen] = useState(false)

  // Hidratar desde localStorage al montar.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) dispatch({ type: 'HYDRATE', items: JSON.parse(raw) })
    } catch {
      /* ignora almacenamiento corrupto */
    }
  }, [])

  // Persistir en cada cambio.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* almacenamiento no disponible */
    }
  }, [items])

  const value = useMemo(() => {
    const count = items.reduce((n, it) => n + it.qty, 0)
    return {
      items,
      count,
      total: cartTotal(items),
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (product, size, flavor, qty = 1) => {
        // Agrega al pedido SIN abrir el carrito (el usuario lo abre cuando quiera).
        dispatch({ type: 'ADD', product, size, flavor, qty })
      },
      inc: (key) => dispatch({ type: 'INC', key }),
      dec: (key) => dispatch({ type: 'DEC', key }),
      remove: (key) => dispatch({ type: 'REMOVE', key }),
      clear: () => dispatch({ type: 'CLEAR' }),
    }
  }, [items, isOpen])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
