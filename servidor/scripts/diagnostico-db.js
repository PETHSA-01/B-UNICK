// Diagnóstico de conectividad MySQL desde el entorno donde corre el backend.
// En Render se ejecuta con: npm --prefix servidor run db:diagnostico
// (o desde Render Shell: node servidor/scripts/diagnostico-db.js).
//
// Prueba el handshake con TLS y sin TLS e imprime cuál funciona. No escribe en
// la base de datos: solo hace SELECT VERSION().

const mysql2 = require('mysql2/promise');
const dotenv = require('dotenv');
const {
    opcionesConexionMysql,
    describirConexionMysql
} = require('../DB/config');

dotenv.config();

async function probarModo(modo) {
    const base = opcionesConexionMysql({ incluirBase: false });
    delete base.ssl;
    if (modo === 'ssl') {
        base.ssl = { rejectUnauthorized: false };
    }
    // Un timeout corto para no esperar 15 s por modo en un deploy que falla.
    base.connectTimeout = 8000;

    const conexion = await mysql2.createConnection(base);
    try {
        const [filas] = await conexion.query(
            'SELECT VERSION() AS version, CURRENT_USER() AS usuario, @@hostname AS host'
        );
        return { ...filas[0], descripcion: describirConexionMysql(base) };
    } finally {
        await conexion.end();
    }
}

async function diagnosticar() {
    const base = opcionesConexionMysql();
    console.log('=== Diagnóstico de conexión a MySQL ===');
    console.log(`Objetivo: ${describirConexionMysql(base)}`);
    console.log(`MYSQLDB_SSL="${process.env.MYSQLDB_SSL || ''}"  ` +
        `DB_INIT_INTENTOS="${process.env.DB_INIT_INTENTOS || ''}"`);
    console.log('');

    const resultados = {};
    for (const modo of ['ssl', 'sin-ssl']) {
        try {
            const info = await probarModo(modo);
            resultados[modo] = true;
            console.log(`[${modo}] OK -> MySQL ${info.version}, usuario ${info.usuario}, host ${info.host}`);
        } catch (error) {
            resultados[modo] = false;
            console.log(`[${modo}] FALLO -> ${error.code || 'SIN_CODIGO'}: ${error.message}`);
        }
    }

    console.log('');
    if (resultados.ssl && !resultados['sin-ssl']) {
        console.log('Conclusión: el servidor exige TLS. Confirma MYSQLDB_SSL=true en Render (el código ya lo fuerza para hosts *.rlwy.net).');
    } else if (!resultados.ssl && resultados['sin-ssl']) {
        console.log('Conclusión: el servidor NO acepta TLS. Pon MYSQLDB_SSL=false y comprueba el host/puerto.');
    } else if (resultados.ssl && resultados['sin-ssl']) {
        console.log('Conclusión: ambos modos funcionan. Si el deploy sigue cayendo, la causa es transitoria: revisa conectividad/estado del proxy de Railway.');
    } else {
        console.log('Conclusión: ningún modo conectó. Revisa MYSQLDB_HOST/PUERTO/USUARIO/CONTRASEÑA y que la IP de salida de Render esté autorizada en Railway.');
        process.exitCode = 1;
    }
}

diagnosticar().catch((error) => {
    console.error('Error inesperado en el diagnóstico:', error);
    process.exitCode = 1;
});
