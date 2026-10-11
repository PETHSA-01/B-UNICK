// Moderación automática de contenido multimedia (RQFN59, RQFN60, RQFN65, RQFN66
// y RQFN125) con Sightengine. Única fuente para moderar publicaciones: recibe
// URLs ya subidas a Cloudinary (el frontend sube con el Upload Widget) y
// devuelve los motivos que superan el umbral del 15%. Sin claves configuradas la
// moderación falla a propósito (no hay bypass): es un requisito de seguridad del
// proyecto.
//
// El DER pide explícitamente la **API Image Moderation** tanto para las imágenes
// (RQFN65/66) como para el video (RQFN59: "utilizar la API Image Moderation de
// Sight Engine para la validación del video"). Por eso se extraen fotogramas del
// propio video (Cloudinary los entrega como imagen) y se modera cada uno con el
// endpoint de imágenes. Es además lo único disponible en
// el plan gratuito de Sightengine, que no incluye análisis de video
// (ver `npm run moderacion:prueba` para diagnosticar los modelos del plan).
//
// Limitación conocida y documentada: no se modera el audio y se muestrean
// FOTOGRAMAS_VIDEO instantáneas del video, no todos sus segundos.

const { urlFotogramaVideo } = require('./cloudinary');

const UMBRAL_CONTENIDO = 0.15;

const URL_IMAGEN = 'https://api.sightengine.com/1.0/check.json';

// Categorías que exigen RQFN60/66: desnudez, violencia, ofensivo, arma, gore,
// alcohol y autolesión. Sightengine no publica un modelo de drogas en su API de
// moderación (sí de alcohol), esa categoría del DER queda fuera y se documenta
// como desviación. Configurable con SIGHTENGINE_MODELOS porque no todos los planes
// incluyen todos los modelos.
const MODELOS_POR_DEFECTO = 'nudity-2.1,weapon,offensive,self-harm,gore-2.0,alcohol,violence';

// Porcentaje del video del que se toma cada fotograma. El operador `so_##p`
// acepta porcentajes, así que funciona con cualquier duración sin consultar la
// duración del asset ni arriesgarse a pedir un offset fuera de rango.
const FOTOGRAMAS_VIDEO = [10, 50, 90];

// Modelos cuyas subclaves forman parte de la respuesta. Cualquier otra clave
// de primer nivel (status, request, media, data…) se ignora.
const MODELOS_CLAVE = ['nudity', 'weapon', 'offensive', 'gore', 'violence', 'self-harm', 'drugs', 'alcohol'];

// Subárboles que no representan una señal positiva directa:
// - `none`: probabilidad de que NO haya contenido de ese modelo (alta siempre).
// - `context`: contexto benigno (playa, interior…), no un motivo de rechazo.
// - `suggestive_classes`: subclases de `suggestive`, ya contabilizadas arriba.
const CLAVES_IGNORADAS = new Set(['none', 'context', 'suggestive_classes']);

// Etiqueta legible (en español) por ruta de probabilidad reportada.
const ETIQUETAS = {
    'nudity.sexual_activity': 'actividad sexual explícita',
    'nudity.sexual_display': 'desnudos explícitos',
    'nudity.erotica': 'contenido erótico',
    'nudity.sextoy': 'juguetes sexuales',
    'nudity.suggestive': 'contenido sexualmente sugerente',
    weapon: 'armas',
    offensive: 'contenido ofensivo',
    gore: 'contenido gore o explícito',
    violence: 'violencia',
    'self-harm': 'autolesión',
    drugs: 'drogas',
    alcohol: 'alcohol'
};

function modelos() {
    const configurado = process.env.SIGHTENGINE_MODELOS;
    const lista = (configurado || MODELOS_POR_DEFECTO)
        .split(',')
        .map((modelo) => modelo.trim())
        .filter(Boolean);
    return lista.length ? lista : MODELOS_POR_DEFECTO.split(',');
}

function etiquetaDeRuta(ruta) {
    if (ETIQUETAS[ruta]) return ETIQUETAS[ruta];
    const modelo = ruta.split('.')[0];
    return ETIQUETAS[modelo] || modelo.replace(/-/g, ' ');
}

// Recorre un objeto de resultados y devuelve las probabilidades positivas
// (ruta + valor), excluyendo los subárboles benignos. Sightengine devuelve
// algunos modelos como número directo (weapon, violence, alcohol, self-harm,
// offensive) y otros como objeto de subclases (nudity, gore), así que ambos
// casos tienen que recolectarse.
function recolectar(objeto, prefijo, salida) {
    if (typeof objeto === 'number') {
        salida.push({ ruta: prefijo, valor: objeto });
        return;
    }
    if (!objeto || typeof objeto !== 'object') return;
    for (const [clave, valor] of Object.entries(objeto)) {
        if (CLAVES_IGNORADAS.has(clave)) continue;
        const ruta = prefijo ? `${prefijo}.${clave}` : clave;
        if (typeof valor === 'number') {
            salida.push({ ruta, valor });
        } else if (valor && typeof valor === 'object') {
            recolectar(valor, ruta, salida);
        }
    }
}

// Extrae los motivos que superan el umbral de un objeto de resultados
// (raíz de una imagen o de un fotograma de video).
function motivosDeResultado(resultado) {
    const salida = [];
    if (!resultado || typeof resultado !== 'object') return salida;
    for (const modelo of MODELOS_CLAVE) {
        if (resultado[modelo]) recolectar(resultado[modelo], modelo, salida);
    }
    const motivos = new Set();
    for (const { ruta, valor } of salida) {
        if (valor > UMBRAL_CONTENIDO) motivos.add(etiquetaDeRuta(ruta));
    }
    return [...motivos];
}

// Sightengine responde 4xx cuando el modelo no existe o no está incluido en el
// plan contratado. Es un problema de configuración, no de contenido.
function esFaltaDeModelo(mensaje) {
    const texto = String(mensaje || '').toLowerCase();
    return texto.includes('unknown model')
        || texto.includes('invalid model')
        || texto.includes('not available')
        || texto.includes('no access');
}

// El plan gratuito limita las peticiones por segundo: una ráfaga de imágenes o
// fotogramas devuelve "Request throttled". No es un rechazo de contenido, así que
// se reintenta con una pausa corta antes de darla por fallida.
function esThrottling(mensaje) {
    return String(mensaje || '').toLowerCase().includes('throttl');
}

const ESPERA_REINTENTO_MS = [1200, 2500];

function esperar(ms) {
    return new Promise((resolver) => setTimeout(resolver, ms));
}

async function pedirJson(url) {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), 60000);
    try {
        const respuesta = await fetch(url, { signal: controlador.signal });
        const payload = await respuesta.json().catch(() => null);
        if (!payload || payload.status !== 'success') {
            const detalle = payload?.error?.message || `HTTP ${respuesta.status}`;
            if (esFaltaDeModelo(detalle)) {
                const error = new Error(
                    `Sightengine no incluye alguno de los modelos solicitados (${detalle}). `
                    + 'Ajusta SIGHTENGINE_MODELOS en servidor/.env con los modelos de tu plan.'
                );
                error.codigo = 'SIGHTENGINE_MODELO_NO_DISPONIBLE';
                throw error;
            }
            const error = new Error(`Sightengine no pudo analizar el contenido (${detalle}).`);
            error.codigo = 'SIGHTENGINE_ERROR';
            error.throttled = esThrottling(detalle);
            throw error;
        }
        return payload;
    } catch (error) {
        if (error.codigo === 'SIGHTENGINE_ERROR' || error.codigo === 'SIGHTENGINE_MODELO_NO_DISPONIBLE') throw error;
        const fallo = new Error('No se pudo conectar con Sightengine para moderar el contenido.');
        fallo.codigo = 'SIGHTENGINE_ERROR';
        fallo.causa = error.message;
        throw fallo;
    } finally {
        clearTimeout(temporizador);
    }
}

async function pedirJsonConReintentos(url) {
    for (let intento = 0; ; intento += 1) {
        try {
            return await pedirJson(url);
        } catch (error) {
            if (!error.throttled || intento >= ESPERA_REINTENTO_MS.length) throw error;
            await esperar(ESPERA_REINTENTO_MS[intento]);
        }
    }
}

function credenciales() {
    const user = process.env.SIGHTENGINE_API_USER;
    const secret = process.env.SIGHTENGINE_API_SECRET;
    if (!user || !secret) {
        const error = new Error(
            'La moderación de contenido no está configurada (faltan SIGHTENGINE_API_USER/SIGHTENGINE_API_SECRET).'
        );
        error.codigo = 'SIGHTENGINE_NO_CONFIGURADO';
        throw error;
    }
    return { user, secret };
}

async function analizarImagen(url, modelosPedidos = null) {
    const { user, secret } = credenciales();
    const lista = (modelosPedidos || modelos()).join(',');
    const params = new URLSearchParams({ url, models: lista, api_user: user, api_secret: secret });
    const payload = await pedirJsonConReintentos(`${URL_IMAGEN}?${params.toString()}`);
    return motivosDeResultado(payload);
}

// URLs de los fotogramas que se moderarán de un video de Cloudinary.
function fotogramasVideo(urlVideo) {
    return FOTOGRAMAS_VIDEO
        .map((porcentaje) => urlFotogramaVideo(urlVideo, porcentaje))
        .filter(Boolean);
}

// RQFN59 con la API Image Moderation: el video se modera a través de imágenes.
// Si un fotograma no se puede descargar no se tumba la moderación mientras quede
// al menos uno analizado; si ninguno se analiza, la publicación se rechaza
// (nunca hay bypass).
async function analizarVideo(urlVideo) {
    const fotogramas = fotogramasVideo(urlVideo);
    if (fotogramas.length === 0) {
        const error = new Error(
            'El video debe estar alojado en Cloudinary para poder moderarlo (no se pudo generar sus fotogramas).'
        );
        error.codigo = 'SIGHTENGINE_ERROR';
        throw error;
    }
    const motivos = new Set();
    const fallos = [];
    let analizados = 0;
    for (const url of fotogramas) {
        try {
            for (const motivo of await analizarImagen(url)) motivos.add(motivo);
            analizados += 1;
        } catch (error) {
            if (error.codigo === 'SIGHTENGINE_MODELO_NO_DISPONIBLE') throw error;
            fallos.push(error.message);
        }
    }
    if (analizados === 0) {
        const error = new Error(
            `No se pudo analizar ningún fotograma del video (${fallos[0] || 'motivo desconocido'}).`
        );
        error.codigo = 'SIGHTENGINE_ERROR';
        throw error;
    }
    if (fallos.length) {
        console.warn(`[sightengine] ${fallos.length} de ${fotogramas.length} fotogramas no se pudieron moderar: ${fallos[0]}`);
    }
    return [...motivos];
}

// Modera una publicación completa. `imagenes` y `urlVideo` son URLs ya subidas.
// Devuelve { aprobado, motivos } con los motivos únicos detectados. Lanza un
// error con `.codigo = 'SIGHTENGINE_NO_CONFIGURADO' | 'SIGHTENGINE_ERROR' |
// 'SIGHTENGINE_MODELO_NO_DISPONIBLE'` cuando la moderación no puede realizarse
// (no se publica sin moderar).
async function moderarContenido({ urlVideo, imagenes = [] } = {}) {
    credenciales();
    const motivos = new Set();
    for (const url of imagenes) {
        if (!url) continue;
        for (const motivo of await analizarImagen(url)) motivos.add(motivo);
    }
    if (urlVideo) {
        for (const motivo of await analizarVideo(urlVideo)) motivos.add(motivo);
    }
    const lista = [...motivos];
    return { aprobado: lista.length === 0, motivos: lista };
}

// Diagnóstico del plan: prueba cada modelo por separado contra una imagen de
// muestra para saber cuáles acepta la cuenta (un plan gratuito no incluye todos).
async function probarModelos(urlImagen = 'https://res.cloudinary.com/demo/image/upload/sample.jpg') {
    const reporte = [];
    for (const modelo of modelos()) {
        try {
            await analizarImagen(urlImagen, [modelo]);
            reporte.push({ modelo, disponible: true, detalle: 'ok' });
        } catch (error) {
            reporte.push({
                modelo,
                disponible: false,
                detalle: error.codigo === 'SIGHTENGINE_MODELO_NO_DISPONIBLE' ? 'no incluido en el plan' : error.message
            });
        }
        // El plan gratuito también limita la frecuencia: espaciar las pruebas.
        await esperar(400);
    }
    return reporte;
}

module.exports = {
    UMBRAL_CONTENIDO,
    MODELOS_POR_DEFECTO,
    FOTOGRAMAS_VIDEO,
    modelos,
    fotogramasVideo,
    moderarContenido,
    probarModelos,
    motivosDeResultado
};