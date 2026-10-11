const mysql2 = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql2.createPool({
    host: process.env.MYSQLDB_HOST || 'localhost',
    port: Number(process.env.MYSQLDB_PORT) || 3306,
    user: process.env.MYSQLDB_USER || 'root',
    password: process.env.MYSQLDB_CONTRASENA || '',
    database: process.env.MYSQLDB_DB || 'bunyk_db',
    // Railway (MySQL gestionado) expone la base por red pública con TLS;
    // con MYSQLDB_SSL=true se habilita la conexión cifrada. En local queda
    // desactivado.
    ssl: process.env.MYSQLDB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function verificacion() {
    try {
        const coneccion = await pool.getConnection();
        console.log('Conectado a la base de datos.');
        coneccion.release();
    }
    catch (err) {
        console.log(err);
    }
}

module.exports = {
    verificacion,
    pool
}