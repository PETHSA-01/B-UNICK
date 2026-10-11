const nodemailer = require('nodemailer');

function crearTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

async function enviarCorreo({ to, subject, html }) {
    const transporter = crearTransporter();
    return transporter.sendMail({
        from: '"B-unick" ',
        to,
        subject,
        html
    });
}

// Escapa caracteres con significado en HTML antes de interpolar valores
// dinámicos (p. ej. el nombre de usuario) en el cuerpo de un correo.
function escaparHtml(valor) {
    if (valor === null || valor === undefined) return '';
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

module.exports = {
    crearTransporter,
    enviarCorreo,
    escaparHtml
};