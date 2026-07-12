// Error con código HTTP para respuestas controladas de la API.
export class ApiError extends Error {
  constructor(status, message, code = null) {
    super(message)
    this.status = status
    this.code = code
  }
}

/** Envuelve un handler async para que los rechazos lleguen al middleware de errores. */
export const ah = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)
