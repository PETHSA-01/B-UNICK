//importing express, environmental variables, bodyparser, router, database connection function and declaring them in a varibale to be using it in our index.js file
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const ConnectDB = require('./DB/mysqldb');
const initDb = require('./DB/initDb');
const app = express();
const router = require('./Routes/routes-autenticacion');
const routerUsuarios = require('./Routes/routes-usuarios');
const routerNotificaciones = require('./Routes/routes-notificaciones');
const routerVideos = require('./Routes/routes-videos');
const routerConversaciones = require('./Routes/routes-conversaciones');
const bodyParser = require('body-parser');
const cors = require("cors")
dotenv.config();
//using the port in environmental variable or 5000
const port = process.env.PORT || 3000;

// Guarda de configuración: en producción los secretos y URLs NO deben caer
// en los valores por defecto del código (los secretos tienen fallbacks
// públicos en helpers/jwt.js y un FRONTEND_URL vacío haría que CORS refleje
// cualquier origen). Si falta algo, se aborta el arranque en vez de correr
// con una configuración insegura.
function validarConfiguracion() {
    if (process.env.NODE_ENV !== 'production') return;

    const requeridas = [
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'JWT_EMAIL_SECRET',
        'FRONTEND_URL',
        'BACKEND_URL'
    ];
    const faltantes = requeridas.filter((clave) => !process.env[clave]);
    if (faltantes.length > 0) {
        console.error(
            `Configuración incompleta: faltan variables de entorno requeridas en producción: ${faltantes.join(', ')}. ` +
            'Defínelas en el panel de Render antes de desplegar.'
        );
        process.exit(1);
    }
}

validarConfiguracion();

// En producción el backend corre detrás del proxy de Render (HTTPS
// terminado aguas arriba). Sin esto, Express no reconoce X-Forwarded-Proto
// y las cookies `secure` podrían no fijarse correctamente.
app.set('trust proxy', 1);

// Cabeceras de seguridad. Se desactiva CSP a propósito: el index.html de
// Vite incluye un script inline (tema claro/oscuro) y el cliente carga el
// Upload Widget de Cloudinary desde otro origen; una CSP por defecto los
// bloquearía y rompería el producto. El resto de cabeceras (HSTS,
// X-Content-Type-Options, X-Frame-Options, Referrer-Policy, etc.) sí aplican.
app.use(helmet({ contentSecurityPolicy: false }));
app.disable('x-powered-by');

// middleware to parse incoming request in bodies
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL ,
  credentials: true
}))
app.use(cookieParser())
// initialize the database connection pool
let pool;

(async () => {
    try {
        await initDb();
        pool = ConnectDB.pool;
        console.log('Pool initialized:', !!pool);

        // Test database connection
        const conn = await pool.getConnection();
        console.log('Database connected successfully');
        conn.release();

        // pass the pool to the routes
        app.use((req, res, next) => {
            req.pool = pool;
            next();
        });

        // use the router
        app.use("/api", router);
        app.use("/api", routerUsuarios);
        app.use("/api", routerNotificaciones);
        app.use("/api", routerVideos);
        app.use("/api", routerConversaciones);

        // 404 con JSON para rutas de API inexistentes (Express devolvería
        // HTML por defecto y el frontend no podría mostrar el error real).
        app.use('/api', (req, res) => {
            res.status(404).json({ error: 'Ruta no encontrada.' });
        });

        // En producción (Render) el frontend y el backend se despliegan
        // juntos: Express sirve el build estático de Vite (cliente/dist) y
        // resuelve las rutas del SPA con un fallback a index.html. Así el
        // frontend llama a `/api` en el MISMO origen, sin CORS ni problemas
        // de cookies cross-site. En desarrollo el build puede no existir
        // (se usa el proxy de Vite) y este bloque se salta sin romper nada.
        const distPath = path.join(__dirname, '..', 'cliente', 'dist');
        const indexHtml = path.join(distPath, 'index.html');
        if (fs.existsSync(indexHtml)) {
            app.use(express.static(distPath));
            app.use((req, res, next) => {
                if (req.method !== 'GET' && req.method !== 'HEAD') {
                    return next();
                }
                res.sendFile(indexHtml, (err) => {
                    if (err) next(err);
                });
            });
            console.log(`Sirviendo el frontend desde ${distPath}`);
        } else {
            console.log('No se encontró cliente/dist; solo se sirve la API (modo desarrollo).');
        }

        // start the server
        // Render exige atar a 0.0.0.0; sin host explícito Node queda en loopback.
        app.listen(port, '0.0.0.0', () => {
            console.log(`Servidor escuchando en 0.0.0.0:${port}`);
        });
    } catch (error) {
        console.error('Startup error:', error);
        process.exit(1);
    }
})();