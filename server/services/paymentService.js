// ============================================================================
//  paymentService — pago anticipado con pasarela real (MercadoPago) y modo
//  simulado como respaldo para poder probar el flujo completo SIN llaves.
//
//  Proveedor por env PAYMENT_PROVIDER:
//    · 'mercadopago' (auto si hay MP_ACCESS_TOKEN): crea una preference de
//      Checkout Pro; el webhook confirma el pago.
//    · 'manual' (por defecto): devuelve una URL local que simula el pago
//      (marca el pedido como pagado) — ideal para desarrollo/QA.
//  Stripe se puede añadir aquí con la misma interfaz sin tocar el resto.
//
//  NOTA: paymentService NO importa orderService (evita ciclos). Quien marca el
//  pedido como pagado es la ruta que llama a orderService.marcarPagado().
// ============================================================================
import { ApiError } from '../lib/ApiError.js'

const MP_TOKEN = process.env.MP_ACCESS_TOKEN || ''
const PROVIDER =
  process.env.PAYMENT_PROVIDER || (MP_TOKEN ? 'mercadopago' : 'manual')
const PUBLIC_URL = (process.env.PUBLIC_URL || '').replace(/\/$/, '')

export function proveedorPago() {
  return { proveedor: PROVIDER, simulado: PROVIDER === 'manual' }
}

/**
 * Inicia el cobro anticipado de un pedido.
 * Devuelve { metodo, url, ref, estado }.
 */
export async function iniciarPago({ codigo, total, nombre }) {
  if (PROVIDER === 'mercadopago') {
    try {
      return await iniciarMercadoPago({ codigo, total, nombre })
    } catch (e) {
      console.warn('[Pago] MercadoPago falló, se usa modo simulado:', e.message)
      return simulado(codigo)
    }
  }
  return simulado(codigo)
}

function simulado(codigo) {
  return {
    metodo: 'simulado',
    url: `/api/pagos/simular?codigo=${encodeURIComponent(codigo)}`,
    ref: '',
    estado: 'pendiente',
  }
}

async function iniciarMercadoPago({ codigo, total, nombre }) {
  const base = PUBLIC_URL || `http://localhost:${process.env.PORT || 3021}`
  const body = {
    items: [
      {
        title: `Pedido ${codigo} — Chicken and More`,
        quantity: 1,
        currency_id: 'MXN',
        unit_price: Number(total),
      },
    ],
    payer: { name: nombre },
    external_reference: codigo,
    notification_url: `${base}/api/pagos/webhook`,
    back_urls: {
      success: `${base}/api/pagos/retorno?codigo=${encodeURIComponent(codigo)}`,
      pending: `${base}/api/pagos/retorno?codigo=${encodeURIComponent(codigo)}`,
      failure: `${base}/api/pagos/retorno?codigo=${encodeURIComponent(codigo)}`,
    },
    auto_return: 'approved',
  }

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MP_TOKEN}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`MP ${res.status}`)
  const data = await res.json()
  return {
    metodo: 'mercadopago',
    url: data.init_point || data.sandbox_init_point,
    ref: data.id || '',
    estado: 'pendiente',
  }
}

/**
 * Procesa el webhook del proveedor. Devuelve { codigo, ref, metodo } si el pago
 * quedó aprobado, o null si aún no. Lanza ApiError si el proveedor no aplica.
 */
export async function procesarWebhook(query, body) {
  if (PROVIDER !== 'mercadopago') {
    throw new ApiError(400, 'Webhook no aplicable en este modo.')
  }
  // MercadoPago notifica con ?type=payment&data.id=... (o topic/id).
  const tipo = query.type || query.topic
  const pagoId = query['data.id'] || body?.data?.id || query.id
  if (tipo !== 'payment' || !pagoId) return null

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${pagoId}`, {
    headers: { Authorization: `Bearer ${MP_TOKEN}` },
  })
  if (!res.ok) throw new ApiError(502, 'No se pudo verificar el pago.')
  const pago = await res.json()
  if (pago.status !== 'approved') return null
  return {
    codigo: pago.external_reference,
    ref: String(pago.id),
    metodo: 'mercadopago',
  }
}
