const mysql2 = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const {
    opcionesConexionMysql,
    describirConexionMysql
} = require('./config');

dotenv.config();

const DB_NAME = process.env.MYSQLDB_DB || 'bunyk_db';
const RESET_DB = process.env.RESET_DB === 'true';
const SCHEMA_VERSION_TABLE = 'schema_version';

// Railway reinicia sus proxies y MySQL puede cerrar el socket justo durante
// el handshake (PROTOCOL_CONNECTION_LOST). Un solo intento tumbaba el deploy
// entero; reintentamos con backoff antes de declarar el arranque fallido.
const MAX_INTENTOS = Math.max(1, Number(process.env.DB_INIT_INTENTOS) || 5);
const ESPERA_BASE_MS = 1000;
const SCHEMA_VERSION_REGEX = /--\s*SCHEMA_VERSION\s*=\s*(\d+)/;

function leerVersionEsquema(schemaSql) {
    const match = schemaSql.match(SCHEMA_VERSION_REGEX);
    if (!match) {
        throw new Error('No se encontró SCHEMA_VERSION en bunyk_db.sql. Agrega "-- SCHEMA_VERSION = N".');
    }
    return match[1];
}

function esperar(ms) {
    return new Promise((resolver) => setTimeout(resolver, ms));
}

async function verificarPermisosDeConexion(connection) {
    const [rows] = await connection.query(
        `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
        [DB_NAME]
    );
    const baseExiste = rows.length > 0;
    return { baseExiste };
}

async function aplicarEsquema(connection, schemaSql, schemaVersion) {
    const { baseExiste } = await verificarPermisosDeConexion(connection);

    let versionRegistrada = null;
    if (baseExiste) {
        try {
            const [rows] = await connection.query(
                `SELECT version FROM \`${DB_NAME}\`.\`${SCHEMA_VERSION_TABLE}\` LIMIT 1`
            );
            if (rows.length > 0) {
                versionRegistrada = rows[0].version;
            }
        } catch (err) {
            versionRegistrada = null;
        }
    }

    const requiereReset =
        RESET_DB ||
        !baseExiste ||
        versionRegistrada === null ||
        String(versionRegistrada) !== String(schemaVersion);

    if (requiereReset && baseExiste) {
        await connection.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
        console.log(`Base de datos \`${DB_NAME}\` reestablecida (esquema ${versionRegistrada} -> ${schemaVersion}${RESET_DB ? ' [RESET_DB]' : ''}).`);
    } else if (!baseExiste) {
        console.log(`Creando base de datos \`${DB_NAME}\` por primera vez (esquema ${schemaVersion}).`);
    } else {
        console.log(`Base de datos \`${DB_NAME}\` al día (esquema ${schemaVersion}), aplicando .sql idempotente.`);
    }

    await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await connection.query(`USE \`${DB_NAME}\``);

    await connection.query(schemaSql);

    await connection.query(
        `CREATE TABLE IF NOT EXISTS \`${SCHEMA_VERSION_TABLE}\` (version VARCHAR(20) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );
    await connection.query(`TRUNCATE TABLE \`${SCHEMA_VERSION_TABLE}\``);
    await connection.query(`INSERT INTO \`${SCHEMA_VERSION_TABLE}\` (version) VALUES (?)`, [schemaVersion]);
}

async function initDb() {
    const schemaPath = path.join(__dirname, 'bunyk_db.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const schemaVersion = leerVersionEsquema(schemaSql);

    const opciones = {
        ...opcionesConexionMysql({ incluirBase: false }),
        multipleStatements: true
    };
    console.log(`[initDb] Conectando a ${describirConexionMysql(opciones)}`);

    let ultimoError = null;
    for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
        let connection = null;
        try {
            connection = await mysql2.createConnection(opciones);
            await aplicarEsquema(connection, schemaSql, schemaVersion);
            console.log('Base de datos inicializada correctamente.');
            return;
        } catch (error) {
            ultimoError = error;
            console.error(
                `[initDb] Intento ${intento}/${MAX_INTENTOS} fallido: ` +
                `${error.code || 'SIN_CODIGO'} ${error.message}`
            );
            if (error.code === 'PROTOCOL_CONNECTION_LOST' && !opciones.ssl) {
                console.error(
                    '[initDb] El servidor cerró el socket durante el handshake. ' +
                    'Si el host es un proxy con TLS obligatorio (Railway), define MYSQLDB_SSL=true.'
                );
            }
            if (intento < MAX_INTENTOS) {
                const espera = ESPERA_BASE_MS * 2 ** (intento - 1);
                console.log(`[initDb] Reintentando en ${espera} ms...`);
                await esperar(espera);
            }
        } finally {
            if (connection) {
                try {
                    await connection.end();
                } catch (error) {
                    console.warn(`[initDb] No se pudo cerrar la conexión: ${error.message}`);
                }
            }
        }
    }

    throw ultimoError;
}

module.exports = initDb;
