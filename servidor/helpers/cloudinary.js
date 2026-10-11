const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Sube una imagen desde un dataURL (base64) a Cloudinary y devuelve la URL segura.
// Pueden pasarse opciones de transformación por llamada (options.upload/resource).
async function subirImagen(dataUrl, { folder = 'bunyk', transformations = [] } = {}) {
    const resultado = await cloudinary.uploader.upload(dataUrl, {
        folder,
        resource_type: 'image',
        transformation: transformations
    });
    return resultado.secure_url;
}

async function eliminarImagen(url) {
    try {
        const publicId = url.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(publicId);
    } catch (e) {
        // Si no se puede eliminar (URL ajena o ya inexistente), no estallar.
    }
}

// Fotograma de un video como imagen, para moderarlo con la API Image Moderation
// (RQFN59). Cloudinary entrega el frame en el porcentaje indicado del video con
// la transformación `so_##p`, así que funciona con cualquier duración sin
// consultar la duración del asset ni arriesgar un offset fuera de rango.
// Devuelve null si la URL no es un video de Cloudinary servida sin firma
// (una URL firmada no admite transformaciones añadidas).
function urlFotogramaVideo(urlVideo, porcentaje) {
    if (typeof urlVideo !== 'string' || !urlVideo) return null;
    let url;
    try {
        url = new URL(urlVideo);
    } catch (e) {
        return null;
    }
    if (url.hostname !== 'res.cloudinary.com') return null;
    if (url.search) return null;
    if (!url.pathname.includes('/video/upload/')) return null;
    const conTransformacion = url.pathname
        .replace(/\.[a-z0-9]+$/i, '.jpg')
        .replace('/video/upload/', `/video/upload/so_${porcentaje}p,w_640,q_auto/`);
    return `${url.protocol}//${url.host}${conTransformacion}`;
}

module.exports = {
    cloudinary,
    subirImagen,
    eliminarImagen,
    urlFotogramaVideo
};