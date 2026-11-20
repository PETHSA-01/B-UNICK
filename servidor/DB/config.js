// Configuración compartida de MySQL para el arranque (initDb) y el pool de
// la aplicación (mysqldb). Antes cada archivo repetía la lógica de SSL, lo que
// permitía que uno conectara por TLS y el otro no.
//
// Railway expone MySQL por un proxy público (`*.proxy.rlwy.net`) que exige TLS;
// si el cliente no pide SSL, el proxy cierra el socket durante el handshake y
// mysql2 lo reporta como PROTOCOL_CONNECTION_LOST (sin paquete de error previo).

const VALORES_VERDADEROS = new Set(['1', 'true', 'yes', 'si', 'on']);
const HOST_PROXY_RAILWAY = /(^|\.)rlwy\.net$/i;

function esVerdadero(valor) {
    if (typeof valor !== 'string') return false;
    return VALORES_VERDADEROS.has(valor.trim().toLowerCase());
}

function esHostProxyRailway(host) {
    return HOST_PROXY_RAILWAY.test(String(host || '').trim());
}

function debeUsarSsl(host, bandera) {
    // En el proxy público de Railway TLS es obligatorio: se ignora la bandera
    // aunque diga `false` (así un valor mal puesto en Render no tumba el deploy).
    if (esHostProxyRailway(host)) return true;
    return esVerdadero(bandera);
}

function opcionesConexionMysql({ incluirBase = true } = {}) {
    const host = process.env.MYSQLDB_HOST || 'localhost';
    const puerto = Number(process.env.MYSQLDB_PORT) || 3306;
    const opciones = {
        host,
        port: puerto,
        user: process.env.MYSQLDB_USER || 'root',
        password: process.env.MYSQLDB_CONTRASENA || '',
        connectTimeout: Number(process.env.MYSQLDB_CONNECT_TIMEOUT) || 15000
    };
    if (incluirBase) {
        opciones.database = process.env.MYSQLDB_DB || 'bunyk_db';
    }
    if (debeUsarSsl(host, process.env.MYSQLDB_SSL)) {
        opciones.ssl = { rejectUnauthorized: false };
    }
    return opciones;
}

// Solo para logs: nunca incluye la contraseña.
function describirConexionMysql(opciones) {
    return `${opciones.user}@${opciones.host}:${opciones.port}/${opciones.database || '(sin base)'}` +
        ` ssl=${opciones.ssl ? 'on' : 'off'}`;
}

module.exports = {
    esVerdadero,
    esHostProxyRailway,
    debeUsarSsl,
    opcionesConexionMysql,
    describirConexionMysql
};
