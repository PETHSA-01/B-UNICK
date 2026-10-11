// Prueba de la moderación automática de contenido (RQFN59, RQFN60, RQFN125).
// Uso:
//   npm run moderacion:prueba                     → diagnóstico completo
//   npm run moderacion:prueba -- --solo-modelos   → solo qué modelos acepta tu plan
//   npm run moderacion:prueba -- <urlImagen> <urlVideo>
//
// Imprime qué modelos incluye tu plan de Sightengine, los fotogramas que se
// moderarán del video y el veredicto final para la imagen y para el video.

require('dotenv').config();
const { modelos, fotogramasVideo, moderarContenido, probarModelos } = require('../helpers/sightengine');

const IMAGEN_DEMO = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
const VIDEO_DEMO = 'https://res.cloudinary.com/demo/video/upload/cat.mp4';

function veredicto(etiqueta, moderacion) {
    const estado = moderacion.aprobado ? 'APROBADO' : 'RECHAZADO';
    console.log(`\n${etiqueta}: ${estado}`);
    if (moderacion.motivos.length) {
        console.log('  Motivos:', moderacion.motivos.join(', '));
    }
}

async function principal() {
    const argumentos = process.argv.slice(2).filter((argumento) => !argumento.startsWith('--'));
    const soloModelos = process.argv.includes('--solo-modelos');
    const urlImagen = argumentos[0] || IMAGEN_DEMO;
    const urlVideo = argumentos[1] || VIDEO_DEMO;

    console.log('Modelos configurados (SIGHTENGINE_MODELOS):', modelos().join(', '));
    console.log('Umbral de rechazo: 15% por categoría');

    console.log('\n— Modelos incluidos en tu plan —');
    const reporte = await probarModelos(urlImagen);
    for (const { modelo, disponible, detalle } of reporte) {
        console.log(`  ${disponible ? '✓' : '✗'} ${modelo}${disponible ? '' : ` → ${detalle}`}`);
    }
    const faltantes = reporte.filter((item) => !item.disponible).map((item) => item.modelo);
    if (faltantes.length) {
        console.log(`\nTu plan no incluye: ${faltantes.join(', ')}.`);
        console.log('Para usar solo los disponibles, ajusta en servidor/.env:');
        console.log(`SIGHTENGINE_MODELOS=${reporte.filter((item) => item.disponible).map((item) => item.modelo).join(',')}`);
    }
    if (soloModelos) return;

    if (urlVideo) {
        console.log('\n— Fotogramas que se moderarán del video —');
        const fotogramas = fotogramasVideo(urlVideo);
        if (fotogramas.length === 0) {
            console.log('  La URL no es un video de Cloudinary: no se pueden extraer fotogramas.');
        } else {
            fotogramas.forEach((url, indice) => console.log(`  ${indice + 1}. ${url}`));
        }
    }

    veredicto('Imagen de muestra', await moderarContenido({ imagenes: [urlImagen] }));
    if (urlVideo && fotogramasVideo(urlVideo).length) {
        veredicto('Video de muestra', await moderarContenido({ urlVideo }));
    }
}

principal().catch((err) => {
    console.error('\nError en la moderación:', err.message);
    process.exitCode = 1;
});