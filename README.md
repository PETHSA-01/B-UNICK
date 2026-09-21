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
