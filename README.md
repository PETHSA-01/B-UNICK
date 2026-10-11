# B-unick

Plataforma web social para la publicación de videos sobre maquillajes de
diferentes estilos y culturas urbanas (Gótico, Emo, Punk, Lolita, Visual Kei,
Gyaru, etc.). Proyecto Integrador de Desarrollo de Software I — CETI,
febrero–julio 2026.

- **Institución:** Centro de Enseñanza Técnica Industrial (CETI)
- **Carrera:** Desarrollo de Software
- **UAC:** Proyecto Integrador de Desarrollo de Software I
- **Integrante:** Betsabe Elizabeth Zamora Esqueda (grupo 7B1)
- **Asesor:** Carlos Molina Martínez

## Diferenciador clave

Recomendaciones personalizadas de contenido basadas en las características
físicas del usuario (forma de ojos, nariz, labios, cara, tono/tipo de piel y
edad), recolectadas durante el registro.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite (ESM), puerto 5173 |
| Backend | Express + MySQL (CommonJS), puerto 3000 |
| Autenticación | JWT (24 h) + refresh tokens (7 d) en cookies httpOnly, bcryptjs (10 rondas), tokens en BD |
| Servicios externos | Cloudinary (multimedia), Sightengine (moderación), Nodemailer + Gmail (correos) |

## Estructura del monorepo

- `cliente/` — Frontend React + Vite
- `servidor/` — Backend Express + MySQL

## Requisitos

- Node.js (LTS recomendado)
- MySQL/MariaDB con base `bunyk_db` (schema en `servidor/DB/bunyk_db.sql`)
- Variables de entorno en `servidor/.env` (ver `AGENTS.md`, sección 5)

## Puesta en marcha

```bash
# Backend (puerto 3000)
cd servidor && npm install && npm run dev

# Frontend (puerto 5173)
cd cliente && npm install && npm run dev
```

El cliente usa el proxy de Vite (`/api` → `http://localhost:3000`).

## Despliegue

Arquitectura (según la propuesta del proyecto): **frontend + backend juntos en
un único servicio web de Render**, que compila el cliente con Vite y lo sirve
con Express desde el mismo origen; la **base de datos MySQL vive en Railway**.
Al compartir origen, el frontend llama a `/api` sin CORS ni problemas de cookies
`httpOnly`.

### 1. Base de datos en Railway

1. Crea un proyecto y añade el plugin **MySQL**.
2. En la pestaña *Variables*/*Connect* copia el **host público**, **puerto**,
   **usuario**, **contraseña** y el nombre de la base.
3. En *Settings → Networking* habilita el **TCP Proxy público** (el host
   interno `*.railway.internal` solo sirve dentro de Railway).
4. Anota esos datos: se usan como `MYSQLDB_HOST`, `MYSQLDB_PORT`,
   `MYSQLDB_USER`, `MYSQLDB_CONTRASENA` y `MYSQLDB_DB` (`bunyk_db`).
   Railway exige TLS, así que `MYSQLDB_SSL=true`.

> La base se crea sola en el primer arranque: `servidor/DB/initDb.js` lee
> `servidor/DB/bunyk_db.sql` y aplica el esquema + seeds. El usuario de
> Railway debe poder crear la base `bunyk_db`.

### 2. Repositorio

`servidor/DB/bunyk_db.sql` **debe estar en el repositorio** (lo usa `initDb` en
cada arranque). Ya no está en `.gitignore`; asegúrate de commitearlo antes de
desplegar. Los `.env` reales **no** se suben (usa los `.env.example`).

### 3. Servicio en Render

Con el repo en GitHub, usa el blueprint incluido (**New → Blueprint →
`render.yaml`**) o crea un **Web Service** manual con:

- **Build Command:**
  `npm --prefix servidor install && npm --prefix cliente install && npm --prefix cliente run build`
- **Start Command:** `node servidor/index.js`
- **Health Check Path:** `/api/videos/filtros`
- **Runtime:** Node (el `render.yaml` fija `NODE_VERSION=24`).

Render inyecta `PORT` automáticamente. Rellena en el dashboard los secretos
marcados con `sync: false` (Railway, JWT, Cloudinary, Sightengine, Gmail) y las
variables `VITE_CLOUDINARY_*` (se embeben en el build del cliente). Usa
`NODE_ENV=production` y `RESET_DB=false`.

### 4. URLs y primer deploy

1. Tras el primer deploy, Render asigna una URL pública
   (p. ej. `https://b-unick.onrender.com`).
2. Configura `FRONTEND_URL` y `BACKEND_URL` con **esa misma URL** y vuelve a
   desplegar. `FRONTEND_URL` se usa como `origin` de CORS y destino de las
   redirecciones de verificación de correo/restablecimiento.
3. Verifica el correo de verificación configurando en Google Cloud el redirect
   de OAuth y `BACKEND_URL/api/verificar-correo` como origen permitido.

> **Aviso:** cada vez que se sube `SCHEMA_VERSION` en `bunyk_db.sql`, `initDb`
> **re-crea la base** (DROP + re-import) y se pierden los datos reales. Mantén
> `RESET_DB=false` y cambia `SCHEMA_VERSION` solo cuando quieras resembrar.

## Estado del proyecto

Iteración **v1.1.0** (2026-09-20):

- ✅ **Registro completo** con formulario de características físicas en 7 pasos
  y verificación de correo por JWT.
- ✅ **Autenticación** (login por correo o nombre de usuario, refresh,
  logout, recuperación de contraseña, sesión activa).
- ✅ **Barra de navegación (`BarraLateral`)** con blob animado, navegación por
  teclado, diseño responsive (sidebar desktop / bottom bar móvil) y módulos de
  login/registro unificados.
- ✅ **Consentimiento de cookies** como toast "Becky te ha mandado un
  mensaje" (RQFN1-2).
- ✅ **Página Perfil completa (RQFN41-56)**: perfil propio (`/perfil`) y ajeno
  (`/usuarios/:id`), header rediseñado en grid, edición de perfil, cambio de
  contraseña, foto de perfil vía Cloudinary (default = icono B-Unick),
  seguir/dejar de seguir, listas de seguidores/siguiendo y pestañas
  accesibles.
- ✅ **Accesibilidad WCAG AA**: tokens `--color-texto-suave` y
  `--color-acento-fuerte` con contraste verificado, `:focus-visible` y
  `prefers-reduced-motion`.
- ✅ **Layout dedicado** (`AppLayout.css` con `.app-main`).
- ✅ **Notificaciones — drawer superpuesto (RQFN69-72)**: `NotificacionesPagina.jsx`
  portalizado desde la campana de la BarraLateral (derecha en escritorio /
  pantalla completa en móvil), `GET /api/notificaciones` +
  `POST /api/notificaciones/leidas` (`servidor/Routes/routes-notificaciones.js`),
  badge de no leídas y tipo `nuevo_seguidor` activo.
- ✅ **Wiki — portal tipo Fandom (RQFN73-78)**: componente único de tres vistas
  (`/wiki`, `/wiki/:culturaId`, `/wiki/:culturaId/:subculturaId`) con contenido
  en `cliente/src/Componentes/WIKI/datos/wiki.json` (**8 culturas / 75
  subestilos**, template editorial Sección 1-6 + ficha de 5 campos por
  subestilo, imágenes reales en los 83 items) y seed de BD sincronizado
  (`subculturas_estilos` con 75 filas, `SCHEMA_VERSION = 6`).
- ✅ **Maquillajes — placeholder funcional**: `/maquillajes` montada, lee
  `cultura`/`subcultura` de query params y enlaza a la Wiki (feed real en paso
  3 del roadmap).
- ⚠️ Pendientes: feed de Maquillajes (RQFN79-98), Crear, Video detalle y
  Conversaciones.

Detalle técnico completo (contratos, rutas API, estructura de datos,
roadmap): ver `AGENTS.md`.

## Documentación

- `AGENTS.md` — Instrucciones del agente / fuente de verdad técnica del proyecto
- `DocumentacionDelCodigo.md` — Documentación de funciones, clases y tablas
- `TODO_B-unick.md` — Pendientes del proyecto
- `CHANGELOG.md` — Historial de versiones

## Scripts útiles

```bash
cd cliente && npm run dev      # Dev server
cd cliente && npm run build    # Build de producción
cd cliente && npm run lint     # ESLint (50 errores baseline conocidos)
cd servidor && npm run dev     # Backend con nodemon
cd servidor && npm start       # Backend producción
```

## Licencia

Privado — uso académico (CETI).
