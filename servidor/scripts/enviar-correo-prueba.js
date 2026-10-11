require('dotenv').config();
const { enviarCorreo, describirErrorCorreo } = require('../helpers/correo');

async function principal() {
    const destinatario = process.argv[2] || process.env.MAIL_FROM;
    console.log('Enviando correo de prueba a:', destinatario);
    await enviarCorreo({
        to: destinatario,
        subject: 'B-unick · Prueba de correo (Gmail API)',
        html: '<h2>¡Hola, cariño! 👋</h2><p>Si recibes este correo, el envío mediante la Gmail API funciona correctamente.</p>'
    });
    console.log('Correo enviado correctamente.');
}

principal().catch(err => {
    console.error('Error al enviar:', describirErrorCorreo(err));
    process.exitCode = 1;
});