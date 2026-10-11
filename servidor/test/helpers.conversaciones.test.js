// Pruebas unitarias del helper de conversaciones (helpers/conversaciones.js):
// umbral de auto-eliminación (RQFN141) y moldeado de respuestas.

const test = require('node:test');
const assert = require('node:assert/strict');

const {
    MINIMO_VISTAS_AUTOELIMINAR,
    PORCENTAJE_DENUNCIAS_AUTOELIMINAR,
    debeAutoeliminarse,
    armarConversacion
} = require('../helpers/conversaciones');
const { FOTO_PERFIL_DEFECTO } = require('../helpers/imagenes');

test('constantes del umbral', () => {
    assert.equal(MINIMO_VISTAS_AUTOELIMINAR, 20);
    assert.equal(PORCENTAJE_DENUNCIAS_AUTOELIMINAR, 45);
});

test('debeAutoeliminarse: false por debajo del minimo de vistas', () => {
    assert.equal(debeAutoeliminarse({ vistas: 19, denuncias: 19 }), false);
    assert.equal(debeAutoeliminarse({ vistas: 0, denuncias: 0 }), false);
});

test('debeAutoeliminarse: false si no supera el 45%', () => {
    assert.equal(debeAutoeliminarse({ vistas: 20, denuncias: 9 }), false);  // 45% exacto no supera
    assert.equal(debeAutoeliminarse({ vistas: 100, denuncias: 45 }), false);
});

test('debeAutoeliminarse: true si supera el 45% con vistas suficientes', () => {
    assert.equal(debeAutoeliminarse({ vistas: 20, denuncias: 10 }), true);  // 50%
    assert.equal(debeAutoeliminarse({ vistas: 20, denuncias: 20 }), true);
    assert.equal(debeAutoeliminarse({ vistas: 100, denuncias: 46 }), true);
});

test('debeAutoeliminarse: tolera valores invalidos', () => {
    assert.equal(debeAutoeliminarse({}), false);
    assert.equal(debeAutoeliminarse({ vistas: null, denuncias: null }), false);
    assert.equal(debeAutoeliminarse({ vistas: '25', denuncias: '14' }), true); // 56%
});

test('armarConversacion: forma del feed (sin galeria ni denuncias)', () => {
    const fila = {
        id: 3,
        tema: 'Dudas',
        titulo: 'Como sello el labial',
        texto: 'Necesito ayuda con el sellado.',
        cultura_id: 1,
        cultura_nombre: 'Gotico',
        subcultura_id: 5,
        subcultura_nombre: 'Goth',
        usuario_id: 9,
        creador_nombre: 'ada',
        creador_foto: 'https://res.cloudinary.com/demo/image/upload/a.jpg',
        cantidad_likes: '4',
        cantidad_vistas: '30',
        comentarios: '2',
        cantidad_denuncias: '1',
        fecha_publicacion: '2026-10-02 09:00:00'
    };
    const c = armarConversacion(fila);
    assert.equal(c.id, 3);
    assert.equal(c.tema, 'Dudas');
    assert.equal(c.cultura.nombre, 'Gotico');
    assert.equal(c.creador.fotoPerfil, 'https://res.cloudinary.com/demo/image/upload/a.jpg');
    assert.equal(c.likes, 4);
    assert.equal(c.vistas, 30);
    assert.equal(c.cantidadComentarios, 2);
    // En el feed no viajan galeria ni cantidadDenuncias.
    assert.equal('galeria' in c, false);
    assert.equal('cantidadDenuncias' in c, false);
});

test('armarConversacion: detalle incluye galeria y cantidadDenuncias', () => {
    const fila = { id: 4, tema: 'Tips', cultura_id: 2, subcultura_id: 8, usuario_id: 1, cantidad_denuncias: '5' };
    const galeria = ['https://res.cloudinary.com/demo/image/upload/1.jpg'];
    const c = armarConversacion(fila, { galeria });
    assert.deepEqual(c.galeria, galeria);
    assert.equal(c.cantidadDenuncias, 5);
    assert.equal(c.creador.fotoPerfil, FOTO_PERFIL_DEFECTO);
});

test('armarConversacion: null con fila nula', () => {
    assert.equal(armarConversacion(null), null);
});
