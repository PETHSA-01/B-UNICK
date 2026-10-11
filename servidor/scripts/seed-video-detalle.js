// Seed de SOPORTE para el módulo Detalle de Video (RQFN100-120).
//
// El seed de bunyk_db.sql deja vacias las tablas que alimentan la vista de
// video individual, asi que la galeria, los pasos de tutorial, los comentarios
// y las razones del voto en contra nunca se pueden ver ni probar. Este script
// siembra datos de ejemplo en la BD local de desarrollo:
//
//   1. razones_voto_contra  -> catalogo de motivos para el voto en contra.
//   2. pasos_maquillaje      -> 8 pasos para los 12 videos 'Tutorial' del seed.
//   3. imagenes_video        -> galeria (4 imagenes) para 3 videos de muestra.
//   4. comentarios           -> hilos con respuestas para 2 videos (no del
//      usuario 1, para que pueda comentar sin chocar con el autor).
//
// Uso:
//   node scripts/seed-video-detalle.js            # prepara
//   node scripts/seed-video-detalle.js --limpiar  # revierte
//
// Guardas: solo corre sobre una BD de desarrollo en la que las tablas de
// soporte esten vacias (el seed normal no las siembra), de modo que todo lo
// que encuentre aqui lo creo este script. Escribiendo solo en la BD local de
// desarrollo: no toca bunyk_db.sql, no bumpea SCHEMA_VERSION y no deja datos
// que sobrevivan a un re-seed.

require('dotenv').config();
const mysql = require('mysql2/promise');

// Los videos 'Tutorial' del seed (ids observados en BD) reciben los pasos.
const VIDEOS_TUTORIAL = [1, 7, 13, 19, 25, 31, 37, 43, 49, 55, 61, 67];

// Videos con galeria de ejemplo (no del usuario 1, para no alterar su feed).
const VIDEOS_GALERIA = [2, 11, 19];

// Videos con hilos de comentarios (no del usuario 1). User 2 es el autor del
// video 2; deja que user 3 comente y responda, y user 1 podra comentar.
const VIDEOS_COMENTARIOS = [2, 11];

// Motivos realistas para el voto en contra de semejanza (RQFN100), agrupados
// por tipo de video en la columna `video`: 'maquillaje' (7) y 'tutorial' (9).
// El tercer campo de cada tria marca la razon "Seleccion de estilo alternativo"
// (es_alternativo=1), que en el frontend despliega una lista de otras
// subculturas del sitio. El backend filtra por grupo segun la categoria del
// video y valida el estilo alternativo contra `subculturas_estilos`.
const RAZONES = [
    // Videos de maquillaje (no tutoriales).
    ['maquillaje', 'El delineado no concuerda con el estilo', 0],
    ['maquillaje', 'Los colores empleados en el maquillaje no hacen referencia al estilo que propone', 0],
    ['maquillaje', 'Los accesorios/vestimenta no concuerdan con la estética', 0],
    ['maquillaje', 'Los simbolismos que se utilizan en el maquillaje no hacen referencia a la estética', 0],
    ['maquillaje', 'La música utilizada no hace referencia al estilo a representar', 0],
    ['maquillaje', 'El peinado no hace referencia a la estética propuesta', 0],
    ['maquillaje', 'Selección de estilo alternativo', 1],
    // Tutoriales de maquillaje.
    ['tutorial', 'Los simbolismos que se utilizan en el maquillaje no hacen referencia a la estética', 0],
    ['tutorial', 'La música utilizada no hace referencia al maquillaje', 0],
    ['tutorial', 'El delineado no concuerda con el estilo', 0],
    ['tutorial', 'Los colores empleados en el maquillaje no hacen referencia al estilo que propone', 0],
    ['tutorial', 'La forma de los ojos no concuerda con las etiquetas utilizadas', 0],
    ['tutorial', 'La forma de la nariz no concuerda con las etiquetas utilizadas', 0],
    ['tutorial', 'La forma del tipo de rostro no concuerda con las etiquetas utilizadas', 0],
    ['tutorial', 'El color de piel no concuerda con las etiquetas utilizadas', 0],
    ['tutorial', 'Selección de estilo alternativo', 1]
];

const PASOS = [
    ['preparacion', 'Limpia, exfolia e hidrata el rostro. Aplica primer para fijar el maquillaje.'],
    ['base', 'Difumina la base con brocha o esponja humeda empezando desde el centro del rostro.'],
    ['contorno', 'Marca pomulos, mandibula y sienes con un tono dos tientos mas oscuro.'],
    ['corrector', 'Corrige ojeras y detalles aplicando corrector en zonas de luz.'],
    ['sombras', 'Difumina la sombra desde el parpado movil hacia la cuenca con transicion suave.'],
    ['delineado', 'Traza el delineado con pulso firme, engrosando el extremo exterior.'],
    ['cejas', 'Rellena las cejas a trazo corto siguiendo el sentido del vello.'],
    ['lip_combo', 'Delinea los labios, aplica labial y sella o ilumina el arco de cupido.'],
];

const IMAGENES = [
    'https://res.cloudinary.com/demo/image/upload/woman.jpg',
    'https://res.cloudinary.com/demo/image/upload/couple.jpg',
    'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    'https://res.cloudinary.com/demo/image/upload/balloons.jpg'
];

// (video, autor, texto) hilos de ejemplo.
const HILOS = [
    [2, 3, 'Me encanta como queda el delineado, pero mi tono de piel es mas claro.'],
    [2, 1, '¿Podrias compartir la paleta de sombras que usas?'],
    [11, 3, 'El paso de la base quedo muy natural, buen tutorial.'],
    [11, 2, 'Excelente guia para principiantes.'],
];

const RESPUESTAS = [
    [2, 3, 'Gracias! Prueba con un tono dos tientos mas claro y veras la diferencia.'],
    [11, 3, 'Me alegra que te sirva, practica mucho la difuminacion.']
];

function conexion() {
    return mysql.createConnection({
        host: process.env.MYSQLDB_HOST,
        user: process.env.MYSQLDB_USER,
        password: process.env.MYSQLDB_CONTRASENA,
        database: process.env.MYSQLDB_DB
    });
}

async function preparar(c) {
    // Guardas: asume BD de desarrollo con las tablas de soporte vacias.
    const checks = [
        ['razones_voto_contra', 'razones'],
        ['pasos_maquillaje', 'pasos de tutorial'],
        ['imagenes_video', 'imagenes de galeria'],
        ['comentarios', 'comentarios'],
    ];
    for (const [tabla, nombre] of checks) {
        const [r] = await c.execute(`SELECT COUNT(*) AS n FROM ${tabla}`);
        if (r[0].n > 0) {
            throw new Error(
                `${tabla} ya tiene ${r[0].n} filas. Este script asume una BD de ` +
                `desarrollo con la tabla de ${nombre} vacia (el seed no la siembra). ` +
                'Aborta para no mezclarse con datos reales.'
            );
        }
    }

    // 1. Razones.
    const [razonesIns] = await c.execute(
        'INSERT INTO razones_voto_contra (video, descripcion, es_alternativo) VALUES ' +
        RAZONES.map(() => '(?, ?, ?)').join(', '),
        RAZONES.flatMap(([video, desc, alternativo]) => [video, desc, alternativo])
    );

    // 2. Pasos de tutorial (8 por cada video Tutorial).
    const pasosParams = [];
    const lugarPasos = Array(VIDEOS_TUTORIAL.length)
        .fill(PASOS.map(() => '(?, ?, ?, ?)')).join(', ');
    for (const videoId of VIDEOS_TUTORIAL) {
        PASOS.forEach(([tipo, contenido], i) => {
            pasosParams.push(videoId, tipo, contenido, i + 1);
        });
    }
    await c.execute(
        `INSERT INTO pasos_maquillaje (video_id, tipo_paso, contenido, orden) VALUES ${lugarPasos}`,
        pasosParams
    );

    // 3. Galeria.
    const galeriaParams = [];
    const lugarGaleria = Array(VIDEOS_GALERIA.length)
        .fill(IMAGENES.map(() => '(?, ?, ?)')).join(', ');
    VIDEOS_GALERIA.forEach((videoId) => {
        IMAGENES.forEach((url, ii) => {
            galeriaParams.push(videoId, url, ii + 1);
        });
    });
    await c.execute(
        `INSERT INTO imagenes_video (video_id, url_imagen, orden) VALUES ${lugarGaleria}`,
        galeriaParams
    );

    // 4. Hilos de comentarios (guardar ids para las respuestas).
    const idsPorVideo = new Map();
    for (const [videoId, autor, texto] of HILOS) {
        const [ins] = await c.execute(
            'INSERT INTO comentarios (usuario_id, video_id, comentario_padre_id, texto, cantidad_likes) VALUES (?, ?, NULL, ?, 2)',
            [autor, videoId, texto]
        );
        if (!idsPorVideo.has(videoId)) idsPorVideo.set(videoId, []);
        idsPorVideo.get(videoId).push(ins.insertId);
    }
    for (const [videoId, autor, texto] of RESPUESTAS) {
        const padre = idsPorVideo.get(videoId)[0];
        await c.execute(
            'INSERT INTO comentarios (usuario_id, video_id, comentario_padre_id, texto, cantidad_likes) VALUES (?, ?, ?, ?, 1)',
            [autor, videoId, padre, texto]
        );
    }

    return {
        razones: razonesIns.affectedRows,
        pasos: pasosParams.length / 4,
        galeria: galeriaParams.length / 3,
        comentarios: HILOS.length + RESPUESTAS.length
    };
}

async function limpiar(c) {
    // Borrar en orden inverso a las FK. Son las mismas tablas que el script
    // solo pudo haber poblado (actua con la premisa de BD de desarrollo vacias).
    const [likes] = await c.execute(
        `DELETE FROM likes_comentario WHERE comentario_id IN
         (SELECT id FROM comentarios)`
    );
    // Borrar respuestas (tienen comentario_padre_id NOT NULL) antes que raices.
    const [respuestas] = await c.execute('DELETE FROM comentarios WHERE comentario_padre_id IS NOT NULL');
    const [comentarios] = await c.execute('DELETE FROM comentarios');
    const [pasos] = await c.execute('DELETE FROM pasos_maquillaje');
    const [imagenes] = await c.execute('DELETE FROM imagenes_video');
    const [razones] = await c.execute('DELETE FROM razones_voto_contra');
    // Resetear el AUTO_INCREMENT para que un re-seed devuelva ids 1..n
    // (sin esto, tras borrar, la siguiente corrida empieza donde se quedo y
    // los ids de las razones, p. ej., saltan a 11-20).
    for (const tabla of ['razones_voto_contra', 'pasos_maquillaje', 'imagenes_video', 'comentarios']) {
        await c.execute(`ALTER TABLE ${tabla} AUTO_INCREMENT = 1`);
    }
    return { lik: likes.affectedRows, res: respuestas.affectedRows, com: comentarios.affectedRows, pas: pasos.affectedRows, img: imagenes.affectedRows, raz: razones.affectedRows };
}

(async () => {
    const limpiarFlag = process.argv.includes('--limpiar');
    const c = await conexion();
    try {
        if (limpiarFlag) {
            const r = await limpiar(c);
            console.log('Limpieza hecha:');
            console.log(`  likes de comentario : ${r.lik} eliminados`);
            console.log(`  respuestas          : ${r.res}`);
            console.log(`  comentarios raiz    : ${r.com}`);
            console.log(`  pasos de maquillaje : ${r.pas}`);
            console.log(`  imagenes de galeria : ${r.img}`);
            console.log(`  razones de voto     : ${r.raz}`);
            const [v] = await c.execute('SELECT COUNT(*) AS n FROM razones_voto_contra');
            console.log(`  razones restantes   : ${v[0].n} (el seed deja 0)`);
        } else {
            const r = await preparar(c);
            console.log('Seed de soporte listo para Detalle de Video:');
            console.log(`  razones_voto_contra : ${r.razones}`);
            console.log(`  pasos_maquillaje     : ${r.pasos} (${VIDEOS_TUTORIAL.length} videos Tutorial)`);
            console.log(`  imagenes_video       : ${r.galeria} (${VIDEOS_GALERIA.length} videos)`);
            console.log(`  comentarios          : ${r.comentarios} (${VIDEOS_COMENTARIOS.length} videos)`);
            console.log('');
            console.log('Casos a probar en /video/:id:');
            console.log('  GET /api/videos/1   -> 8 pasos de tutorial, sin galeria ni comentarios');
            console.log('  GET /api/videos/2   -> galeria 4 + comentarios con respuestas');
            console.log('  GET /api/videos/11  -> galeria + comentarios');
            console.log('  POST /voto {voto:contra, razones:[1,3]} -> valida catalogo');
            console.log('');
            console.log('Para revertir: node scripts/seed-video-detalle.js --limpiar');
        }
    } catch (e) {
        console.error('Error:', e.message);
        process.exitCode = 1;
    } finally {
        await c.end();
    }
})();