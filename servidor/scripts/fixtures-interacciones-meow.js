// Fixtures TEMPORALES de interacciones para el video de prueba de `meow`
// (video 73), para poder probar en vivo las dos features nuevas:
//
//   1. GET /api/perfil/vistos  -> historial real de videos vistos (pestana
//      "Vistas" del Perfil propio) con fechas repartidas en los ultimos 14
//      dias (el evento evt_limpiar_videos_vistos se las lleva pasadas 2 semanas).
//   2. GET /api/videos/:id/estadisticas -> panel de graficas del autor
//      (totales + tendencia diaria de 14 dias), con las 6 tablas de interaccion
//      pobladas y los contadores desnormalizados de `videos` consistentes.
//   3. Portada = primera imagen de la galeria: siembra una galeria de 3 imagenes
//      para que el video 73 muestre como miniatura la primera (no el frame).
//
// Uso:
//   node scripts/fixtures-interacciones-meow.js            # prepara
//   node scripts/fixtures-interacciones-meow.js --limpiar  # revierte
//
// Todo lo que inserta queda ligado al video 73 y `--limpiar` lo borra por ese
// id. Escribiendo solo en la BD local de desarrollo: no toca bunyk_db.sql, no
// bumpea SCHEMA_VERSION y no deja datos que sobrevivan a un re-seed.

require('dotenv').config();
const mysql = require('mysql2/promise');

const VIDEO_ID = 73;   // video de prueba de meow (usuario 11)
const DUENO_ID = 11;   // meow
const ESTILO_ALT = 60; // subcultura distinta a la del video 73 (cultura 1 / subcultura 1)

// Actores: usuarios del seed (1-10) + meow (11). Cada uno ve el video una vez
// (PK usuario_id+video_id), con fechas repartidas de hace 13 dias a hoy.
const VISTAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const LIKES = [2, 4, 6, 8, 10];
const GUARDADOS = [3, 5, 9];
const COMPARTIDOS = [2, 7, 8];
const VOTOS_FAVOR = [4, 5, 6, 7, 8];
const VOTOS_CONTRA = [9, 10, 1]; // con razones: 9 y 1 normal, 10 "estilo alternativo"

// Galeria de prueba para el video 73 (para ver la portada = primera imagen de
// la galeria). Reusa los assets Cloudinary demo del seed (0 recursos nuevos).
const GALERIA = [
    'https://res.cloudinary.com/demo/image/upload/woman.jpg',
    'https://res.cloudinary.com/demo/image/upload/couple.jpg',
    'https://res.cloudinary.com/demo/image/upload/sample.jpg'
];

function conexion() {
    return mysql.createConnection({
        host: process.env.MYSQLDB_HOST,
        user: process.env.MYSQLDB_USER,
        password: process.env.MYSQLDB_CONTRASENA,
        database: process.env.MYSQLDB_DB
    });
}

function iso(d) {
    // Fechas EN HORA LOCAL para que coincidan con DATE()/CURDATE() de MySQL y
    // con la ventana de 14 días que arma el endpoint de estadísticas.
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
        `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Fecha de hace `k` dias (k=0 -> hoy). Las 6 tablas de interaccion guardan
// timestamps y la grafica agrupa por DATE().
function hace(k) {
    return iso(new Date(Date.now() - k * 86400000));
}

async function verificarPreparado(c) {
    const [v] = await c.execute('SELECT id, usuario_id, cantidad_vistas, cantidad_likes, cantidad_guardados, cantidad_compartidos, votos_favor, votos_contra, porcentaje_semejanza FROM videos WHERE id = ?', [VIDEO_ID]);
    if (v.length !== 1) throw new Error(`No existe el video ${VIDEO_ID}. Crea primero el video de prueba de meow (id ${VIDEO_ID}).`);
    if (v[0].usuario_id !== DUENO_ID) throw new Error(`El video ${VIDEO_ID} no es de meow (id ${DUENO_ID}).`);
    if (v[0].cantidad_likes !== 0 || v[0].cantidad_guardados !== 0 || v[0].cantidad_compartidos !== 0 ||
        v[0].votos_favor !== 0 || v[0].votos_contra !== 0 || Number(v[0].porcentaje_semejanza) !== 0) {
        throw new Error('El video ya tiene contadores de interaccion: no se toca. Restaura la BD a estado de seed/meow primero.');
    }

    // Las tablas de interaccion deben estar vacias para el video; en
    // `videos_vistos` solo se tolera la posible vista previa del propio meow.
    const tablas = ['likes_video', 'videos_guardados', 'videos_compartidos', 'votos_video', 'comentarios'];
    for (const tabla of tablas) {
        const [r] = await c.execute(`SELECT COUNT(*) AS n FROM \`${tabla}\` WHERE video_id = ?`, [VIDEO_ID]);
        if (r[0].n > 0) throw new Error(`\`${tabla}\` ya tiene ${r[0].n} filas para el video ${VIDEO_ID}. Se aborta para no mezclarse con datos reales.`);
    }
    // La galeria del video tambien debe estar vacia (el fixture la siembra).
    const [g] = await c.execute('SELECT COUNT(*) AS n FROM imagenes_video WHERE video_id = ?', [VIDEO_ID]);
    if (g[0].n > 0) throw new Error(`imagenes_video ya tiene ${g[0].n} filas para el video ${VIDEO_ID}. Se aborta para no mezclarse con datos reales.`);
    const [vv] = await c.execute('SELECT usuario_id FROM videos_vistos WHERE video_id = ?', [VIDEO_ID]);
    for (const fila of vv) {
        if (fila.usuario_id !== DUENO_ID) {
            throw new Error(`videos_vistos ya tiene una visita del usuario ${fila.usuario_id}. Se aborta para no mezclarse con datos reales.`);
        }
    }
    // Limpiar la posible vista previa del propio meow para re-sembrarla con
    // fecha controlada dentro del arreglo.
    await c.execute('DELETE FROM videos_vistos WHERE video_id = ? AND usuario_id = ?', [VIDEO_ID, DUENO_ID]);
}

async function preparar(c) {
    await verificarPreparado(c);

    // 1. Visitas (una por usuario, fechas repartidas en los ultimos 14 dias).
    const numVistas = VISTAS.length;
    for (let i = 0; i < numVistas; i++) {
        const usuario = VISTAS[i];
        await c.execute('INSERT INTO videos_vistos (usuario_id, video_id, fecha_visto) VALUES (?, ?, ?)',
            [usuario, VIDEO_ID, hace(numVistas - 1 - i)]);
    }

    // 2. Likes / guardados / compartidos.
    LIKES.forEach((u, i) => c.execute('INSERT INTO likes_video (usuario_id, video_id, fecha) VALUES (?, ?, ?)', [u, VIDEO_ID, hace(9 - i * 2)]));
    GUARDADOS.forEach((u, i) => c.execute('INSERT INTO videos_guardados (usuario_id, video_id, fecha_guardado) VALUES (?, ?, ?)', [u, VIDEO_ID, hace(8 - i * 2)]));
    COMPARTIDOS.forEach((u, i) => c.execute('INSERT INTO videos_compartidos (usuario_id, video_id, fecha_compartido) VALUES (?, ?, ?)', [u, VIDEO_ID, hace(9 - i * 2)]));

    // 3. Votos de semejanza. Razones del grupo 'maquillaje' (el video 73 es
    //    'Video Maquillajes'): una normal y la "Seleccion de estilo alternativo".
    const [raNormal] = await c.execute('SELECT id FROM razones_voto_contra WHERE video = ? AND es_alternativo = 0 LIMIT 1', ['maquillaje']);
    const [raAlternativa] = await c.execute('SELECT id FROM razones_voto_contra WHERE video = ? AND es_alternativo = 1 LIMIT 1', ['maquillaje']);
    if (raNormal.length !== 1 || raAlternativa.length !== 1) {
        throw new Error('No esta sembrado el catalogo de razones (corre seed-video-detalle.js).');
    }
    const razonNormal = raNormal[0].id;
    const razonAlternativa = raAlternativa[0].id;

    const votosContra = new Map(); // usuario -> insertId
    for (let i = 0; i < VOTOS_FAVOR.length; i++) {
        await c.execute('INSERT INTO votos_video (video_id, usuario_id, tipo_voto, fecha) VALUES (?, ?, ?, ?)',
            [VIDEO_ID, VOTOS_FAVOR[i], 'favor', hace(9 - i * 2)]);
    }
    for (let i = 0; i < VOTOS_CONTRA.length; i++) {
        const [v] = await c.execute('INSERT INTO votos_video (video_id, usuario_id, tipo_voto, fecha) VALUES (?, ?, ?, ?)',
            [VIDEO_ID, VOTOS_CONTRA[i], 'contra', hace(7 - i * 2)]);
        votosContra.set(VOTOS_CONTRA[i], v.insertId);
    }
    // Dos de los votos en contra llevan razon: el usuario 10 elige la razon
    // "Seleccion de estilo alternativo" con un estilo distinto al del video.
    await c.execute('INSERT INTO voto_razones (voto_id, razon_id, estilo_alternativo_id) VALUES (?, ?, NULL)',
        [votosContra.get(9), razonNormal]);
    await c.execute('INSERT INTO voto_razones (voto_id, razon_id, estilo_alternativo_id) VALUES (?, ?, NULL)',
        [votosContra.get(1), razonNormal]);
    await c.execute('INSERT INTO voto_razones (voto_id, razon_id, estilo_alternativo_id) VALUES (?, ?, ?)',
        [votosContra.get(10), razonAlternativa, ESTILO_ALT]);

    // 4. Comentarios: uno principal con dos likes y una respuesta.
    const [padreRes] = await c.execute(
        'INSERT INTO comentarios (usuario_id, video_id, comentario_padre_id, texto, cantidad_likes, fecha) VALUES (?, ?, NULL, ?, 2, ?)',
        [2, VIDEO_ID, 'No entiendo por que la gente dice que el gothic solo es negro: la base porcelana y el contorno hacen TODO.', hace(2)]
    );
    const padre = padreRes.insertId;
    await c.execute(
        'INSERT INTO comentarios (usuario_id, video_id, comentario_padre_id, texto, fecha) VALUES (?, ?, ?, ?, ?)',
        [3, VIDEO_ID, padre, 'Exacto, y justo por eso lo ame \u2661', hace(1)]
    );
    await c.execute('INSERT INTO likes_comentario (usuario_id, comentario_id, fecha) VALUES (?, ?, ?)', [5, padre, hace(1)]);
    await c.execute('INSERT INTO likes_comentario (usuario_id, comentario_id, fecha) VALUES (?, ?, ?)', [6, padre, hace(0)]);

    // 5. Galeria de prueba: 3 imagenes (portada = la de menor `orden`).
    for (let ii = 0; ii < GALERIA.length; ii++) {
        await c.execute('INSERT INTO imagenes_video (video_id, url_imagen, orden) VALUES (?, ?, ?)',
            [VIDEO_ID, GALERIA[ii], ii + 1]);
    }

    // 6. Contadores desnormalizados de `videos` (invariante like<->cantidad).
    const votosFavor = VOTOS_FAVOR.length;
    const votosContraTotal = VOTOS_CONTRA.length;
    const semejanza = Math.round((votosFavor / (votosFavor + votosContraTotal)) * 100);
    await c.execute(
        'UPDATE videos SET cantidad_vistas = ?, cantidad_likes = ?, cantidad_guardados = ?, cantidad_compartidos = ?, votos_favor = ?, votos_contra = ?, porcentaje_semejanza = ? WHERE id = ?',
        [VISTAS.length, LIKES.length, GUARDADOS.length, COMPARTIDOS.length,
            votosFavor, votosContraTotal, semejanza, VIDEO_ID]
    );
}

async function limpiar(c) {
    await c.execute('DELETE FROM imagenes_video WHERE video_id = ?', [VIDEO_ID]);
    await c.execute('DELETE FROM likes_comentario WHERE comentario_id IN (SELECT id FROM comentarios WHERE video_id = ?)', [VIDEO_ID]);
    await c.execute('UPDATE comentarios SET comentario_padre_id = NULL WHERE video_id = ?', [VIDEO_ID]);
    await c.execute('DELETE FROM comentarios WHERE video_id = ?', [VIDEO_ID]);
    await c.execute('DELETE FROM voto_razones WHERE voto_id IN (SELECT id FROM votos_video WHERE video_id = ?)', [VIDEO_ID]);
    await c.execute('DELETE FROM votos_video WHERE video_id = ?', [VIDEO_ID]);
    await c.execute('DELETE FROM videos_compartidos WHERE video_id = ?', [VIDEO_ID]);
    await c.execute('DELETE FROM videos_guardados WHERE video_id = ?', [VIDEO_ID]);
    await c.execute('DELETE FROM likes_video WHERE video_id = ?', [VIDEO_ID]);
    await c.execute('DELETE FROM videos_vistos WHERE video_id = ?', [VIDEO_ID]);
    await c.execute('UPDATE videos SET cantidad_vistas = 0, cantidad_likes = 0, cantidad_guardados = 0, cantidad_compartidos = 0, votos_favor = 0, votos_contra = 0, porcentaje_semejanza = 0 WHERE id = ?', [VIDEO_ID]);
}

(async () => {
    const limpiarFlag = process.argv.includes('--limpiar');
    const c = await conexion();
    try {
        if (limpiarFlag) {
            const [r] = await c.execute('SELECT id FROM videos WHERE id = ?', [VIDEO_ID]);
            if (r.length === 0) throw new Error(`No existe el video ${VIDEO_ID}; nada que limpiar.`);
            await c.beginTransaction();
            await limpiar(c);
            await c.commit();
            console.log('Limpieza hecha:');
            console.log(`  interacciones del video ${VIDEO_ID} borradas (seis tablas + galeria + likes de comentarios)`);
            console.log(`  contadores de videos.${VIDEO_ID} restaurados a 0`);
        } else {
            await c.beginTransaction();
            await preparar(c);
            await c.commit();
            const [v] = await c.execute('SELECT cantidad_vistas, cantidad_likes, cantidad_guardados, cantidad_compartidos, votos_favor, votos_contra, porcentaje_semejanza FROM videos WHERE id = ?', [VIDEO_ID]);
            console.log('Fixtures de interacciones listos sobre el video ' + VIDEO_ID + ' (meow):');
            console.log(`  vistas ${v[0].cantidad_vistas} / likes ${v[0].cantidad_likes} / guardados ${v[0].cantidad_guardados} / compartidos ${v[0].cantidad_compartidos}`);
            console.log(`  votos ${v[0].votos_favor} favor + ${v[0].votos_contra} contra (semejanza ${v[0].porcentaje_semejanza}%)`);
            console.log(`  comentarios: 1 con respuesta y likes en el padre`);
            console.log(`  galeria: ${GALERIA.length} imagenes (portada/miniatura = la primera)`);
            console.log('');
            console.log('Casos a probar:');
            console.log('  GET /api/videos/73/estadisticas  (cookie de meow)      -> 200 con resumen + 14 dias');
            console.log('  GET /api/videos/73/estadisticas  (cookie de otro user)  -> 403');
            console.log('  GET /api/perfil/vistos            (cookie de meow)      -> 11 videos con fechas recientes');
            console.log('  GET /api/videos/73                (sin sesion)          -> miniatura = primera imagen de la galeria');
            console.log('');
            console.log('Para revertir: node scripts/fixtures-interacciones-meow.js --limpiar');
        }
    } catch (e) {
        try { await c.rollback(); } catch (_) {}
        console.error('Error:', e.message);
        process.exitCode = 1;
    } finally {
        await c.end();
    }
})();