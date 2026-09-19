const mysql2 = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const DB_HOST = process.env.MYSQLDB_HOST || 'localhost';
const DB_USER = process.env.MYSQLDB_USER || 'root';
const DB_PASSWORD = process.env.MYSQLDB_CONTRASENA || '';
const DB_NAME = process.env.MYSQLDB_DB || 'bunyk_db';
const RESET_DB = process.env.RESET_DB === 'true';
const SCHEMA_VERSION_TABLE = 'schema_version';

const SCHEMA_VERSION_REGEX = /--\s*SCHEMA_VERSION\s*=\s*(\d+)/;

function leerVersionEsquema(schemaSql) {
    const match = schemaSql.match(SCHEMA_VERSION_REGEX);
    if (!match) {
        throw new Error('No se encontró SCHEMA_VERSION en bunyk_db.sql. Agrega "-- SCHEMA_VERSION = N".');
    }
    return match[1];
}

async function verificarPermisosDeConexion(connection) {
    const [rows] = await connection.query(
        `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
        [DB_NAME]
    );
    const baseExiste = rows.length > 0;
    return { baseExiste };
}

async function initDb() {
    const schemaPath = path.join(__dirname, 'bunyk_db.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const schemaVersion = leerVersionEsquema(schemaSql);

    const connection = await mysql2.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        multipleStatements: true
    });

    try {
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

        console.log('Base de datos inicializada correctamente.');
    } catch (error) {
        console.error('Error inicializando la base de datos:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

module.exports = initDb;