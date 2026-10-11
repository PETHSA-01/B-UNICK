// Pruebas unitarias de helpers/sightengine.js: interpretación de la respuesta
// de moderación (umbral 15%, RQFN60/66) y armado de fotogramas de video
// (RQFN59). No hacen llamadas de red.

const test = require('node:test');
const assert = require('node:assert/strict');

const {
    UMBRAL_CONTENIDO,
    MODELOS_POR_DEFECTO,
    FOTOGRAMAS_VIDEO,
    modelos,
    fotogramasVideo,
    motivosDeResultado
} = require('../helpers/sightengine');

test('UMBRAL_CONTENIDO es 0.15 (mas del 15% rechaza)', () => {
    assert.equal(UMBRAL_CONTENIDO, 0.15);
});

test('motivosDeResultado: detecta modelos numericos directos sobre el umbral', () => {
    assert.deepEqual(motivosDeResultado({ weapon: 0.8 }), ['armas']);
    assert.deepEqual(motivosDeResultado({ violence: 0.9 }), ['violencia']);
    assert.deepEqual(motivosDeResultado({ alcohol: 0.16 }), ['alcohol']);
    assert.deepEqual(motivosDeResultado({ 'self-harm': 0.3 }), ['autolesión']);
    assert.deepEqual(motivosDeResultado({ offensive: 0.25 }), ['contenido ofensivo']);
});

test('motivosDeResultado: exactamente 0.15 no rechaza (debe superarlo)', () => {
    assert.deepEqual(motivosDeResultado({ weapon: 0.15 }), []);
    assert.deepEqual(motivosDeResultado({ weapon: 0.14 }), []);
});

test('motivosDeResultado: detecta subclases de nudity y gore', () => {
    assert.deepEqual(motivosDeResultado({ nudity: { sexual_activity: 0.2 } }), ['actividad sexual explícita']);
    assert.deepEqual(motivosDeResultado({ nudity: { suggestive: 0.9 } }), ['contenido sexualmente sugerente']);
    assert.deepEqual(motivosDeResultado({ gore: { skull: 0.4 } }), ['contenido gore o explícito']);
});

test('motivosDeResultado: ignora none, context y sugerencias benignas', () => {
    assert.deepEqual(motivosDeResultado({ nudity: { none: 0.99, sexual_activity: 0.05 } }), []);
    assert.deepEqual(motivosDeResultado({ context: { sea: 0.9 }, nudity: { none: 0.9 } }), []);
});

test('motivosDeResultado: agrupa motivos únicos y tolera entradas vacías', () => {
    const motivos = motivosDeResultado({ nudity: { sexual_activity: 0.9, sexual_display: 0.9 } });
    assert.equal(motivos.length, 2);
    assert.deepEqual(motivosDeResultado({}), []);
    assert.deepEqual(motivosDeResultado(null), []);
    assert.deepEqual(motivosDeResultado('texto'), []);
});

test('fotogramasVideo: genera los 3 frames (10/50/90) de un video de Cloudinary', () => {
    const urls = fotogramasVideo('https://res.cloudinary.com/demo/video/upload/dog.mp4');
    assert.equal(urls.length, 3);
    assert.deepEqual(urls, [
        'https://res.cloudinary.com/demo/video/upload/so_10p,w_640,q_auto/dog.jpg',
        'https://res.cloudinary.com/demo/video/upload/so_50p,w_640,q_auto/dog.jpg',
        'https://res.cloudinary.com/demo/video/upload/so_90p,w_640,q_auto/dog.jpg'
    ]);
    assert.deepEqual(FOTOGRAMAS_VIDEO, [10, 50, 90]);
});

test('fotogramasVideo: vacío si la URL no permite fotogramas', () => {
    assert.deepEqual(fotogramasVideo('https://ejemplo.com/x.mp4'), []);
    assert.deepEqual(fotogramasVideo(null), []);
});

test('modelos: por defecto son los 7 del plan gratuito', () => {
    const previo = process.env.SIGHTENGINE_MODELOS;
    delete process.env.SIGHTENGINE_MODELOS;
    try {
        const lista = modelos();
        assert.equal(lista.length, 7);
        assert.deepEqual(lista, MODELOS_POR_DEFECTO.split(','));
        assert.ok(lista.includes('nudity-2.1'));
        assert.ok(lista.includes('violence'));
    } finally {
        if (previo !== undefined) process.env.SIGHTENGINE_MODELOS = previo;
    }
});

test('modelos: respeta SIGHTENGINE_MODELOS (espacios y vacíos)', () => {
    const previo = process.env.SIGHTENGINE_MODELOS;
    process.env.SIGHTENGINE_MODELOS = ' nudity-2.1 , alcohol ,, weapon ';
    try {
        assert.deepEqual(modelos(), ['nudity-2.1', 'alcohol', 'weapon']);
    } finally {
        if (previo === undefined) delete process.env.SIGHTENGINE_MODELOS;
        else process.env.SIGHTENGINE_MODELOS = previo;
    }
});
