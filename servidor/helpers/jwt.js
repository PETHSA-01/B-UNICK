const jwt = require('jsonwebtoken');

const getSecret = (tipo) => {
    switch (tipo) {
        case 'access':
            return process.env.JWT_SECRET || 'bunyk_super_secret_key_change_in_production_2026';
        case 'refresh':
            return process.env.JWT_REFRESH_SECRET || 'bunyk_refresh_secret_key_change_in_production_2026';
        case 'email':
            return process.env.JWT_EMAIL_SECRET || 'bunyk_email_secret_key_change_in_production_2026';
        default:
            return process.env.JWT_SECRET || 'bunyk_super_secret_key_change_in_production_2026';
    }
};

const firmarToken = (payload, familia, expiresIn) => {
    return jwt.sign(payload, getSecret(familia), { expiresIn });
};

const verificarToken = (token, familia) => {
    return jwt.verify(token, getSecret(familia));
};

module.exports = {
    getSecret,
    firmarToken,
    verificarToken
};