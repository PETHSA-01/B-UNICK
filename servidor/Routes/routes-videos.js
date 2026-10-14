const express = require('express');
const { verificarToken } = require('../helpers/jwt');
const { armarVideo, calcularSemejanza } = require('../helpers/videos');
const { resolverFotoPerfil } = require('../helpers/imagenes');
const { moderarContenido } = require('../helpers/sightengine');
const verificarAcceso = require('../middleware/verificarToken');

const router = express.Router();

// -------------------------------------------------------------------
// Constantes (RQFN88)
// -------------------------------------------------------------------
const CATEGORIAS = ['Tutorial', 'Delineados', 'Sombras', 'Lip Combo', 'Base', 'Video Maquillajes'];
const CATEGORIA_VALIDA = new Set(CATEGORIAS);

const ORDENES = ['semejanza', 'relevantes', 'fecha', 'cultura', 'subestilo'];
const ORDEN_VALIDA = new Set(ORDENES);

// Claves de los apartados de coincidencia física (fallback de "Mis
// características"): el índice coincide con el rango `apartado` del SQL.
const APARTADOS_CODIGO = ['todos', 'color_piel', 'forma_ojos', 'tipo_rostro', 'tipo_labios', 'tipo_nariz'];

// Valores válidos al crear una publicación (RQFN121-125). El paso
// "descripcion_general" es el texto introductorio del acordeón Pasos.
const RANGOS_EDAD = new Set(['13-17', '18-24', '25-30', '31+']);
const PROPORCIONES = new Set(['1:1', '4:5', '3:4', '2:3', '5:4', '9:16']);
const TIPOS_PASO = new Set([
    'descripcion_general', 'preparacion', 'base', 'contorno',
    'corrector', 'sombras', 'delineado', 'cejas', 'lip_combo'
]);

// Semejanza (RQFN71/RQFN72): el aviso al dueño se dispara cuando su video
// baja del 40% que fija el DER. Coincide con el mínimo de la Wiki.
const MINIMO_SEMEJANZA = 40;
// El porcentaje solo es confiable (y visible en el frontend) con más de
// 1000 votos, que es el mismo corte de `calcularSemejanza`.
const VOTOS_MINIMOS_PARA_AVISAR = 1000;

// -------------------------------------------------------------------
// Helpers internos
// -------------------------------------------------------------------

// Sesión opcional: el feed es público, pero si hay cookie nos permite
// personalizar (RQFN84) y filtrar por las características del usuario.
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

async function obtenerCaracteristicasUsuario(pool, userId) {
    const [rows] = await pool.execute(
        `SELECT cf.forma_ojos, cf.tipo_nariz, cf.tipo_labios, cf.tipo_rostro,
                cf.color_piel, cf.tipo_piel, u.edad
         FROM usuarios u
         JOIN caracteristicas_fisicas cf ON cf.id = u.caracteristicas_id
         WHERE u.id = ? LIMIT 1`,
        [userId]
    );
    return rows[0] || null;
}

function rangoDeEdad(edad) {
    const e = Number(edad);
    if (!Number.isFinite(e)) return null;
    if (e <= 17) return '13-17';
    if (e <= 24) return '18-24';
    if (e <= 30) return '25-30';
    return '31+';
}

// Preferencias del usuario (RQFN84): las 3 culturas y los 3 subestilos a los
// que más les ha dado like. Devuelve los ids para un ORDER BY de boost.
async function obtenerPreferencias(pool, userId) {
    const [culturas] = await pool.execute(
        `SELECT v.cultura_id AS id, COUNT(*) AS n
         FROM likes_video lv
         JOIN videos v ON v.id = lv.video_id
         WHERE lv.usuario_id = ?
         GROUP BY v.cultura_id
         ORDER BY n DESC, v.cultura_id ASC
         LIMIT 3`,
        [userId]
    );
    const [subculturas] = await pool.execute(
        `SELECT v.subcultura_id AS id, COUNT(*) AS n
         FROM likes_video lv
         JOIN videos v ON v.id = lv.video_id
         WHERE lv.usuario_id = ?
         GROUP BY v.subcultura_id
         ORDER BY n DESC, v.subcultura_id ASC
         LIMIT 3`,
        [userId]
    );
    return {
        culturas: culturas.map((r) => Number(r.id)),
        subculturas: subculturas.map((r) => Number(r.id))
    };
}

// Aviso de baja de semejanza (RQFN71 y RQFN72): notifica al dueño cuando su
// video cae por debajo del 40% exigido por el DER. Se evalúa después de cada
// voto, porque es un voto lo que mueve el porcentaje.
//
// Guardas, en orden:
//   1. El votante no es el dueño (uno no se avisa a sí mismo).
//   2. Hay más de 1000 votos, el mismo corte de `calcularSemejanza`: con
//      menos, el frontend ni muestra el porcentaje.
//   3. El porcentaje quedó por debajo del mínimo.
//   4. El video todavía no tiene este aviso, para no repetirlo en cada voto.
//
// `usuario_actor_id` va NULL a propósito: es un aviso del sistema y el drawer
// lo dibuja con el avatar de Becky en lugar del de una persona.
async function avisarSemejanzaBaja(pool, { videoId, duenioId, votanteId, porcentaje, totalVotos }) {
    try {
        if (Number(votanteId) === Number(duenioId)) return false;
        if (totalVotos <= VOTOS_MINIMOS_PARA_AVISAR) return false;
        if (porcentaje >= MINIMO_SEMEJANZA) return false;

        const [yaAvisado] = await pool.execute(
            `SELECT 1 AS x FROM notificaciones
             WHERE usuario_id = ? AND tipo = 'semejanza_baja' AND video_id = ?
             LIMIT 1`,
            [duenioId, videoId]
        );
        if (yaAvisado.length > 0) return false;

        await pool.execute(
            `INSERT INTO notificaciones (usuario_id, tipo, mensaje, video_id, usuario_actor_id)
             VALUES (?, 'semejanza_baja', ?, ?, NULL)`,
            [
                duenioId,
                `Tu video bajó a ${porcentaje}% de semejanza, por debajo del ${MINIMO_SEMEJANZA}% que se pide para que las recomendaciones lleguen.`,
                videoId
            ]
        );
        return true;
    } catch (error) {
        // Un aviso que falla nunca debe tumbar el voto que lo dispara.
        console.error('Error creando notificación semejanza_baja:', error.message);
        return false;
    }
}

const COLUMNAS_VIDEO = `v.id, v.usuario_id, v.categoria_contenido, v.cultura_id, v.subcultura_id,
    v.url_video, v.descripcion, v.votos_favor, v.votos_contra, v.porcentaje_semejanza,
    v.cantidad_likes, v.cantidad_guardados, v.cantidad_compartidos, v.cantidad_vistas,
    v.fecha_publicacion, v.rango_edad, v.proporcion,
    u.nombre_usuario AS creador_nombre, u.foto_perfil AS creador_foto,
    c.nombre AS cultura_nombre, s.nombre AS subcultura_nombre,
    CASE WHEN (v.votos_favor + v.votos_contra) > 1000
        THEN ROUND(v.votos_favor / (v.votos_favor + v.votos_contra) * 100)
        ELSE NULL END AS semejanza_calc,
    COALESCE(co.cantidad, 0) AS comentarios,
    -- Primera imagen de la galeria como imagen del video (portada/poster).
    -- Si el video no tiene galeria, img.url_imagen viene NULL y armarVideo
    -- cae al primer frame del video (resolverMiniaturaVideo).
    img.url_imagen AS imagen_principal`;

const JOINS_VIDEO = `FROM videos v
    JOIN usuarios u ON u.id = v.usuario_id
    JOIN culturas_estilos c ON c.id = v.cultura_id
    JOIN subculturas_estilos s ON s.id = v.subcultura_id
    LEFT JOIN caracteristicas_fisicas cf ON cf.id = v.caracteristicasfisicas
    -- OJO: la tabla derivada "co" solo expone (video_id, cantidad). No referenciar
    -- co.cantidad_likes aqui (esa columna existe en la tabla real comentarios,
    -- que se consulta con su propio alias en GET /videos/:id): MySQL responderia
    -- ER_BAD_FIELD_ERROR 1054 y el endpoint devolveria 500. El alias "cantidad"
    -- ademas lo consume el ORDER BY de orden=relevantes (mas abajo).
    LEFT JOIN (SELECT video_id, COUNT(*) AS cantidad FROM comentarios GROUP BY video_id) co
        ON co.video_id = v.id
    -- OJO: este LEFT JOIN es EXACTAMENTE 1:1 (una sola fila por video, la imagen
    -- de menor 'orden'; desempate por id) para no multiplicar filas ni romper
    -- los COUNT(*) de la paginacion. Es la portada que alimenta imagen_principal.
    LEFT JOIN imagenes_video img ON img.id = (
        SELECT g.id FROM imagenes_video g
        WHERE g.video_id = v.id
        ORDER BY g.orden ASC, g.id ASC
        LIMIT 1
    )`;

// -------------------------------------------------------------------
// GET /videos - Feed de maquillajes (RQFN79-99)
// -------------------------------------------------------------------
router.get('/videos', async (req, res) => {
    const pool = req.pool;
    const sesion = await obtenerSesion(req);

    // Sesión con sesión activa → leer sus características para personalizar.
    const caracsUsuario = sesion ? await obtenerCaracteristicasUsuario(pool, sesion.id) : null;

    // Rasgos que cuentan para la coincidencia parcial (RQFN requisito: si el
    // filtrado estricto por "Mis características" no devuelve nada, se fallback
    // a videos ordenados por cuántos rasgos coinciden, en este orden de prioridad).
    const PRIORIDAD_COINCIDENCIA = [
        ['color_piel', 'cf.color_piel'],
        ['forma_ojos', 'cf.forma_ojos'],
        ['tipo_rostro', 'cf.tipo_rostro'],
        ['tipo_labios', 'cf.tipo_labios'],
        ['tipo_nariz', 'cf.tipo_nariz']
    ];

    let activarMios = false;
    let cantCondicionesMios = 0;

    const conditions = [];
    const params = [];

    const buscar = (clave) => {
        const v = req.query[clave];
        return v !== undefined && String(v).trim() !== '' ? String(v).trim() : null;
    };

    // Tabs / apartados (RQFN88).
    const categoria = buscar('categoria');
    if (categoria && CATEGORIA_VALIDA.has(categoria)) {
        conditions.push('v.categoria_contenido = ?');
        params.push(categoria);
    }

    // Filtro por estilo (contrato Wiki "Utilizar", RQFN78).
    const cultura = buscar('cultura');
    const subcultura = buscar('subcultura');
    if (cultura) {
        conditions.push('v.cultura_id = ?');
        params.push(cultura);
    }
    if (subcultura) {
        conditions.push('v.subcultura_id = ?');
        params.push(subcultura);
    }

    // Búsqueda (RQFN87): al buscar se ignoran las características físicas.
    const q = buscar('q');
    const buscando = q !== null;
    if (buscando) {
        const patron = `%${q}%`;
        conditions.push('(v.descripcion LIKE ? OR c.nombre LIKE ? OR s.nombre LIKE ?)');
        params.push(patron, patron, patron);
    }

    // Filtros físicos manuales (por pestaña; ignorados al buscar).
    let marcaFiltrosActivos = false;
    const manuales = [
        ['edad', 'v.rango_edad'],
        ['ojos', 'cf.forma_ojos'],
        ['nariz', 'cf.tipo_nariz'],
        ['labios', 'cf.tipo_labios'],
        ['boca', 'cf.tipo_labios'],
        ['rostro', 'cf.tipo_rostro'],
        ['piel_color', 'cf.color_piel'],
        ['piel_tipo', 'cf.tipo_piel']
    ];

    if (!buscando) {
        let aplicados = 0;
        for (const [clave, columna] of manuales) {
            const valor = buscar(clave);
            if (valor) {
                conditions.push(`${columna} = ?`);
                params.push(valor);
                aplicados++;
            }
        }

        // Toggle “filtrar por mis características” (RQFN88 / RQNFN35): requiere sesión.
        activarMios = sesion && caracsUsuario && buscar('mis_caracteristicas') === '1';
        if (activarMios) {
            const suyos = [
                ['forma_ojos', 'cf.forma_ojos'],
                ['tipo_nariz', 'cf.tipo_nariz'],
                ['tipo_labios', 'cf.tipo_labios'],
                ['tipo_rostro', 'cf.tipo_rostro'],
                ['color_piel', 'cf.color_piel'],
                ['tipo_piel', 'cf.tipo_piel']
            ];
            for (const [campo, columna] of suyos) {
                conditions.push(`${columna} = ?`);
                params.push(caracsUsuario[campo]);
            }
            cantCondicionesMios = suyos.length;
            marcaFiltrosActivos = true;
        }

        // RQFN85: marca activa cuando TODOS los filtros aplicados coinciden con
        // las características físicas registradas del usuario.
        if (sesion && caracsUsuario && aplicados > 0) {
            const referencias = [
                ['edad', rangoDeEdad(caracsUsuario.edad)],
                ['ojos', caracsUsuario.forma_ojos],
                ['nariz', caracsUsuario.tipo_nariz],
                ['labios', caracsUsuario.tipo_labios],
                ['boca', caracsUsuario.tipo_labios],
                ['rostro', caracsUsuario.tipo_rostro],
                ['piel_color', caracsUsuario.color_piel],
                ['piel_tipo', caracsUsuario.tipo_piel]
            ];
            let todosCoinciden = true;
            for (const [clave, valorUsuario] of referencias) {
                const aplicado = buscar(clave);
                if (aplicado && (!valorUsuario || aplicado !== valorUsuario)) {
                    todosCoinciden = false;
                }
            }
            if (todosCoinciden) marcaFiltrosActivos = true;
        }
    }

    const whereTexto = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const paramsWhere = params.slice();

    // Ordenamiento (RQFN92/93/95/97/99 y RQFN83/84).
    const orden = ORDEN_VALIDA.has(req.query.orden) ? req.query.orden : 'semejanza';
    let ordenBase;
    switch (orden) {
        case 'relevantes':
            ordenBase = 'COALESCE(co.cantidad, 0) DESC, v.cantidad_likes DESC, v.fecha_publicacion DESC';
            break;
        case 'fecha':
            ordenBase = 'v.fecha_publicacion DESC';
            break;
        case 'cultura':
            ordenBase = 'c.nombre ASC, v.fecha_publicacion DESC';
            break;
        case 'subestilo':
            ordenBase = 's.nombre ASC, v.fecha_publicacion DESC';
            break;
        case 'semejanza':
        default:
            ordenBase = 'semejanza_calc IS NULL ASC, semejanza_calc DESC, v.cantidad_likes DESC, v.fecha_publicacion DESC';
            break;
    }

    // Boost por preferencias del usuario (RQFN84): solo aplica si ya hay likes.
    let boostSQL = '';
    let boostParams = [];
    if (sesion) {
        const preferencias = await obtenerPreferencias(pool, sesion.id);
        const partesBoost = [];
        if (preferencias.culturas.length > 0) {
            partesBoost.push('CASE WHEN FIND_IN_SET(v.cultura_id, ?) > 0 THEN 0 ELSE 1 END ASC');
            boostParams.push(preferencias.culturas.join(','));
        }
        if (preferencias.subculturas.length > 0) {
            partesBoost.push('CASE WHEN FIND_IN_SET(v.subcultura_id, ?) > 0 THEN 0 ELSE 1 END ASC');
            boostParams.push(preferencias.subculturas.join(','));
        }
        if (partesBoost.length > 0) {
            partesBoost.push('semejanza_calc IS NULL ASC, semejanza_calc DESC, v.cantidad_likes DESC');
            boostSQL = partesBoost.join(', ');
        }
    }
    // En el path normal los parámetros del boost van después de los del WHERE.
    params.push(...boostParams);
    const ordenFULL = boostSQL ? `ORDER BY ${boostSQL}` : `ORDER BY ${ordenBase}`;

    try {
        // Conteo total de la envolvente estricta (misma envolvente, sin orden/paginación).
        const [totalRows] = await pool.execute(
            `SELECT COUNT(*) AS total ${JOINS_VIDEO} ${whereTexto}`,
            paramsWhere
        );
        let total = Number(totalRows[0].total);

        const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 30, 1), 60);
        const pagina = Math.max(parseInt(req.query.pagina, 10) || 1, 1);
        const offset = (pagina - 1) * limite;

        // Fallback por coincidencia física: si el filtrado estricto por "Mis
        // características" (RQFN88) no devuelve videos, se dividen por apartados
        // de coincidencia (todos → color de piel → ojos → rostro → labios → nariz);
        // si ningún video coincide con ningún rasgo, se muestran todos en el
        // orden original precedidos por un aviso en el frontend.
        let coincidenciaParcial = false;
        let sinCoincidencia = false;
        let selectSQL = `SELECT ${COLUMNAS_VIDEO} ${JOINS_VIDEO} ${whereTexto} ${ordenFULL}`;
        let selectParams = params.slice();
        if (activarMios && total === 0 && cantCondicionesMios > 0) {
            // Quita SOLO las condiciones de "Mis características" (son siempre
            // las últimas: 6 condiciones), conservando tab/cultura/q/manuales.
            const condicionesSinMios = conditions.slice(0, conditions.length - cantCondicionesMios);
            const baseWhere = condicionesSinMios.length > 0 ? `WHERE ${condicionesSinMios.join(' AND ')}` : '';
            const paramsSinMios = paramsWhere.slice(0, paramsWhere.length - cantCondicionesMios);

            // Recalcula el total sobre la envolvente sin las condiciones del usuario.
            const [fRows] = await pool.execute(
                `SELECT COUNT(*) AS total ${JOINS_VIDEO} ${baseWhere}`,
                paramsSinMios
            );
            total = Number(fRows[0].total);

            // Subconsulta que expone un booleano (m0..m4) por rasgo priorizado:
            // color_de_piel, forma_de_ojos, tipo_de_rostro, tipo_de_labios, tipo_de_nariz.
            const coincVals = PRIORIDAD_COINCIDENCIA.map(([campo]) => caracsUsuario[campo]);
            const mSelect = PRIORIDAD_COINCIDENCIA.map(
                ([, columna], i) => `COALESCE(${columna} = ?, 0) AS m${i}`
            ).join(', ');
            const subSQL = `SELECT ${COLUMNAS_VIDEO}, ${mSelect} ${JOINS_VIDEO} ${baseWhere}`;
            const subParams = [...coincVals, ...paramsSinMios];

            // ¿Hay al menos un video que coincida con algún rasgo priorizado?
            const [cntRows] = await pool.execute(
                `SELECT COUNT(*) AS total FROM (${subSQL}) t WHERE m0 OR m1 OR m2 OR m3 OR m4`,
                subParams
            );
            const coinciden = Number(cntRows[0].total);

            if (coinciden === 0) {
                // Cero coincidencias: se muestran TODOS en el orden original.
                sinCoincidencia = true;
                selectSQL = `SELECT ${COLUMNAS_VIDEO} ${JOINS_VIDEO} ${baseWhere} ${ordenFULL}`;
                selectParams = [...paramsSinMios, ...boostParams];
            } else {
                // Hay coincidencias: cada video va al apartado del rasgo de mayor
                // prioridad que calza (todos → piel → ojos → rostro → labios → nariz).
                coincidenciaParcial = true;
                // El total real en modo parcial son las coincidencias, no la envolvente
                // (evita hasMore con páginas vacías tras agotar los apartados).
                total = coinciden;
                const darApartado = `CASE
                    WHEN t.m0 AND t.m1 AND t.m2 AND t.m3 AND t.m4 THEN 0
                    WHEN t.m0 THEN 1
                    WHEN t.m1 THEN 2
                    WHEN t.m2 THEN 3
                    WHEN t.m3 THEN 4
                    WHEN t.m4 THEN 5
                    ELSE -1 END AS apartado`;
                const dentroDeApartado = boostSQL
                    ? boostSQL.replace(/v\./g, 't.')
                    : 'semejanza_calc IS NULL ASC, semejanza_calc DESC, t.cantidad_likes DESC, t.fecha_publicacion DESC';
                selectSQL = `SELECT t.*, ${darApartado}
                    FROM (${subSQL}) t
                    WHERE t.m0 OR t.m1 OR t.m2 OR t.m3 OR t.m4
                    ORDER BY apartado ASC, ${dentroDeApartado}`;
                selectParams = [...subParams, ...boostParams];
            }
        }

        // LIMIT/OFFSET inline (enteros ya validados): mysql2 envía los números
        // JS como MYSQL_TYPE_DOUBLE y MySQL 8.0.22+ lo rechaza en LIMIT con
        // ER_WRONG_ARGUMENTS (1210); MariaDB lo toleraba. Ver AGENTS.md §13.
        const [rows] = await pool.execute(
            `${selectSQL} LIMIT ${limite} OFFSET ${offset}`,
            selectParams
        );

        const videos = rows.map((fila) => {
            const video = armarVideo(fila);
            if (coincidenciaParcial && fila.apartado !== undefined && fila.apartado >= 0) {
                video.apartado = APARTADOS_CODIGO[fila.apartado];
            }
            return video;
        });
        res.json({
            success: true,
            videos,
            total,
            pagina,
            limite,
            hasMore: offset + videos.length < total,
            marcaFiltrosActivos,
            coincidenciaParcial,
            sinCoincidencia
        });
    } catch (error) {
        console.error('Error en GET /videos:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -------------------------------------------------------------------
// GET /videos/filtros - Valores canónicos para los selectores de filtro
// -------------------------------------------------------------------
// OJO: esta ruta DEBE seguir registrada antes que `GET /videos/:id` de abajo.
// Si alguien "optimiza" el orden, `/videos/filtros` cae en el patrón `:id`,
// falla la guarda /^\d+$/ y responde 400 en lugar de 200.
router.get('/videos/filtros', async (req, res) => {
    const pool = req.pool;
    try {
        const d = {};
        const columnas = [
            ['forma_ojos', 'ojos'],
            ['tipo_nariz', 'narices'],
            ['tipo_labios', 'labios'],
            ['tipo_rostro', 'rostros'],
            ['color_piel', 'coloresPiel'],
            ['tipo_piel', 'tiposPiel']
        ];
        for (const [col, clave] of columnas) {
            const [rows] = await pool.execute(
                `SELECT DISTINCT ${col} AS valor FROM caracteristicas_fisicas ORDER BY valor`
            );
            d[clave] = rows.map((r) => r.valor);
        }
        const [edades] = await pool.execute(
            'SELECT DISTINCT rango_edad AS valor FROM videos ORDER BY rango_edad'
        );
        d.edades = edades.map((r) => r.valor);
        res.json({ success: true, filtros: d });
    } catch (error) {
        console.error('Error en GET /videos/filtros:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -------------------------------------------------------------------
// Detalle de video (RQFN100-120). Se inyecta antes de module.exports.
// El archivo ya trae: express, verificarToken (helpers/jwt),
// armarVideo (helpers/videos), obtenerSesion(req) para sesión
// opcional y CATEGORIA_VALIDA. Solo se agregan los requires de
// resolverFotoPerfil y verificarAcceso.
// -------------------------------------------------------------------

router.get('/videos/:id', async (req, res) => {
    const pool = req.pool;
    const { id } = req.params;
    const sesion = await obtenerSesion(req);

    try {
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'Identificador de video inválido.' });
        }

        const [filas] = await pool.execute(
            `SELECT ${COLUMNAS_VIDEO}
             ${JOINS_VIDEO}
             WHERE v.id = ? LIMIT 1`,
            [id]
        );
        if (filas.length === 0) {
            return res.status(404).json({ error: 'Video no encontrado.' });
        }

        const video = armarVideo(filas[0]);

        const [pasosRows] = await pool.execute(
            'SELECT id, tipo_paso, contenido, orden FROM pasos_maquillaje WHERE video_id = ? ORDER BY orden ASC',
            [id]
        );
        video.pasosMaquillaje = pasosRows.map((p) => ({
            id: Number(p.id),
            tipo: p.tipo_paso,
            contenido: p.contenido,
            orden: Number(p.orden)
        }));

        const [galeriaRows] = await pool.execute(
            'SELECT id, url_imagen, orden FROM imagenes_video WHERE video_id = ? ORDER BY orden ASC',
            [id]
        );
        video.galeria = galeriaRows.map((g) => ({
            id: Number(g.id),
            url: g.url_imagen,
            orden: Number(g.orden)
        }));

        const [comentariosRows] = await pool.execute(
            `SELECT co.id, co.usuario_id, co.comentario_padre_id, co.texto, co.cantidad_likes, co.fecha,
                    u.nombre_usuario AS autor_nombre, u.foto_perfil AS autor_foto
             FROM comentarios co
             JOIN usuarios u ON u.id = co.usuario_id
             WHERE co.video_id = ? AND co.comentario_padre_id IS NULL
             ORDER BY co.fecha ASC`,
            [id]
        );
        const [respuestasRows] = await pool.execute(
            `SELECT co.id, co.usuario_id, co.comentario_padre_id, co.texto, co.cantidad_likes, co.fecha,
                    u.nombre_usuario AS autor_nombre, u.foto_perfil AS autor_foto
             FROM comentarios co
             JOIN usuarios u ON u.id = co.usuario_id
             WHERE co.video_id = ? AND co.comentario_padre_id IS NOT NULL
             ORDER BY co.fecha ASC`,
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
        video.comentarios = comentariosRows.map((c) =>
            armarComentario(c, respuestasPorPadre.get(Number(c.id)) || [])
        );
        video.cantidadComentarios =
            video.comentarios.length + respuestasRows.length;

        const grupoRazones = video.categoria === 'Tutorial' ? 'tutorial' : 'maquillaje';
        const [razonesRows] = await pool.execute(
            'SELECT id, descripcion, es_alternativo FROM razones_voto_contra WHERE video = ? ORDER BY id ASC',
            [grupoRazones]
        );
        video.razonesVotoContra = razonesRows.map((r) => ({
            id: Number(r.id),
            descripcion: r.descripcion,
            esAlternativo: Number(r.es_alternativo) === 1
        }));

        const [etiquetasRows] = await pool.execute(
            'SELECT id, etiqueta FROM etiquetas_video WHERE video_id = ? ORDER BY orden ASC, id ASC',
            [id]
        );
        video.etiquetas = etiquetasRows.map((e) => ({
            id: Number(e.id),
            etiqueta: e.etiqueta,
            orden: Number(e.orden)
        }));

        const estado = { like: false, guardado: false, voto: null };
        video.yaSigo = false;
        if (sesion) {
            const [likeRows] = await pool.execute(
                'SELECT 1 AS x FROM likes_video WHERE usuario_id = ? AND video_id = ? LIMIT 1',
                [sesion.id, id]
            );
            estado.like = likeRows.length > 0;
            const [guardadoRows] = await pool.execute(
                'SELECT 1 AS x FROM videos_guardados WHERE usuario_id = ? AND video_id = ? LIMIT 1',
                [sesion.id, id]
            );
            estado.guardado = guardadoRows.length > 0;
            const [votoRows] = await pool.execute(
                'SELECT tipo_voto FROM votos_video WHERE usuario_id = ? AND video_id = ? LIMIT 1',
                [sesion.id, id]
            );
            estado.voto = votoRows.length > 0 ? votoRows[0].tipo_voto : null;

            if (Number(sesion.id) !== Number(filas[0].usuario_id)) {
                const [siguiendoRows] = await pool.execute(
                    'SELECT 1 AS x FROM seguidores WHERE seguidor_id = ? AND seguido_id = ? LIMIT 1',
                    [sesion.id, filas[0].usuario_id]
                );
                video.yaSigo = siguiendoRows.length > 0;
            }
        }
        video.estadoPropio = estado;
        video.esDueño = sesion ? Number(sesion.id) === Number(filas[0].usuario_id) : false;

        res.json({ success: true, video });
    } catch (error) {
        console.error('Error en GET /videos/:id:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

router.post('/videos/:id/like', verificarAcceso, async (req, res) => {
    const pool = req.pool;
    const userId = req.user.id;
    const { id } = req.params;
    try {
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'Identificador de video inválido.' });
        }
        const [videoRows] = await pool.execute(
            'SELECT usuario_id, cantidad_likes FROM videos WHERE id = ? LIMIT 1',
            [id]
        );
        if (videoRows.length === 0) {
            return res.status(404).json({ error: 'Video no encontrado.' });
        }
        const totalActual = Number(videoRows[0].cantidad_likes);

        const [existe] = await pool.execute(
            'SELECT 1 AS x FROM likes_video WHERE usuario_id = ? AND video_id = ? LIMIT 1',
            [userId, id]
        );
        if (existe.length > 0) {
            await pool.execute(
                'DELETE FROM likes_video WHERE usuario_id = ? AND video_id = ?',
                [userId, id]
            );
            await pool.execute(
                'UPDATE videos SET cantidad_likes = GREATEST(cantidad_likes - 1, 0) WHERE id = ?',
                [id]
            );
            return res.json({
                success: true,
                like: false,
                cantidadLikes: Math.max(totalActual - 1, 0)
            });
        }

        await pool.execute(
            'INSERT INTO likes_video (usuario_id, video_id) VALUES (?, ?)',
            [userId, id]
        );
        await pool.execute(
            'UPDATE videos SET cantidad_likes = cantidad_likes + 1 WHERE id = ?',
            [id]
        );

        if (Number(videoRows[0].usuario_id) !== Number(userId)) {
            const [actorRows] = await pool.execute(
                'SELECT nombre_usuario FROM usuarios WHERE id = ? LIMIT 1',
                [userId]
            );
            await pool.execute(
                `INSERT INTO notificaciones (usuario_id, tipo, mensaje, video_id, usuario_actor_id)
                 VALUES (?, 'nuevo_like', ?, ?, ?)`,
                [
                    videoRows[0].usuario_id,
                    `${actorRows[0].nombre_usuario} le dio like a tu video`,
                    Number(id),
                    userId
                ]
            );
        }

        res.json({ success: true, like: true, cantidadLikes: totalActual + 1 });
    } catch (error) {
        console.error('Error en POST /videos/:id/like:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

router.post('/videos/:id/voto', verificarAcceso, async (req, res) => {
    const pool = req.pool;
    const userId = req.user.id;
    const { id } = req.params;
    const { voto, razones, estiloAlternativoId } = req.body || {};
    try {
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'Identificador de video inválido.' });
        }
        if (voto !== 'favor' && voto !== 'contra') {
            return res.status(400).json({ error: 'El voto debe ser favor o contra.' });
        }
        if (voto === 'contra' && (!Array.isArray(razones) || razones.length === 0)) {
            return res.status(400).json({
                error: 'Elige al menos una razón para el voto en contra.'
            });
        }
        const [videoRows] = await pool.execute(
            'SELECT id, usuario_id, categoria_contenido, subcultura_id FROM videos WHERE id = ? LIMIT 1',
            [id]
        );
        if (videoRows.length === 0) {
            return res.status(404).json({ error: 'Video no encontrado.' });
        }
        const v = videoRows[0];

        // Solo acepta razones del grupo del video (maquillaje vs tutorial).
        const grupo = v.categoria_contenido === 'Tutorial' ? 'tutorial' : 'maquillaje';
        const [razonesPermitidas] = await pool.execute(
            'SELECT id, es_alternativo FROM razones_voto_contra WHERE video = ?',
            [grupo]
        );
        const razonValida = new Map();
        razonesPermitidas.forEach((r) => razonValida.set(Number(r.id), Number(r.es_alternativo) === 1));

        // Si el usuario marcó la razón "Selección de estilo alternativo", debe
        // elegir una subcultura distinta a la del propio video.
        let estiloAlt = null;
        if (voto === 'contra') {
            const idsElegidas = new Set(razones.map(Number));
            const requiereAlternativa = [...razonValida.entries()].some(
                ([rid, esAlt]) => esAlt && idsElegidas.has(rid)
            );
            if (requiereAlternativa) {
                estiloAlt = Number(estiloAlternativoId);
                if (!Number.isInteger(estiloAlt) || estiloAlt <= 0) {
                    return res.status(400).json({
                        error: 'Si eliges "Selección de estilo alternativo" debes indicar el estilo.'
                    });
                }
                if (estiloAlt === Number(v.subcultura_id)) {
                    return res.status(400).json({
                        error: 'El estilo alternativo debe ser distinto al del video.'
                    });
                }
                const [estiloRows] = await pool.execute(
                    'SELECT id FROM subculturas_estilos WHERE id = ? LIMIT 1',
                    [estiloAlt]
                );
                if (estiloRows.length === 0) {
                    return res.status(400).json({ error: 'El estilo alternativo no existe.' });
                }
            }
        }

        const [previo] = await pool.execute(
            'SELECT id FROM votos_video WHERE usuario_id = ? AND video_id = ? LIMIT 1',
            [userId, id]
        );
        if (previo.length > 0) {
            await pool.execute('DELETE FROM voto_razones WHERE voto_id = ?', [previo[0].id]);
            await pool.execute('DELETE FROM votos_video WHERE id = ?', [previo[0].id]);
        }

        const [ins] = await pool.execute(
            'INSERT INTO votos_video (video_id, usuario_id, tipo_voto) VALUES (?, ?, ?)',
            [id, userId, voto]
        );
        for (const razonId of voto === 'contra' ? razones : []) {
            const num = Number(razonId);
            if (!razonValida.has(num)) continue;
            await pool.execute(
                'INSERT INTO voto_razones (voto_id, razon_id, estilo_alternativo_id) VALUES (?, ?, ?)',
                [ins.insertId, num, razonValida.get(num) ? estiloAlt : null]
            );
        }

        const [contadores] = await pool.execute(
            `SELECT
                SUM(tipo_voto = 'favor') AS favor,
                SUM(tipo_voto = 'contra') AS contra
             FROM votos_video WHERE video_id = ?`,
            [id]
        );
        const favor = Number(contadores[0].favor) || 0;
        const contra = Number(contadores[0].contra) || 0;
        const total = favor + contra;
        const porcentaje = total > 0 ? Math.round((favor / total) * 100) : 0;
        await pool.execute(
            'UPDATE videos SET votos_favor = ?, votos_contra = ?, porcentaje_semejanza = ? WHERE id = ?',
            [favor, contra, porcentaje, id]
        );

        // RQFN71/RQFN72: si el voto dejó el video por debajo del 40% de
        // semejanza, se avisa al dueño (una sola vez por video).
        const avisoEnviado = await avisarSemejanzaBaja(pool, {
            videoId: Number(id),
            duenioId: Number(v.usuario_id),
            votanteId: Number(userId),
            porcentaje,
            totalVotos: total
        });

        res.json({
            success: true,
            voto,
            votos: { favor, contra },
            porcentajeSemejanza: porcentaje,
            ...(avisoEnviado ? { avisoSemejanza: true } : {})
        });
    } catch (error) {
        console.error('Error en POST /videos/:id/voto:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

router.post('/videos/:id/visto', verificarAcceso, async (req, res) => {
    const pool = req.pool;
    const userId = req.user.id;
    const { id } = req.params;
    try {
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'Identificador de video inválido.' });
        }
        const [videoRows] = await pool.execute(
            'SELECT id FROM videos WHERE id = ? LIMIT 1',
            [id]
        );
        if (videoRows.length === 0) {
            return res.status(404).json({ error: 'Video no encontrado.' });
        }
        // RQNFN20: cada visualización re-posiciona el video al tope de la
        // lista "Vistas" (la PK (usuario_id, video_id) ya existe). La vista
        // solo cuenta una vez: un re-visionado actualiza fecha_visto sin
        // incrementar el contador ni duplicar la fila.
        const [insertado] = await pool.execute(
            `INSERT INTO videos_vistos (usuario_id, video_id) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE fecha_visto = NOW()`,
            [userId, id]
        );
        if (insertado.affectedRows === 1) {
            await pool.execute(
                'UPDATE videos SET cantidad_vistas = cantidad_vistas + 1 WHERE id = ?',
                [id]
            );
        }
        res.json({ success: true, registrado: insertado.affectedRows === 1 });
    } catch (error) {
        console.error('Error en POST /videos/:id/visto:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -------------------------------------------------------------------
// GET /videos/:id/estadisticas - Estadísticas del video para su dueño
// (gráficas "de los requerimientos"): totales acumulados + tendencia
// diaria de los últimos 14 días. Cada tabla de interacción tiene su
// propia fecha (videos_vistos.fecha_visto, likes_video.fecha,
// videos_guardados.fecha_guardado, videos_compartidos.fecha_compartido,
// votos_video.fecha, comentarios.fecha), así que la serie se arma
// agrupando por DATE() y fusionando en JS sobre un calendario de 14 días.
// -------------------------------------------------------------------
router.get('/videos/:id/estadisticas', verificarAcceso, async (req, res) => {
    const pool = req.pool;
    const userId = req.user.id;
    const { id } = req.params;
    try {
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'Identificador de video inválido.' });
        }
        const [vids] = await pool.execute(
            `SELECT v.usuario_id, v.votos_favor, v.votos_contra,
                    v.cantidad_vistas, v.cantidad_likes,
                    v.cantidad_guardados, v.cantidad_compartidos,
                    v.categoria_contenido, v.fecha_publicacion
             FROM videos v WHERE v.id = ? LIMIT 1`,
            [id]
        );
        if (vids.length === 0) {
            return res.status(404).json({ error: 'Video no encontrado.' });
        }
        if (Number(vids[0].usuario_id) !== userId) {
            return res.status(403).json({ error: 'Solo el autor del video puede ver sus estadísticas.' });
        }

        const [comRows] = await pool.execute(
            'SELECT COUNT(*) AS c FROM comentarios WHERE video_id = ?',
            [id]
        );
        const votosFavor = Number(vids[0].votos_favor) || 0;
        const votosContra = Number(vids[0].votos_contra) || 0;
        const resumen = {
            vistas: Number(vids[0].cantidad_vistas) || 0,
            likes: Number(vids[0].cantidad_likes) || 0,
            guardados: Number(vids[0].cantidad_guardados) || 0,
            compartidos: Number(vids[0].cantidad_compartidos) || 0,
            comentarios: Number(comRows[0].c) || 0,
            votosFavor,
            votosContra,
            votosTotal: votosFavor + votosContra,
            semejanza: calcularSemejanza(votosFavor, votosContra)
        };

        const [hoyRows] = await pool.execute('SELECT CURDATE() AS hoy');
        const hoy = new Date(hoyRows[0].hoy);
        const fechaInicio =
            `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
        const dias = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date(`${fechaInicio}T12:00:00`);
            d.setDate(d.getDate() - i);
            dias.push(
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            );
        }

        // RQNFN44: días transcurridos desde la publicación del video.
        const diasEnElSistema = vids[0].fecha_publicacion
            ? Math.max(0, Math.floor((hoy - new Date(vids[0].fecha_publicacion)) / 86400000))
            : 0;

        // RQNFN40/43: listado de elementos en contra por razón. La fórmula
        // literal del DER (R = VotosEnContraTotal*100/VotosAEsaCasilla) es
        // indefinida con 0 votos y arroja >100%, así que se implementa la
        // forma estándar: R = (VotosAEsaCasilla * 100) / VotosEnContraTotal.
        const razonesGrupo = vids[0].categoria_contenido === 'Tutorial' ? 'tutorial' : 'maquillaje';
        const [razonesRows] = await pool.execute(
            `SELECT r.id, r.descripcion, COUNT(vv.id) AS votos
             FROM razones_voto_contra r
             LEFT JOIN voto_razones vr ON vr.razon_id = r.id
             LEFT JOIN votos_video vv ON vv.id = vr.voto_id
                    AND vv.tipo_voto = 'contra' AND vv.video_id = ?
             WHERE r.video = ?
             GROUP BY r.id, r.descripcion
             ORDER BY r.id ASC`,
            [id, razonesGrupo]
        );
        const enContraPorRazon = [];
        if (votosContra === 0) {
            enContraPorRazon.push({
                id: 0,
                descripcion: 'Sin votos en contra',
                votos: 0,
                porcentaje: 0,
                sinVotos: true
            });
        } else {
            razonesRows.forEach((r) => {
                const votos = Number(r.votos) || 0;
                enContraPorRazon.push({
                    id: Number(r.id),
                    descripcion: r.descripcion,
                    votos,
                    porcentaje: Math.round((votos * 100) / votosContra)
                });
            });
        }

        const Y = `WHERE video_id = ? AND fecha >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)`;

        const [vistos] = await pool.execute(
            `SELECT DATE(fecha_visto) AS d, COUNT(*) AS c FROM videos_vistos WHERE video_id = ? AND fecha_visto >= DATE_SUB(CURDATE(), INTERVAL 13 DAY) GROUP BY DATE(fecha_visto)`, [id]);
        const [likes] = await pool.execute(
            `SELECT DATE(fecha) AS d, COUNT(*) AS c FROM likes_video ${Y} GROUP BY DATE(fecha)`, [id]);
        const [guardados] = await pool.execute(
            `SELECT DATE(fecha_guardado) AS d, COUNT(*) AS c FROM videos_guardados WHERE video_id = ? AND fecha_guardado >= DATE_SUB(CURDATE(), INTERVAL 13 DAY) GROUP BY DATE(fecha_guardado)`, [id]);
        const [compartidos] = await pool.execute(
            `SELECT DATE(fecha_compartido) AS d, COUNT(*) AS c FROM videos_compartidos WHERE video_id = ? AND fecha_compartido >= DATE_SUB(CURDATE(), INTERVAL 13 DAY) GROUP BY DATE(fecha_compartido)`, [id]);
        const [comentarios] = await pool.execute(
            `SELECT DATE(fecha) AS d, COUNT(*) AS c FROM comentarios ${Y} GROUP BY DATE(fecha)`, [id]);
        const [votos] = await pool.execute(
            `SELECT DATE(fecha) AS d, SUM(tipo_voto = 'favor') AS f, SUM(tipo_voto = 'contra') AS c
             FROM votos_video ${Y} GROUP BY DATE(fecha)`, [id]);

        const formatearDia = (d) => (d instanceof Date
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    : String(d).slice(0, 10));
        const mapa = (rows, sel) => rows.reduce((acc, r) => acc.set(formatearDia(r.d), sel(r)), new Map());
        const vistosPorDia = mapa(vistos, (r) => Number(r.c));
        const likesPorDia = mapa(likes, (r) => Number(r.c));
        const guardadosPorDia = mapa(guardados, (r) => Number(r.c));
        const compartidosPorDia = mapa(compartidos, (r) => Number(r.c));
        const comentariosPorDia = mapa(comentarios, (r) => Number(r.c));
        const votosPorDia = mapa(votos, (r) => ({ favor: Number(r.f), contra: Number(r.c) }));

        const diario = dias.map((fecha) => {
            const votosDia = votosPorDia.get(fecha) || { favor: 0, contra: 0 };
            return {
                fecha,
                vistas: vistosPorDia.get(fecha) || 0,
                likes: likesPorDia.get(fecha) || 0,
                guardados: guardadosPorDia.get(fecha) || 0,
                compartidos: compartidosPorDia.get(fecha) || 0,
                comentarios: comentariosPorDia.get(fecha) || 0,
                votosFavor: votosDia.favor,
                votosContra: votosDia.contra
            };
        });

        resumen.diasEnElSistema = diasEnElSistema;
        res.json({ success: true, estadisticas: { resumen, diario, enContraPorRazon, desde: dias[0], hasta: dias[dias.length - 1] } });
    } catch (error) {
        console.error('Error en GET /videos/:id/estadisticas:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

router.post('/videos/:id/guardar', verificarAcceso, async (req, res) => {
    const pool = req.pool;
    const userId = req.user.id;
    const { id } = req.params;
    try {
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'Identificador de video inválido.' });
        }
        const [videoRows] = await pool.execute(
            'SELECT cantidad_guardados FROM videos WHERE id = ? LIMIT 1',
            [id]
        );
        if (videoRows.length === 0) {
            return res.status(404).json({ error: 'Video no encontrado.' });
        }
        const totalActual = Number(videoRows[0].cantidad_guardados);

        const [existe] = await pool.execute(
            'SELECT 1 AS x FROM videos_guardados WHERE usuario_id = ? AND video_id = ? LIMIT 1',
            [userId, id]
        );
        if (existe.length > 0) {
            await pool.execute(
                'DELETE FROM videos_guardados WHERE usuario_id = ? AND video_id = ?',
                [userId, id]
            );
            await pool.execute(
                'UPDATE videos SET cantidad_guardados = GREATEST(cantidad_guardados - 1, 0) WHERE id = ?',
                [id]
            );
            return res.json({
                success: true,
                guardado: false,
                cantidadGuardados: Math.max(totalActual - 1, 0)
            });
        }
        await pool.execute(
            'INSERT INTO videos_guardados (usuario_id, video_id) VALUES (?, ?)',
            [userId, id]
        );
        await pool.execute(
            'UPDATE videos SET cantidad_guardados = cantidad_guardados + 1 WHERE id = ?',
            [id]
        );
        res.json({
            success: true,
            guardado: true,
            cantidadGuardados: totalActual + 1
        });
    } catch (error) {
        console.error('Error en POST /videos/:id/guardar:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

router.post('/videos/:id/compartir', verificarAcceso, async (req, res) => {
    const pool = req.pool;
    const userId = req.user.id;
    const { id } = req.params;
    try {
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'Identificador de video inválido.' });
        }
        const [videoRows] = await pool.execute(
            'SELECT cantidad_compartidos FROM videos WHERE id = ? LIMIT 1',
            [id]
        );
        if (videoRows.length === 0) {
            return res.status(404).json({ error: 'Video no encontrado.' });
        }
        const totalActual = Number(videoRows[0].cantidad_compartidos);

        const [insertado] = await pool.execute(
            'INSERT IGNORE INTO videos_compartidos (usuario_id, video_id) VALUES (?, ?)',
            [userId, id]
        );
        const nuevo = insertado.affectedRows > 0;
        if (nuevo) {
            await pool.execute(
                'UPDATE videos SET cantidad_compartidos = cantidad_compartidos + 1 WHERE id = ?',
                [id]
            );
        }
        res.json({
            success: true,
            nuevo,
            cantidadCompartidos: nuevo ? totalActual + 1 : totalActual
        });
    } catch (error) {
        console.error('Error en POST /videos/:id/compartir:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

router.post('/videos/:id/comentarios', verificarAcceso, async (req, res) => {
    const pool = req.pool;
    const userId = req.user.id;
    const { id } = req.params;
    const { texto, comentario_padre_id } = req.body || {};
    try {
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'Identificador de video inválido.' });
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
        const [videoRows] = await pool.execute(
            'SELECT usuario_id FROM videos WHERE id = ? LIMIT 1',
            [id]
        );
        if (videoRows.length === 0) {
            return res.status(404).json({ error: 'Video no encontrado.' });
        }

        let padreId = null;
        let destinatario = videoRows[0].usuario_id;
        if (comentario_padre_id) {
            if (!/^\d+$/.test(String(comentario_padre_id))) {
                return res.status(400).json({ error: 'Comentario padre inválido.' });
            }
            const [padreRows] = await pool.execute(
                'SELECT id, usuario_id FROM comentarios WHERE id = ? AND video_id = ? LIMIT 1',
                [comentario_padre_id, id]
            );
            if (padreRows.length === 0) {
                return res.status(404).json({ error: 'El comentario no existe.' });
            }
            padreId = padreRows[0].id;
            destinatario = padreRows[0].usuario_id;
        }

        const [ins] = await pool.execute(
            'INSERT INTO comentarios (usuario_id, video_id, comentario_padre_id, texto) VALUES (?, ?, ?, ?)',
            [userId, id, padreId, limpio]
        );

        if (Number(destinatario) !== Number(userId)) {
            const [actorRows] = await pool.execute(
                'SELECT nombre_usuario FROM usuarios WHERE id = ? LIMIT 1',
                [userId]
            );
            // RQFN71 distingue los dos casos: un comentario raíz va al dueño
            // del video ("comentó tu video") y una respuesta va a quien
            // escribió el comentario padre ("respondió a tu comentario").
            const mensaje = padreId
                ? `${actorRows[0].nombre_usuario} respondió a tu comentario`
                : `${actorRows[0].nombre_usuario} comentó tu video`;
            await pool.execute(
                `INSERT INTO notificaciones (usuario_id, tipo, mensaje, video_id, usuario_actor_id)
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
        console.error('Error en POST /videos/:id/comentarios:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

router.post('/videos/:id/comentarios/:cid/like', verificarAcceso, async (req, res) => {
    const pool = req.pool;
    const userId = req.user.id;
    const { id, cid } = req.params;
    try {
        if (!/^\d+$/.test(id) || !/^\d+$/.test(cid)) {
            return res.status(400).json({ error: 'Identificador inválido.' });
        }
        const [comentarioRows] = await pool.execute(
            'SELECT usuario_id, cantidad_likes FROM comentarios WHERE id = ? AND video_id = ? LIMIT 1',
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
                `INSERT INTO notificaciones (usuario_id, tipo, mensaje, video_id, usuario_actor_id)
                 VALUES (?, 'like_comentario', ?, ?, ?)`,
                [
                    comentarioRows[0].usuario_id,
                    `${actorRows[0].nombre_usuario} le dio like a tu comentario`,
                    Number(id),
                    userId
                ]
            );
        }
        res.json({ success: true, like: true, cantidadLikes: totalActual + 1 });
    } catch (error) {
        console.error('Error en POST /videos/:id/comentarios/:cid/like:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -------------------------------------------------------------------
// POST /videos - Crear una publicación (RQFN121-125)
// -------------------------------------------------------------------
// Recibe URLs ya subidas a Cloudinary (el frontend sube con el Upload
// Widget) y modera ANTES de escribir en la base de datos. En "Video
// Maquillajes" el video es obligatorio; en los flujos de tutorial las
// imágenes (1..5) son obligatorias y el video es opcional. Los pasos solo
// aplican a tutoriales. Crea el trigger nuevo_contenido_seguido (RQFN122).
router.post('/videos', verificarAcceso, async (req, res) => {
    const pool = req.pool;
    const userId = req.user.id;
    const {
        categoria_contenido,
        cultura_id,
        subcultura_id,
        url_video,
        descripcion,
        rango_edad,
        proporcion,
        imagenes,
        etiquetas,
        pasos,
        caracteristicas
    } = req.body || {};

    let conexion = null;
    try {
        // 1) Categoría y clasificación cultura/subestilo
        if (!CATEGORIA_VALIDA.has(categoria_contenido)) {
            return res.status(400).json({ error: 'Categoría inválida.' });
        }
        const esTutorial = categoria_contenido !== 'Video Maquillajes';

        if (!/^\d+$/.test(String(cultura_id)) || !/^\d+$/.test(String(subcultura_id))) {
            return res.status(400).json({ error: 'Cultura o subcultura inválida.' });
        }
        const [subRows] = await pool.execute(
            'SELECT id, cultura_id FROM subculturas_estilos WHERE id = ? LIMIT 1',
            [subcultura_id]
        );
        if (subRows.length === 0 || Number(subRows[0].cultura_id) !== Number(cultura_id)) {
            return res.status(400).json({ error: 'La subcultura no pertenece a la cultura elegida.' });
        }

        // 2) Descripción (obligatoria)
        const descripcionLimpia = String(descripcion ?? '').trim();
        if (!descripcionLimpia) {
            return res.status(400).json({ error: 'La descripción es obligatoria.' });
        }
        if (descripcionLimpia.length > 2000) {
            return res.status(400).json({ error: 'La descripción no puede superar 2000 caracteres.' });
        }

        // 3) Rango de edad y proporción (con los defaults del esquema)
        const rangoFinal = rango_edad === undefined || rango_edad === '' ? '18-24' : rango_edad;
        if (!RANGOS_EDAD.has(rangoFinal)) {
            return res.status(400).json({ error: 'Rango de edad inválido.' });
        }
        const proporcionFinal = proporcion === undefined || proporcion === '' ? '4:5' : proporcion;
        if (!PROPORCIONES.has(proporcionFinal)) {
            return res.status(400).json({ error: 'Proporción inválida.' });
        }

        // 4) Multimedia: video y galería (URLs de Cloudinary)
        const videoUrl = typeof url_video === 'string' ? url_video.trim() : '';
        const galeria = Array.isArray(imagenes)
            ? imagenes.map((u) => String(u || '').trim()).filter(Boolean)
            : [];
        if (!esTutorial && !videoUrl) {
            return res.status(400).json({ error: 'Debes subir un video.' });
        }
        if (esTutorial && galeria.length === 0) {
            return res.status(400).json({ error: 'Debes subir al menos una imagen.' });
        }
        if (videoUrl && !/^https?:\/\//i.test(videoUrl)) {
            return res.status(400).json({ error: 'La URL del video no es válida.' });
        }
        if (galeria.length > 5) {
            return res.status(400).json({ error: 'Solo puedes subir hasta 5 imágenes.' });
        }
        if (galeria.some((u) => !/^https?:\/\//i.test(u))) {
            return res.status(400).json({ error: 'Alguna imagen no tiene una URL válida.' });
        }

        // 5) Etiquetas (mismas reglas que PUT)
        const etiquetasFinal = [];
        if (etiquetas !== undefined && etiquetas !== null) {
            if (!Array.isArray(etiquetas)) {
                return res.status(400).json({ error: 'Las etiquetas deben ser una lista.' });
            }
            const vistas = new Map();
            for (const etiqueta of etiquetas) {
                const limpia = String(etiqueta).trim().replace(/\s+/g, ' ');
                if (!limpia) continue;
                if (limpia.length > 30) {
                    return res.status(400).json({ error: 'Cada etiqueta no puede superar 30 caracteres.' });
                }
                const llave = limpia.toLowerCase();
                if (!vistas.has(llave)) {
                    vistas.set(llave, true);
                    etiquetasFinal.push(limpia);
                }
            }
            if (etiquetasFinal.length > 20) {
                return res.status(400).json({ error: 'Máximo 20 etiquetas por video.' });
            }
        }

        // 6) Pasos (solo tutoriales)
        const pasosFinal = [];
        if (pasos !== undefined && pasos !== null) {
            if (!Array.isArray(pasos)) {
                return res.status(400).json({ error: 'Los pasos deben ser una lista.' });
            }
            if (!esTutorial && pasos.length > 0) {
                return res.status(400).json({ error: 'Los pasos solo aplican a los tutoriales.' });
            }
            if (pasos.length > 30) {
                return res.status(400).json({ error: 'Demasiados pasos.' });
            }
            for (const paso of pasos) {
                const tipo = paso?.tipo;
                const contenido = String(paso?.contenido ?? '').trim();
                if (!TIPOS_PASO.has(tipo)) {
                    return res.status(400).json({ error: 'Tipo de paso inválido.' });
                }
                if (!contenido) continue;
                if (contenido.length > 2000) {
                    return res.status(400).json({ error: 'Cada paso no puede superar 2000 caracteres.' });
                }
                pasosFinal.push({ tipo, contenido });
            }
        }

        // 7) Características físicas objetivo (obligatorias)
        const claves = ['forma_ojos', 'tipo_nariz', 'tipo_labios', 'tipo_rostro', 'color_piel', 'tipo_piel'];
        const rasgos = {};
        if (!caracteristicas || typeof caracteristicas !== 'object') {
            return res.status(400).json({ error: 'Faltan las características físicas.' });
        }
        for (const clave of claves) {
            const valor = String(caracteristicas[clave] ?? '').trim();
            if (!valor || valor.length > 20) {
                return res.status(400).json({ error: 'Características físicas inválidas.' });
            }
            rasgos[clave] = valor;
        }

        // 8) Moderación automática (RQFN125) ANTES de tocar la BD
        let moderacion;
        try {
            moderacion = await moderarContenido({ urlVideo: videoUrl || null, imagenes: galeria });
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

        conexion = await pool.getConnection();
        await conexion.beginTransaction();

        // Resolver (o crear) el combo de características físicas objetivo
        const [carRows] = await conexion.execute(
            `SELECT id FROM caracteristicas_fisicas
             WHERE forma_ojos = ? AND tipo_nariz = ? AND tipo_labios = ?
               AND tipo_rostro = ? AND color_piel = ? AND tipo_piel = ?
             LIMIT 1`,
            claves.map((c) => rasgos[c])
        );
        let caracteristicasId;
        if (carRows.length > 0) {
            caracteristicasId = carRows[0].id;
        } else {
            const [insCar] = await conexion.execute(
                `INSERT INTO caracteristicas_fisicas
                 (forma_ojos, tipo_nariz, tipo_labios, tipo_rostro, color_piel, tipo_piel)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                claves.map((c) => rasgos[c])
            );
            caracteristicasId = insCar.insertId;
        }

        const [insVideo] = await conexion.execute(
            `INSERT INTO videos
             (usuario_id, categoria_contenido, cultura_id, subcultura_id, url_video,
              descripcion, rango_edad, proporcion, caracteristicasfisicas)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, categoria_contenido, cultura_id, subcultura_id, videoUrl,
                descripcionLimpia, rangoFinal, proporcionFinal, caracteristicasId]
        );
        const videoId = insVideo.insertId;

        if (galeria.length > 0) {
            const lugar = galeria.map(() => '(?, ?, ?)').join(', ');
            const params = [];
            galeria.forEach((u, i) => params.push(videoId, u, i + 1));
            await conexion.execute(
                `INSERT INTO imagenes_video (video_id, url_imagen, orden) VALUES ${lugar}`,
                params
            );
        }

        if (etiquetasFinal.length > 0) {
            const lugar = etiquetasFinal.map(() => '(?, ?, ?)').join(', ');
            const params = [];
            etiquetasFinal.forEach((e, i) => params.push(videoId, e, i + 1));
            await conexion.execute(
                `INSERT INTO etiquetas_video (video_id, etiqueta, orden) VALUES ${lugar}`,
                params
            );
        }

        if (pasosFinal.length > 0) {
            const lugar = pasosFinal.map(() => '(?, ?, ?, ?)').join(', ');
            const params = [];
            pasosFinal.forEach((p, i) => params.push(videoId, p.tipo, p.contenido, i + 1));
            await conexion.execute(
                `INSERT INTO pasos_maquillaje (video_id, tipo_paso, contenido, orden) VALUES ${lugar}`,
                params
            );
        }

        // Notificar a los seguidores (RQFN122): nuevo_contenido_seguido
        try {
            const [yoRows] = await conexion.execute(
                'SELECT nombre_usuario FROM usuarios WHERE id = ? LIMIT 1',
                [userId]
            );
            const nombreAutor = yoRows[0]?.nombre_usuario || 'Alguien';
            const [seguidoresRows] = await conexion.execute(
                'SELECT seguidor_id FROM seguidores WHERE seguido_id = ?',
                [userId]
            );
            const seguidores = seguidoresRows.map((f) => f.seguidor_id);
            const mensaje = `${nombreAutor} ha publicado un video nuevo`;
            for (let i = 0; i < seguidores.length; i += 100) {
                const lote = seguidores.slice(i, i + 100);
                const lugar = lote.map(() => "(?, 'nuevo_contenido_seguido', ?, ?, ?)").join(', ');
                const params = [];
                lote.forEach((sid) => params.push(sid, mensaje, videoId, userId));
                await conexion.execute(
                    `INSERT INTO notificaciones (usuario_id, tipo, mensaje, video_id, usuario_actor_id) VALUES ${lugar}`,
                    params
                );
            }
        } catch (notifError) {
            console.error('Error creando notificaciones nuevo_contenido_seguido:', notifError.message);
        }

        await conexion.commit();
        res.status(201).json({ success: true, id: videoId });
    } catch (error) {
        if (conexion) {
            try {
                await conexion.rollback();
            } catch (rollbackError) {
                console.error('Rollback fallido:', rollbackError.message);
            }
        }
        console.error('Error en POST /videos:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        if (conexion) conexion.release();
    }
});

router.put('/videos/:id', verificarAcceso, async (req, res) => {
    const pool = req.pool;
    const userId = req.user.id;
    const { id } = req.params;
    const { descripcion, categoria_contenido, cultura_id, subcultura_id, etiquetas } = req.body || {};
    let conexion = null;
    try {
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'Identificador de video inválido.' });
        }
        // categoria_contenido/subcultura_id actuales para detectar el cambio
        // real de categoría (RQNFN39: al cambiar, se borran los votos).
        const [videoRows] = await pool.execute(
            'SELECT usuario_id, cultura_id, categoria_contenido, subcultura_id FROM videos WHERE id = ? LIMIT 1',
            [id]
        );
        if (videoRows.length === 0) {
            return res.status(404).json({ error: 'Video no encontrado.' });
        }
        if (Number(videoRows[0].usuario_id) !== Number(userId)) {
            return res.status(403).json({ error: 'Solo puedes editar tu video.' });
        }

        // RQNFN39: si la categoría o la subcultura cambian de verdad, los
        // votos favor/contra y la semejanza se borran (la razón del público
        // ya no aplica a otro encuadre).
        let resetVotos = false;
        const campos = [];
        const valores = [];
        if (descripcion !== undefined) {
            const limpio = String(descripcion).trim();
            if (limpio.length > 2000) {
                return res.status(400).json({
                    error: 'La descripción no puede superar 2000 caracteres.'
                });
            }
            campos.push('descripcion = ?');
            valores.push(limpio);
        }
        if (categoria_contenido !== undefined) {
            if (!CATEGORIA_VALIDA.has(categoria_contenido)) {
                return res.status(400).json({ error: 'Categoría inválida.' });
            }
            if (categoria_contenido !== videoRows[0].categoria_contenido) {
                resetVotos = true;
            }
            campos.push('categoria_contenido = ?');
            valores.push(categoria_contenido);
        }
        if (cultura_id !== undefined || subcultura_id !== undefined) {
            let nuevaCultura = Number(videoRows[0].cultura_id);
            if (cultura_id !== undefined) {
                if (!/^\d+$/.test(String(cultura_id))) {
                    return res.status(400).json({ error: 'Cultura inválida.' });
                }
                const [culturaRows] = await pool.execute(
                    'SELECT id FROM culturas_estilos WHERE id = ? LIMIT 1',
                    [cultura_id]
                );
                if (culturaRows.length === 0) {
                    return res.status(400).json({ error: 'La cultura no existe.' });
                }
                nuevaCultura = Number(culturaRows[0].id);
                campos.push('cultura_id = ?');
                valores.push(nuevaCultura);
            }
            if (subcultura_id !== undefined) {
                if (!/^\d+$/.test(String(subcultura_id))) {
                    return res.status(400).json({ error: 'Subcultura inválida.' });
                }
                const [subRows] = await pool.execute(
                    'SELECT id, cultura_id FROM subculturas_estilos WHERE id = ? LIMIT 1',
                    [subcultura_id]
                );
                if (subRows.length === 0) {
                    return res.status(400).json({ error: 'La subcultura no existe.' });
                }
                if (Number(subRows[0].cultura_id) !== nuevaCultura) {
                    return res.status(400).json({
                        error: 'La subcultura no pertenece a la cultura del video.'
                    });
                }
                if (Number(subRows[0].id) !== Number(videoRows[0].subcultura_id)) {
                    resetVotos = true;
                }
                campos.push('subcultura_id = ?');
                valores.push(Number(subRows[0].id));
            }
        }

        let etiquetasFinal = null;
        if (etiquetas !== undefined) {
            if (!Array.isArray(etiquetas)) {
                return res.status(400).json({ error: 'Las etiquetas deben ser una lista.' });
            }
            const vistas = new Map();
            const dedup = [];
            for (const etiqueta of etiquetas) {
                const limpia = String(etiqueta).trim().replace(/\s+/g, ' ');
                if (!limpia) continue;
                if (limpia.length > 30) {
                    return res.status(400).json({
                        error: 'Cada etiqueta no puede superar 30 caracteres.'
                    });
                }
                const llave = limpia.toLowerCase();
                if (!vistas.has(llave)) {
                    vistas.set(llave, true);
                    dedup.push(limpia);
                }
            }
            if (dedup.length > 20) {
                return res.status(400).json({ error: 'Máximo 20 etiquetas por video.' });
            }
            etiquetasFinal = dedup;
        }

        if (campos.length === 0 && etiquetasFinal === null) {
            return res.status(400).json({ error: 'No hay cambios para guardar.' });
        }

        conexion = await pool.getConnection();
        try {
            await conexion.beginTransaction();
            if (campos.length > 0) {
                // RQNFN39: si la categoría/subcultura cambió, los votos se
                // borran en la misma transacción (valores literales en el SQL,
                // sin parámetros; la alineación de ? no cambia).
                const sqlCampos = [...campos];
                if (resetVotos) {
                    sqlCampos.push('votos_favor = 0', 'votos_contra = 0', 'porcentaje_semejanza = NULL');
                }
                valores.push(id);
                await conexion.execute(`UPDATE videos SET ${sqlCampos.join(', ')} WHERE id = ?`, valores);
                if (resetVotos) {
                    await conexion.execute(
                        'DELETE FROM voto_razones WHERE voto_id IN (SELECT id FROM votos_video WHERE video_id = ?)',
                        [id]
                    );
                    await conexion.execute('DELETE FROM votos_video WHERE video_id = ?', [id]);
                }
            }
            if (etiquetasFinal !== null) {
                await conexion.execute('DELETE FROM etiquetas_video WHERE video_id = ?', [id]);
                if (etiquetasFinal.length > 0) {
                    const lugar = etiquetasFinal.map(() => '(?, ?, ?)').join(', ');
                    const params = [];
                    etiquetasFinal.forEach((e, i) => params.push(id, e, i + 1));
                    await conexion.execute(
                        `INSERT INTO etiquetas_video (video_id, etiqueta, orden) VALUES ${lugar}`,
                        params
                    );
                }
            }
            await conexion.commit();
        } catch (trans) {
            try {
                await conexion.rollback();
            } catch (rollbackError) {
                console.error('Rollback fallido:', rollbackError.message);
            }
            throw trans;
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error en PUT /videos/:id:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        if (conexion) conexion.release();
    }
});

router.delete('/videos/:id', verificarAcceso, async (req, res) => {
    const pool = req.pool;
    const userId = req.user.id;
    const { id } = req.params;
    let conexion = null;
    try {
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'Identificador de video inválido.' });
        }
        const [videoRows] = await pool.execute(
            'SELECT usuario_id FROM videos WHERE id = ? LIMIT 1',
            [id]
        );
        if (videoRows.length === 0) {
            return res.status(404).json({ error: 'Video no encontrado.' });
        }
        if (Number(videoRows[0].usuario_id) !== Number(userId)) {
            return res.status(403).json({ error: 'Solo puedes borrar tu video.' });
        }

        conexion = await pool.getConnection();
        await conexion.beginTransaction();

        const [comentarioIds] = await conexion.execute(
            'SELECT id FROM comentarios WHERE video_id = ?',
            [id]
        );
        if (comentarioIds.length > 0) {
            await conexion.query('DELETE FROM likes_comentario WHERE comentario_id IN (?)', [
                comentarioIds.map((c) => c.id)
            ]);
        }
        await conexion.execute('DELETE FROM comentarios WHERE video_id = ?', [id]);

        const [votoIds] = await conexion.execute(
            'SELECT id FROM votos_video WHERE video_id = ?',
            [id]
        );
        if (votoIds.length > 0) {
            await conexion.query('DELETE FROM voto_razones WHERE voto_id IN (?)', [
                votoIds.map((v) => v.id)
            ]);
        }
        await conexion.execute('DELETE FROM votos_video WHERE video_id = ?', [id]);
        await conexion.execute('DELETE FROM videos_vistos WHERE video_id = ?', [id]);
        await conexion.execute('DELETE FROM videos_guardados WHERE video_id = ?', [id]);
        await conexion.execute('DELETE FROM videos_compartidos WHERE video_id = ?', [id]);
        await conexion.execute('DELETE FROM likes_video WHERE video_id = ?', [id]);
        await conexion.execute('DELETE FROM imagenes_video WHERE video_id = ?', [id]);
        await conexion.execute('DELETE FROM pasos_maquillaje WHERE video_id = ?', [id]);
        await conexion.execute('DELETE FROM etiquetas_video WHERE video_id = ?', [id]);
        await conexion.execute('DELETE FROM notificaciones WHERE video_id = ?', [id]);
        await conexion.execute('DELETE FROM videos WHERE id = ?', [id]);

        await conexion.commit();
        res.json({ success: true });
    } catch (error) {
        if (conexion) {
            try {
                await conexion.rollback();
            } catch (rollbackError) {
                console.error('Rollback fallido:', rollbackError.message);
            }
        }
        console.error('Error en DELETE /videos/:id:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        if (conexion) conexion.release();
    }
});

module.exports = router;
module.exports.COLUMNAS_VIDEO = COLUMNAS_VIDEO;
module.exports.JOINS_VIDEO = JOINS_VIDEO;