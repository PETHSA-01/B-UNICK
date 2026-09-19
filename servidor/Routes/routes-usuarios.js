const express = require('express');
const bcrypt = require('bcryptjs');
const verificarAcceso = require('../middleware/verificarToken');
const { subirImagen } = require('../helpers/cloudinary');
const { resolverFotoPerfil, mapearUsuarioConFoto } = require('../helpers/imagenes');

const router = express.Router();

// -------------------------------------------------------------------
// Helpers internos
// -------------------------------------------------------------------

async function obtenerStats(pool, userId) {
    const [videosRows] = await pool.execute(
        'SELECT COUNT(*) AS total FROM videos WHERE usuario_id = ?',
        [userId]
    );
    const [likesRows] = await pool.execute(
        'SELECT COALESCE(SUM(cantidad_likes), 0) AS total FROM videos WHERE usuario_id = ?',
        [userId]
    );
    const [seguidoresRows] = await pool.execute(
        'SELECT COUNT(*) AS total FROM seguidores WHERE seguido_id = ?',
        [userId]
    );
    const [siguiendoRows] = await pool.execute(
        'SELECT COUNT(*) AS total FROM seguidores WHERE seguidor_id = ?',
        [userId]
    );

    return {
        videos: videosRows[0].total,
        likesRecibidos: Number(likesRows[0].total),
        seguidores: seguidoresRows[0].total,
        siguiendo: siguiendoRows[0].total
    };
}

async function obtenerYoSigo(pool, yo, ellos) {
    if (ellos.length === 0) return {};
    const [rows] = await pool.execute(
        `SELECT seguido_id FROM seguidores WHERE seguidor_id = ? AND seguido_id IN (?)`,
        [yo, ellos]
    );
    const set = new Set(rows.map((r) => r.seguido_id));
    const mapa = {};
    ellos.forEach((id) => { mapa[id] = set.has(id); });
    return mapa;
}

async function buscarPerfilAjeno(pool, id) {
    const [users] = await pool.execute(
        `SELECT id, nombre_usuario, foto_perfil, descripcion, fecha_registro, correo_verificado
         FROM usuarios WHERE id = ? LIMIT 1`,
        [id]
    );
    return users[0] || null;
}

// -------------------------------------------------------------------
// GET /perfil - Perfil propio con estadísticas
// -------------------------------------------------------------------
router.get('/perfil', verificarAcceso, async (req, res) => {
    const userId = req.user.id;
    const pool = req.pool;

    try {
        const [users] = await pool.execute(
            `SELECT id, correo, nombre_usuario, foto_perfil, descripcion, fecha_registro, correo_verificado
             FROM usuarios WHERE id = ? LIMIT 1`,
            [userId]
        );
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = users[0];
        const stats = await obtenerStats(pool, userId);

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.correo,
                username: user.nombre_usuario,
                fotoPerfil: resolverFotoPerfil(user.foto_perfil),
                descripcion: user.descripcion,
                fechaRegistro: user.fecha_registro,
                correo_verificado: user.correo_verificado,
                ...stats
            }
        });
    } catch (error) {
        console.error('Error en /perfil:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// -------------------------------------------------------------------
// GET /usuarios/:id/perfil - Perfil de otro usuario (solo verificados)
// -------------------------------------------------------------------
router.get('/usuarios/:id/perfil', verificarAcceso, async (req, res) => {
    const miId = req.user.id;
    const { id } = req.params;
    const pool = req.pool;

    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ error: 'Identificador inválido' });
    }

    try {
        const targetId = parseInt(id, 10);
        if (targetId === miId) {
            return res.status(400).json({ error: 'Este perfil es el tuyo; usa /perfil' });
        }

        const user = await buscarPerfilAjeno(pool, targetId);
        // Usuarios sin verificar no son visibles ni seguibles (ocultos como 404).
        if (!user || user.correo_verificado === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const stats = await obtenerStats(pool, targetId);

        const [sigoRows] = await pool.execute(
            'SELECT 1 FROM seguidores WHERE seguidor_id = ? AND seguido_id = ? LIMIT 1',
            [miId, targetId]
        );

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.nombre_usuario,
                fotoPerfil: resolverFotoPerfil(user.foto_perfil),
                descripcion: user.descripcion,
                fechaRegistro: user.fecha_registro,
                yaSigo: sigoRows.length > 0,
                ...stats
            }
        });
    } catch (error) {
        console.error('Error en /usuarios/:id/perfil:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// -------------------------------------------------------------------
// PUT /perfil - Editar username y/o descripción
// -------------------------------------------------------------------
router.put('/perfil', verificarAcceso, async (req, res) => {
    const userId = req.user.id;
    const { username, descripcion } = req.body;
    const pool = req.pool;

    if (username === undefined && descripcion === undefined) {
        return res.status(400).json({ error: 'Nada para actualizar' });
    }

    try {
        const [users] = await pool.execute(
            'SELECT id, nombre_usuario, descripcion FROM usuarios WHERE id = ? LIMIT 1',
            [userId]
        );
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const current = users[0];

        let nuevoUsername = current.nombre_usuario;
        let nuevaDescripcion = current.descripcion;

        if (username !== undefined) {
            const usernameTrim = String(username).trim();
            if (usernameTrim.length < 3 || usernameTrim.length > 50) {
                return res.status(400).json({ error: 'El nombre de usuario debe tener entre 3 y 50 caracteres' });
            }
            if (usernameTrim !== current.nombre_usuario) {
                const [chocados] = await pool.execute(
                    'SELECT id FROM usuarios WHERE nombre_usuario = ? AND id <> ? LIMIT 1',
                    [usernameTrim, userId]
                );
                if (chocados.length > 0) {
                    return res.status(409).json({ error: 'El nombre de usuario ya está en uso' });
                }
            }
            nuevoUsername = usernameTrim;
        }

        if (descripcion !== undefined) {
            const descTrim = String(descripcion).trim();
            if (descTrim.length > 200) {
                return res.status(400).json({ error: 'La descripción no puede exceder 200 caracteres' });
            }
            nuevaDescripcion = descTrim.length > 0 ? descTrim : null;
        }

        await pool.execute(
            'UPDATE usuarios SET nombre_usuario = ?, descripcion = ? WHERE id = ?',
            [nuevoUsername, nuevaDescripcion, userId]
        );

        res.json({
            success: true,
            message: 'Perfil actualizado correctamente.',
            user: {
                id: userId,
                username: nuevoUsername,
                descripcion: nuevaDescripcion
            }
        });
    } catch (error) {
        console.error('Error en PUT /perfil:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// -------------------------------------------------------------------
// POST /perfil/contrasena - Cambio de contraseña (revoca otras sesiones)
// Nota: la ruta usa "contrasena" sin tilde (Express 5 no matchea
// literales con caracteres no-ASCII en la URL).
// -------------------------------------------------------------------
router.post('/perfil/contrasena', verificarAcceso, async (req, res) => {
    const userId = req.user.id;
    const { contrasenaActual, nuevaContrasena, confirmarContrasena } = req.body;
    const pool = req.pool;

    if (!contrasenaActual || !nuevaContrasena || !confirmarContrasena) {
        return res.status(400).json({ error: 'Contraseña actual, nueva y confirmación son requeridas' });
    }

    if (nuevaContrasena.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    if (nuevaContrasena !== confirmarContrasena) {
        return res.status(400).json({ error: 'Las contraseñas nuevas no coinciden' });
    }

    try {
        const [users] = await pool.execute(
            'SELECT contrasena_hash FROM usuarios WHERE id = ? LIMIT 1',
            [userId]
        );
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const valida = await bcrypt.compare(contrasenaActual, users[0].contrasena_hash);
        if (!valida) {
            return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
        }

        const nuevoHash = await bcrypt.hash(nuevaContrasena, 10);
        await pool.execute(
            'UPDATE usuarios SET contrasena_hash = ? WHERE id = ?',
            [nuevoHash, userId]
        );

        // Revocar refresh tokens de otras sesiones (excepto el dispositivo actual).
        const refreshActual = req.cookies?.refreshToken;
        await pool.execute(
            'DELETE FROM tokens WHERE usuario_id = ? AND tipo = ? AND token <> ?',
            [userId, 'refresh', refreshActual || '']
        );

        res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
        console.error('Error en /perfil/contrasena:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// -------------------------------------------------------------------
// PUT /perfil/foto - Subir foto de perfil (base64/dataURL -> Cloudinary)
// -------------------------------------------------------------------
router.put('/perfil/foto', verificarAcceso, async (req, res) => {
    const userId = req.user.id;
    const { imagen } = req.body;
    const pool = req.pool;

    if (!imagen || typeof imagen !== 'string' || !imagen.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Se requiere una imagen en formato dataURL' });
    }

    try {
        const fotoPerfil = await subirImagen(imagen, {
            folder: 'bunyk/perfiles',
            transformations: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face' }
            ]
        });

        await pool.execute(
            'UPDATE usuarios SET foto_perfil = ? WHERE id = ?',
            [fotoPerfil, userId]
        );

        res.json({ success: true, message: 'Foto de perfil actualizada.', fotoPerfil });
    } catch (error) {
        console.error('Error en /perfil/foto:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// -------------------------------------------------------------------
// POST /seguir/:id - Seguir / dejar de seguir (toggle)
// -------------------------------------------------------------------
router.post('/seguir/:id', verificarAcceso, async (req, res) => {
    const seguidorId = req.user.id;
    const { id } = req.params;
    const pool = req.pool;

    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ error: 'Identificador inválido' });
    }

    const seguidoId = parseInt(id, 10);

    if (seguidoId === seguidorId) {
        return res.status(400).json({ error: 'No puedes seguirte a ti mismo' });
    }

    const connection = await pool.getConnection();
    try {
        const user = await buscarPerfilAjeno(pool, seguidoId);
        if (!user || user.correo_verificado === 0) {
            connection.release();
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const [existeRows] = await connection.execute(
            'SELECT 1 FROM seguidores WHERE seguidor_id = ? AND seguido_id = ? LIMIT 1',
            [seguidorId, seguidoId]
        );

        if (existeRows.length > 0) {
            await connection.execute(
                'DELETE FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?',
                [seguidorId, seguidoId]
            );
            connection.release();
            return res.json({ success: true, siguiendo: false });
        }

        await connection.beginTransaction();

        await connection.execute(
            'INSERT INTO seguidores (seguidor_id, seguido_id) VALUES (?, ?)',
            [seguidorId, seguidoId]
        );

        try {
            const [yoRows] = await connection.execute(
                'SELECT nombre_usuario FROM usuarios WHERE id = ? LIMIT 1',
                [seguidorId]
            );
            const nombreSeguidor = yoRows[0]?.nombre_usuario || 'Alguien';
            await connection.execute(
                `INSERT INTO notificaciones (usuario_id, tipo, mensaje) VALUES (?, 'nuevo_seguidor', ?)`,
                [seguidoId, `${nombreSeguidor} te ha seguido`]
            );
        } catch (notifError) {
            console.error('Error creando notificación nuevo_seguidor:', notifError.message);
        }

        await connection.commit();
        connection.release();

        res.json({ success: true, siguiendo: true });
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('Error en /seguir/:id:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// -------------------------------------------------------------------
// GET listas de seguidores / siguiendo (propio y ajeno)
// -------------------------------------------------------------------
router.get('/perfil/seguidores', verificarAcceso, async (req, res) => {
    const miId = req.user.id;
    const pool = req.pool;

    try {
        const [rows] = await pool.execute(
            `SELECT u.id, u.nombre_usuario, u.foto_perfil, u.descripcion
             FROM seguidores s JOIN usuarios u ON u.id = s.seguidor_id
             WHERE s.seguido_id = ? ORDER BY s.fecha_inicio DESC`,
            [miId]
        );
        const yoSigo = await obtenerYoSigo(pool, miId, rows.map((r) => r.id));
        res.json({
            success: true,
            usuarios: rows.map((r) => ({ ...mapearUsuarioConFoto(r), yoSigo: yoSigo[r.id] === true }))
        });
    } catch (error) {
        console.error('Error en /perfil/seguidores:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/perfil/siguiendo', verificarAcceso, async (req, res) => {
    const miId = req.user.id;
    const pool = req.pool;

    try {
        const [rows] = await pool.execute(
            `SELECT u.id, u.nombre_usuario, u.foto_perfil, u.descripcion
             FROM seguidores s JOIN usuarios u ON u.id = s.seguido_id
             WHERE s.seguidor_id = ? ORDER BY s.fecha_inicio DESC`,
            [miId]
        );
        const yoSigo = await obtenerYoSigo(pool, miId, rows.map((r) => r.id));
        res.json({
            success: true,
            usuarios: rows.map((r) => ({ ...mapearUsuarioConFoto(r), yoSigo: yoSigo[r.id] === true }))
        });
    } catch (error) {
        console.error('Error en /perfil/siguiendo:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/usuarios/:id/seguidores', verificarAcceso, async (req, res) => {
    const miId = req.user.id;
    const { id } = req.params;
    const pool = req.pool;

    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ error: 'Identificador inválido' });
    }
    const targetId = parseInt(id, 10);

    try {
        const user = await buscarPerfilAjeno(pool, targetId);
        if (!user || user.correo_verificado === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const [rows] = await pool.execute(
            `SELECT u.id, u.nombre_usuario, u.foto_perfil, u.descripcion
             FROM seguidores s JOIN usuarios u ON u.id = s.seguidor_id
             WHERE s.seguido_id = ? ORDER BY s.fecha_inicio DESC`,
            [targetId]
        );
        const yoSigo = await obtenerYoSigo(pool, miId, rows.map((r) => r.id));
        res.json({
            success: true,
            usuarios: rows.map((r) => ({ ...mapearUsuarioConFoto(r), yoSigo: yoSigo[r.id] === true }))
        });
    } catch (error) {
        console.error('Error en /usuarios/:id/seguidores:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/usuarios/:id/siguiendo', verificarAcceso, async (req, res) => {
    const miId = req.user.id;
    const { id } = req.params;
    const pool = req.pool;

    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ error: 'Identificador inválido' });
    }
    const targetId = parseInt(id, 10);

    try {
        const user = await buscarPerfilAjeno(pool, targetId);
        if (!user || user.correo_verificado === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const [rows] = await pool.execute(
            `SELECT u.id, u.nombre_usuario, u.foto_perfil, u.descripcion
             FROM seguidores s JOIN usuarios u ON u.id = s.seguido_id
             WHERE s.seguidor_id = ? ORDER BY s.fecha_inicio DESC`,
            [targetId]
        );
        const yoSigo = await obtenerYoSigo(pool, miId, rows.map((r) => r.id));
        res.json({
            success: true,
            usuarios: rows.map((r) => ({ ...mapearUsuarioConFoto(r), yoSigo: yoSigo[r.id] === true }))
        });
    } catch (error) {
        console.error('Error en /usuarios/:id/siguiendo:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;