// ============================================================================
//  App — página única con NAVEGACIÓN LATERAL + sistema de pedidos.
//  El estado de apertura y el horario provienen del backend (StoreContext),
//  fuente de verdad única. Promos/reseñas siguen siendo locales.
//  Orden: Hero → Menú → (Promos) → Nosotros → Galería → Reseñas → Contacto.
// ============================================================================

import { useMemo } from 'react'
import { StoreProvider, useStore } from './context/StoreContext'
import { CartProvider } from './context/CartContext'
import { TrackerProvider } from './context/TrackerContext'

import Sidebar from './components/Sidebar'
import StatusBanner from './components/StatusBanner'
import Hero from './components/Hero'
import Menu from './components/Menu'
import Promos from './components/Promos'
import About from './components/About'
import Gallery from './components/Gallery'
import Reviews from './components/Reviews'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Cart from './components/Cart'
import OrderTracker from './components/OrderTracker'
import FloatingWhatsApp from './components/FloatingWhatsApp'

function Shell() {
  const { estado } = useStore()

  // Estado de apertura para el componente OpenStatus (shape { open, nextChange }).
  const openState = useMemo(
    () => ({ open: estado.abierto, nextChange: estado.proximoCambio }),
    [estado.abierto, estado.proximoCambio]
  )

  // Horario en el shape que espera Contact ({ day, open, close, closed }).
  const hours = useMemo(
    () =>
      (estado.horarios || []).map((h) => ({
        day: h.dia,
        open: h.abre,
        close: h.cierra,
        closed: h.cerrado,
      })),
    [estado.horarios]
  )

  return (
    <>
      <Sidebar openState={openState} />

      {/* Contenido: deja espacio para la barra lateral (desktop) / superior (móvil). */}
      <div className="pt-16 lg:pl-72 lg:pt-0">
        <StatusBanner />
        <main>
          <Hero openState={openState} />
          <Menu />
          <Promos />
          <About />
          <Gallery />
          <Reviews />
          <Contact hours={hours} openState={openState} />
        </main>
        <Footer />
      </div>

      <Cart />
      <OrderTracker />
      <FloatingWhatsApp />
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <TrackerProvider>
        <CartProvider>
          <Shell />
        </CartProvider>
      </TrackerProvider>
    </StoreProvider>
  )
}
