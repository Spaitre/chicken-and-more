import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Reenvía las llamadas a la API hacia el backend de pedidos (server/index.js).
    proxy: {
      '/api': {
        target: 'http://localhost:3021',
        changeOrigin: true,
      },
    },
  },
})
