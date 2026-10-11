//importing express, environmental variables, bodyparser, router, database connection function and declaring them in a varibale to be using it in our index.js file
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const ConnectDB = require('./DB/mysqldb');
const initDb = require('./DB/initDb');
const app = express();
const router = require('./Routes/routes-autenticacion');
const routerUsuarios = require('./Routes/routes-usuarios');
const routerNotificaciones = require('./Routes/routes-notificaciones');
const bodyParser = require('body-parser');
const cors = require("cors")
const helmet = require('helmet');
dotenv.config();
//using the port in environmental variable or 5000
const port = process.env.PORT || 3000;

// En producción, aborta el arranque si faltan secretos o URLs críticas: sin
// ellas los helpers de JWT caerían en secretos por defecto públicos (tokens
// forjables) y CORS reflejaría cualquier origen.
function validarConfiguracion() {
    if (process.env.NODE_ENV !== 'production') return;
    const requeridas = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'JWT_EMAIL_SECRET', 'FRONTEND_URL', 'BACKEND_URL'];
    const faltantes = requeridas.filter((clave) => !process.env[clave]);
    if (faltantes.length > 0) {
        console.error('Faltan variables de entorno obligatorias en producción:', faltantes.join(', '));
        process.exit(1);
    }
}
validarConfiguracion();

// Cabeceras de seguridad. CSP desactivada a propósito: el index.html de Vite
// usa un script inline (tema) y el cliente carga el widget de Cloudinary.
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));

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

        // start the server
        app.listen(port, () => {
            console.log(`Example app listening on port http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Startup error:', error);
        process.exit(1);
    }
})();