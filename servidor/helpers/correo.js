const MailComposer = require('nodemailer/lib/mail-composer');

const URL_TOKEN_GOOGLE = 'https://oauth2.googleapis.com/token';
const URL_GMAIL_SEND = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

// El access token se cachea hasta ~1 min antes de expirar para no pedir uno
// nuevo a oauth2.googleapis.com en cada envío.
let tokenCache = { token: null, caducaEn: 0 };

function direccionRemitente() {
    const nombre = process.env.MAIL_FROM_NAME || 'B-unick';
    const correo = process.env.MAIL_FROM;
    return `"${nombre}" <${correo}>`;
}

// Escapa texto que se interpola en el HTML de un correo (por ejemplo el
// nombre de usuario). Evita inyección de HTML/enlaces en los correos
// transaccionales si alguien registra un nombre con <, >, ", ', &.
function escaparHtml(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function leerCuerpoJson(respuesta) {
    try {
        const cuerpo = await respuesta.text();
        return JSON.parse(cuerpo);
    } catch (err) {
        return {};
    }
}

function crearErrorCorreo(mensaje, extra) {
    return Object.assign(new Error(mensaje), extra || {});
}

function describirCausa(causa) {
    if (!causa) return '';
    const mensaje = causa.message || String(causa);
    if (causa.errors) {
        try {
            return `${mensaje} [${causa.errors.map(e => e.message).filter(Boolean).join('; ')}]`;
        } catch (err) {
            return mensaje;
        }
    }
    return mensaje;
}

async function obtenerTokenAcceso() {
    if (tokenCache.token && Date.now() < tokenCache.caducaEn - 60000) {
        return tokenCache.token;
    }

    const parametros = new URLSearchParams({
        client_id: process.env.GMAIL_CLIENT_ID,
        client_secret: process.env.GMAIL_CLIENT_SECRET,
        refresh_token: process.env.GMAIL_REFRESH_TOKEN,
        grant_type: 'refresh_token'
    });

    let respuesta;
    try {
        respuesta = await fetch(URL_TOKEN_GOOGLE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: parametros.toString()
        });
    } catch (err) {
        throw crearErrorCorreo('No se pudo contactar a oauth2.googleapis.com', {
            code: 'RED_ERROR',
            causa: err
        });
    }

    if (!respuesta.ok) {
        const cuerpo = await leerCuerpoJson(respuesta);
        throw crearErrorCorreo(`OAuth fallo al pedir access_token (HTTP ${respuesta.status})`, {
            status: respuesta.status,
            detail: cuerpo.error_description || cuerpo.error,
            error: cuerpo.error,
            original: cuerpo
        });
    }

    const datos = await respuesta.json();
    if (!datos.access_token) {
        throw crearErrorCorreo('OAuth no devolvio access_token', { original: datos });
    }

    tokenCache.token = datos.access_token;
    tokenCache.caducaEn = Date.now() + (datos.expires_in || 3599) * 1000;
    return tokenCache.token;
}

async function construirMensajeRaw({ to, subject, html }) {
    const composer = new MailComposer({
        from: direccionRemitente(),
        to,
        subject,
        html
    });
    const mensaje = await composer.compile().build();
    return Buffer.from(mensaje).toString('base64url');
}

async function enviarCorreo({ to, subject, html }) {
    const token = await obtenerTokenAcceso();
    const raw = await construirMensajeRaw({ to, subject, html });

    let respuesta;
    try {
        respuesta = await fetch(URL_GMAIL_SEND, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ raw })
        });
    } catch (err) {
        throw crearErrorCorreo('No se pudo contactar a gmail.googleapis.com', {
            code: 'RED_ERROR',
            causa: err
        });
    }

    if (!respuesta.ok) {
        const cuerpo = await leerCuerpoJson(respuesta);
        throw crearErrorCorreo(`Gmail API rechazo el envio (HTTP ${respuesta.status})`, {
            status: respuesta.status,
            detail: cuerpo.error && cuerpo.error.message,
            error: cuerpo.error && cuerpo.error.reason,
            original: cuerpo
        });
    }

    return respuesta.json();
}

// Detalle util de un fallo al enviar con Gmail API para diagnostico: estado
// HTTP, subcódigo/razón de Google y causa de red cuando aplica.
function describirErrorCorreo(error) {
    if (!error) return 'Error desconocido';
    const partes = [error.message || String(error)];
    if (error.status) partes.push(`status=${error.status}`);
    if (error.code) partes.push(`code=${error.code}`);
    if (error.error) partes.push(`error=${String(error.error).trim()}`);
    if (error.detail) partes.push(`detail=${String(error.detail).trim()}`);
    const causa = describirCausa(error.causa);
    if (causa) partes.push(`causa=${causa}`);
    return partes.join(' | ');
}

module.exports = {
    enviarCorreo,
    describirErrorCorreo,
    escaparHtml
};