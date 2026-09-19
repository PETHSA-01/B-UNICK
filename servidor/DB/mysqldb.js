const mysql2 = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql2.createPool({
    host: process.env.MYSQLDB_HOST || 'localhost',
    user: process.env.MYSQLDB_USER || 'root',
    password: process.env.MYSQLDB_CONTRASENA || '',
    database: process.env.MYSQLDB_DB || 'bunyk_db',
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