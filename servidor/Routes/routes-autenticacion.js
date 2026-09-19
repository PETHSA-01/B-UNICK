const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { firmarToken, verificarToken } = require('../helpers/jwt');
const { enviarCorreo } = require('../helpers/correo');
const verificarAcceso = require('../middleware/verificarToken');
const { resolverFotoPerfil } = require('../helpers/imagenes');

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

        const token = firmarToken(
            { userId: usuarioId, email: email, tipo: 'verificacion_correo' },
            'email',
            '24h'
        );

        const fechaExpiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await connection.execute(
            `INSERT INTO tokens (usuario_id, token, tipo, fecha_expiracion) VALUES (?, ?, 'verificacion_correo', ?)`,
            [usuarioId, token, fechaExpiracion]
        );

        await connection.commit();

        const verificationUrl = `${process.env.BACKEND_URL}/api/verificar-correo?token=${token}`;

        try {
            await enviarCorreo({
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
                    <p>También puedes copia y pega este enlace en tu navegador:</p>
                    <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                    <p>Este enlace expira en 24 horas.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">Si no creaste esta cuenta, puedes ignorar este correo.</p>
                </div>
            `
            });
        } catch (emailError) {
            console.error('Correo de verificación no enviado:', emailError.message);
        }

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
    // URL base del frontend para redirección (desde .env o valor por defecto)
    const frontendUrl = process.env.FRONTEND_URL;

    // Validación: token es requerido en la URL
    if (!token) {
        // Redirigir al frontend con error de token faltante
        return res.redirect(`${frontendUrl}/verificar-correo?error=token_missing`);
    }

    try {
        // 1) Verificar y decodificar el JWT (valida firma y expiración automáticamente)
        const decoded = verificarToken(token, 'email');
        
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
            // Token expirado (verificarToken lanza este error si exp < now)
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

// POST /login - Autentica usuario por correo o nombre de usuario, verifica contraseña,
//               revisa verificación de email y setea cookies httpOnly
router.post('/login', async (req, res) => {
    const { identificador, password } = req.body;
    const pool = req.pool;

    if (!identificador || !password) {
        return res.status(400).json({ error: 'Correo o usuario y contraseña son requeridos' });
    }

    try {
        const [users] = await pool.execute(
            'SELECT id, correo, contrasena_hash, nombre_usuario, correo_verificado, foto_perfil, descripcion FROM usuarios WHERE correo = ? OR nombre_usuario = ? LIMIT 1',
            [identificador, identificador]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = users[0];

        let validPassword = false;
        try {
            validPassword = await bcrypt.compare(password, user.contrasena_hash);
        } catch (hashError) {
            validPassword = false;
        }
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (!user.correo_verificado) {
            return res.status(403).json({ 
                error: 'Verifica tu correo antes de iniciar sesión',
                requireVerification: true 
            });
        }

        const accessToken = firmarToken(
            { userId: user.id, email: user.correo, tipo: 'access' },
            'access',
            '24h'
        );

        const refreshToken = firmarToken(
            { userId: user.id, email: user.correo, tipo: 'refresh' },
            'refresh',
            '7d'
        );

        const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        // Dos logins en el mismo segundo generan un JWT refresh idéntico (mismo
        // userId/correo/tipo e iat). INSERT IGNORE evita chocar con la UNIQUE KEY
        // `token`; el token ya almacenado es equivalente, así que es seguro.
        await pool.execute(
            `INSERT IGNORE INTO tokens (usuario_id, token, tipo, fecha_expiracion) VALUES (?, ?, 'refresh', ?)`,
            [user.id, refreshToken, refreshExpiry]
        );

        const isProduction = process.env.NODE_ENV === 'production';
        
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const [preferenciasRows] = await pool.execute(
            'SELECT id FROM usuario_preferencias WHERE usuario_id = ? LIMIT 1',
            [user.id]
        );

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.correo,
                username: user.nombre_usuario,
                fotoPerfil: resolverFotoPerfil(user.foto_perfil),
                descripcion: user.descripcion,
                correo_verificado: user.correo_verificado,
                tienePreferencias: preferenciasRows.length > 0
            }
        });

    } catch (error) {
        console.error('Error en login:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /api/me - Obtiene información del usuario autenticado desde la cookie
router.get('/me', async (req, res) => {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const pool = req.pool;

    try {
        const decoded = verificarToken(accessToken, 'access');
        
        if (decoded.tipo !== 'access') {
            return res.status(401).json({ error: 'Invalid token type' });
        }

        const [users] = await pool.execute(
            'SELECT id, correo, contrasena_hash, nombre_usuario, correo_verificado, foto_perfil, descripcion FROM usuarios WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = users[0];

        const [preferenciasRows] = await pool.execute(
            'SELECT id FROM usuario_preferencias WHERE usuario_id = ? LIMIT 1',
            [user.id]
        );

        res.json({
            user: {
                id: user.id,
                email: user.correo,
                username: user.nombre_usuario,
                fotoPerfil: resolverFotoPerfil(user.foto_perfil),
                descripcion: user.descripcion,
                correo_verificado: user.correo_verificado,
                tienePreferencias: preferenciasRows.length > 0
            }
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.error('Error en /me:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST /refresh - Usa el refreshToken para emitir un nuevo accessToken
router.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    const pool = req.pool;

    if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token provided' });
    }

    try {
        // 1) Verificar firma y expiración del refresh token
        const decoded = verificarToken(refreshToken, 'refresh');

        if (decoded.tipo !== 'refresh') {
            return res.status(401).json({ error: 'Invalid token type' });
        }

        // 2) Confirmar que el refresh token existe en BD, no ha sido revocado/usado y no está expirado
        const [tokenRows] = await pool.execute(
            `SELECT * FROM tokens WHERE token = ? AND usuario_id = ? AND tipo = 'refresh' AND usado = 0 AND fecha_expiracion > NOW()`,
            [refreshToken, decoded.userId]
        );

        if (tokenRows.length === 0) {
            return res.status(401).json({ error: 'Refresh token invalid or revoked' });
        }

        // 3) Confirmar que el usuario sigue existiendo
        const [users] = await pool.execute(
            'SELECT id, correo, nombre_usuario, correo_verificado, foto_perfil, descripcion FROM usuarios WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = users[0];

        // 4) Emitir un nuevo accessToken
        const newAccessToken = firmarToken(
            { userId: user.id, email: user.correo, tipo: 'access' },
            'access',
            '24h'
        );

        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        const [preferenciasRows] = await pool.execute(
            'SELECT id FROM usuario_preferencias WHERE usuario_id = ? LIMIT 1',
            [user.id]
        );

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.correo,
                username: user.nombre_usuario,
                fotoPerfil: resolverFotoPerfil(user.foto_perfil),
                descripcion: user.descripcion,
                correo_verificado: user.correo_verificado,
                tienePreferencias: preferenciasRows.length > 0
            }
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            // Refresh token expirado -> el usuario debe volver a hacer login
            return res.status(401).json({ error: 'Refresh token expired', requireLogin: true });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
        console.error('Error en /refresh:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST /logout - Revoca el refresh token del dispositivo actual y limpia cookies
router.post('/logout', async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    const pool = req.pool;
    const isProduction = process.env.NODE_ENV === 'production';

    if (refreshToken) {
        try {
            const decoded = verificarToken(refreshToken, 'refresh');
            if (decoded && decoded.userId) {
                await pool.execute(
                    `UPDATE tokens SET usado = 1 WHERE token = ? AND usuario_id = ?`,
                    [refreshToken, decoded.userId]
                );
            }
        } catch (tokenError) {
            console.error('Error revocando refresh token en logout:', tokenError.message);
        }
    }

    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax'
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax'
    });

    res.json({ success: true, message: 'Sesión cerrada correctamente' });
});

// POST /olvido-contrasena - Genera token de restablecimiento y envía correo. Respuesta neutral.
router.post('/olvido-contrasena', async (req, res) => {
    const { email } = req.body;
    const pool = req.pool;

    if (!email) {
        return res.status(400).json({ error: 'El correo electrónico es requerido' });
    }

    try {
        const [users] = await pool.execute(
            'SELECT id, nombre_usuario, correo_verificado FROM usuarios WHERE correo = ?',
            [email]
        );

        if (users.length > 0 && users[0].correo_verificado === 1) {
            const user = users[0];
            const token = firmarToken({ userId: user.id, email, tipo: 'restablecer' }, 'email', '1h');
            const fechaExpiracion = new Date(Date.now() + 60 * 60 * 1000);

            await pool.execute(
                `INSERT INTO tokens (usuario_id, token, tipo, fecha_expiracion) VALUES (?, ?, 'restablecer', ?)`,
                [user.id, token, fechaExpiracion]
            );

            const resetUrl = `${process.env.FRONTEND_URL}/restablecer?token=${token}`;

            try {
                await enviarCorreo({
                    to: email,
                    subject: 'Restablece tu contraseña - B-unick',
                    html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>¡Hola, ${user.nombre_usuario}!</h2>
                    <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #9b82b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                            Restablecer mi contraseña
                        </a>
                    </p>
                    <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                    <p>Este enlace expira en 1 hora.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
                </div>
            `
                });
            } catch (emailError) {
                console.error('Correo de restablecimiento no enviado:', emailError.message);
            }
        }

        res.json({
            success: true,
            message: 'Si el correo está registrado y verificado, recibirás un enlace para restablecer tu contraseña.'
        });
    } catch (error) {
        console.error('Error en olvido-contrasena:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST /recuperar-contrasena - Valida token de restablecimiento y actualiza la contraseña
router.post('/recuperar-contrasena', async (req, res) => {
    const { token, nuevaContrasena } = req.body;
    const pool = req.pool;

    if (!token || !nuevaContrasena) {
        return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
    }
    if (nuevaContrasena.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    try {
        let decoded;
        try {
            decoded = verificarToken(token, 'email');
        } catch (tokenError) {
            if (tokenError.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'El enlace ha expirado. Solicita uno nuevo.' });
            }
            return res.status(401).json({ error: 'El enlace no es válido. Solicita uno nuevo.' });
        }

        if (decoded.tipo !== 'restablecer') {
            return res.status(401).json({ error: 'El enlace no es válido. Solicita uno nuevo.' });
        }

        const [tokenRows] = await pool.execute(
            `SELECT * FROM tokens WHERE token = ? AND usuario_id = ? AND tipo = 'restablecer' AND usado = 0 AND fecha_expiracion > NOW()`,
            [token, decoded.userId]
        );

        if (tokenRows.length === 0) {
            return res.status(401).json({ error: 'El enlace ha expirado o ya fue utilizado. Solicita uno nuevo.' });
        }

        const passwordHash = await bcrypt.hash(nuevaContrasena, 10);

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            await connection.execute(
                'UPDATE usuarios SET contrasena_hash = ? WHERE id = ?',
                [passwordHash, decoded.userId]
            );
            await connection.execute(
                `UPDATE tokens SET usado = 1 WHERE token = ?`,
                [token]
            );
            await connection.commit();
        } catch (dbError) {
            await connection.rollback();
            throw dbError;
        } finally {
            connection.release();
        }

        res.json({ success: true, message: 'Tu contraseña fue actualizada correctamente.' });
    } catch (error) {
        console.error('Error en recuperar-contrasena:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST /reenviar-verificacion - Reenvía el correo de verificación. Respuesta neutral.
router.post('/reenviar-verificacion', async (req, res) => {
    const { email } = req.body;
    const pool = req.pool;

    if (!email) {
        return res.status(400).json({ error: 'El correo electrónico es requerido' });
    }

    try {
        const [users] = await pool.execute(
            'SELECT id, nombre_usuario, correo_verificado FROM usuarios WHERE correo = ?',
            [email]
        );

        if (users.length > 0 && users[0].correo_verificado === 0) {
            const user = users[0];
            const token = firmarToken({ userId: user.id, email, tipo: 'verificacion_correo' }, 'email', '24h');
            const fechaExpiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);

            await pool.execute(
                `INSERT INTO tokens (usuario_id, token, tipo, fecha_expiracion) VALUES (?, ?, 'verificacion_correo', ?)`,
                [user.id, token, fechaExpiracion]
            );

            const verificationUrl = `${process.env.BACKEND_URL}/api/verificar-correo?token=${token}`;

            try {
                await enviarCorreo({
                    to: email,
                    subject: 'Verifica tu correo electrónico - B-unick',
                    html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>¡Hola de nuevo, ${user.nombre_usuario}!</h2>
                    <p>Hemos recibido tu solicitud para reenviar el enlace de verificación. Haz clic en el enlace:</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="background-color: #9b82b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                            Verificar mi correo
                        </a>
                    </p>
                    <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                    <p>Este enlace expira en 24 horas.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">Si no creaste esta cuenta, puedes ignorar este correo.</p>
                </div>
            `
                });
            } catch (emailError) {
                console.error('Correo de verificación reenviado falló:', emailError.message);
            }
        }

        res.json({
            success: true,
            message: 'Si tu correo está pendiente de verificación, recibirás un nuevo enlace.'
        });
    } catch (error) {
        console.error('Error en reenviar-verificacion:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /culturas - Devuelve todas las culturas/estilos con sus subculturas. Es público.
router.get('/culturas', async (req, res) => {
    const pool = req.pool;

    try {
        const [culturasRows] = await pool.execute(
            'SELECT id, nombre, descripcion, imagen_ref FROM culturas_estilos ORDER BY id'
        );
        const [subculturasRows] = await pool.execute(
            'SELECT id, cultura_id, nombre, imagen_ref, descripcion, bibliografia FROM subculturas_estilos ORDER BY id'
        );

        const culturas = culturasRows.map((cultura) => ({
            ...cultura,
            subculturas: subculturasRows.filter((sub) => sub.cultura_id === cultura.id)
        }));

        res.json({ success: true, culturas });
    } catch (error) {
        console.error('Error en /culturas:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST /preferencias - Guarda las preferencias culturales del usuario autenticado (1-3 culturas, 1 subcultura c/u)
router.post('/preferencias', verificarAcceso, async (req, res) => {
    const { preferencias } = req.body;
    const pool = req.pool;
    const userId = req.user.id;

    if (!Array.isArray(preferencias) || preferencias.length < 1 || preferencias.length > 3) {
        return res.status(400).json({ error: 'Debes seleccionar entre 1 y 3 culturas' });
    }

    const connection = await pool.getConnection();
    try {
        // Validar que cada preferencia sea { culturaId, subculturaId } y la subcultura pertenezca a la cultura
        for (const preferencia of preferencias) {
            if (!preferencia.culturaId || !preferencia.subculturaId) {
                await connection.rollback();
                return res.status(400).json({ error: 'Cada preferencia debe incluir cultura y subcultura' });
            }

            const [subRows] = await connection.execute(
                'SELECT id FROM subculturas_estilos WHERE id = ? AND cultura_id = ?',
                [preferencia.subculturaId, preferencia.culturaId]
            );

            if (subRows.length === 0) {
                await connection.rollback();
                return res.status(400).json({ error: 'La subcultura seleccionada no pertenece a la cultura indicada' });
            }
        }

        await connection.beginTransaction();

        await connection.execute(
            'DELETE FROM usuario_preferencias WHERE usuario_id = ?',
            [userId]
        );

        for (const preferencia of preferencias) {
            await connection.execute(
                `INSERT INTO usuario_preferencias (usuario_id, cultura_id, subcultura_id) VALUES (?, ?, ?)`,
                [userId, preferencia.culturaId, preferencia.subculturaId]
            );
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Preferencias guardadas correctamente.',
            user: {
                id: userId,
                tienePreferencias: true
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error en /preferencias:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        connection.release();
    }
});

module.exports = router