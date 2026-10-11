const rateLimit = require('express-rate-limit');

// Limitadores de tasa para los endpoints sensibles de autenticación.
// No dependen de la BD: usan memoria (suficiente para un único servicio;
// si algún día se escala horizontalmente habría que compartir el store).
// `trust proxy` está activado en index.js, así que req.ip respeta
// X-Forwarded-For del proxy de Render.

function responderLimite(mensaje) {
    return (req, res) => {
        res.status(429).json({ error: mensaje });
    };
}

// Login / validación de credenciales: frena fuerza bruta por IP.
const limitadorLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: responderLimite('Demasiados intentos. Espera unos minutos e inténtalo de nuevo.')
});

// Envío de correos (verificación / restablecimiento / reenvío):
// evita el abuso masivo y el consumo del plan de Gmail.
const limitadorCorreo = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: responderLimite('Demasiadas solicitudes. Espera un momento antes de volver a intentarlo.')
});

// Registro: limita la creación de cuentas y las comprobaciones de disponibilidad.
const limitadorRegistro = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: responderLimite('Demasiados registros desde tu conexión. Espera un momento.')
});

module.exports = {
    limitadorLogin,
    limitadorCorreo,
    limitadorRegistro
};
