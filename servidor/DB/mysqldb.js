const mysql2 = require('mysql2/promise');

const pool = mysql2.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bunyk_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function verificacion(sql, values) {
    try{
        const coneccion = await pool.getConnection();
        console.log('Conectado a la base de datos.');
        coneccion.release();
    }
    catch(err){
        console.log(err);
    }
}

module.exports = {
    verificacion,
    pool 
}
