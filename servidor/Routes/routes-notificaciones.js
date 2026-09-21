const express = require('express');
const verificarAcceso = require('../middleware/verificarToken');
const { mapearUsuarioConFoto } = require('../helpers/imagenes');

const router = express.Router();

// -------------------------------------------------------------------
// GET /notificaciones - Lista propia de notificaciones
// Devuelve { success, noLeidas, notificaciones: [...] }, ordenadas por
// fecha descendente. El campo actor es null para los tipos que genera
// el sistema (p. ej. semejanza_baja) y tiene avatar resuelto en el resto.
// -------------------------------------------------------------------
router.get('/notificaciones', verificarAcceso, async (req, res) => {
    const userId = req.user.id;
    const pool = req.pool;

    try {
        const [rows] = await pool.execute(
            `SELECT n.id, n.tipo, n.mensaje, n.leida, n.fecha_creacion,
                    n.video_id, n.conversacion_id, n.usuario_actor_id,
                    u.nombre_usuario, u.foto_perfil, u.descripcion
             FROM notificaciones n
             LEFT JOIN usuarios u ON u.id = n.usuario_actor_id
             WHERE n.usuario_id = ?
             ORDER BY n.fecha_creacion DESC, n.id DESC`,
            [userId]
        );

        const [noLeidasRows] = await pool.execute(
            'SELECT COUNT(*) AS total FROM notificaciones WHERE usuario_id = ? AND leida = 0',
            [userId]
        );

        const notificaciones = rows.map((fila) => {
            const { usuario_actor_id, nombre_usuario, foto_perfil, descripcion, ...resto } = fila;
            const actor = usuario_actor_id
                ? { id: usuario_actor_id, nombre_usuario, descripcion, ...mapearUsuarioConFoto({ foto_perfil }) }
                : null;
            return {
                ...resto,
                leida: resto.leida === 1,
                actor
            };
        });

        res.json({
            success: true,
            noLeidas: noLeidasRows[0].total,
            notificaciones
        });
    } catch (error) {
        console.error('Error en GET /notificaciones:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// -------------------------------------------------------------------
// POST /notificaciones/leidas - Marca todas las notificaciones como leídas
// -------------------------------------------------------------------
router.post('/notificaciones/leidas', verificarAcceso, async (req, res) => {
    const userId = req.user.id;
    const pool = req.pool;

    try {
        const [result] = await pool.execute(
            'UPDATE notificaciones SET leida = 1 WHERE usuario_id = ? AND leida = 0',
            [userId]
        );

        res.json({
            success: true,
            message: 'Notificaciones marcadas como leídas.',
            leidas: result.affectedRows
        });
    } catch (error) {
        console.error('Error en POST /notificaciones/leidas:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;