const { verificarToken } = require('../helpers/jwt');

const verificarAcceso = async (req, res, next) => {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = verificarToken(accessToken, 'access');

        if (decoded.tipo !== 'access') {
            return res.status(401).json({ error: 'Invalid token type' });
        }

        req.user = {
            id: decoded.userId,
            email: decoded.email
        };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.error('Error en verificarAcceso:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = verificarAcceso;