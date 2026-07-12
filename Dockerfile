# ============================================================================
#  Imagen de producción para Chicken and More (backend Node + build del frontend).
#  Node 24: incluye node:sqlite sin flag experimental.
# ============================================================================
FROM node:24-slim

WORKDIR /app

# Instala dependencias (incluye devDependencies para poder compilar con Vite).
COPY package*.json ./
RUN npm ci --include=dev

# Copia el código y compila el frontend a dist/.
COPY . .
RUN npm run build

# A partir de aquí, modo producción.
ENV NODE_ENV=production
# Railway inyecta PORT automáticamente; 3021 es solo el valor por defecto local.
ENV PORT=3021

# El backend sirve la API y el build del frontend en el MISMO puerto.
CMD ["node", "server/index.js"]
