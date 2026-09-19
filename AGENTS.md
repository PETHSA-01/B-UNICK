# B-unick - Agent Instructions

## 0. Contexto académico y profesional del proyecto

> Esta sección resume el protocolo de investigación y la propuesta formal del
> proyecto (fuente: `Guia_Protocolo_B-Unick.pdf` y `Formato_para_propuestas_V5_5.pdf`).
> Sirve para que cualquier persona o agente que trabaje en el código entienda
> **por qué** existe el proyecto, no solo **cómo** está construido, y para que
> el reporte final que se entregue a la escuela sea consistente con lo que el
> código realmente hace.

**Datos generales**
- **Institución:** Centro de Enseñanza Técnica Industrial (CETI), Organismo
  Público Descentralizado Federal.
- **Carrera:** Desarrollo de Software.
- **UAC:** Proyecto Integrador de Desarrollo de Software I.
- **Nombre oficial del proyecto:** "Sitio web social para la publicación de
  videos sobre maquillajes de diferentes estilos y culturas urbanas (B-unick)".
- **Integrante:** Betsabe Elizabeth Zamora Esqueda (grupo 7B1).
- **Asesor:** Carlos Molina Martínez.
- **Periodo:** Guadalajara, Jal., febrero–julio 2026.

> Nota de nomenclatura: el nombre del proyecto aparece con tres grafías en la
> documentación fuente: **B-unick** (portada del protocolo), **B-unyk**
> (slogan en la propuesta detallada) y **B-unik** (usado en algunos documentos
> internos del repositorio). Al redactar el reporte final o cualquier texto de
> cara al usuario, unificar bajo un solo nombre oficial y dejarlo anotado aquí
> una vez que el equipo lo decida.

### Problema que resuelve

Actualmente no existe una plataforma web enfocada específicamente en la
difusión de maquillajes relacionados con culturas urbanas y estilos
alternativos (Gótico, Emo, Punk, Lolita, Visual Kei, Gyaru, etc.) que combine
aprendizaje, interacción social y recomendaciones personalizadas basadas en
características físicas del usuario. Las plataformas existentes (TikTok,
Instagram, Pinterest) priorizan tendencias comerciales y algoritmos de
popularidad masiva, lo que deja poco espacio para:

- contenido especializado sobre subculturas específicas y su significado real,
- filtros de recomendación basados en rasgos físicos del usuario, y
- espacios de discusión estructurados alrededor de estos estilos.

### Objetivo general

Desarrollar una plataforma web social enfocada en maquillajes de culturas
urbanas y estilos alternativos donde los usuarios puedan compartir, visualizar
y encontrar contenido personalizado mediante tecnologías web, sistemas de
recomendación y herramientas de interacción social.

### Objetivos específicos

- Registro e inicio de sesión seguros con JWT y bcrypt.
- Publicación de videos e imágenes con almacenamiento en la nube.
- Filtros de recomendación basados en características físicas del usuario.
- Apartados informativos (Wiki) sobre culturas urbanas y estilos alternativos.
- Comentarios y conversaciones para fomentar la interacción social.
- Moderación automática de contenido multimedia.
- Base de datos relacional en MySQL para usuarios, publicaciones, comentarios
  y notificaciones.
- Despliegue en un entorno cloud para disponibilidad multiplataforma.

### Justificación

El proyecto centraliza contenido de maquillaje alternativo que hoy está
disperso y poco documentado en plataformas generalistas, ayuda a visibilizar
subculturas con representación limitada, y usa los filtros por rasgos físicos
para mejorar la relevancia de las recomendaciones frente a un feed genérico.
La moderación automática busca mantener un entorno seguro, y el desarrollo del
proyecto en sí permite aplicar y demostrar competencias en desarrollo web,
diseño de bases de datos, seguridad informática, APIs externas, almacenamiento
multimedia y sistemas de recomendación.

### Diferenciación frente a la competencia

| Plataforma | Fortaleza | Carencia frente a B-unick |
|---|---|---|
| TikTok | Videos cortos, recomendación por comportamiento | Sin clasificación por características físicas del usuario |
| Instagram | Publicación visual, interacción social | Búsqueda basada en hashtags/popularidad, no en rasgos físicos |
| Pinterest | Inspiración visual por tableros | Sin recomendación basada en rasgos físicos personales |

### Viabilidad, aplicabilidad, accesibilidad, usabilidad (resumen)

- **Viabilidad:** stack estándar, sin herramientas experimentales; desarrollo
  modular pensado para un MVP funcional en 3–6 meses.
- **Aplicabilidad:** resuelve una necesidad real de contenido especializado y
  recomendaciones personalizadas; escalable de nicho educativo a comunidad
  amplia.
- **Accesibilidad:** diseño responsive mobile-first, selección visual de
  rasgos faciales, navegación básica por teclado; pendiente reforzar
  contraste, subtítulos/transcripciones y atributos ARIA para cumplir WCAG
  2.1/2.2 nivel AA.
- **Usabilidad:** flujo lineal e intuitivo — registro → selección guiada de
  rasgos → recomendaciones → exploración por cultura → interacción
  (ver/comentar/votar/guardar).

### Relación con el reporte final del CETI

El reporte final del proyecto debe seguir el "Formato para Reporte final" del
CETI: capítulos en romano con subcapítulos arábigos de dos números, sin usar
nombres de tecnologías o plataformas como título de capítulo, tipografía
Times New Roman/Courier New/Arial/Calibri a 12 pt, párrafos justificados con
interlineado de 1.5, y documentación de cada función/clase/tabla cubriendo
nombre, variables, qué hace, cómo lo hace, quién la invoca, qué entrega, a
quién invoca y qué recibe. Este `AGENTS.md` es la fuente de verdad técnica
para redactar los capítulos de "Diseño técnico" y "Desarrollo" de ese reporte;
las secciones 0 y siguientes de este documento deben mantenerse sincronizadas
con el estado real del código antes de generar esos capítulos.

---

## 1. Project Status
✅ **Complete registration flow implemented and working:**
- `POST /validacionregistro` - validates email/username availability
- `POST /preregistro` - creates user + characteristics + JWT token + sends verification email
- `GET /verificar-correo` (backend) - validates token, marks user verified, redirects to frontend
- Frontend: `PreregistroConfirmado` modal on preregistration success
- Frontend: `CuentaConfirmada` modal on email verification success
- Loading spinner in `EdadFormulario` during submission

✅ **Navigation Bar (BarraLateral) Implementation - COMPLETE:**
- `BarraLateral.jsx` - Main sidebar component with 6 navigation items (Inicio, Conversaciones, Crear, Wiki, Notificaciones, **Perfil**)
- `estilospequeños.css` - Full responsive styling with desktop sidebar (72-200px) and mobile bottom bar
- `AuthContext.jsx` - Authentication context with `/api/me` integration
- `AppLayout.jsx` - Layout wrapper with sidebar + Outlet for nested routes
- `main.jsx` - Complete route structure with AppLayout wrapping authenticated routes
- Morphing blob animation as signature element (follows active item)
- SVG icons for all navigation items (logo.svg for Inicio, inline SVGs for others)
- Auth integration with useAuth hook (shows Perfil when logged in, login/register buttons when not)
- Keyboard navigation (arrows, Home, End)
- Active route highlighting
- Reduced motion support
- Mobile responsive bottom bar with safe-area-inset support
- Hidden on /verificar-correo route
- Conditional auth section (Perfil when logged in, login/register buttons when not)
- **Profile navigation**: Clickable profile avatar navigates to `/perfil` route
- **Perfil route fija**: en `/perfil` y `/usuarios/:id` el `activeIndex` se fuerza a `-1` (el blob del ítem activo se oculta, ya que Perfil no es un ítem de `NAV_ITEMS`); el avatar autenticado lleva `aria-current="page"` + clase `barra-lateral-auth-btn--activo` cuando `enPerfil` es true
- **Auth modals**: Login/Register modals with portal rendering, ESC/backdrop close, mode switching

✅ **Cookie Consent (RQFN1-2) - COMPLETE (toast, NOT modal):**
- `Notificaciones.jsx` shows the cookie request as a notification toast styled like "Becky te ha mandado un mensaje" (`.notificacion.notif-cookie`, gif `/hi.gif`, cookie text, buttons "Aceptar todo" / "Rechazar todo") - **no longer a modal**
- `createPortal` removed from the cookie flow; classes `.cookie-consent-overlay`, `.cookie-consent-modal`, `.cookie-consent-content`, `.cookie-consent-gif`, `.cookie-consent-text` eliminated (inline SVG icons + `createPortal` only remain for auth modals in `BarraLateral.jsx`)
- `AuthContext.jsx`: `cookieConsent` initialized with lazy initializer reading `localStorage.getItem('cookie-consent')` (try/catch → null if absent/invalid); `setCookieConsentFromChild` persists to localStorage **ONLY** when `consentData.accepted === true`; rejection stays only for the current session and is re-asked
- `Notificaciones.jsx` local state `cookieToastDismissed` resets on every mount (rejecting in Inicio does not prevent reappear in login/register); `hasConsent = resolvedConsent?.accepted === true`; `shouldShowCookieToast = !hasConsent && !cookieToastDismissed`
- `handleReject` calls `resolvedReject` + `setCookieToastDismissed(true)`; the ✕ button also rejects
- AuthContext fallback (`resolvedConsent` / `resolvedAccept` / `resolvedReject`) maintained: the card appears on **any** mount without needing props
- CSS: "Rechazar todo" uses `background: var(--color-elementos)` (fixed from nonexistent `--color-error`); added `.notif-cookie { border-left: 4px solid var(--color-fondo3) }` and `.cookie-consent-buttons { justify-content: flex-start }`

✅ **Perfil (RQFN41-56) - COMPLETE:**
- `routes-usuarios.js`: router dedicado con `GET/PUT /perfil`, `POST /perfil/contrasena`, `PUT /perfil/foto`, `GET /usuarios/:id/perfil`, `POST /seguir/:id`, listas de seguidores/siguiendo (propias y ajenas) — todo tras `verificarAcceso`
- Foto de perfil: base64 `{ imagen: dataURL }` → Cloudinary (`c_fill,w_400,h_400`) vía `helpers/cloudinary.js` (sin multer); sin Sightengine por ahora
- Cambio de contraseña: exige actual (bcrypt), nueva === confirmación, revoca refresh tokens de otras sesiones (ruta **sin tilde** por Express 5)
- `POST /seguir` con toggle, `400` self-follow y creación de notificación `nuevo_seguidor` (RQFN69-72 la leerá retroactivamente)
- Perfiles ajenos: `404` si no existe o `correo_verificado=0` (no visibles ni seguibles)
- `GET /me`·`/login`·`/refresh` ahora devuelven `fotoPerfil` y `descripcion` (el avatar de la BarraLateral se actualiza solo)
- Frontend: `Perfil.jsx` rediseñado (modo propio `/perfil` y ajeno `/usuarios/:id`), avatar con iniciales de fallback, stats clicables, modales Editar perfil (foto con preview + resize client-side) y Cambiar contraseña, botón Seguir/Dejar de seguir optimista, listas en modal, toasts de Becky portalizados
- Express 5 detectado (v5.2.1): literales no-ASCII en rutas no matchean → usar rutas sin tildes

✅ **Foto de perfil predeterminada (icono B-Unick) - COMPLETE:**
- `servidor/helpers/imagenes.js` (nuevo): `FOTO_PERFIL_DEFECTO` = URL Cloudinary del icono B-Unick, `resolverFotoPerfil(url)` (NULL/vacía/`placehold.co` → icono; si no, la url real) y `mapearUsuarioConFoto(fila)` (renombra `foto_perfil`→`fotoPerfil` resuelto)
- `/api/login`, `/api/refresh`, `/api/me`, `GET /api/perfil`, `GET /api/usuarios/:id/perfil` sirven `fotoPerfil` con el default ya resuelto
- Los 4 endpoints de listas (`/perfil/seguidores`, `/perfil/siguiendo`, `/usuarios/:id/seguidores`, `/usuarios/:id/siguiendo`) devuelven el campo RENOMBRADO `fotoPerfil` (antes `foto_perfil`), ya resuelto; el frontend usa `u.fotoPerfil`
- Migración `servidor/DB/migrar_avatar_default.js` (ejecutada una vez): normalizó a NULL las 10 filas de seed con `placehold.co`; fotos Cloudinary personalizadas intactas
- BarraLateral: el avatar del usuario autenticado muestra la foto real (`user.fotoPerfil`) en vez de solo la inicial; CSS `.barra-lateral-avatar img` agregado

✅ **Perfil header reestructurado (decisión de diseño del equipo, con colores/tokens nuevos) - COMPLETE:**
- Header = grid `auto minmax(0, 1fr) auto` con avatar 112px (anillo blanco `0 0 0 4px #fff`, sin borde, iniciales del fallback a 40px) + bloque info (username ahora `<h1>` 28px/600 con `letter-spacing:-0.01em` y `overflow-wrap:anywhere` + descripción 15px/1.55 máx. 44ch con `overflow-wrap:anywhere` + botón Seguir/Siguiendo inline para perfiles ajenos) + rail de 4 stats (Likes, Publicaciones, Seguidores, Seguidos; columnas `repeat(4, minmax(88px, 1fr))`, **sin offset en cols 3-4**, números **15px/600** con `font-variant-numeric: tabular-nums`, iconos SVG 26px en `--color-acento-fuerte`); `box-shadow: 0 16px 32px -20px rgba(83, 60, 94, 0.28)`. El `padding-right: 72px` reserva sitio al engranaje
- Eliminados del header: correo electrónico y "Miembro desde". Eliminada la fila de botones `.perfil-actions`. **Retirado el offset de las columnas 3 y 4** de stats
- Nuevos tokens en `estilos.css`: `--color-texto-suave: #5E4380` (texto secundario; 5.30:1 sobre `--color-fondo2`, 7.22:1 sobre `--color-fondo`, 8.11:1 sobre `#fff`) y `--color-acento-fuerte: #6B4E8C` (iconos, pestaña activa, botón primario, foco; 6.05:1 sobre `--color-fondo` y 6.79:1 sobre `#fff` y en texto blanco encima). Todos los textos del módulo ≥4.5:1 e iconos ≥3:1 (WCAG AA)
- Botón engranaje ⚙ (solo perfil propio) ahora **dentro de la tarjeta** (`position: absolute; top/right: 14px` en todos los breakpoints; se eliminó el bloque `@media (min-width:769px)` que lo hacía `fixed` y blanco): 44px, color `--color-texto-suave`; abre menú desplegable `top: 50px; right: 0` con z-index sobre tarjeta y pestañas (Editar perfil / Cambiar contraseña / Cerrar sesión)
- Barra de pestañas `.perfil-tabs` al pie del header (**solo visual, sin rutas ni API**): Publicaciones (activa por defecto), Guardados, Vistas, Chats; grid `repeat(4, 1fr)` con `gap: 8px` y `padding: 0 20px` (≥769px) / `0 12px` (≤768px) **idéntico al de `.perfil-page`**, de modo que los bordes coinciden con la tarjeta; pestaña activa con fondo blanco + "docket" `::after` que se funde con `.perfil-contenido`; separación tarjeta→pestañas ≈ 28px. ARIA: `role="tablist|tab|tabpanel"`, `aria-selected`, `aria-controls`/`aria-labelledby`, `tabIndex` roving (0/-1) y navegación con ←/→ (con envoltura), Inicio y Fin
- Estado vacío contextual por pestaña (componente `EstadoVacio` con `PESTANAS`/`TEXTOS_VACIOS`): círculo 64px con icono de la pestaña, título, explicación y botón de acción (solo perfil propio); perfiles ajenos muestran título/texto sin botón
- Iconos SVG propios (IconoBase + 8 iconos feather-style) en Perfil.jsx
- CSS responsive en `perfil.css`: ≤1000px header a 2 columnas (`auto minmax(0,1fr)`) y stats a fila completa (`grid-column: 1/-1`) con divisor `border-top` + `padding-top: 22px`; ≤768px apila header (avatar 96px centrado, stats 2×2 `repeat(2,1fr)` sin divisor, engranaje 12px); ≤480px oculta nombres de pestaña con patrón `visually-hidden` (no `display:none`); `:focus-visible` con `--color-acento-fuerte` (`outline-offset: -3px` en pestañas); transiciones anuladas vía `@media (prefers-reduced-motion: reduce)`

**Pending Visual Improvements:**
- Blob animation positioning refinement (smooth transitions between items)
- Hover/focus states polish
- Mobile bottom bar icon spacing
- Focus visible styles consistency
- Loading state in auth section

**Component Status:**
- ✅ BarraLateral.jsx - Created with full logic
- ✅ BarraLateral.css (in estilospequeños.css) - Created with full styling
- ✅ AuthContext.jsx - Created with /api/me integration
- ✅ AppLayout.jsx - Layout wrapper with sidebar + Outlet (`className="app-main"`)
- ✅ AppLayout.css - **NUEVO**: `.app-main` con `margin-left: 72px` desktop y `margin-left: 0` + `padding-bottom: 84px` en móvil (≤768px)
- ✅ main.jsx - Complete route structure with AppLayout
- ✅ Inicio.jsx - Basic implementation with login/register modals
- ⚠️ Conversaciones.jsx - **Exists but empty placeholder** (just `<div>Conversaciones</div>`), no logic or backend integration
- ⚠️ Crear.jsx - **Exists but empty placeholder** (just `<div>Crear</div>`), no logic or backend integration
- ⚠️ Wiki.jsx - **Exists but empty placeholder** (just `<div>Wiki</div>`), no logic or backend integration
- ✅ Notificaciones.jsx - Created with toast notifications + cookie consent toast (RQFN1-2)
- ✅ Perfil.jsx - Complete (RQFN41-56): perfil propio y ajeno, edición, contraseña, foto, seguir + listas (toasts de Becky)
- ✅ InicioSesion.jsx - Exists with login flow integration
- ✅ Backend /api/me endpoint - Created (returns `tienePreferencias` too)
- ✅ Backend /api/login - Created and working
- ✅ Backend /api/refresh - Implemented (JWT_REFRESH_SECRET, validates DB tipo/expiry)
- ✅ Backend /api/logout - Implemented (revokes device refresh token + clears cookies)
- ✅ Backend /api/reenviar-verificacion - Implemented (neutral response)
- ✅ Backend /api/olvido-contrasena + /api/recuperar-contrasena - Implemented (password reset)
- ✅ Backend /api/culturas + /api/preferencias - Implemented (RQFN11-13)
- ✅ `PreferenciasFormulario.jsx` - First-time user culture/style preferences form (shown when `tienePreferencias === false`)
- ✅ Auth modal unificado vía `AuthModalContext` (no nested login/register), helpers JWT/correo, middleware `verificarAcceso`

**Note on Main Page Components:** Conversaciones, Crear y Wiki están routados y montados pero renderizan solo texto placeholder estático. Carecen de: data fetching, state management, API integration, UI components y business logic. **Perfil ya NO es placeholder** (RQFN41-56 completo + header reestructurado). `Notificaciones.jsx` now exists but only manages toast notifications + the cookie consent card; there is still no dedicated notifications page with a persisted list, "Nada aquí" empty state or backend integration (RQFN69-72).

**Remaining Pending (auth):**
- RQFN3: el guard de `AuthModalContext.openModal` ya hace no-op si hay sesión activa; la BarraLateral ya muestra el perfil en lugar de login/registro cuando hay sesión
- Perfil **COMPLETADO** en su totalidad (RQFN41-56): `Perfil.jsx` con botón "Cerrar sesión" que llama `AuthContext.logout()` + `useNavigate('/')`, edición de perfil, cambio de contraseña, foto y seguir/listas
- Limpieza de BD por **eventos MySQL** (completado): `evt_eliminar_usuarios_no_verificados` y `evt_limpiar_tokens_expirados` en `bunyk_db.sql` (`SCHEMA_VERSION = 2`; requieren privilegio EVENT en `bunyk_app`, ya otorgado; `event_scheduler` ON)
- `verificarAcceso` aplicado en `/api/preferencias`; queda **en reserva** para los futuros routers (crear/likes/seguir) que aún no existen
- Bug de `tienePreferencias` sin refrescar tras guardar preferencias: **COMPLETADO** — `/api/preferencias` devuelve `user.tienePreferencias` y `Inicio.jsx` llama `refreshUser()` tras guardar

## 2. Project Overview
**B-unick** - Social web platform for makeup videos across urban cultures/styles (Gótico, Emo, Punk, Lolita, Visual Kei, Gyaru, etc.)

**Key differentiator:** Personalized content recommendations based on user's physical characteristics (eye shape, face shape, lips, nose, skin tone/type, age) collected during registration.

**Tech Stack:**
- Frontend: React + Vite (ESM), port 5173
- Backend: Express + MySQL (CommonJS), port 3000
- Auth: JWT (24h expiry), bcryptjs (10 rounds), tokens in DB
- External: Cloudinary (media), Sightengine (moderation), Nodemailer (email)

## 3. Project Structure
Monorepo with two packages:
- `cliente/` - React + Vite frontend (port 5173)
- `servidor/` - Express + MySQL backend (port 3000)

## 4. Development Commands

### Frontend (cliente)
```bash
cd cliente && npm run dev     # Start Vite dev server
cd cliente && npm run build   # Production build
cd cliente && npm run lint    # Run ESLint
```

### Backend (servidor)
```bash
cd servidor && npm run dev    # Start with nodemon (auto-reload)
cd servidor && npm start      # Production start
```

## 5. Environment Variables (servidor/.env)
```
PORT=3000
MYSQLDB_HOST=localhost
MYSQLDB_USER=bunyk_app
MYSQLDB_CONTRASENA=brochacho
MYSQLDB_DB=bunyk_db
JWT_SECRET=bunyk_super_secret_key_change_in_production_2026
JWT_REFRESH_SECRET=<refresh-secret>
JWT_EMAIL_SECRET=<email-secret>
RESET_DB=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=b.unick.ceti@gmail.com
SMTP_PASS=<gmail-app-password>
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
```

## 6. Database
- MySQL/MariaDB: `bunyk_db`
- Schema: `servidor/DB/bunyk_db.sql`
- Key tables: `usuarios`, `caracteristicas_fisicas`, `tokens`, `videos`, `comentarios`, `conversaciones`, `likes`, `seguidores`, `notificaciones`, `culturas_estilos`, `subculturas_estilos`
- Connection pool in `servidor/DB/mysqldb.js`

## 7. Key API Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/validacionregistro` | Check if email/username available |
| POST | `/api/preregistro` | Create user + characteristics + send verification email |
| GET | `/api/verificar-correo` | Verify JWT token from email, mark user verified, redirect to frontend |
| POST | `/api/login` | Authenticate user by **email or username** (`identificador`), set httpOnly cookies (access + refresh tokens); `fotoPerfil` ya trae el default resuelto |
| GET | `/api/me` | Get authenticated user info + `tienePreferencias` from accessToken cookie; `fotoPerfil` ya trae el default resuelto |
| POST | `/api/refresh` | Re-emit accessToken from refreshToken (validates DB tipo/expiry/used); `fotoPerfil` ya trae el default resuelto |
| POST | `/api/logout` | Revoke current device refresh token (`usado=1`) + clear cookies |
| POST | `/api/reenviar-verificacion` | Neutral response; resends verification email if pending |
| POST | `/api/olvido-contrasena` | Neutral response; sends reset link `FRONTEND_URL/restablecer?token=X` |
| POST | `/api/recuperar-contrasena` | Validate reset token, update password, mark token used |
| GET | `/api/culturas` | List cultures + nested subcultures (public, RQFN11-13) |
| POST | `/api/preferencias` | Save 1-3 user culture/subculture preferences (`verificarAcceso` protected) |
| GET | `/api/perfil` | Own profile + stats (videos, likes recibidos, seguidores, siguiendo) (`verificarAcceso`); `fotoPerfil` ya trae el default resuelto |
| PUT | `/api/perfil` | Edit own `username` (unicidad excluyendo propio id) + `descripcion` (≤200) (`verificarAcceso`) |
| POST | `/api/perfil/contrasena` | Change own password (exige actual + confirmación; revoca refresh tokens de otras sesiones) — ruta **sin tilde** (Express 5 no matchea literales no-ASCII) |
| PUT | `/api/perfil/foto` | Upload profile photo `{ imagen: dataURL }` → Cloudinary (`c_fill,w_400,h_400`) (`verificarAcceso`) |
| GET | `/api/usuarios/:id/perfil` | Other user profile + `yaSigo`; `404` si no existe o `correo_verificado=0` (`verificarAcceso`); `fotoPerfil` ya trae el default resuelto |
| POST | `/api/seguir/:id` | Follow/unfollow toggle; `400` self-follow; crea notificación `nuevo_seguidor` (`verificarAcceso`) |
| GET | `/api/perfil/seguidores` · `/api/perfil/siguiendo` | Follow lists (own, con `yoSigo`); devuelven `fotoPerfil` (renombrado desde `foto_perfil`), con default ya resuelto |
| GET | `/api/usuarios/:id/seguidores` · `/api/usuarios/:id/siguiendo` | Follow lists (ajeno, con `yoSigo`); devuelven `fotoPerfil` (renombrado desde `foto_perfil`), con default ya resuelto |

## 8. Frontend Routes (cliente/src/main.jsx)
| Path | Component | Description |
|------|-----------|-------------|
| `/` | `<Inicio/>` | Main app entry point (shows authenticated home or login/register; shows `PreferenciasFormulario` when `tienePreferencias === false`) |
| `/conversaciones` | `<Conversaciones/>` | Conversations page (placeholder) |
| `/crear` | `<Crear/>` | Create content page (placeholder) |
| `/wiki` | `<Wiki/>` | Wiki page (placeholder) |
| `/notificaciones` | `<Notificaciones/>` | Notifications page (component exists as toast/cookie-consent; page RQFN69-72 pending) |
| `/verificar-correo` | `<CuentaConfirmada/>` | Email verification result page (reads `?success=true\|error=code` query params) |
| `/perfil` | `<Perfil/>` | Own user profile (RQFN41-56): header grid con avatar 112px (anillo blanco `0 0 0 4px #fff`) + info (username `<h1>` 28px/600 con `overflow-wrap:anywhere`, descripción 15px/1.55 máx. 44ch) + rail de 4 stats alineadas sin offset (números **15px/600** `tabular-nums`, iconos 26px `--color-acento-fuerte`), gear ⚙ dentro de la tarjeta (`position:absolute; top/right:14px`; menú Editar/Cambiar contraseña/Cerrar sesión), pestañas `.perfil-tabs` solo visuales con ARIA tablist completa (`role="tablist\|tab\|tabpanel"`, `aria-selected`, `aria-controls`/`aria-labelledby`, `tabIndex` roving 0/-1, navegación ←/→/Inicio/Fin), estado vacío contextual por pestaña, seguimiento y listas |
| `/usuarios/:id` | `<Perfil/>` | Other user profile (`useParams`): view + follow/unfollow + lists |
| `/restablecer` | `<ReescribirContraseña/>` | Password reset page (reads `?token=X`) |

## 9. Frontend Components (Navigation Related)
| Component | Path | Status |
|-----------|------|--------|
| BarraLateral | `cliente/src/Componentes/elementos_pequeños/BarraLateral.jsx` | ✅ Complete (avatar con foto real `user.fotoPerfil`, ya no solo la inicial) |
| AppLayout | `cliente/src/layout/AppLayout.jsx` | ✅ Complete (usa `className="app-main"` + `AppLayout.css` nuevo) |
| AppLayout.css | `cliente/src/layout/AppLayout.css` | ✅ Complete (`.app-main` con `margin-left:72px` desktop / `0` + `padding-bottom:84px` móvil ≤768px) |
| AuthContext | `cliente/src/context/AuthContext.jsx` | ✅ Complete |
| AuthModalContext | `cliente/src/context/AuthModalContext.jsx` | ✅ Complete (unified login/register modals) |
| Inicio | `cliente/src/Componentes/Inicio/Inicio.jsx` | ✅ Basic (welcome toast + preferences gate) |
| InicioSesion | `cliente/src/Componentes/InicioDeSesion/InicioSesion.jsx` | ✅ Complete (RQFN4-10, RQFN6 show/hide, RQFN7 errors + resend action) |
| RecuperarContraseñaCorreo | `cliente/src/Componentes/InicioDeSesion/RecuperarContraseñaCorreo.jsx` | ✅ Connected to `/olvido-contrasena` |
| ReescribirContraseña | `cliente/src/Componentes/InicioDeSesion/ReescribirContraseña.jsx` | ✅ Connected to `/recuperar-contrasena` |
| PreferenciasFormulario | `cliente/src/Componentes/Registro/PreferenciasFormulario.jsx` | ✅ Complete (RQFN11-13) |
| Conversaciones | `cliente/src/Componentes/Conversaciones/Conversaciones.jsx` | ⚠️ Placeholder (empty) |
| Crear | `cliente/src/Componentes/Crear/Crear.jsx` | ⚠️ Placeholder (empty) |
| Wiki | `cliente/src/Componentes/WIKI/Wiki.jsx` | ⚠️ Placeholder (empty) |
| Notificaciones | `cliente/src/Componentes/elementos_pequeños/Notificaciones.jsx` | ✅ Created (toast + cookie consent RQFN1-2 + action buttons; page RQFN69-72 pending) |
| Perfil | `cliente/src/Componentes/Perfil/Perfil.jsx` | ✅ Complete (RQFN41-56): perfil propio (`/perfil`) y ajeno (`/usuarios/:id`), edición username/descripción, cambio de contraseña, foto Cloudinary (base64→JSON), seguir/dejar de seguir + listas, toasts de Becky. Header rediseñado: grid con avatar 112px (anillo blanco), username `<h1>`, rail de 4 stats alineadas sin offset (números **15px/600** `tabular-nums`), botón engranaje ⚙ dentro de la tarjeta + menú (Editar/Cambiar contraseña/Cerrar sesión), Seguir/Siguiendo inline junto al nombre, pestañas `.perfil-tabs` **solo visuales** con ARIA tablist + teclado y estado vacío contextual por pestaña, tokens `--color-texto-suave`/`--color-acento-fuerte` |

## 10. Key Functional Requirements (from DER)
**Authentication (RQFN1-RQFN13):**
- Cookie consent gif-toast "Becky te ha mandado un mensaje" (RQFN1-2): "Aceptar todo" persists in localStorage, "Rechazar todo" is session-only and re-prompts (NOT a modal)
- Auto-redirect if active session in cookies (RQFN3)
- Login with email/password, show/hide password (RQFN4-6)
- Error messages for invalid credentials (RQFN7)
- Link to register & forgot password (RQFN8-9)
- Redirect to home on login success (RQFN10)
- First-time user: culture/style preferences form (RQFN11-13)

**Registration (RQFN14-RQFN24):**
- Email, password, username (RQFN14)
- Physical characteristics form with images (RQFN17-18): eye shape (8), nose (12), lips (9), face (9), skin tone (6), skin type (4), age
- Email verification flow (RQFN19-24): send email → user clicks link → backend validates JWT → marks `correo_verificado=1` → redirects to frontend success page

**Password Recovery (RQFN25-RQFN34):**
- Email input → check if registered → send reset link → form with new password + confirm → redirect to login

**Navigation (RQFN35-RQFN39):**
- Navbar on all pages except video view
- Links: notifications, maquillajes, crear, comunidad, perfil
- Conditional links based on auth state
- Logo + slogan "B-unik: ¿qué tan única puedes ser?" + Wiki link

**Profile (RQFN41-RQFN56):**
- Config: username, password, profile photo, description
- Password change requires current password + double confirmation
- Stats: likes, posts, description, followers/following counts
- Follow/unfollow button, followers/following lists

**Notifications (RQFN69-RQFN72):**
- List with "Nada aquí" empty state
- Triggers: new content from followed, likes, low similarity (<40%), comment likes, new comments, new followers
- Low similarity notification: "Cambiar categoría" (video link) + "Wiki"

**Wiki (RQFN73-RQFN78):**
- Pages per culture/style with substyles
- Each substyle: name, image, description/origin/differences, "Utilizar" button (redirects to maquillajes with filters), resources, bibliography

**Maquillajes Page (RQFN79-RQFN98):**
- Video thumbnails: image, creator, likes, similarity %
- Infinite scroll (30 + 30)
- Sorting: similarity, likes, date, culture, substyle
- Filters: age, face parts, skin tone/type, similarity toggle
- Tabs: Todos, Tutorial, Delineados, Sombras, Lip Combo, Base, Video Maquillajes

**Video Detail (RQFN100-RQFN120):**
- Player controls, edit (desc, category, subcategory, tags, delete), comments, gallery, info panel
- Similarity voting (favor/contra with reasons), save/share stats
- Steps for tutorials: prep, base, contour, corrector, shadows, eyeliner, brows, lip combo

**Create Content (RQFN121-RQFN125):**
- Type: tutorial vs maquillaje, culture, substyle, video upload
- Optional steps (tutorials only)
- Physical characteristics tags
- Up to 5 images
- Sightengine moderation (<15% threshold)

**Conversations (RQFN126-RQFN141):**
- Filters: theme + subculture
- Infinite scroll (30 + 30)
- Miniatures: creator, title, preview (300 chars), comment count, likes
- Create: theme, substyle, title, text, optional images
- Conversation page: creator, title, text, images, likes, comments with replies
- Report system with 10 reasons, auto-delete at >45% reports after 20 views

## 11. External Services
- **Cloudinary**: Media storage/optimization/distribution (en uso: foto de perfil vía `helpers/cloudinary.js`)
- **Sightengine**: Auto-moderation (reject if any category >15%) |
- **Nodemailer + Gmail**: Verification & password reset emails

## 12. Important Notes
- Server uses **CommonJS** (`type: "commonjs"`), client uses **ESM** (`type: "module"`)
- Client calls API at `http://localhost:3000` (via Vite proxy `/api`)
- Nodemailer requires Gmail App Password (not regular password)
- JWT tokens stored in `tokens` table with 24h expiry (access) / 7d expiry (refresh)
- Passwords hashed with bcryptjs (10 rounds) **only on backend** (frontend sends plain password)
- Field name: `labios` (not `boca`) for lips characteristic - matches DB column `tipo_labios`
- Physical characteristics flow: 7-step wizard (ojos → nariz → labios → cara → colores → tipospiel → edad)
- `closeAll(origen)` distinguishes flows: 'preregistro' vs default (email verification)
- Cookie consent (RQFN1-2) is a toast card, NOT a modal: rendered inline by `Notificaciones.jsx` as `.notificacion.notif-cookie` with `/hi.gif`, title "Becky te ha mandado un mensaje" and buttons "Aceptar todo" / "Rechazar todo"; `createPortal` is not used for cookies (still used by auth modals in `BarraLateral.jsx`)
- Cookie consent persistence: `AuthContext` lazy-initializes `cookieConsent` from localStorage key `cookie-consent` (try/catch → null); `setCookieConsentFromChild` persists **ONLY** `{ accepted: true, timestamp }`; rejection `{ accepted: false }` remains session-only and is re-asked on next mount/session
- `Notificaciones.jsx` shows the cookie toast whenever `hasConsent = resolvedConsent?.accepted === true` is false and local `cookieToastDismissed` is false; rejecting in one mount (e.g. Inicio) does not prevent reappearing in another mount (login/register)
- **Única fuente del default de foto de perfil** = `servidor/helpers/imagenes.js` (`FOTO_PERFIL_DEFECTO` = icono B-Unick en Cloudinary). Toda nueva feature que muestre avatares debe usar `resolverFotoPerfil(url)` o `mapearUsuarioConFoto(fila)`; no replicar lógica de `placehold.co`/NULL en otra parte
- **Layout**: `AppLayout.jsx` renderiza `<main className="app-main">` y el CSS vive en `cliente/src/layout/AppLayout.css` (ya no hay `style` inline): `.app-main` con `margin-left: 72px` desktop y `margin-left: 0` + `padding-bottom: 84px` en móvil (≤768px) para no tapar el contenido con la bottom bar
- **BarraLateral y rutas de perfil**: en `/perfil` y `/usuarios/:id` el `activeIndex` se fuerza a `-1`, de modo que el blob activo desaparece (Perfil no es ítem de `NAV_ITEMS`); el botón de avatar/username autenticado lleva `aria-current="page"` + `barra-lateral-auth-btn--activo` en esas rutas
- El header de Perfil quedó con pestañas `.perfil-tabs` **solo visuales (sin navegación a rutas)**: Guardados/Vistas/Chats no enrutan a nada hasta que existan sus módulos. Llevan ARIA completa (`role="tablist|tab|tabpanel"`, `aria-selected`, `aria-controls`/`aria-labelledby`, `tabIndex` roving, navegación con ←/→/Inicio/Fin) y el contenido por pestaña es un estado vacío contextual (`EstadoVacio` con icono, título, texto y botón de acción solo en perfil propio)

## 13. Known Issues & Fixes Applied
| Issue | Fix |
|-------|-----|
| Double password hashing (frontend + backend) | Removed bcrypt from frontend, only backend hashes |
| Axios doesn't throw on 409 | Added `validateStatus: (status) => status < 400` to axios calls |
| Notificaciones not showing on success | Moved `<Notificaciones>` to persistent parent (`Registro.jsx`), pass `notificationsRef` down |
| Form chain doesn't close all on success | Added `closeAll` callback propagated from `Registro` → all form components |
| Field name mismatch `boca` vs `labios` | Renamed all `boca` → `labios` in frontend components |
| Typo in TiposPielFormulario validation | Fixed `datosUsuario.cara` → `datosUsuario.tipospiel` |
| DB table name typo | `caracterisiticas_fisicas` → `caracteristicas_fisicas` |
| DB column name typo | `formas_ojos` → `forma_ojos` |
| caracteristicasId undefined when record exists | Fixed to read from `caracteristicascheck[0].id` |
| MySQL user permissions | Created `bunyk_app@localhost` with proper grants |
| /validacionregistro didn't separate email/username checks | Two separate queries, returns `field` in error response |
| Preregistro success showed notification instead of modal | Created `PreregistroConfirmado` component, renders at Registro level, calls `closeAll` via useEffect on mount |
| Email verification flow missing | Added `GET /verificar-correo` route, validates JWT, updates `correo_verificado`, marks token used, redirects to frontend |
| closeAll didn't distinguish between flows | Modified to accept `origen` param ('preregistro' vs default), sets appropriate state |
| Email sending fails after DB commit (rollback ineffective) | Wrapped `transporter.sendMail` in inner try/catch after commit; logs error, returns success to frontend |
| Verification email link pointed to frontend instead of backend | Changed `verificationUrl` to use `BACKEND_URL`; backend validates token then redirects to frontend |
| Loading state missing during registration | Added `isLoading` state + spinner overlay in `EdadFormulario` during `/preregistro` request |
| Sidebar hover expands on mobile (touch devices) | Moved hover expansion to desktop-only media query (`min-width: 769px`); removed hover expansion from mobile media query |
| Sidebar buttons stretched full-width on desktop | Changed `align-items: left` → `align-items: center` on `.barra-lateral` (line 324); invalid `left` value was ignored by browsers |
| Sidebar nav items not centered on mobile | Changed `justify-content: space-around` → `justify-content: center` on `.barra-lateral` mobile media query (line 346) |
| Auth button icons not centered on mobile | Reordered CSS: moved mobile auth button styles (`.barra-lateral-auth .barra-lateral-auth-btn` at `@media max-width: 768px`) AFTER general auth button styles to ensure mobile-specific `width: 48px`, `justify-content: center` override desktop `width: 100%` |
| Sidebar overlaps modals (z-index issue) | Lowered sidebar z-index: `100` → `50` on `.barra-lateral`; raised modal backdrop z-index: added `z-index: 100` to `.fondo` in `iniciosesion.css` (lines 17, 314); added portal overlay z-index `100` in `BarraLateral.jsx` + `.auth-modal-overlay`/`.auth-modal-content` styles in `estilospequeños.css` |
| Cookie consent rendered as modal via `createPortal` | Converted to notification toast (`.notificacion.notif-cookie`) rendered inline in `Notificaciones.jsx`; removed `createPortal` for cookies and classes `.cookie-consent-overlay`, `.cookie-consent-modal`, `.cookie-consent-content`, `.cookie-consent-gif`, `.cookie-consent-text` |
| "Rechazar todo" used `--color-error` (undefined variable) | Changed to `background: var(--color-elementos)` on `.cookie-consent-btn--danger`; added `.notif-cookie { border-left: 4px solid var(--color-fondo3) }` and `.cookie-consent-buttons { justify-content: flex-start }` |
| Cookie consent not persisted across sessions | Acceptance persisted in localStorage key `cookie-consent` via `setCookieConsentFromChild` (only when `accepted === true`, lazy-initialized on read); rejection stays session-only and is re-prompted |
| Toast de error de login/recovery invisibile | `<Notificaciones>` en `InicioSesion.jsx` y `RecuperarContraseñaCorreo.jsx` se renderizaba **dentro** del portal del modal de auth (`.auth-modal-overlay` z-100), por lo que su `z-index:999` quedaba atrapado en ese stacking context y el toast nunca se veía → se portalizó a `document.body` vía `createPortal` (mismo patrón que el modal); además se agregó estado `cargando` + `disabled` al botón "Iniciar sesión" para evitar doble envío |
| Login no mostraba error de credenciales con usuario/email no válido | `<input type="email">` sin `noValidate` hace que el navegador bloquee el evento `submit` en silencio cuando el valor no es un email (p. ej. escribir el **username** `olatumamauwu` sin `@`), por lo que `handleSubmit` nunca corría ni se mostraba toast → se agregó `noValidate` a los formularios de `InicioSesion.jsx` y `RecuperarContraseñaCorreo.jsx` y validación manual (vacío + formato de correo en recuperación). El mensaje de error se muestra **solo** vía el toast de Becky (un mensaje inline `.error-credenciales` se probó y luego se eliminó al considerarse redundante) |
| Login no aceptaba nombre de usuario | `/api/login` consultaba solo `WHERE correo = ?` → ahora acepta **email o username** (`identificador`: `WHERE correo = ? OR nombre_usuario = ? LIMIT 1`); el frontenvía `{ identificador, password }`; `RecuperarContraseñaCorreo`/`reenviar-verificacion` siguen siendo email-only |
| 500 `Duplicate entry '...' for key 'token'` al loguear | Dos logins exitosos en el mismo segundo generan un JWT refresh idéntico (mismo `userId`/tipo e `iat`) y chocan con la `UNIQUE KEY token` de `tokens` → el insert del refresh en `/api/login` usa `INSERT IGNORE` (el token ya almacenado es equivalente) |
| Avatares legacy `placehold.co` en seed | Migración única `servidor/DB/migrar_avatar_default.js` normaliza a `NULL` las fotos `placehold.co`/vacías (10 filas); el icono por defecto lo sirve el backend vía `resolverFotoPerfil` (no se tocan fotos Cloudinary personalizadas) |
| Listas de seguidores devolvían `foto_perfil` crudo | Los 4 endpoints de listas (`/perfil/seguidores`, `/perfil/siguiendo`, `/usuarios/:id/seguidores`, `/usuarios/:id/siguiendo`) mapean cada fila con `mapearUsuarioConFoto` → el campo se llama `fotoPerfil` (renombrado desde `foto_perfil`) y ya viene el default resuelto; el frontend usa `u.fotoPerfil` |
| Avatar de BarraLateral mostraba solo la inicial | El avatar del bloque autenticado muestra `<img src={user.fotoPerfil}>` cuando existe (fallback a inicial); CSS `.barra-lateral-avatar img` (`width/height: 100%`, `object-fit: cover`) agregado en `estilospequeños.css` |
| Stats del header de Perfil con offset en columnas 3-4 | Se retiró el offset: `.perfil-stats` ahora es `repeat(4, minmax(88px, 1fr))` liso (sin `:nth-child`), con números **15px/600** `tabular-nums` e iconos 26px `--color-acento-fuerte` |
| Engranaje ⚙ quedaba fixed y blanco en desktop | Se eliminó el bloque `@media (min-width:769px)` que lo sacaba de la tarjeta; `.perfil-gear-wrap` es `position:absolute; top/right:14px` **dentro** de la tarjeta en todos los breakpoints (≤768px: 12px) |

## 14. Known Issues (Pending)
| Issue | Description |
|-------|-------------|
| Email sending in production | Requires valid Gmail App Password in `SMTP_PASS` for production deployment |
| Notificaciones page | `Notificaciones.jsx` exists (toast notifications + cookie consent) but there is still no dedicated page with persisted list, "Nada aquí" empty state and triggers (RQFN69-72). El trigger `nuevo_seguidor` ya lo escribe `POST /seguir` |
| Auth middleware coverage | `verificarAcceso` aplicado en auth (`/api/preferencias`) y en el router de usuarios; queda **en reserva** para los routers futuros (vídeos, likes, comentarios, conversaciones) |
| Main page components | Conversaciones, Crear y Wiki siguen como placeholders sin lógica ni integración (Perfil ya NO es placeholder: RQFN41-56 completo) |
| Perfil: pestañas solo visuales | Por decisión de diseño, las pestañas `.perfil-tabs` del header de Perfil (Guardados, Vistas, Chats) son solo visuales y no navegan a ningún lado hasta que existan sus módulos; llevan ARIA de tablist + navegación por teclado y el contenido por pestaña es un estado vacío contextual (`EstadoVacio`), con botón de acción solo en perfil propio |

## 15. Component Data Flow
```
Registro (owns notificationsRef, closeAll, showPreregistroConfirmado, showConfirmada)
  ├── PreregistroConfirmado (renders at Registro level, calls closeAll on mount)
  ├── CuentaConfirmada (renders at Registro level, email verification flow)
  └── InicioFormularioCF
        └── OjosFormulario
              └── NarizFormulario
                    └── CaraFormulario
                          └── ColoresFormulario
                                └── BocaFormulario (labios)
                                      └── TiposPielFormulario
                                            └── EdadFormulario (calls closeAll('preregistro') on success)
```

## 16. Navigation Bar (BarraLateral) Architecture
```
AppLayout (layout wrapper)
  ├── BarraLateral (sidebar navigation)
  │     ├── NAV_ITEMS: [inicio, conversaciones, crear, wiki, notificaciones, **perfil**]
  │     ├── ICON_MAP: SVG icons + logo.svg
  │     ├── Morphing blob (::before pseudo-element)
  │     ├── Keyboard navigation (ArrowLeft/Right, Home, End)
  │     ├── Active index tracking via location.pathname
  │     ├── Auth section (desktop only):
  │     │     ├── Loading state (skeleton)
  │     │     ├── Authenticated: avatar con foto real (`user.fotoPerfil`) + username (clickable → /perfil)
  │     │     └── Unauthenticated: "Iniciar sesión" + "Registrarse" buttons
  │     └── Mobile: bottom bar with safe-area-inset support
  │           └── Auth buttons visible when not authenticated
  └── <main> with margin-left: 72px (desktop) / full width (mobile)
        └── <Outlet /> (nested routes)
```

## 17. API Response Format
- `/api/validacionregistro`: Returns `{ error, field }` on 409 for field-specific frontend validation
- `/api/preregistro`: Returns `{ success, message, usuarioId }` on success
- `/api/login`: Returns `{ success, user }` + sets httpOnly cookies (`accessToken`, `refreshToken`); `user.fotoPerfil` ya trae el icono por defecto (`resolverFotoPerfil`)
- `/api/me`: Returns `{ user: { id, email, username, fotoPerfil, descripcion, correo_verificado, tienePreferencias } }` (fotoPerfil con default resuelto) or 401
- `/api/perfil`: Returns `{ success, user: { id, email, username, fotoPerfil, descripcion, fechaRegistro, correo_verificado, videos, likesRecibidos, seguidores, siguiendo } }` o 401
- `/api/usuarios/:id/perfil`: Returns `{ success, user: { id, username, fotoPerfil, descripcion, fechaRegistro, yaSigo, videos, likesRecibidos, seguidores, siguiendo } }` o 400/404
- Listas (`/perfil/seguidores`, `/perfil/siguiendo`, `/usuarios/:id/seguidores`, `/usuarios/:id/siguiendo`): Returns `{ success, usuarios: [{ id, nombre_usuario, fotoPerfil, descripcion, yoSigo }] }` — `fotoPerfil` renombrado y resuelto vía `mapearUsuarioConFoto`

## 18. Login Implementation Summary
- ✅ POST `/api/login` - Auth por **email o nombre de usuario** (`identificador`), bcrypt verification, email verification check; `INSERT IGNORE` del refresh token evita 500 `Duplicate entry` en logins seguidos
- ✅ JWT tokens: access (24h) + refresh (7d) stored in httpOnly cookies
- ✅ GET `/api/me` - Validates accessToken cookie, returns user data (`tienePreferencias`)
- ✅ Frontend: Centralized axios with `withCredentials: true`
- ✅ Frontend: Vite proxy with `credentials: true`
- ✅ CORS configured for credentials
- ✅ POST `/api/refresh` - Re-emits accessToken from refreshToken (validates DB tipo/expiry)
- ✅ POST `/api/logout` - Revokes device refresh token + clears cookies
- ✅ POST `/api/olvido-contrasena` + `/api/recuperar-contrasena` - Password reset flow
- ✅ POST `/api/culturas` + `/api/preferencias` - Culture preferences (RQFN11-13)
- ✅ Middleware `verificarAcceso` (`servidor/middleware/verificarToken.js`)
- ✅ RQFN3 sesión activa: `openModal` de `AuthModalContext` es no-op si hay sesión; BarraLateral muestra perfil en vez de login/registro
- ✅ Logout UI: botón "Cerrar sesión" en `Perfil.jsx` (dentro de la página Perfil completa RQFN41-56)
- ✅ Limpieza de BD: eventos MySQL `evt_eliminar_usuarios_no_verificados` + `evt_limpiar_tokens_expirados` (`SCHEMA_VERSION = 2`)
- ✅ Foto de perfil predeterminada: `/login`·`/me`·`/refresh`·`/perfil`·`/usuarios/:id/perfil` sirven `fotoPerfil` con el icono B-Unick ya resuelto vía `servidor/helpers/imagenes.js`; las 4 listas de seguidores/siguiendo usan `mapearUsuarioConFoto` (campo renombrado `fotoPerfil`)
- ⚠️ En reserva: `verificarAcceso` pendiente de aplicar a routers futuros (videos, likes, comentarios, conversaciones) que aún no existen

## 19. Roadmap Futuro y Contratos de Integración (post-Perfil)

> Esta sección define el orden de implementación posterior a la página Perfil y
> los contratos técnicos que el proyecto debe respetar para que la implementación
> actual no entre en conflicto con las futuras. La PRÓXIMA tarea en curso es la
> página **Notificaciones — página (RQFN69-72)**; este roadmap asume que Perfil ya se
> implementó con las decisiones fijadas (perfil ajeno en `/usuarios/:id` y
> `/api/usuarios/:id/perfil`, foto de perfil sin moderación Sightengine por ahora,
> `POST /seguir` crea notificaciones tipo `nuevo_seguidor`, cambio de contraseña
> revoca refresh tokens de otras sesiones, usuarios con `correo_verificado=0` → 404
> en perfiles ajenos y no seguibles).

### 19.1 Orden de implementación futuro (dependencias)

| # | Módulo | RQFN | Alcance y dependencias |
|---|--------|------|------------------------|
| 1 | Notificaciones — página | RQFN69-72 | Endpoint `GET /api/notificaciones`, lista persistida ordenada por `fecha_creacion`, estado "Nada aquí", marcar como leída. Solo existirá el trigger `nuevo_seguidor` (lo crea Perfil); los demás triggers se agregan cuando su feature origen se implemente. |
| 2 | Wiki | RQFN73-78 | Páginas de cultura/subestilo (tablas `culturas_estilos`/`subculturas_estilos`/`subcultura_recursos` ya sembradas), recursos y bibliografía. Define el contrato de "Utilizar": `GET /maquillajes?cultura=<id>&subcultura=<id>`. |
| 3 | Crear contenido | RQFN121-125 | Publica en `videos`, agrega el trigger `nuevo_contenido_seguido` (a seguidores) y conteos de vistas. Debe pasar contenido por Sightengine antes de publicar (umbral <15%). |
| 4 | Maquillajes | RQFN79-98 | Feed de miniaturas con scroll infinito (30+30), orden, filtros y pestañas. Depende del paso 3 para datos reales. |
| 5 | Video detalle | RQFN100-120 | Player, galería, `comentarios`, likes, voto de semejanza (`votos_video`/`razones_voto_contra`), guardados/compartidos, pasos de tutorial (`pasos_maquillaje`). |
| 6 | Wiring de notificaciones restantes | — | `nuevo_like`, `like_comentario`, `nuevo_comentario`, `semejanza_baja` (<40% con acciones "Cambiar categoría" y "Wiki"). |
| 7 | Conversaciones | RQFN126-141 | Lista + crear + detalle + comentarios con respuestas + sistema de denuncias (10 motivos, auto-baja >45% con ≥20 vistas). Módulo independiente. |
| 8 | Cierre | — | Pulido visual de BarraLateral, moderación retroactiva de foto de perfil (opcional), notificaciones producción/SMTP. |

### 19.2 Contratos de integración (NO romper)

- **Rutas en `cliente/src/main.jsx` con namespaces exclusivos**: `/perfil` (propio), `/usuarios/:id` (ajeno), `/maquillajes`, `/video/:id`, `/crear`, `/wiki/:culturaId(/:subculturaId)`, `/conversaciones`. Nada bajo `/usuarios` salvo perfiles.
- **`notificaciones.tipo` como enum estable (snake_case)**: `nuevo_seguidor`, `nuevo_contenido_seguido`, `nuevo_like`, `like_comentario`, `nuevo_comentario`, `semejanza_baja`. Usar siempre el mismo string en todos los módulos.
- **Un único helper de subida**: toda imagen vía `servidor/helpers/cloudinary.js` (base64→JSON, opciones de transformación por llamada, sin values hardcodeadas). Para **videos** NO usar base64 por JSON (peso): usar Cloudinary Upload Widget que devuelve URL y luego `POST /api/videos` con metadatos.
- **Única fuente de URLs de foto de perfil**: todo endpoint que exponga avatares devuelve `fotoPerfil` con el default ya resuelto vía `resolverFotoPerfil`/`mapearUsuarioConFoto` del helper `servidor/helpers/imagenes.js` (default = icono B-Unick); no hardcodear lógica de `placehold.co`/NULL en el frontend ni en otro helper.
- **`verificarAcceso` es el ÚNICO guard** (`servidor/middleware/verificarToken.js`): cada router futuro lo importa; no duplicar lógica de tokens.
- **Contadores desnormalizados (invariantes con transacciones)**: like ↔ `videos.cantidad_likes`; denuncia ↔ `conversaciones.cantidad_denuncias`/`cantidad_vistas`; voto ↔ `videos.votos_favor`/`votos_contra`. La página Perfil lee `videos.cantidad_likes`, por lo que depende de este invariante.
- **Token tipos constantes**: `verificacion_correo`, `refresh`, `recuperacion_contrasena` (access solo en cookie). La revocación de sesiones al cambiar contraseña (Perfil) no debe chocar con `evt_limpiar_tokens_expirados`.
- **`SCHEMA_VERSION`** (hoy = 2): solo sube al cambiar schema o seeds en `servidor/DB/bunyk_db.sql`. Si el módulo de notificaciones necesita columnas extra (p. ej. `data` JSON para `semejanza_baja`/enlaces), se agregan en su paso con bump de versión; ningún insert actual a `notificaciones` debe asumir columnas que no existen hoy.
- **Contrato wiki/maquillajes**: el "Utilizar" de Wiki (`/maquillajes?cultura=<id>&subcultura=<id>`) se define en el paso Wiki y Maquillajes solo lo consume.
- **Disciplina AGENTS.md**: actualizar tablas de endpoints/estado y este roadmap en cada iteración.

### 19.3 Nota de estado

La página **Perfil (RQFN41-56)** se implementó respetando los contratos del 19.2
(perfil ajeno en `/usuarios/:id` y `/api/usuarios/:id/perfil`, foto de perfil sin
moderación Sightengine por ahora, `POST /seguir` crea notificaciones tipo
`nuevo_seguidor`, cambio de contraseña revoca refresh tokens de otras sesiones,
usuarios con `correo_verificado=0` → 404 en perfiles ajenos y no seguibles).
Además, por **decisión de diseño del equipo**, el header de Perfil se
rediseñó (grid `auto minmax(0,1fr) auto`, avatar 112px con anillo blanco, stats
sin offset, engranaje ⚙ dentro de la tarjeta, pestañas `.perfil-tabs` con ARIA
tablist + teclado y estado vacío contextual por pestaña, botón Seguir/Siguiendo
inline); no se cambió ningún contrato de API ni de rutas.
Esta iteración también añadió soporte de layout dedicado (`AppLayout.css` con
`.app-main`), la ruta de perfil fija en la BarraLateral (`activeIndex` -1 para
ocultar el blob en `/perfil` y `/usuarios/:id`, `aria-current="page"` en el
avatar autenticado) y los tokens `--color-texto-suave`/`--color-acento-fuerte`.
Con Perfil completado, la siguiente tarea del roadmap es el **paso 1:
Notificaciones — página (RQFN69-72)**.

---
*Document updated: 2026-09-18*
*Added academic/professional project context (section 0) sourced from the CETI protocol and detailed proposal documents.*
*Navigation bar (BarraLateral) implementation documented - main page components status updated*
*Sidebar alignment and z-index fixes documented*
*Cookie consent (RQFN1-2) converted from modal to "Becky te ha mandado un mensaje" toast in Notificaciones.jsx; acceptance persisted in localStorage only (rejection re-prompts); fixed "Rechazar todo" from non-existent --color-error to --color-elementos*
*Auth block complete: unified auth modal (AuthModalContext), JWT/email helpers, verificarAcceso middleware, logout, reenvio de verificación, password reset, culture preferences (RQFN11-13), tienePreferencias in /me·/login·/refresh*
*Pendientes menores de autenticación completados: guard RQFN3 en openModal (no-op con sesión activa), botón "Cerrar sesión" en Perfil.jsx, eventos MySQL de limpieza (SCHEMA_VERSION=2, event_scheduler ON), bug de tienePreferencias resuelto (/preferencias devuelve user.tienePreferencias + refreshUser en Inicio), verificarAcceso documentado como en reserva para routers futuros*
*Agregado sección 19: Roadmap futuro y contratos de integración post-Perfil (orden de implementación de módulos restantes, enum de notificaciones.tipo, un solo helper Cloudinary, verificarAcceso único guard, invariantes de contadores, tipos de token y disciplina de SCHEMA_VERSION)*
*Perfil completo (RQFN41-56): routes-usuarios.js (GET/PUT /perfil, POST /perfil/contrasena sin tilde, PUT /perfil/foto, GET /usuarios/:id/perfil, POST /seguir/:id con notificación nuevo_seguidor, listas), Cloudinary por base64 sin multer, /me·/login·/refresh con fotoPerfil/descripcion, Perfil.jsx rediseñado (propio/ajeno, modales, seguir, toasts), Express 5 detectado (rutas sin no-ASCII)*
*Foto de perfil predeterminada (icono B-Unick): default centralizado en servidor/helpers/imagenes.js (FOTO_PERFIL_DEFECTO + resolverFotoPerfil/mapearUsuarioConFoto), /login·/refresh·/me·/perfil·/usuarios/:id/perfil·y las 4 listas sirven fotoPerfil ya resuelto, migración migrar_avatar_default.js ejecutada (seeds placehold.co → NULL), avatar de BarraLateral con foto real (user.fotoPerfil)*
*Header de Perfil rediseñado (corrección de diseño aprobada por la usuaria; revierte la decisión "solo layout"): header en grid `auto minmax(0,1fr) auto` con avatar 112px + anillo blanco, stats sin offset (4 columnas `minmax(88px,1fr)`, números 15px/600 `tabular-nums`), engranaje ⚙ dentro de la tarjeta (14px; se eliminó el bloque que lo hacía fixed y blanco en ≥769px), pestañas con `role="tablist"` + teclado (←/→ con envoltura, Inicio/Fin) alineadas a la tarjeta (`padding:0 20px` = `.perfil-page`), estado vacío contextual con icono/acción por pestaña, `:focus-visible` con token de acento, <480px etiquetas con patrón visually-hidden y `prefers-reduced-motion: reduce`; nuevos tokens `--color-texto-suave:#5E4380` y `--color-acento-fuerte:#6B4E8C` (texto ≥4.5:1, iconos ≥3:1, WCAG AA)*
*Iteración actual 2026-09-18: layout dedicado nuevo (`cliente/src/layout/AppLayout.css` con `.app-main`: `margin-left:72px` desktop / `0` + `padding-bottom:84px` móvil; `AppLayout.jsx` usa `className="app-main"` sin estilos inline) y ruta de perfil fija en la BarraLateral (`activeIndex = -1` en `/perfil` y `/usuarios/:id` oculta el blob; botón de avatar con `aria-current="page"` + clase `barra-lateral-auth-btn--activo` cuando `enPerfil`); notable: los números de stats del header quedaron en **15px/600 `tabular-nums`** (no 28px/700 del changelog anterior) y el engranaje ⚙ quedó fijo dentro de la tarjeta (`position:absolute; top/right:14px`)*