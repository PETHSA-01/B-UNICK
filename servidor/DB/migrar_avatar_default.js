// ---------------------------------------------------------------------
// Migración única: normaliza la foto de perfil por defecto.
// Limpia NULL/vacío y las URLs legacy de placehold.co a NULL. Las fotos
// personalizadas (Cloudinary) NO se tocan. El default visual (icono
// B-Unick) lo resuelve el backend vía helpers/imagenes.resolverFotoPerfil.
// Ejecutar una sola vez:
//   node servidor/DB/migrar_avatar_default.js
// ---------------------------------------------------------------------
const { pool } = require('./mysqldb');

(async () => {
    try {
        const [resultado] = await pool.execute(
            `UPDATE usuarios
             SET foto_perfil = NULL
             WHERE foto_perfil IS NULL
                OR TRIM(foto_perfil) = ''
                OR foto_perfil LIKE 'https://placehold.co%'`
        );
        console.log(`[migrar_avatar_default] Filas normalizadas a NULL: ${resultado.affectedRows}`);
    } catch (error) {
        console.error('[migrar_avatar_default] Error:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
})();