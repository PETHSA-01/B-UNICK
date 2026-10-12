const express = require('express');
const { verificarToken } = require('../helpers/jwt');
const { armarConversacion, debeAutoeliminarse } = require('../helpers/conversaciones');
const { resolverFotoPerfil } = require('../helpers/imagenes');
const { moderarContenido } = require('../helpers/sightengine');
const verificarAcceso = require('../middleware/verificarToken');

const router = express.Router();

// -------------------------------------------------------------------
// Constantes (RQFN126/RQFN127)
// -------------------------------------------------------------------
// Temas de conversación para las pestañas del feed. Son una whitelist de UI
// (tabs) y de validación de longitud al crear; el campo `tema` guarda el
// string (varchar 40) que el usuario eligió, incluida la opción libre
// "Otros" (decisión del equipo: whitelist + búsqueda libre + "Otros").
const TEMAS = ['Tips', 'Dudas', 'Tutorial', 'Opiniones', 'Eventos', 'Show', 'Look', 'General'];

const ORDENES = ['fecha', 'likes', 'sin_responder', 'siguiendo'];
const ORDEN_VALIDA = new Set(ORDENES);

// Máximo de participantes (avatares) que viajan en cada conversación del feed.
const MAX_PARTICIPANTES = 6;

// Una conversación admite hasta 3 imágenes opcionales (RQFN131).
const MAX_IMAGENES = 3;

// -------------------------------------------------------------------
// Helpers internos
// -------------------------------------------------------------------

// Sesión opcional: el feed y el detalle son públicos, pero con cookie
// podemos marcar yaLike/yaDenuncie sin exigir login.
async function obtenerSesion(req) {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) return null;
    try {
        const decoded = verificarToken(accessToken, 'access');
        return decoded && decoded.tipo === 'access' ? { id: decoded.userId } : null;
    } catch (error) {
        return null;
    }
}

const COLUMNAS_CONVERSACION = `c.id, c.usuario_id, c.tema, c.subcultura_id, c.titulo, c.texto,
    c.cantidad_likes, c.cantidad_vistas, c.cantidad_denuncias, c.fecha_publicacion,
    u.nombre_usuario AS creador_nombre, u.foto_perfil AS creador_foto,
    s.cultura_id, sc.nombre AS cultura_nombre, s.nombre AS subcultura_nombre,
    -- Conteo de comentarios (incluye respuestas). El alias es 'cantidad'
    -- (no 'cantidad_comentarios'): es lo único que expone la tabla derivada.
    COALESCE(co.cantidad, 0) AS comentarios`;

const JOINS_CONVERSACION = `FROM conversaciones c
    JOIN usuarios u ON u.id = c.usuario_id
    JOIN subculturas_estilos s ON s.id = c.subcultura_id
    JOIN culturas_estilos sc ON sc.id = s.cultura_id
    LEFT JOIN (SELECT conversacion_id, COUNT(*) AS cantidad FROM comentarios
               WHERE conversacion_id IS NOT NULL
               GROUP BY conversacion_id) co ON co.conversacion_id = c.id`;

// -------------------------------------------------------------------
// Conversaciones iniciadas por un usuario (pestaña Chats del Perfil):
// misma forma de respuesta que el feed, filtrada por creador y con las
// miniaturas de galería cargadas por página (RQFN126/RQFN137).
// -------------------------------------------------------------------
async function listarConversacionesDe(pool, usuarioId, pagina, limite) {
    const offset = (pagina - 1) * limite;

    const [totalRows] = await pool.execute(
        `SELECT COUNT(*) AS total ${JOINS_CONVERSACION} WHERE c.usuario_id = ?`,
        [usuarioId]
    );
    const total = Number(totalRows[0].total);

    // LIMIT/OFFSET inline (enteros ya validados): ver nota en routes-videos.js (ER_WRONG_ARGUMENTS/MySQL 8.0.22+).
    const [rows] = await pool.execute(
        `SELECT ${COLUMNAS_CONVERSACION} ${JOINS_CONVERSACION}
         WHERE c.usuario_id = ? ORDER BY c.fecha_publicacion DESC, c.id DESC LIMIT ${limite} OFFSET ${offset}`,
        [usuarioId]
    );

    const conversaciones = rows.map((fila) => armarConversacion(fila));

    // Miniaturas: primeras imágenes de cada conversación (mismo patrón del feed).
    if (conversaciones.length > 0) {
        const convIds = conversaciones.map((c) => c.id);
        const lugar = convIds.map(() => '?').join(', ');
        const [galeriaRows] = await pool.execute(
            `SELECT conversacion_id, url_imagen FROM imagenes_conversacion
             WHERE conversacion_id IN (${lugar})
             ORDER BY conversacion_id ASC, orden ASC, id ASC`,
            convIds
        );
        const galeriaPorConv = new Map();
        galeriaRows.forEach((g) => {
            const cid = Number(g.conversacion_id);
            if (!galeriaPorConv.has(cid)) galeriaPorConv.set(cid, []);
            if (galeriaPorConv.get(cid).length < MAX_IMAGENES) {
                galeriaPorConv.get(cid).push(g.url_imagen);
            }
        });
        conversaciones.forEach((c) => {
            c.galeria = galeriaPorConv.get(c.id) || [];
        });
    }

    return { conversaciones, total, hasMore: offset + conversaciones.length < total };
}

// -------------------------------------------------------------------
// GET /conversaciones - Feed de conversaciones (RQFN126-128)
// Filtros: tema (exacto), cultura (una o varias separadas por coma),
// subcultura, rango de fechas desde/hasta (YYYY-MM-DD), búsqueda q
// (título/texto/tema con LIKE); orden por fecha o por likes.
// -------------------------------------------------------------------
router.get('/conversaciones', async (req, res) => {
    const pool = req.pool;
    const sesion = await obtenerSesion(req);
    try {
        const conditions = [];
        const params = [];
        // Parámetros propios de un JOIN condicional (orden "siguiendo"):
        // deben ir ANTES que los de WHERE en el orden posicional de MySQL.
        let joinsExtra = '';
        let paramsJoin = [];

        const buscar = (clave) => {
            const v = req.query[clave];
            return v !== undefined && String(v).trim() !== '' ? String(v).trim() : null;
        };

        const tema = buscar('tema');
        if (tema) {
            conditions.push('c.tema = ?');
            params.push(tema);
        }
        // Multi-cultura: acepta "3" o "3,5,8" (panel de filtros con casillas).
        const cultura = buscar('cultura');
        if (cultura) {
            const ids = cultura.split(',').map((x) => String(x).trim()).filter((x) => x !== '');
            if (!ids.every((x) => /^\d+$/.test(x))) {
                return res.status(400).json({ error: 'Filtro de cultura inválido.' });
            }
            if (ids.length > 0) {
                conditions.push(`s.cultura_id IN (${ids.map(() => '?').join(', ')})`);
                ids.forEach((x) => params.push(Number(x)));
            }
        }
        const subcultura = buscar('subcultura');
        if (subcultura) {
            conditions.push('c.subcultura_id = ?');
            params.push(subcultura);
        }
        // Rango de fechas (fechas nativas YYYY-MM-DD): "hasta" incluye todo el día.
        const desde = buscar('desde');
        if (desde) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(desde)) {
                return res.status(400).json({ error: 'Filtro de fecha inválido (desde).' });
            }
            conditions.push('c.fecha_publicacion >= ?');
            params.push(`${desde} 00:00:00`);
        }
        const hasta = buscar('hasta');
        if (hasta) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(hasta)) {
                return res.status(400).json({ error: 'Filtro de fecha inválido (hasta).' });
            }
            conditions.push('c.fecha_publicacion < DATE_ADD(?, INTERVAL 1 DAY)');
            params.push(`${hasta} 00:00:00`);
        }
        const q = buscar('q');
        if (q) {
            const patron = `%${q}%`;
            conditions.push('(c.titulo LIKE ? OR c.texto LIKE ? OR c.tema LIKE ?)');
            params.push(patron, patron, patron);
        }

        const orden = buscar('orden');
        const ordenValido = orden && ORDEN_VALIDA.has(orden) ? orden : 'fecha';
        let ordenSQL;
        if (ordenValido === 'likes') {
            ordenSQL = 'ORDER BY c.cantidad_likes DESC, c.fecha_publicacion DESC, c.id DESC';
        } else if (ordenValido === 'sin_responder') {
            // Conversaciones sin respuesta primero (foro "Sin responder").
            ordenSQL =
                'ORDER BY (COALESCE(co.cantidad, 0) = 0) DESC, c.fecha_publicacion DESC, c.id DESC';
        } else if (ordenValido === 'siguiendo') {
            // Solo conversaciones de creadores a los que sigo (requiere sesión).
            if (sesion) {
                joinsExtra = ` JOIN seguidores fl ON fl.seguido_id = c.usuario_id AND fl.seguidor_id = ?`;
                paramsJoin.push(sesion.id);
            }
            ordenSQL = 'ORDER BY c.fecha_publicacion DESC, c.id DESC';
        } else {
            ordenSQL = 'ORDER BY c.fecha_publicacion DESC, c.id DESC';
        }

        const whereTexto = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const joins = JOINS_CONVERSACION + joinsExtra;

        const [totalRows] = await pool.execute(
            `SELECT COUNT(*) AS total ${joins} ${whereTexto}`,
            [...paramsJoin, ...params]
        );
        const total = Number(totalRows[0].total);

        const pagina = Math.max(1, Number(req.query.pagina) || 1);
        const limite = Math.min(60, Math.max(1, Number(req.query.limite) || 30));
        const offset = (pagina - 1) * limite;

        const [rows] = await pool.execute(
            `SELECT ${COLUMNAS_CONVERSACION} ${joins} ${whereTexto} ${ordenSQL} LIMIT ${limite} OFFSET ${offset}`,
            [...paramsJoin, ...params]
        );

        const conversaciones = rows.map((fila) => armarConversacion(fila));

        // Miniaturas de las tarjetas: las primeras imágenes de cada conversación
        // (hasta MAX_IMAGENES), en una consulta por página para no multiplicar filas.
        if (conversaciones.length > 0) {
            const convIds = conversaciones.map((c) => c.id);
            const lugar = convIds.map(() => '?').join(', ');
            const [galeriaRows] = await pool.execute(
                `SELECT conversacion_id, url_imagen FROM imagenes_conversacion
                 WHERE conversacion_id IN (${lugar})
                 ORDER BY conversacion_id ASC, orden ASC, id ASC`,
                convIds
            );
            const galeriaPorConv = new Map();
            galeriaRows.forEach((g) => {
                const cid = Number(g.conversacion_id);
                if (!galeriaPorConv.has(cid)) galeriaPorConv.set(cid, []);
                if (galeriaPorConv.get(cid).length < MAX_IMAGENES) {
                    galeriaPorConv.get(cid).push(g.url_imagen);
                }
            });
            conversaciones.forEach((c) => {
                c.galeria = galeriaPorConv.get(c.id) || [];
            });

            // Like propio por conversación: rellena la flecha de votos de la
            // tarjeta (mismo patrón que estadoPropio del detalle). Sin sesión,
            // todas quedan como no likeadas.
            const likeSet = new Set();
            if (sesion) {
                const [likeRows] = await pool.execute(
                    `SELECT conversacion_id FROM likes_conversacion
                     WHERE usuario_id = ? AND conversacion_id IN (${lugar})`,
                    [sesion.id, ...convIds]
                );
                likeRows.forEach((r) => likeSet.add(Number(r.conversacion_id)));
            }
            conversaciones.forEach((c) => {
                c.estadoPropio = { like: likeSet.has(c.id), denuncie: false };
            });

            // Últimos participantes (distintos) y fecha de la última respuesta:
            // la tarjeta muestra el grupo de avatares y el "última respuesta hace Xh".
            const participantesPorConv = new Map();
            const [comentariosFeed] = await pool.execute(
                `SELECT cm.conversacion_id, cm.usuario_id, cm.fecha, u.foto_perfil AS autor_foto
                 FROM comentarios cm
                 JOIN usuarios u ON u.id = cm.usuario_id
                 WHERE cm.conversacion_id IN (${lugar})
                 ORDER BY cm.fecha DESC, cm.id DESC`,
                convIds
            );
            comentariosFeed.forEach((r) => {
                const cid = Number(r.conversacion_id);
                if (!participantesPorConv.has(cid)) {
                    participantesPorConv.set(cid, {
                        fotos: [],
                        vistos: new Set(),
                        ultimaRespuesta: null
                    });
                }
                const grupo = participantesPorConv.get(cid);
                if (grupo.ultimaRespuesta === null) {
                    // La primera fila (más reciente) marca la última respuesta.
                    grupo.ultimaRespuesta = r.fecha;
                    grupo.fotos.push(r.autor_foto);
                    grupo.vistos.add(Number(r.usuario_id));
                } else if (!grupo.vistos.has(Number(r.usuario_id)) && grupo.fotos.length < MAX_PARTICIPANTES) {
                    grupo.vistos.add(Number(r.usuario_id));
                    grupo.fotos.push(r.autor_foto);
                }
            });
            conversaciones.forEach((c) => {
                const grupo = participantesPorConv.get(c.id);
                c.ultimosParticipantes = grupo
                    ? grupo.fotos.map((f) => resolverFotoPerfil(f))
                    : [];
                c.ultimaRespuesta = grupo ? grupo.ultimaRespuesta : null;
            });
        }

        res.json({
            success: true,
            conversaciones,
            total,
            pagina,
            limite,
            hasMore: offset + conversaciones.length < total
        });
    } catch (error) {
        console.error('Error en GET /conversaciones:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -------------------------------------------------------------------
// GET /perfil/conversaciones - Conversaciones iniciadas por el propio
// usuario (pestaña Chats del Perfil).
// -------------------------------------------------------------------
router.get('/perfil/conversaciones', verificarAcceso, async (req, res) => {
    const pool = req.pool;
    const usuarioId = req.user.id;
    try {
        const pagina = Math.max(1, Number(req.query.pagina) || 1);
        const limite = Math.min(60, Math.max(1, Number(req.query.limite) || 30));
        const data = await listarConversacionesDe(pool, usuarioId, pagina, limite);
        res.json({ success: true, ...data, pagina, limite });
    } catch (error) {
        console.error('Error en GET /perfil/conversaciones:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -------------------------------------------------------------------
// GET /usuarios/:id/conversaciones - Conversaciones iniciadas por otro
// usuario (perfiles ajenos). Solo usuarios verificados (404 si no).
// -------------------------------------------------------------------
router.get('/usuarios/:id/conversaciones', verificarAcceso, async (req, res) => {
    const { id } = req.params;
    const pool = req.pool;

    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ error: 'Identificador inválido.' });
    }
    const targetId = parseInt(id, 10);
    try {
        const [users] = await pool.execute(
            'SELECT id, correo_verificado FROM usuarios WHERE id = ? LIMIT 1',
            [targetId]
        );
        const user = users[0];
        if (!user || user.correo_verificado === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        const pagina = Math.max(1, Number(req.query.pagina) || 1);
        const limite = Math.min(60, Math.max(1, Number(req.query.limite) || 30));
        const data = await listarConversacionesDe(pool, targetId, pagina, limite);
        res.json({ success: true, ...data, pagina, limite });
    } catch (error) {
        console.error('Error en GET /usuarios/:id/conversaciones:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -------------------------------------------------------------------
// GET /conversaciones/temas - Lista de temas para las pestañas del feed.
// -------------------------------------------------------------------
router.get('/conversaciones/temas', (req, res) => {
    res.json({ success: true, temas: TEMAS });
});

// -------------------------------------------------------------------
// GET /conversaciones/denuncia-motivos - Catálogo de motivos (RQFN139).
// -------------------------------------------------------------------
// OJO: esta ruta DEBE seguir registrada antes que `GET /conversaciones/:id`
// (igual que `/videos/filtros` antes que `/videos/:id`): si no, cae en el
// patrón `:id` y la guarda /^\d+$/ responde 400.
router.get('/conversaciones/denuncia-motivos', async (req, res) => {
    const pool = req.pool;
    try {
        const [rows] = await pool.execute(
            'SELECT id, descripcion FROM motivos_denuncia WHERE activo = 1 ORDER BY id ASC'
        );
        res.json({
            success: true,
            motivos: rows.map((r) => ({ id: Number(r.id), descripcion: r.descripcion }))
        });
    } catch (error) {
        console.error('Error en GET /conversaciones/denuncia-motivos:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -------------------------------------------------------------------
// POST /conversaciones - Crear una conversación (RQFN129-132)
// Body: { tema, subcultura_id, titulo, texto, imagenes[] }.
// Las imágenes opcionales se moderan con Sightengine ANTES de la BD.
// -------------------------------------------------------------------
router.post('/conversaciones', verificarAcceso, async (req, res) => {
    const pool = req.pool;
    const userId = req.user.id;
    const { tema, subcultura_id, titulo, texto, imagenes = [] } = req.body || {};
    let conexion = null;
    try {
        const temaFinal = String(tema || '').trim();
        if (!temaFinal) {
            return res.status(400).json({ error: 'Elige un tema para la conversación.' });
        }
        if (temaFinal.length > 40) {
            return res.status(400).json({ error: 'El tema no puede superar 40 caracteres.' });
        }

        const subId = Number(subcultura_id);
        if (!Number.isInteger(subId) || subId <= 0) {
            return res.status(400).json({ error: 'Debes elegir un subestilo.' });
        }

        const tituloFinal = String(titulo || '').trim();
        if (!tituloFinal) {
            return res.status(400).json({ error: 'El título es obligatorio.' });
        }
        if (tituloFinal.length > 80) {
            return res.status(400).json({ error: 'El título no puede superar 80 caracteres.' });
        }

        const textoFinal = String(texto || '').trim();
        if (!textoFinal) {
            return res.status(400).json({ error: 'El texto es obligatorio.' });
        }
        if (textoFinal.length > 500) {
            return res.status(400).json({ error: 'El texto no puede superar 500 caracteres.' });
        }

        if (!Array.isArray(imagenes)) {
            return res.status(400).json({ error: 'Las imágenes deben ser una lista.' });
        }
        const galeria = imagenes
            .map((u) => String(u || '').trim())
            .filter((u) => u !== '');
        if (galeria.length > MAX_IMAGENES) {
            return res.status(400).json({ error: `Solo puedes subir hasta ${MAX_IMAGENES} imágenes.` });
        }
        if (galeria.some((u) => !/^https?:\/\//i.test(u))) {
            return res.status(400).json({ error: 'Alguna imagen no tiene una URL válida.' });
        }

        const [subRows] = await pool.execute(
            'SELECT id FROM subculturas_estilos WHERE id = ? LIMIT 1',
            [subId]
        );
        if (subRows.length === 0) {
            return res.status(400).json({ error: 'El subestilo elegido no existe.' });
        }

        // Moderación de las imágenes opcionales (RQFN125, misma firma que Crear).
        if (galeria.length > 0) {
            let moderacion;
            try {
                moderacion = await moderarContenido({ imagenes: galeria });
            } catch (error) {
                if (error.codigo === 'SIGHTENGINE_NO_CONFIGURADO') {
                    return res.status(503).json({ error: error.message, codigo: error.codigo });
                }
                return res.status(502).json({ error: error.message, codigo: 'SIGHTENGINE_ERROR' });
            }
            if (!moderacion.aprobado) {
                return res.status(422).json({
                    error: 'El contenido no pasó la moderación.',
                    motivos: moderacion.motivos
                });
            }
        }

        conexion = await pool.getConnection();
        await conexion.beginTransaction();

        const [ins] = await conexion.execute(
            `INSERT INTO conversaciones (usuario_id, tema, subcultura_id, titulo, texto)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, temaFinal, subId, tituloFinal, textoFinal]
        );
        const convId = ins.insertId;

        if (galeria.length > 0) {
            const lugar = galeria.map(() => '(?, ?, ?)').join(', ');
            const params = [];
            galeria.forEach((u, i) => params.push(convId, u, i + 1));
            await conexion.execute(
                `INSERT INTO imagenes_conversacion (conversacion_id, url_imagen, orden) VALUES ${lugar}`,
                params
            );
        }

        await conexion.commit();
        res.status(201).json({ success: true, id: convId });
    } catch (error) {
        if (conexion) {
            try {
                await conexion.rollback();
            } catch (rollbackError) {
                console.error('Rollback fallido:', rollbackError.message);
            }
        }
        console.error('Error en POST /conversaciones:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        if (conexion) conexion.release();
    }
});

// -------------------------------------------------------------------
// GET /conversaciones/:id - Detalle (RQFN133-137)
// Devuelve autor, galería y comentarios anidados (respuestas).
// -------------------------------------------------------------------
router.get('/conversaciones/:id', async (req, res) => {
    const pool = req.pool;
    const { id } = req.params;
    const sesion = await obtenerSesion(req);
    try {
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'Identificador de conversación inválido.' });
        }
        const [filas] = await pool.execute(
            `SELECT ${COLUMNAS_CONVERSACION} ${JOINS_CONVERSACION} WHERE c.id = ? LIMIT 1`,
            [id]
        );
        if (filas.length === 0) {
            return res.status(404).json({ error: 'Conversación no encontrada.' });
        }

        const [galeriaRows] = await pool.execute(
            'SELECT id, url_imagen, orden FROM imagenes_conversacion WHERE conversacion_id = ? ORDER BY orden ASC',
            [id]
        );
        const galeria = galeriaRows.map((g) => ({
            id: Number(g.id),
            url: g.url_imagen,
            orden: Number(g.orden)
        }));

        const conversacion = armarConversacion(filas[0], { galeria });

        const [comentariosRows] = await pool.execute(
            `SELECT co.id, co.usuario_id, co.comentario_padre_id, co.texto, co.cantidad_likes, co.fecha,
                    u.nombre_usuario AS autor_nombre, u.foto_perfil AS autor_foto
             FROM comentarios co
             JOIN usuarios u ON u.id = co.usuario_id
             WHERE co.conversacion_id = ? AND co.comentario_padre_id IS NULL
             ORDER BY co.fecha ASC, co.id ASC`,
            [id]
        );
        const [respuestasRows] = await pool.execute(
            `SELECT co.id, co.usuario_id, co.comentario_padre_id, co.texto, co.cantidad_likes, co.fecha,
                    u.nombre_usuario AS autor_nombre, u.foto_perfil AS autor_foto
             FROM comentarios co
             JOIN usuarios u ON u.id = co.usuario_id
             WHERE co.conversacion_id = ? AND co.comentario_padre_id IS NOT NULL
             ORDER BY co.fecha ASC, co.id ASC`,
            [id]
        );

        const likesPropios = new Set();
        if (sesion) {
            const [likesComentarios] = await pool.execute(
                'SELECT comentario_id FROM likes_comentario WHERE usuario_id = ?',
                [sesion.id]
            );
            likesComentarios.forEach((r) => likesPropios.add(Number(r.comentario_id)));
        }

        const armarComentario = (c, respuestas) => ({
            id: Number(c.id),
            usuarioId: Number(c.usuario_id),
            texto: c.texto,
            cantidadLikes: Number(c.cantidad_likes),
            fecha: c.fecha,
            likeDado: likesPropios.has(Number(c.id)),
            autor: {
                id: Number(c.usuario_id),
                nombre: c.autor_nombre,
                fotoPerfil: resolverFotoPerfil(c.autor_foto)
            },
            respuestas
        });

        const respuestasPorPadre = new Map();
        respuestasRows.forEach((r) => {
            const pid = Number(r.comentario_padre_id);
            if (!respuestasPorPadre.has(pid)) respuestasPorPadre.set(pid, []);
            respuestasPorPadre.get(pid).push(armarComentario(r, []));
        });

        conversacion.comentarios = comentariosRows.map((c) =>
            armarComentario(c, respuestasPorPadre.get(Number(c.id)) || [])
        );
        conversacion.cantidadComentarios =
            conversacion.comentarios.length + respuestasRows.length;

        const estado = { like: false, denuncie: false };
        if (sesion) {
            const [likeRows] = await pool.execute(
                'SELECT 1 AS x FROM likes_conversacion WHERE usuario_id = ? AND conversacion_id = ? LIMIT 1',
                [sesion.id, id]
            );
            estado.like = likeRows.length > 0;
            const [denRows] = await pool.execute(
                'SELECT 1 AS x FROM denuncias_conversacion WHERE usuario_id = ? AND conversacion_id = ? LIMIT 1',
                [sesion.id, id]
            );
            estado.denuncie = denRows.length > 0;
        }
        conversacion.estadoPropio = estado;
        conversacion.esDueño = sesion ? Number(sesion.id) === Number(filas[0].usuario_id) : false;

        res.json({ success: true, conversacion });
    } catch (error) {
        console.error('Error en GET /conversaciones/:id:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -------------------------------------------------------------------
// POST /conversaciones/:id/visto - Registra una vista de la conversación.
// Hace progresar la regla de auto-eliminación (requiere ≥20 vistas).
// -------------------------------------------------------------------
router.post('/conversaciones/:id/visto', verificarAcceso, async (req, res) => {
    const pool = req.pool;
    const { id } = req.params;
    try {
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'Identificador de conversación inválido.' });
        }
        const [rows] = await pool.execute(
            'SELECT 1 AS x FROM conversaciones WHERE id = ? LIMIT 1',
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Conversación no encontrada.' });
        }
        await pool.execute(
            'UPDATE conversaciones SET cantidad_vistas = cantidad_vistas + 1 WHERE id = ?',
            [id]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error en POST /conversaciones/:id/visto:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -------------------------------------------------------------------
// POST /conversaciones/:id/like - Like/unlike (RQFN134)
// -------------------------------------------------------------------
router.post('/conversaciones/:id/like', verificarAcceso, async (req, res) => {
    const pool = req.pool;
    const userId = req.user.id;
    const { id } = req.params;
    try {
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'Identificador de conversación inválido.' });
        }
        const [convRows] = await pool.execute(
            'SELECT usuario_id, cantidad_likes FROM conversaciones WHERE id = ? LIMIT 1',
            [id]
        );
        if (convRows.length === 0) {
            return res.status(404).json({ error: 'Conversación no encontrada.' });
        }
        const totalActual = Number(convRows[0].cantidad_likes);

        const [existe] = await pool.execute(
            'SELECT 1 AS x FROM likes_conversacion WHERE usuario_id = ? AND conversacion_id = ? LIMIT 1',
            [userId, id]
        );
        if (existe.length > 0) {
            await pool.execute(
                'DELETE FROM likes_conversacion WHERE usuario_id = ? AND conversacion_id = ?',
                [userId, id]
            );
            await pool.execute(
                'UPDATE conversaciones SET cantidad_likes = GREATEST(cantidad_likes - 1, 0) WHERE id = ?',
                [id]
            );
            return res.json({
                success: true,
                like: false,
                cantidadLikes: Math.max(totalActual - 1, 0)
            });
        }

        await pool.execute(
            'INSERT INTO likes_conversacion (usuario_id, conversacion_id) VALUES (?, ?)',
            [userId, id]
        );
        await pool.execute(
            'UPDATE conversaciones SET cantidad_likes = cantidad_likes + 1 WHERE id = ?',
            [id]
        );

        if (Number(convRows[0].usuario_id) !== Number(userId)) {
            const [actorRows] = await pool.execute(
                'SELECT nombre_usuario FROM usuarios WHERE id = ? LIMIT 1',
                [userId]
            );
            await pool.execute(
                `INSERT INTO notificaciones (usuario_id, tipo, mensaje, conversacion_id, usuario_actor_id)
                 VALUES (?, 'nuevo_like', ?, ?, ?)`,
                [
                    convRows[0].usuario_id,
                    `${actorRows[0].nombre_usuario} le dio like a tu conversación`,
                    Number(id),
                    userId
                ]
            );
        }

        res.json({ success: true, like: true, cantidadLikes: totalActual + 1 });
    } catch (error) {
        console.error('Error en POST /conversaciones/:id/like:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -------------------------------------------------------------------
// POST /conversaciones/:id/comentarios - Crear comentario/respuesta (RQFN135)
// -------------------------------------------------------------------
router.post('/conversaciones/:id/comentarios', verificarAcceso, async (req, res) => {
    const pool = req.pool;
    const userId = req.user.id;
    const { id } = req.params;
    const { texto, comentario_padre_id } = req.body || {};
    try {
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'Identificador de conversación inválido.' });
        }
        const limpio = String(texto || '').trim();
        if (limpio.length === 0) {
            return res.status(400).json({ error: 'El comentario no puede estar vacío.' });
        }
        if (limpio.length > 250) {
            return res.status(400).json({
                error: 'El comentario no puede superar 250 caracteres.'
            });
        }
        const [convRows] = await pool.execute(
            'SELECT usuario_id FROM conversaciones WHERE id = ? LIMIT 1',
            [id]
        );
        if (convRows.length === 0) {
            return res.status(404).json({ error: 'Conversación no encontrada.' });
        }

        let padreId = null;
        let destinatario = convRows[0].usuario_id;
        if (comentario_padre_id) {
            if (!/^\d+$/.test(String(comentario_padre_id))) {
                return res.status(400).json({ error: 'Comentario padre inválido.' });
            }
            const [padreRows] = await pool.execute(
                'SELECT id, usuario_id FROM comentarios WHERE id = ? AND conversacion_id = ? LIMIT 1',
                [comentario_padre_id, id]
            );
            if (padreRows.length === 0) {
                return res.status(404).json({ error: 'El comentario no existe.' });
            }
            padreId = padreRows[0].id;
            destinatario = padreRows[0].usuario_id;
        }

        const [ins] = await pool.execute(
            'INSERT INTO comentarios (usuario_id, conversacion_id, comentario_padre_id, texto) VALUES (?, ?, ?, ?)',
            [userId, id, padreId, limpio]
        );

        if (Number(destinatario) !== Number(userId)) {
            const [actorRows] = await pool.execute(
                'SELECT nombre_usuario FROM usuarios WHERE id = ? LIMIT 1',
                [userId]
            );
            // Igual que en videos: una respuesta va a quien escribió el
            // comentario padre; un comentario raíz va al dueño de la conversación.
            const mensaje = padreId
                ? `${actorRows[0].nombre_usuario} respondió a tu comentario`
                : `${actorRows[0].nombre_usuario} comentó tu conversación`;
            await pool.execute(
                `INSERT INTO notificaciones (usuario_id, tipo, mensaje, conversacion_id, usuario_actor_id)
                 VALUES (?, 'nuevo_comentario', ?, ?, ?)`,
                [
                    destinatario,
                    mensaje,
                    Number(id),
                    userId
                ]
            );
        }

        const [autorRows] = await pool.execute(
            'SELECT nombre_usuario, foto_perfil FROM usuarios WHERE id = ? LIMIT 1',
            [userId]
        );
        res.status(201).json({
            success: true,
            comentario: {
                id: Number(ins.insertId),
                usuarioId: Number(userId),
                texto: limpio,
                cantidadLikes: 0,
                likeDado: false,
                esRespuesta: padreId !== null,
                autor: {
                    id: Number(userId),
                    nombre: autorRows[0].nombre_usuario,
                    fotoPerfil: resolverFotoPerfil(autorRows[0].foto_perfil)
                },
                respuestas: []
            }
        });
    } catch (error) {
        console.error('Error en POST /conversaciones/:id/comentarios:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -------------------------------------------------------------------
// POST /conversaciones/:id/comentarios/:cid/like - Like/unlike (RQFN136)
// -------------------------------------------------------------------
router.post('/conversaciones/:id/comentarios/:cid/like', verificarAcceso, async (req, res) => {
    const pool = req.pool;
    const userId = req.user.id;
    const { id, cid } = req.params;
    try {
        if (!/^\d+$/.test(id) || !/^\d+$/.test(cid)) {
            return res.status(400).json({ error: 'Identificador inválido.' });
        }
        const [comentarioRows] = await pool.execute(
            'SELECT usuario_id, cantidad_likes FROM comentarios WHERE id = ? AND conversacion_id = ? LIMIT 1',
            [cid, id]
        );
        if (comentarioRows.length === 0) {
            return res.status(404).json({ error: 'Comentario no encontrado.' });
        }
        const totalActual = Number(comentarioRows[0].cantidad_likes);

        const [existe] = await pool.execute(
            'SELECT 1 AS x FROM likes_comentario WHERE usuario_id = ? AND comentario_id = ? LIMIT 1',
            [userId, cid]
        );
        if (existe.length > 0) {
            await pool.execute(
                'DELETE FROM likes_comentario WHERE usuario_id = ? AND comentario_id = ?',
                [userId, cid]
            );
            await pool.execute(
                'UPDATE comentarios SET cantidad_likes = GREATEST(cantidad_likes - 1, 0) WHERE id = ?',
                [cid]
            );
            return res.json({
                success: true,
                like: false,
                cantidadLikes: Math.max(totalActual - 1, 0)
            });
        }

        await pool.execute(
            'INSERT INTO likes_comentario (usuario_id, comentario_id) VALUES (?, ?)',
            [userId, cid]
        );
        await pool.execute(
            'UPDATE comentarios SET cantidad_likes = cantidad_likes + 1 WHERE id = ?',
            [cid]
        );

        if (Number(comentarioRows[0].usuario_id) !== Number(userId)) {
            const [actorRows] = await pool.execute(
                'SELECT nombre_usuario FROM usuarios WHERE id = ? LIMIT 1',
                [userId]
            );
            await pool.execute(
                `INSERT INTO notificaciones (usuario_id, tipo, mensaje, conversacion_id, usuario_actor_id)
                 VALUES (?, 'like_comentario', ?, ?, ?)`,
                [
                    comentarioRows[0].usuario_id,
                    `${actorRows[0].nombre_usuario} le dio like a tu comentario en tu conversación`,
                    Number(id),
                    userId
                ]
            );
        }

        res.json({ success: true, like: true, cantidadLikes: totalActual + 1 });
    } catch (error) {
        console.error('Error en POST /conversaciones/:id/comentarios/:cid/like:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -------------------------------------------------------------------
// POST /conversaciones/:id/denuncias - Denunciar (RQFN138-141)
// Body: { motivos: [ids]. Un solo motivo por id (catálogo). No se puede
// denunciar la propia conversación ni denunciar dos veces. Tras sumar la
// denuncia se evalúa la auto-eliminación: más del 45% de denuncias con ≥20
// vistas → borrado físico en transacción.
// -------------------------------------------------------------------
router.post('/conversaciones/:id/denuncias', verificarAcceso, async (req, res) => {
    const pool = req.pool;
    const userId = req.user.id;
    const { id } = req.params;
    const { motivos } = req.body || {};
    let conexion = null;
    try {
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'Identificador de conversación inválido.' });
        }
        if (!Array.isArray(motivos) || motivos.length === 0) {
            return res.status(400).json({ error: 'Elige al menos un motivo de denuncia.' });
        }
        const ids = [...new Set(motivos.map(Number))];
        if (ids.some((m) => !Number.isInteger(m) || m <= 0)) {
            return res.status(400).json({ error: 'Motivo de denuncia inválido.' });
        }
        if (ids.length > 10) {
            return res.status(400).json({ error: 'Demasiados motivos de denuncia.' });
        }

        const [convRows] = await pool.execute(
            'SELECT usuario_id, cantidad_vistas, cantidad_denuncias FROM conversaciones WHERE id = ? LIMIT 1',
            [id]
        );
        if (convRows.length === 0) {
            return res.status(404).json({ error: 'Conversación no encontrada.' });
        }
        const conv = convRows[0];
        if (Number(conv.usuario_id) === Number(userId)) {
            return res.status(400).json({ error: 'No puedes denunciar tu propia conversación.' });
        }

        const [yaDenunciado] = await pool.execute(
            'SELECT 1 AS x FROM denuncias_conversacion WHERE usuario_id = ? AND conversacion_id = ? LIMIT 1',
            [userId, id]
        );
        if (yaDenunciado.length > 0) {
            return res.status(409).json({ error: 'Ya denunciaste esta conversación.' });
        }

        // Valida que todos los motivos existan y estén activos.
        const lugar = ids.map(() => '?').join(', ');
        const [motiveRows] = await pool.execute(
            `SELECT id FROM motivos_denuncia WHERE id IN (${lugar}) AND activo = 1`,
            ids
        );
        const existentes = new Set(motiveRows.map((m) => Number(m.id)));
        if (ids.some((m) => !existentes.has(m))) {
            return res.status(400).json({ error: 'Algún motivo de denuncia no existe.' });
        }

        const nuevasDenuncias = Number(conv.cantidad_denuncias) + 1;
        const eliminar = debeAutoeliminarse({
            vistas: conv.cantidad_vistas,
            denuncias: nuevasDenuncias
        });

        conexion = await pool.getConnection();
        await conexion.beginTransaction();

        const [insDen] = await conexion.execute(
            'INSERT INTO denuncias_conversacion (conversacion_id, usuario_id) VALUES (?, ?)',
            [id, userId]
        );
        const denId = insDen.insertId;
        const mLugar = ids.map(() => '(?, ?)').join(', ');
        const mParams = [];
        ids.forEach((m) => mParams.push(denId, m));
        await conexion.execute(
            `INSERT INTO denuncia_motivos (denuncia_id, motivo_id) VALUES ${mLugar}`,
            mParams
        );
        await conexion.execute(
            'UPDATE conversaciones SET cantidad_denuncias = cantidad_denuncias + 1 WHERE id = ?',
            [id]
        );

        let eliminada = false;
        if (eliminar) {
            // Auto-eliminación: borrado físico en transacción (RQFN141).
            const [comentarioIds] = await conexion.execute(
                'SELECT id FROM comentarios WHERE conversacion_id = ?',
                [id]
            );
            if (comentarioIds.length > 0) {
                await conexion.query('DELETE FROM likes_comentario WHERE comentario_id IN (?)', [
                    comentarioIds.map((c) => c.id)
                ]);
            }
            const [denunciaIds] = await conexion.execute(
                'SELECT id FROM denuncias_conversacion WHERE conversacion_id = ?',
                [id]
            );
            if (denunciaIds.length > 0) {
                await conexion.query('DELETE FROM denuncia_motivos WHERE denuncia_id IN (?)', [
                    denunciaIds.map((d) => d.id)
                ]);
            }
            await conexion.execute('DELETE FROM comentarios WHERE conversacion_id = ?', [id]);
            await conexion.execute('DELETE FROM likes_conversacion WHERE conversacion_id = ?', [id]);
            await conexion.execute('DELETE FROM denuncias_conversacion WHERE conversacion_id = ?', [id]);
            await conexion.execute('DELETE FROM imagenes_conversacion WHERE conversacion_id = ?', [id]);
            await conexion.execute('DELETE FROM notificaciones WHERE conversacion_id = ?', [id]);
            await conexion.execute('DELETE FROM conversaciones WHERE id = ?', [id]);
            eliminada = true;
        }

        await conexion.commit();
        res.json({
            success: true,
            eliminada,
            ...(eliminar && { message: 'La conversación no cumplía con los lineamientos de la comunidad y fue eliminada.' })
        });
    } catch (error) {
        if (conexion) {
            try {
                await conexion.rollback();
            } catch (rollbackError) {
                console.error('Rollback fallido:', rollbackError.message);
            }
        }
        console.error('Error en POST /conversaciones/:id/denuncias:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        if (conexion) conexion.release();
    }
});

module.exports = router;