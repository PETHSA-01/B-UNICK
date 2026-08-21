const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello World!');
})

const validacion = require('./validacionregistro');

router.post('/validacionregistro', async (req, res) => {
    const { email } = req.body;
    const pool = req.pool;

    if (!email) {
        return res.status(400).json({ error: 'El correo es requerido' });
    }

    try {
    const [rows] = await pool.execute('SELECT * FROM usuarios WHERE correo = ?', [email]);
        
        if (rows.length > 0) {
            return res.status(409).json({ error: 'El correo ya se encuentra registrado' });
        }

        res.json({ success: true, message: 'Correo disponible para registro' });
    } catch (error) {
        console.error('Error validando registro:', error.message, error.code, error.sqlMessage);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/registro', async (req, res) => {
    validacion(req, res)
})

module.exports = router