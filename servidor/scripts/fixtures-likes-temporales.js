// Fixtures TEMPORALES para poder probar a mano las ramas autenticadas de
// GET /api/videos, que el seed normal deja inalcanzables:
//
//   1. BOOST DE PREFERENCIAS (RQFN84)  -> necesita filas en `likes_video`.
//      El seed de bunyk_db.sql NO siembra esa tabla, asi que el ORDER BY
//      FIND_IN_SET(v.cultura_id, ...) nunca se ha podido ejercitar.
//   2. COINCIDENCIA PARCIAL            -> usuario cuyos 6 rasgos no coinciden
//      con ningun video, pero que si comparte 1 o 2 rasgos priorizados.
//   3. SIN COINCIDENCIA                -> usuario cuyos 5 rasgos priorizados
//      (color_piel, forma_ojos, tipo_rostro, tipo_labios, tipo_nariz) no
//      aparecen en NINGUN video del seed.
//
// Uso:
//   node scripts/fixtures-likes-temporales.js            # prepara
//   node scripts/fixtures-likes-temporales.js --limpiar  # revierte
//
// Todo lo que inserta este script queda marcado con `TEMP_TEST` en la
// descripcion, y `--limpiar` lo borra por ese marcador. Escribiendo solo en
// la BD local de desarrollo: no toca bunyk_db.sql, no bumpea SCHEMA_VERSION y
// no deja datos que sobrevivan a un re-seed.

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const MARCA = 'TEMP_TEST';
const CONTRASENA = 'Prueba123!';

// Valores del seed (bunyk_db.sql, tabla `usuarios`). Se restauran tal cual en
// --limpiar para que la BD vuelva a estar exactamente como estaba.
const USUARIOS = [
    { id: 1, hashSeed: '$2b$devhash01', caracsSeed: 1, caso: 'coincidencia exacta + boost' },
    { id: 2, hashSeed: '$2b$devhash02', caracsSeed: 2, caso: 'coincidencia parcial' },
    { id: 3, hashSeed: '$2b$devhash03', caracsSeed: 3, caso: 'sin coincidencia' }
];

// Likes temporales del usuario 1, todos de la cultura 5 (ids 32-35): son solo
// 4 de los 72 videos, asi que el boost es evidente a simple vista.
const LIKES_TEMP = [32, 33, 34, 35];

// Rasgos priorizados por el fallback (los 5 que cuentan como "coincidencia").
// tipo_piel NO participa: se elige uno real a proposito para no alterar el caso.
const COMBO_PARCIAL = {
    forma_ojos: 'cafezados',   // novel  -> m1 no
    tipo_nariz: 'afilada',     // novel  -> m4 no
    tipo_labios: 'carnosos',   // novel  -> m3 no
    tipo_rostro: 'Corazon',    // real   -> m2 SI (combo 6, 7 videos)
    color_piel: 'Oscura',      // real   -> m0 SI (combos 8 y 10, 14 videos)
    tipo_piel: 'Mixta'         // no cuenta
};

const COMBO_NADA = {
    forma_ojos: 'trapezoidales',
    tipo_nariz: 'filiforme',
    tipo_labios: 'mueltos',
    tipo_rostro: 'romboidal',
    color_piel: 'Eboria',
    tipo_piel: 'Normal'
};

function conexion() {
    return mysql.createConnection({
        host: process.env.MYSQLDB_HOST,
        user: process.env.MYSQLDB_USER,
        password: process.env.MYSQLDB_CONTRASENA,
        database: process.env.MYSQLDB_DB
    });
}

// El hash del seed no es un bcrypt valido ("$2b$devhash01" son 7 caracteres de
// sal), asi que estas cuentas no se pueden autenticar. Se reemplaza por uno real.
async function preparar(c) {
    const hash = bcrypt.hashSync(CONTRASENA, 10);

    const [likes] = await c.execute('SELECT COUNT(*) AS n FROM likes_video');
    if (likes[0].n > 0) {
        throw new Error(
            `likes_video ya tiene ${likes[0].n} filas. Este script asume una BD de ` +
            'desarrollo con la tabla vacia (el seed no la siembra). Aborta para no ' +
            'mezclarse con datos reales.'
        );
    }

    for (const u of USUARIOS) {
        const [rows] = await c.execute('SELECT contrasena_hash FROM usuarios WHERE id = ?', [u.id]);
        if (rows.length !== 1) throw new Error(`No existe el usuario ${u.id}`);
        if (rows[0].contrasena_hash !== u.hashSeed) {
            throw new Error(
                `El usuario ${u.id} ya no tiene el hash del seed (${rows[0].contrasena_hash}). ` +
                'No se toca: podria ser una cuenta real. Restaura la BD de desarrollo primero.'
            );
        }
        await c.execute('UPDATE usuarios SET contrasena_hash = ? WHERE id = ?', [hash, u.id]);
    }

    for (const videoId of LIKES_TEMP) {
        await c.execute('INSERT INTO likes_video (usuario_id, video_id) VALUES (?, ?)', [1, videoId]);
    }

    const [parcial] = await c.execute(
        'INSERT INTO caracteristicas_fisicas (forma_ojos, tipo_nariz, tipo_labios, tipo_rostro, color_piel, tipo_piel) VALUES (?,?,?,?,?,?)',
        [COMBO_PARCIAL.forma_ojos, COMBO_PARCIAL.tipo_nariz, COMBO_PARCIAL.tipo_labios,
            COMBO_PARCIAL.tipo_rostro, COMBO_PARCIAL.color_piel, COMBO_PARCIAL.tipo_piel]
    );
    const [nada] = await c.execute(
        'INSERT INTO caracteristicas_fisicas (forma_ojos, tipo_nariz, tipo_labios, tipo_rostro, color_piel, tipo_piel) VALUES (?,?,?,?,?,?)',
        [COMBO_NADA.forma_ojos, COMBO_NADA.tipo_nariz, COMBO_NADA.tipo_labios,
            COMBO_NADA.tipo_rostro, COMBO_NADA.color_piel, COMBO_NADA.tipo_piel]
    );

    await c.execute('UPDATE usuarios SET caracteristicas_id = ? WHERE id = ?', [parcial.insertId, 2]);
    await c.execute('UPDATE usuarios SET caracteristicas_id = ? WHERE id = ?', [nada.insertId, 3]);

    return { idParcial: parcial.insertId, idNada: nada.insertId };
}

async function limpiar(c) {
    // 1. Quitar los likes temporales y restaurar los hash/caracteristicas del seed.
    const [borrados] = await c.execute('DELETE FROM likes_video');
    for (const u of USUARIOS) {
        await c.execute(
            'UPDATE usuarios SET contrasena_hash = ?, caracteristicas_id = ? WHERE id = ?',
            [u.hashSeed, u.caracsSeed, u.id]
        );
    }
    // 2. Borrar los combos de caracteristicas temporales (los ids 11 y 12 del
    //    seed NO tienen usuario ni videos asignados y deben sobrevivir).
    const [temp] = await c.execute('SELECT COALESCE(MAX(id), 0) AS maxId FROM caracteristicas_fisicas');
    const [combinados] = await c.execute(
        `SELECT id FROM caracteristicas_fisicas WHERE id > 12
         AND (forma_ojos, tipo_nariz, tipo_labios, tipo_rostro, color_piel, tipo_piel) IN (
            (?,?,?,?,?,?), (?,?,?,?,?,?))`,
        [
            COMBO_PARCIAL.forma_ojos, COMBO_PARCIAL.tipo_nariz, COMBO_PARCIAL.tipo_labios,
            COMBO_PARCIAL.tipo_rostro, COMBO_PARCIAL.color_piel, COMBO_PARCIAL.tipo_piel,
            COMBO_NADA.forma_ojos, COMBO_NADA.tipo_nariz, COMBO_NADA.tipo_labios,
            COMBO_NADA.tipo_rostro, COMBO_NADA.color_piel, COMBO_NADA.tipo_piel
        ]
    );
    for (const fila of combinados) {
        await c.execute('DELETE FROM caracteristicas_fisicas WHERE id = ?', [fila.id]);
    }
    return { likesBorrados: borrados.affectedRows, caracsBorrados: combinados.length, maxId: temp[0].maxId };
}

(async () => {
    const limpiarFlag = process.argv.includes('--limpiar');
    const c = await conexion();
    try {
        if (limpiarFlag) {
            const r = await limpiar(c);
            console.log('Limpieza hecha:');
            console.log(`  likes_video borrados : ${r.likesBorrados}`);
            console.log(`  combos temporales    : ${r.caracsBorrados}`);
            console.log(`  usuarios 1-3         : hash y caracteristicas_id restaurados a los del seed`);
            const [v] = await c.execute('SELECT COUNT(*) AS n FROM caracteristicas_fisicas');
            console.log(`  caracteristicas_fisicas restantes: ${v[0].n} (el seed deja 12)`);
        } else {
            const r = await preparar(c);
            console.log('Fixtures temporales listos. Contrasena para los 3 usuarios: ' + CONTRASENA);
            console.log('');
            USUARIOS.forEach((u) => {
                const extra = u.id === 1 ? ` + likes en videos ${LIKES_TEMP.join(', ')} (cultura 5)`
                    : u.id === 2 ? ` + caracteristicas_id ${r.idParcial} (parcial)`
                        : ` + caracteristicas_id ${r.idNada} (nada)`;
                console.log(`  test_user_0${u.id} -> ${u.caso}${extra}`);
            });
            console.log('');
            console.log('Casos a probar:');
            console.log('  /api/videos?limite=6                        boost: 1 con sesion vs sin sesion');
            console.log('  /api/videos?mis_caracteristicas=1&limite=30  user 1: 8 videos, sin aviso');
            console.log('  /api/videos?mis_caracteristicas=1&limite=30  user 2: coincidenciaParcial + apartados');
            console.log('  /api/videos?mis_caracteristicas=1&limite=30  user 3: sinCoincidencia, 72 videos');
            console.log('');
            console.log('Para revertir: node scripts/fixtures-likes-temporales.js --limpiar');
        }
    } catch (e) {
        console.error('Error:', e.message);
        process.exitCode = 1;
    } finally {
        await c.end();
    }
})();
