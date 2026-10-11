// Fixture TEMPORAL para probar en vivo el aviso de baja de semejanza
// (`semejanza_baja`, RQFN71 y RQFN72), que dispara `POST /videos/:id/voto`.
//
// El trigger exige tres cosas a la vez, y el seed normal no llega a ninguna:
//   1. mas de 1000 votos (mismo corte que `calcularSemejanza`: con menos, el
//      frontend ni muestra el porcentaje), y
//   2. porcentaje por debajo del 40% que fija el DER, y
//   3. un voto nuevo de alguien que NO es el dueño.
//
// El seed si pone contadores de votos en `videos` (929/81/92% en el video 1),
// pero NO siembra filas en `votos_video`, y el endpoint de voto recalcula
// siempre con un SUM sobre esa tabla. Por eso este script siembra 1001 votos
// reales: 390 a favor + 611 en contra = 38.96% -> 39% redondeado.
//
// Uso:
//   node scripts/fixtures-semejanza-baja.js              # prepara el estado de votos
//   node scripts/fixtures-semejanza-baja.js --notificar  # ademas inserta el aviso (para ver el drawer)
//   node scripts/fixtures-semejanza-baja.js --limpiar    # revierte todo
//
// El video 1 es de `test_user_01` (usuario 1). Para poder iniciar sesion hace
// falta `fixtures-likes-temporales.js`, que le pone una contrasena bcrypt real
// a los usuarios 1-3 (`Prueba123!`): el usuario 1 ve el aviso y el usuario 2
// vota. Escribiendo solo en la BD local de desarrollo: no toca bunyk_db.sql, no
// bumpea SCHEMA_VERSION y no deja datos que sobrevivan a un re-seed.

require('dotenv').config();
const mysql = require('mysql2/promise');

const VIDEO_ID = 1;      // video del seed que pertenece al usuario 1
const DUENO_ID = 1;      // test_user_01: es quien recibe el aviso
const VOTANTE_ID = 2;    // test_user_02: quien dispara el voto (no es el dueño)

// Votos que se siembran para dejar el video por debajo del minimo.
const VOTOS_FAVOR = 390;
const VOTOS_CONTRA = 611;

// Contadores del seed del video 1, restaurados tal cual en --limpiar.
const SEED_VIDEO_1 = { favor: 929, contra: 81, porcentaje: 92.0 };

// Mismo texto que escribe `avisarSemejanzaBaja` en routes-videos.js, con el
// porcentaje que deja la siembra.
const MENSAJE = 'Tu video bajó a 39% de semejanza, por debajo del 40% que se pide para que las recomendaciones lleguen.';

function conexion() {
    return mysql.createConnection({
        host: process.env.MYSQLDB_HOST,
        user: process.env.MYSQLDB_USER,
        password: process.env.MYSQLDB_CONTRASENA,
        database: process.env.MYSQLDB_DB
    });
}

function abortar(mensaje) {
    console.error('ABORTA: ' + mensaje);
    process.exit(1);
}

// Verifica que el video existe y que su dueño es el esperado: si el seed
// cambio, mejor fallar que sembrar sobre otra cosa.
async function verificarVideo(c) {
    const [rows] = await c.execute(
        'SELECT id, usuario_id FROM videos WHERE id = ? LIMIT 1',
        [VIDEO_ID]
    );
    if (rows.length === 0) abortar(`el video ${VIDEO_ID} no existe`);
    if (Number(rows[0].usuario_id) !== DUENO_ID) {
        abortar(`el video ${VIDEO_ID} ahora es del usuario ${rows[0].usuario_id}, no del ${DUENO_ID}`);
    }
}

// El votante tiene que existir, estar verificado y no ser el dueño (si fuera el
// dueño, el trigger se guarda solo y nunca avisaria).
async function verificarVotante(c) {
    const [rows] = await c.execute(
        'SELECT id, nombre_usuario, correo_verificado FROM usuarios WHERE id = ? LIMIT 1',
        [VOTANTE_ID]
    );
    if (rows.length === 0) abortar(`el usuario ${VOTANTE_ID} no existe`);
    if (Number(rows[0].id) === DUENO_ID) abortar('el votante es el dueño: el trigger no se dispararía');
    if (Number(rows[0].correo_verificado) !== 1) abortar(`el usuario ${VOTANTE_ID} no tiene el correo verificado`);
    return rows[0];
}

async function preparar(c) {
    await verificarVideo(c);
    const votante = await verificarVotante(c);

    const [votosPrevios] = await c.execute(
        'SELECT COUNT(*) AS n FROM votos_video WHERE video_id = ?',
        [VIDEO_ID]
    );
    if (Number(votosPrevios[0].n) > 0) {
        abortar(`el video ${VIDEO_ID} ya tiene ${votosPrevios[0].n} votos en votos_video; ` +
            'si son de otro fixture, reviertelo primero con su --limpiar');
    }

    // El dueño y el votante se quedan fuera de la siembra: el dueño no debe
    // votarse a si mismo y el votante debe entrar limpio, para que el endpoint
    // no le borre un voto previo y los contadores no se descuadren.
    const [candidatos] = await c.execute(
        'SELECT id FROM usuarios WHERE id <> ? AND id <> ? AND correo_verificado = 1 ORDER BY id ASC',
        [DUENO_ID, VOTANTE_ID]
    );
    if (candidatos.length === 0) abortar('no hay otros usuarios verificados para repartir los votos');

    const grupo = candidatos.map((r) => Number(r.id));
    const total = VOTOS_FAVOR + VOTOS_CONTRA;
    // Porcentaje que vera el endpoint al recalcular con su propio SUM.
    const porcentaje = Math.round((VOTOS_FAVOR / total) * 100);
    const filas = [];
    for (let i = 0; i < total; i++) {
        filas.push([VIDEO_ID, grupo[i % grupo.length], i < VOTOS_FAVOR ? 'favor' : 'contra']);
    }

    await c.beginTransaction();
    try {
        // Lotes de 500: una sola sentencia con 1001 filas excede lo que MySQL
        // acepta bien por paquete y hace el script mas lento de lo necesario.
        for (let i = 0; i < filas.length; i += 500) {
            const lote = filas.slice(i, i + 500);
            const lugar = lote.map(() => '(?, ?, ?)').join(', ');
            const params = lote.flat();
            await c.execute(
                `INSERT INTO votos_video (video_id, usuario_id, tipo_voto) VALUES ${lugar}`,
                params
            );
        }

        await c.execute(
            'UPDATE videos SET votos_favor = ?, votos_contra = ?, porcentaje_semejanza = ? WHERE id = ?',
            [VOTOS_FAVOR, VOTOS_CONTRA, porcentaje, VIDEO_ID]
        );
        await c.commit();
    } catch (e) {
        await c.rollback();
        throw e;
    }

    return { votante, porcentaje, grupo };
}

async function insertarAviso(c) {
    await verificarVideo(c);
    const [ya] = await c.execute(
        `SELECT id FROM notificaciones
         WHERE usuario_id = ? AND tipo = 'semejanza_baja' AND video_id = ? LIMIT 1`,
        [DUENO_ID, VIDEO_ID]
    );
    if (ya.length > 0) return false;
    await c.execute(
        `INSERT INTO notificaciones (usuario_id, tipo, mensaje, video_id, usuario_actor_id)
         VALUES (?, 'semejanza_baja', ?, ?, NULL)`,
        [DUENO_ID, MENSAJE, VIDEO_ID]
    );
    return true;
}

async function limpiar(c) {
    await verificarVideo(c);
    // voto_razones tiene FK a votos_video: se borra primero aunque este
    // fixture no inserte razones, por si otro script las dejo.
    await c.execute('DELETE FROM voto_razones WHERE voto_id IN (SELECT id FROM votos_video WHERE video_id = ?)', [VIDEO_ID]);
    const [borrados] = await c.execute('DELETE FROM votos_video WHERE video_id = ?', [VIDEO_ID]);
    await c.execute(
        'UPDATE videos SET votos_favor = ?, votos_contra = ?, porcentaje_semejanza = ? WHERE id = ?',
        [SEED_VIDEO_1.favor, SEED_VIDEO_1.contra, SEED_VIDEO_1.porcentaje, VIDEO_ID]
    );
    const [avisos] = await c.execute(
        "DELETE FROM notificaciones WHERE tipo = 'semejanza_baja' AND video_id = ?",
        [VIDEO_ID]
    );
    return { votos: borrados.affectedRows, avisos: avisos.affectedRows };
}

(async () => {
    const limpiarFlag = process.argv.includes('--limpiar');
    const notificarFlag = process.argv.includes('--notificar');
    const c = await conexion();
    try {
        if (limpiarFlag) {
            const r = await limpiar(c);
            console.log('Limpieza hecha:');
            console.log(`  votos_video del video ${VIDEO_ID} borrados : ${r.votos}`);
            console.log(`  avisos semejanza_baja del video ${VIDEO_ID}  : ${r.avisos}`);
            console.log(`  contadores del video ${VIDEO_ID} restaurados a ${SEED_VIDEO_1.favor}/${SEED_VIDEO_1.contra}/${SEED_VIDEO_1.porcentaje}% (los del seed)`);
        } else {
            const r = await preparar(c);
            console.log(`Fixture de semejanza_baja listo sobre el video ${VIDEO_ID} (dueño: usuario ${DUENO_ID}):`);
            console.log(`  ${VOTOS_FAVOR + VOTOS_CONTRA} votos reales = ${VOTOS_FAVOR} favor + ${VOTOS_CONTRA} contra -> ${r.porcentaje}% de semejanza`);
            console.log(`  repartidos entre ${r.grupo.length} usuarios verificados (ni el dueño ni el votante)`);
            if (notificarFlag) {
                const inserted = await insertarAviso(c);
                console.log(inserted
                    ? '  aviso semejanza_baja insertado a mano (para ver el drawer sin votar)'
                    : '  el aviso ya existía, no se insertó otro');
            }
            console.log('');
            console.log('Caso a probar (dispara el trigger de verdad):');
            console.log(`  1. Entra como ${r.votante.nombre_usuario} (usuario ${VOTANTE_ID}, contraseña Prueba123!)`);
            console.log(`     -> hace falta correr antes: node scripts/fixtures-likes-temporales.js`);
            console.log(`  2. Abre /video/${VIDEO_ID} y vota EN CONTRA (elige una razón)`);
            console.log('  3. Entra como test_user_01 (usuario 1, contraseña Prueba123!) y abre la campana');
            console.log('     -> debe aparecer "Tu video bajó a 39% de semejanza..." con los botones');
            console.log('        "Cambiar categoría" (va a /video/1) y "Wiki"');
            console.log('');
            console.log('Sin el paso 2, el total de votos es ' + (VOTOS_FAVOR + VOTOS_CONTRA) +
                ' y el porcentaje ' + r.porcentaje + '%: por encima de 1000 y por debajo de 40,');
            console.log('que es justo lo que exige el aviso.');
            console.log('');
            console.log('Para revertir: node scripts/fixtures-semejanza-baja.js --limpiar');
        }
    } catch (e) {
        console.error('Error:', e.message);
        process.exitCode = 1;
    } finally {
        await c.end();
    }
})();