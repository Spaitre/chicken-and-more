// Botón flotante de WhatsApp, siempre accesible.
import { motion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import { BUSINESS } from '../lib/config'
import { buildMessageLink } from '../lib/whatsapp'

export default function FloatingWhatsApp() {
  const link = buildMessageLink(`¡Hola ${BUSINESS.name}! Quiero hacer un pedido.`)
  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-hard-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#20bd5a] focus-visible:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 transition-transform duration-700 group-hover:scale-125 group-hover:opacity-0" />
      <FaWhatsapp className="relative text-2xl" />
    </motion.a>
  )
}
