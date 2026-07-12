# Chicken and More — Sitio + Sistema de Pedidos

Sitio de una sola página **con sistema de pedidos para recoger** (alitas, boneless,
pizzas y hamburguesas) para Mexicali, B.C.

- **Frontend:** React + Vite + Tailwind + Framer Motion (navegación lateral).
- **Backend:** Express + `node:sqlite` + SSE (tiempo real). Sin dependencias pesadas.
- **Panel admin** en `/admin`. **Pago anticipado** con MercadoPago (o modo simulado).

---

## 1. Requisitos

- **Node.js ≥ 22.5** (se usa el módulo nativo `node:sqlite`). Verifica con `node -v`.

## 2. Arranque en desarrollo

```bash
npm install
npm run dev
```

Esto levanta **dos procesos** a la vez (con `concurrently`):

- **Backend** (API de pedidos) en `http://localhost:3021`.
- **Cliente** (Vite) en `http://localhost:5184`, que hace *proxy* de `/api` al backend.

Abre **http://localhost:5184** (sitio) y **http://localhost:5184/admin** (panel).

> ¿Solo quieres uno? `npm run dev:server` o `npm run dev:client`.

## 3. Producción

```bash
npm run build     # genera dist/
npm run start     # el backend sirve dist/ + la API en el MISMO puerto (3021)
```

En producción necesitas un **host con Node** (Render, Railway, un VPS, etc.).
Ya **no** basta un hosting estático, porque hay backend y base de datos.

---

## 4. Configuración

### 4.1 Datos del negocio (frontend)
`src/lib/config.js` → nombre, teléfono, WhatsApp, dirección, redes, mapa, rating.
Cambia también el `index.html` (SEO / Open Graph / JSON‑LD) y las imágenes.

### 4.2 Variables de entorno (backend)
Copia `.env.example` a **`.env`** y ajusta:

| Variable | Para qué |
|---|---|
| `PORT` | Puerto del backend (3021 por defecto). |
| `ADMIN_PASSWORD` | Contraseña del panel `/admin`. **¡Cámbiala!** |
| `PAYMENT_PROVIDER` | `mercadopago` o `manual` (simulado). |
| `MP_ACCESS_TOKEN` | Access Token de MercadoPago (activa el cobro real). |
| `PUBLIC_URL` | URL pública del sitio (para pagos). |
| `DATA_DIR` | Carpeta de la base SQLite (por defecto `./data`). |

La base de datos se crea sola en `data/chicken.db` la primera vez, con el menú y el
horario **de semilla** (tomados de `src/data/menu.js` y `src/lib/config.js`).

---

## 5. El menú vive en el panel admin

A diferencia de un sitio estático, **el menú para pedir se administra desde `/admin`**
(pestaña *Productos*): precios, disponibilidad (agotado/oculto) y **tiempo de
preparación** por producto. Los archivos `src/data/menu.js` solo se usan como
**semilla inicial** y como *fallback* si el backend no responde.

---

## 6. Cómo funciona el sistema de pedidos

### Cliente (sitio)
1. Explora el menú, elige **cantidad** y opciones (tamaño/sabor) y agrega al carrito.
2. En el carrito toca **Continuar**, llena **nombre, teléfono y comentarios**.
3. Ve el **tiempo estimado** y confirma. **Solo para recoger en el local.**
4. Recibe un **código** (p. ej. `CM-AB12`) y una pantalla de **seguimiento en vivo**.
5. Puede volver luego con **“Seguir pedido”** y su código.

### Tiempo estimado (control de saturación)
```
estimado = (mayor tiempo de preparación del pedido)
         + (pedidos activos en cola) × (minutos extra por pedido)
```
Ejemplo con base 20 y +10/cola: 20 → 30 → 40 → 50 min. Ambos parámetros se
configuran en *Ajustes*.

### Límite de capacidad
Si los **pedidos activos** llegan al **máximo simultáneo**, el sitio deja de aceptar
pedidos y muestra “a máxima capacidad”. Se reactiva solo al liberarse la cola.

### Horario
Los pedidos solo se aceptan dentro del **horario** (configurable por día en
*Ajustes*, con soporte para cierres después de medianoche). Fuera de horario el
sitio muestra “cocina cerrada”. También puedes **pausar la recepción** manualmente
sin cambiar el horario.

### Estados del pedido
`Recibido → Confirmado → En preparación → Listo para recoger → Entregado` (o
`Cancelado`). El cliente los ve en vivo; tú los cambias desde el panel.

### Pago anticipado (anti‑pedidos falsos)
- Pedidos **por debajo** del umbral: **pago al recoger**.
- Pedidos **iguales o mayores** al umbral (*Ajustes → umbral*): exigen **pago en
  línea** antes de confirmarse.
- El **teléfono** se valida (10 dígitos MX) en cliente y servidor.
- **MercadoPago:** define `MP_ACCESS_TOKEN` y `PUBLIC_URL`. Sin token, el sistema
  corre en **modo simulado** (el pago se marca como pagado automáticamente) para que
  puedas probar todo el flujo. Para Stripe, se puede añadir en
  `server/services/paymentService.js` con la misma interfaz.

---

## 7. Panel administrativo (`/admin`)

Entra con `ADMIN_PASSWORD`. Todo se actualiza **en vivo** (SSE):

- **Pedidos:** tablero en tiempo real; avanzar estado, **editar el tiempo estimado**,
  cancelar.
- **Historial:** pedidos entregados/cancelados.
- **Productos (inventario):** marcar **agotado**, **ocultar/mostrar**, reactivar;
  editar **precio** y **tiempo de preparación**.
- **Ajustes:** **pausar/reanudar** la recepción, **máximo simultáneo**, **minutos
  extra por pedido**, **umbral de pago anticipado** y **horarios** por día.

---

## 8. Estructura

```
chicken-and-more/
├── server/                 # Backend (Express + node:sqlite + SSE)
│   ├── index.js            # app, rutas, arranque
│   ├── env.js              # carga .env (nativo de Node)
│   ├── db/                 # schema.js (tablas + semilla), database.js (adaptador)
│   ├── lib/                # ApiError, codigo (folio), tiempo (horario + teléfono)
│   ├── services/           # config, menu, order, payment, adminAuth, realtime
│   └── routes/             # menu, orders, admin
├── src/                    # Frontend
│   ├── components/         # Hero, Menu, MenuItem, Cart, Checkout, OrderTracker,
│   │                       # StatusBanner, Sidebar, Promos, About, Gallery, …
│   ├── admin/              # AdminApp, Login, OrdersBoard, History, Products, Settings
│   ├── context/            # CartContext, StoreContext, TrackerContext
│   ├── hooks/              # useOpenStatus, useScrollSpy, …
│   ├── lib/                # api.js (cliente), config.js, time.js, whatsapp.js
│   └── data/               # menu/promos/reviews/gallery (semilla + fallback)
└── data/                   # base SQLite (se crea sola; ignorada por git)
```

## 9. Imágenes

Coloca las fotos en `public/gallery/` (`hero.jpg`, `1.jpg`…`6.jpg`, `about.jpg`).
Si falta alguna, el componente `SafeImage` usa una imagen de respaldo automáticamente.

## 10. Notas

- El botón de WhatsApp queda como **contacto** (dudas), no como método de pedido.
- Cambia `ADMIN_PASSWORD`, el `placeid` de Google (reseñas) y los datos de contacto
  antes de publicar.
- La carpeta `data/` (base SQLite) no debe subirse a git; ya está en `.gitignore`
  vía el patrón `*.local`/`.env`; agrega `data/` si hiciera falta.
