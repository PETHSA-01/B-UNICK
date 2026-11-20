// Diagnóstico por capas de la conexión a MySQL desde el entorno donde corre el
// backend. En Render: npm --prefix servidor run db:diagnostico
// (o desde Render Shell: node servidor/scripts/diagnostico-db.js).
//
// Prueba, en orden: resolución DNS -> TCP -> TLS -> handshake MySQL con y sin
// TLS. No escribe en la BD: solo SELECT 1 / VERSION().
//
// También se puede importar: diagnosticar(registrar) devuelve true/false y
// escribe cada línea por el callback (lo usa el modo HTTP de index.js).

const net = require('net');
const tls = require('tls');
const dns = require('dns').promises;
const mysql2 = require('mysql2/promise');
const dotenv = require('dotenv');
const {
    opcionesConexionMysql,
    describirConexionMysql
} = require('../DB/config');

dotenv.config();

const TIMEOUT_MS = 8000;

function conTimeout(promesa, ms, etiqueta) {
    let temporizador;
    const reloj = new Promise((_, rechazar) => {
        temporizador = setTimeout(() => rechazar(new Error(`timeout tras ${ms} ms (${etiqueta})`)), ms);
    });
    return Promise.race([promesa, reloj]).finally(() => clearTimeout(temporizador));
}

async function probarDns(host) {
    const direcciones = await dns.lookup(host, { all: true });
    return direcciones.map((d) => `${d.address}${d.family === 6 ? ' (IPv6)' : ''}`).join(', ');
}

function probarTcp(host, puerto) {
    return conTimeout(new Promise((resolver, rechazar) => {
        const socket = net.connect({ host, port: puerto });
        let conecto = false;
        socket.setTimeout(TIMEOUT_MS);
        socket.once('connect', () => {
            conecto = true;
            // Observamos un instante: si el proxy hace FIN justo después del
            // accept, aquí se ve aunque el connect haya funcionado.
            setTimeout(() => {
                socket.destroy();
                resolver({ conecto, cierre: 'sin cierre inmediato' });
            }, 400);
        });
        socket.once('close', () => {
            if (!conecto) rechazar(new Error('TCP cerrado antes de conectar'));
            else resolver({ conecto, cierre: 'servidor cerró el socket nada más aceptar (FIN)' });
        });
        socket.once('error', (error) => rechazar(error));
        socket.once('timeout', () => rechazar(new Error('timeout de TCP')));
    }), TIMEOUT_MS + 1000, 'TCP');
}

function probarTls(host, puerto) {
    return conTimeout(new Promise((resolver, rechazar) => {
        const socket = tls.connect({
            host,
            port: puerto,
            rejectUnauthorized: false,
            servername: host,
            timeout: TIMEOUT_MS
        }, () => {
            const datos = {
                protocolo: socket.getProtocol(),
                cifrado: socket.getCipher().name
            };
            socket.destroy();
            resolver(datos);
        });
        socket.once('error', (error) => rechazar(error));
        socket.once('close', () => rechazar(new Error('TLS cerrado por el servidor antes de secureConnect')));
        socket.once('timeout', () => rechazar(new Error('timeout de TLS')));
    }), TIMEOUT_MS + 1000, 'TLS');
}

async function probarMysql(opciones) {
    const conexion = await mysql2.createConnection({ ...opciones, connectTimeout: TIMEOUT_MS });
    try {
        const [filas] = await conexion.query(
            'SELECT VERSION() AS version, CURRENT_USER() AS usuario, @@hostname AS host'
        );
        return filas[0];
    } finally {
        await conexion.end();
    }
}

async function diagnosticar(registrar = console.log) {
    const base = opcionesConexionMysql();
    registrar('=== Diagnóstico de conexión a MySQL ===');
    registrar(`Objetivo: ${describirConexionMysql(base)}`);
    registrar(`MYSQLDB_SSL="${process.env.MYSQLDB_SSL || ''}"  MYSQLDB_CONNECT_TIMEOUT="${process.env.MYSQLDB_CONNECT_TIMEOUT || ''}"`);
    registrar(`USER="${base.user}"  (la contraseña nunca se imprime)`);
    registrar('');

    // 1. DNS
    try {
        registrar(`[DNS] OK -> ${await probarDns(base.host)}`);
    } catch (error) {
        registrar(`[DNS] FALLO -> ${error.code || 'SIN_CODIGO'}: ${error.message}`);
        registrar('\nConclusión: el host no resuelve. Copia MYSQLDB_HOST/PUERTO desde la pestaña Connect del servicio MySQL de Railway (los públicos, no *.railway.internal).');
        return false;
    }

    // 2. TCP
    try {
        const tcp = await probarTcp(base.host, base.port);
        registrar(`[TCP] OK -> conectó a ${base.host}:${base.port}; ${tcp.cierre}`);
    } catch (error) {
        registrar(`[TCP] FALLO -> ${error.code || 'SIN_CODIGO'}: ${error.message || 'sin mensaje'}`);
        registrar('\nConclusión: no hay ruta TCP. Revisa el puerto, que el servicio MySQL esté activo y que el plan/trial de Railway no esté agotado/pausado.');
        return false;
    }

    // 3. TLS
    try {
        const tlsInfo = await probarTls(base.host, base.port);
        registrar(`[TLS] OK -> ${tlsInfo.protocolo}, cifrado ${tlsInfo.cifrado}`);
    } catch (error) {
        registrar(`[TLS] FALLO -> ${error.code || 'SIN_CODIGO'}: ${error.message || 'sin mensaje'}`);
    }

    // 4. MySQL: todas las combinaciones relevantes
    const variantes = [
        { etiqueta: 'mysql ssl', ssl: true, multipleStatements: false },
        { etiqueta: 'mysql sin ssl', ssl: false, multipleStatements: false },
        { etiqueta: 'mysql ssl + multi-statements', ssl: true, multipleStatements: true }
    ];
    let alguno = false;
    for (const variante of variantes) {
        const opciones = { ...base, multipleStatements: variante.multipleStatements };
        delete opciones.ssl;
        if (variante.ssl) opciones.ssl = { rejectUnauthorized: false };
        try {
            const info = await probarMysql(opciones);
            alguno = true;
            registrar(`[${variante.etiqueta}] OK -> MySQL ${info.version}, usuario ${info.usuario}, host ${info.host}`);
        } catch (error) {
            registrar(`[${variante.etiqueta}] FALLO -> ${error.code || 'SIN_CODIGO'}: ${error.message}`);
        }
    }

    registrar('');
    if (alguno) {
        registrar('Conclusión: MySQL sí responde. Si el deploy sigue cayendo, compara la variante que funcionó con la que usa initDb (ssl + multi-statements).');
        registrar('Si funciona "ssl + multi-statements" pero no "ssl", el problema está en el arranque, no en la red.');
        return true;
    }

    registrar('Conclusión: TCP/TLS conectan pero MySQL nunca completa el handshake. Causas típicas en Railway:');
    registrar('  - El puerto/host son de otro servicio o están desactualizados (Railway rota el proxy al recrear la BD).');
    registrar('  - El servicio MySQL está pausado o el plan/trial se agotó (revisar dashboard de Railway).');
    registrar('  - La IP de salida de Render no está autorizada en el servicio MySQL.');
    registrar('  - Las credenciales MYSQLDB_USER / MYSQLDB_CONTRASENA ya no son válidas.');
    return false;
}

if (require.main === module) {
    diagnosticar().then((ok) => {
        if (!ok) process.exitCode = 1;
    }).catch((error) => {
        console.error('Error inesperado en el diagnóstico:', error);
        process.exitCode = 1;
    });
}

module.exports = { diagnosticar };
