// Pruebas del config compartido de MySQL: decide TLS igual en initDb y en el
// pool, y evita que un MYSQLDB_SSL mal escrito tumb el deploy en Railway.

const test = require('node:test');
const assert = require('node:assert/strict');

const {
    esVerdadero,
    esHostProxyRailway,
    debeUsarSsl,
    opcionesConexionMysql,
    describirConexionMysql
} = require('../DB/config');

const CLAVES = [
    'MYSQLDB_HOST', 'MYSQLDB_PORT', 'MYSQLDB_USER',
    'MYSQLDB_CONTRASENA', 'MYSQLDB_DB', 'MYSQLDB_SSL',
    'MYSQLDB_CONNECT_TIMEOUT'
];

function conEnv(valores, fn) {
    const originales = Object.fromEntries(CLAVES.map((clave) => [clave, process.env[clave]]));
    try {
        for (const clave of CLAVES) delete process.env[clave];
        Object.assign(process.env, valores);
        return fn();
    } finally {
        for (const clave of CLAVES) {
            if (originales[clave] === undefined) delete process.env[clave];
            else process.env[clave] = originales[clave];
        }
    }
}

test('esVerdadero acepta las grafías habituales y rechaza el resto', () => {
    for (const valor of ['true', 'TRUE', ' 1 ', 'yes', 'SI', 'on']) {
        assert.equal(esVerdadero(valor), true, valor);
    }
    for (const valor of ['false', '0', 'no', '', undefined, null, true]) {
        assert.equal(esVerdadero(valor), false, String(valor));
    }
});

test('esHostProxyRailway solo reconoce hosts del proxy público', () => {
    assert.equal(esHostProxyRailway('hopper.proxy.rlwy.net'), true);
    assert.equal(esHostProxyRailway('RLWY.NET'), true);
    assert.equal(esHostProxyRailway('mysql.railway.internal'), false);
    assert.equal(esHostProxyRailway('localhost'), false);
    assert.equal(esHostProxyRailway('rlwy.net.evil.com'), false);
});

test('debeUsarSsl fuerza TLS en Railway aunque la bandera diga false', () => {
    assert.equal(debeUsarSsl('maglev.proxy.rlwy.net', 'false'), true);
    assert.equal(debeUsarSsl('maglev.proxy.rlwy.net', undefined), true);
});

test('debeUsarSsl respeta la bandera en hosts que no son el proxy', () => {
    assert.equal(debeUsarSsl('localhost', 'true'), true);
    assert.equal(debeUsarSsl('localhost', 'false'), false);
    assert.equal(debeUsarSsl('db.miservidor.com', 'yes'), true);
});

test('opcionesConexionMysql: valores por defecto y base opcional', () => {
    conEnv({}, () => {
        const opciones = opcionesConexionMysql();
        assert.equal(opciones.host, 'localhost');
        assert.equal(opciones.port, 3306);
        assert.equal(opciones.user, 'root');
        assert.equal(opciones.database, 'bunyk_db');
        assert.equal(opciones.ssl, undefined);
        assert.equal(opciones.connectTimeout, 15000);

        const sinBase = opcionesConexionMysql({ incluirBase: false });
        assert.equal('database' in sinBase, false);
    });
});

test('opcionesConexionMysql: Railway activa SSL y respeta puerto personalizado', () => {
    conEnv({
        MYSQLDB_HOST: 'hopper.proxy.rlwy.net',
        MYSQLDB_PORT: '31234',
        MYSQLDB_USER: 'bunyk_app',
        MYSQLDB_CONTRASENA: 'secreto',
        MYSQLDB_DB: 'railway',
        MYSQLDB_SSL: 'false',
        MYSQLDB_CONNECT_TIMEOUT: '5000'
    }, () => {
        const opciones = opcionesConexionMysql();
        assert.equal(opciones.port, 31234);
        assert.equal(opciones.database, 'railway');
        assert.deepEqual(opciones.ssl, { rejectUnauthorized: false });
        assert.equal(opciones.connectTimeout, 5000);
    });
});

test('describirConexionMysql no filtra la contraseña', () => {
    conEnv({ MYSQLDB_CONTRASENA: 'secreto' }, () => {
        const texto = describirConexionMysql(opcionesConexionMysql());
        assert.match(texto, /root@localhost:3306\/bunyk_db ssl=off/);
        assert.equal(texto.includes('secreto'), false);
    });
});
