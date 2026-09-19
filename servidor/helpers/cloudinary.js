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

module.exports = {
    cloudinary,
    subirImagen,
    eliminarImagen
};