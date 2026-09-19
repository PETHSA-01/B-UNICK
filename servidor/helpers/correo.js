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

module.exports = {
    crearTransporter,
    enviarCorreo
};