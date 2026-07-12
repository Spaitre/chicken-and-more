import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AdminApp from './admin/AdminApp'
import './index.css'

// Enrutamiento mínimo: /admin monta el panel; el resto, el sitio público.
const path = window.location.pathname.replace(/\/+$/, '')
const esAdmin = path === '/admin' || path.startsWith('/admin/')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{esAdmin ? <AdminApp /> : <App />}</React.StrictMode>
)
