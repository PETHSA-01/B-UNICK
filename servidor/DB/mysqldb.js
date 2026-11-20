const mysql2 = require('mysql2/promise');
const dotenv = require('dotenv');
const { opcionesConexionMysql } = require('./config');

dotenv.config();

// Mismas opciones de host/puerto/TLS que initDb: un desajuste aquí dejaba al
// arranque conectando por SSL y al pool intentando sin él (o al revés).
const pool = mysql2.createPool({
    ...opcionesConexionMysql(),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function verificacion() {
    try {
        const coneccion = await pool.getConnection();
        console.log('Conectado a la base de datos.');
        coneccion.release();
    } catch (err) {
        console.error(`No se pudo conectar a la base de datos: ${err.code || 'SIN_CODIGO'} ${err.message}`);
    }
}

module.exports = {
    verificacion,
    pool
};
