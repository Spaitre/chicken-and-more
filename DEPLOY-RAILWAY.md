# Desplegar en Railway (demo temporal)

Guía para subir Chicken and More a Railway y enseñárselo al cliente. Railway corre
tu código **tal cual** (Node real), así que no hay que reescribir nada. El despliegue
usa el `Dockerfile` incluido.

> **Costo:** Railway ya no tiene plan 100% gratis permanente. Da un **trial con
> ~$5 USD de crédito** (suficiente para un demo de días) y luego el plan **Hobby**
> (~$5/mes). Para mostrarlo un rato, el crédito de prueba alcanza de sobra.

---

## Opción A — Railway CLI (recomendada, sin subir todo el monorepo)

Desde una terminal, **dentro de la carpeta `chicken-and-more`**:

```bash
# 1) Instala la CLI (una sola vez)
npm i -g @railway/cli

# 2) Inicia sesión (abre el navegador)
railway login

# 3) Crea un proyecto nuevo
railway init            # ponle un nombre, p. ej. "chicken-and-more-demo"

# 4) Despliega ESTA carpeta (Railway detecta el Dockerfile y compila en la nube)
railway up

# 5) Genera una URL pública
railway domain
```

Al terminar, `railway domain` te da una URL tipo
`https://chicken-and-more-demo-production.up.railway.app`. Ábrela: el sitio está en
`/` y el panel en `/admin`.

---

## Opción B — Desde GitHub

1. Sube el repo a GitHub (o solo esta carpeta).
2. En Railway: **New Project → Deploy from GitHub repo**.
3. Si es un monorepo, en **Settings → Root Directory** pon `chicken-and-more`.
4. Railway detecta el `Dockerfile` y despliega. En **Settings → Networking →
   Generate Domain** obtienes la URL pública.

---

## Variables de entorno (en el dashboard → pestaña *Variables*)

Para el demo basta con una:

| Variable | Valor sugerido | Nota |
|---|---|---|
| `ADMIN_PASSWORD` | *(elige una)* | Contraseña del panel `/admin`. |

Lo demás tiene buenos valores por defecto:

- **`PORT`** lo inyecta Railway solo (no lo pongas).
- **`PAYMENT_PROVIDER`** queda en `manual` → el pago anticipado corre en **modo
  simulado** (perfecto para el demo; el pedido grande "se paga" solo y sigues el flujo).
- Para cobro real con MercadoPago más adelante: agrega `MP_ACCESS_TOKEN` y
  `PUBLIC_URL=https://TU-URL.up.railway.app`.

---

## ¿Guardar los pedidos entre reinicios? (opcional)

Por defecto la base SQLite vive en el disco del contenedor, que **se reinicia con cada
redeploy** (se vuelve a sembrar el menú y se pierden los pedidos de prueba). Para un
demo suele estar bien. Si quieres que **persista**:

1. En el servicio de Railway: **Settings → Volumes → New Volume**.
2. **Mount path:** `/app/data`  (ahí guarda la base por defecto).

Listo: los pedidos, inventario y ajustes sobreviven a los reinicios.

---

## Comprobación rápida tras desplegar

- `https://TU-URL/` → carga el sitio.
- `https://TU-URL/admin` → panel (entra con `ADMIN_PASSWORD`).
- Haz un pedido de prueba en el sitio y velo aparecer **en vivo** en el panel.

> Cuando termines el demo, en Railway puedes **pausar o borrar** el servicio para no
> gastar crédito.
