const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

router.get('/', (req, res) => {
    res.send('Hello World!');
})

router.post('/validacionregistro', async (req, res) => {
    const { email, username } = req.body;
    const pool = req.pool;

    if (!email) {
        return res.status(400).json({ error: 'El correo es requerido', field: 'email' });
    }
    if (!username) {
        return res.status(400).json({ error: 'El nombre de usuario es requerido', field: 'username' });
    }

    try {
        // Check email
        const [emailRows] = await pool.execute('SELECT id FROM usuarios WHERE correo = ?', [email]);
        if (emailRows.length > 0) {
            return res.status(409).json({ error: 'El correo ya se encuentra registrado', field: 'email' });
        }

        // Check username
        const [usernameRows] = await pool.execute('SELECT id FROM usuarios WHERE nombre_usuario = ?', [username]);
        if (usernameRows.length > 0) {
            return res.status(409).json({ error: 'El nombre de usuario ya está en uso', field: 'username' });
        }

        res.json({ success: true, message: 'Correo y usuario disponibles para registro' });
    } catch (error) {
        console.error('Error validando registro:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/preregistro', async (req, res) => {
    const {
        email,
        password,
        username,
        ojos,
        nariz, 
        labios,
        cara,
        colorPiel,
        tipoPiel,
        edad
    } = req.body;
    const pool = req.pool;

    if (!email || !password || !username) {
        return res.status(400).json({ error: 'Correo, contraseña y nombre de usuario son requeridos' });
    }

    if (!ojos || !nariz || !labios || !cara || !colorPiel || !tipoPiel || !edad) {
        return res.status(400).json({ error: 'Todas las características físicas y la edad son requeridas' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [existingUser] = await connection.execute('SELECT id FROM usuarios WHERE correo = ?', [email]);  
        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(409).json({ error: 'El correo ya se encuentra registrado' });
        }

        const [existingUsername] = await connection.execute('SELECT id FROM usuarios WHERE nombre_usuario = ?', [username]);
        if (existingUsername.length > 0) {
            await connection.rollback();
            return res.status(409).json({ error: 'El nombre de usuario ya está en uso' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [caracteristicascheck] = await connection.execute( 'SELECT id FROM caracteristicas_fisicas where forma_ojos = ? and tipo_nariz = ? and tipo_labios = ? and tipo_rostro = ? and color_piel = ? and tipo_piel = ?',
            [ojos, nariz, labios, cara, colorPiel, tipoPiel]
        ); //TERMINAR
        let caracteristicasId;
        if(caracteristicascheck.length === 0){
            const [caracteristicasResult] = await connection.execute(
                `INSERT INTO caracteristicas_fisicas (forma_ojos, tipo_nariz, tipo_labios, tipo_rostro, color_piel, tipo_piel)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [ojos, nariz, labios, cara, colorPiel, tipoPiel]
            );
            caracteristicasId = caracteristicasResult.insertId;
        } else {
            caracteristicasId = caracteristicascheck[0].id;
        }

        const [usuarioResult] = await connection.execute(
            `INSERT INTO usuarios (correo, contrasena_hash, nombre_usuario, caracteristicas_id, edad, correo_verificado)
             VALUES (?, ?, ?, ?, ?, 0)`,
            [email, passwordHash, username, caracteristicasId, edad]
        );
        const usuarioId = usuarioResult.insertId;

        const jwtSecret = process.env.JWT_SECRET || 'bunyk_secret_key_change_in_production';
        const token = jwt.sign(
            { userId: usuarioId, email: email, tipo: 'verificacion_correo' },
            jwtSecret,
            { expiresIn: '24h' }
        );

        const fechaExpiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await connection.execute(
            `INSERT INTO tokens (usuario_id, token, tipo, fecha_expiracion) VALUES (?, ?, 'verificacion_correo', ?)`,
            [usuarioId, token, fechaExpiracion]
        );

        await connection.commit();

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:3000'}/verificar-correo?token=${token}`;

        await transporter.sendMail({
            from: '"B-unick" ',
            to: email,
            subject: 'Verifica tu correo electrónico - B-unick',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>¡Bienvenido a B-unick, ${username}!</h2>
                    <p>Gracias por registrarte, cariño. Para completar tu registro, por favor verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="background-color: #9b82b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                            Verificar mi correo
                        </a>
                    </p>
                    <p>También puedes copia y pega este enlace en tu navegador:</p>
                    <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                    <p>Este enlace expira en 24 horas.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">Si no creaste esta cuenta, puedes ignorar este correo.</p>
                </div>
            `
        });

        res.json({ 
            success: true, 
            message: 'Registro completado. Se ha enviado un correo de verificación.',
            usuarioId
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error en preregistro:', error.message, error.code, error.sqlMessage);
        res.status(500).json({ error: 'Error interno del servidor al registrar' });
    } finally {
        connection.release();
    }
});

// GET /verificar-correo - Verifica el token JWT enviado por email y marca el usuario como verificado
// Recibe el token como query parameter (?token=xxx)
// Proceso: 1) Valida JWT 2) Verifica token en BD (existe, no expirado, no usado) 3) Actualiza usuario.correo_verificado = 1 4) Marca token como usado 5) Redirige al frontend
router.get('/verificar-correo', async (req, res) => {
    // Obtener token de la query string de la URL
    const { token } = req.query;
    // Pool de conexiones a la base de datos
    const pool = req.pool;
    // Clave secreta para verificar la firma del JWT (desde .env o valor por defecto)
    const jwtSecret = process.env.JWT_SECRET || 'bunyk_secret_key_change_in_production';
    // URL base del frontend para redirección (desde .env o valor por defecto)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Validación: token es requerido en la URL
    if (!token) {
        // Redirigir al frontend con error de token faltante
        return res.redirect(`${frontendUrl}/verificar-correo?error=token_missing`);
    }

    try {
        // 1) Verificar y decodificar el JWT (valida firma y expiración automáticamente)
        const decoded = jwt.verify(token, jwtSecret);
        
        // Validar que el token sea del tipo correcto (verificación de correo)
        if (decoded.tipo !== 'verificacion_correo') {
            return res.redirect(`${frontendUrl}/verificar-correo?error=invalid_token_type`);
        }

        // Extraer datos del payload del token
        const { userId, email } = decoded;

        // 2) Consultar en BD: token existe, pertenece al usuario, es de verificación, no usado, no expirado
        const [tokenRows] = await pool.execute(
            `SELECT * FROM tokens WHERE token = ? AND usuario_id = ? AND tipo = 'verificacion_correo' AND usado = 0 AND fecha_expiracion > NOW()`,
            [token, userId]
        );

        // Si no existe token válido en BD, redirigir con error
        if (tokenRows.length === 0) {
            return res.redirect(`${frontendUrl}/verificar-correo?error=token_invalid_or_expired`);
        }

        // 3) Actualizar usuario: marcar correo como verificado (correo_verificado = 1)
        await pool.execute(
            `UPDATE usuarios SET correo_verificado = 1 WHERE id = ?`,
            [userId]
        );

        // 4) Marcar token como usado (usado = 1) para que no se pueda reutilizar
        await pool.execute(
            `UPDATE tokens SET usado = 1 WHERE token = ?`,
            [token]
        );

        // 5) Redirigir al frontend con éxito
        res.redirect(`${frontendUrl}/verificar-correo?success=true`);

    } catch (error) {
        // Manejo específico de errores de JWT
        if (error.name === 'TokenExpiredError') {
            // Token expirado (jwt.verify lanza este error si exp < now)
            return res.redirect(`${frontendUrl}/verificar-correo?error=token_expired`);
        }
        if (error.name === 'JsonWebTokenError') {
            // Token inválido (firma incorrecta, malformado, etc.)
            return res.redirect(`${frontendUrl}/verificar-correo?error=token_invalid`);
        }
        // Error inesperado del servidor
        console.error('Error verificando correo:', error.message);
        return res.redirect(`${frontendUrl}/verificar-correo?error=server_error`);
    }
});

module.exports = router