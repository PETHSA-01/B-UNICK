# Changelog

Todos los cambios notables del proyecto B-unick se documentan en este archivo.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y el
versionado es [SemVer](https://semver.org/lang/es/).

## [1.0.0] — 2026-09-18

Primer release versionado del proyecto. Empaqueta la implementación completa
de la página Perfil (RQFN41-56) y todo el historial previo de desarrollo.

### Añadido — Página Perfil completa (RQFN41-56)

- Nuevo router `servidor/Routes/routes-usuarios.js` con `GET/PUT /perfil`,
  `POST /perfil/contrasena`, `PUT /perfil/foto`, `GET /usuarios/:id/perfil`,
  `POST /seguir/:id` (toggle con notificación `nuevo_seguidor`) y las 4 listas
  de seguidores/siguiendo (propias y ajenas), todo protegido por
  `verificarAcceso`.
- Foto de perfil: subida por base64 (dataURL) → Cloudinary (`c_fill,w_400,h_400`)
  sin multer; default = icono B-Unick centralizado en
  `servidor/helpers/imagenes.js` (`FOTO_PERFIL_DEFECTO`, `resolverFotoPerfil`,
  `mapearUsuarioConFoto`) y resuelto en `/login`, `/refresh`, `/me`, `/perfil`,
  `/usuarios/:id/perfil` y las 4 listas.
- Cambio de contraseña con verificación de la actual (bcrypt), doble
  confirmación y revocación de refresh tokens de otras sesiones.
- `Perfil.jsx` rediseñado: header en grid `auto minmax(0,1fr) auto` con avatar
  112px (anillo blanco), username `<h1>` 28px/600 con `overflow-wrap:anywhere`,
  rail de 4 stats clicables sin offset (números 15px/600 `tabular-nums`),
  engranaje ⚙ dentro de la tarjeta con menú (Editar perfil / Cambiar
  contraseña / Cerrar sesión), botón Seguir/Siguiendo inline (optimista),
  modales de edición y contraseña, toasts de Becky portalizados.
- Pestañas `.perfil-tabs` **solo visuales** (decisión de diseño del equipo)
  con ARIA tablist completa (`role="tablist|tab|tabpanel"`, `aria-selected`,
  `aria-controls`/`aria-labelledby`, `tabIndex` roving) y navegación por
  teclado (←/→ con envoltura, Inicio, Fin); estado vacío contextual por
  pestaña (`EstadoVacio`), con botón de acción solo en perfil propio.
- Perfil ajeno en `/usuarios/:id`: `404` si el usuario no existe o no está
  verificado; seguimiento y listas con `yoSigo`.

### Añadido — Accesibilidad WCAG AA

- Tokens nuevos en `estilos.css`: `--color-texto-suave: #5E4380` (5.30:1 –
  8.11:1) y `--color-acento-fuerte: #6B4E8C` (6.05:1 – 6.79:1).
- `:focus-visible` con token de acento en todo el módulo Perfil y pestañas.
- `@media (prefers-reduced-motion: reduce)` anula transiciones.
- ≤480px: etiquetas de pestaña con patrón `visually-hidden` (no `display:none`).

### Añadido — Layout dedicado y BarraLateral

- Nuevo `cliente/src/layout/AppLayout.css` con `.app-main`: `margin-left: 72px`
  desktop y `margin-left: 0` + `padding-bottom: 84px` en móvil (bottom bar);
  `AppLayout.jsx` usa `className="app-main"` (sin estilos inline).
- Ruta de perfil fija en la BarraLateral: `activeIndex = -1` en `/perfil` y
  `/usuarios/:id` (el blob del ítem activo se oculta); avatar con foto real
  (`user.fotoPerfil`), `aria-current="page"` y clase
  `barra-lateral-auth-btn--activo` en rutas de perfil.

### Añadido — Backend de autenticación y usuarios

- Nuevo router `servidor/Routes/routes-autenticacion.js` (login por email o
  username, refresh, logout, olvido/recuperar contraseña, validacionregistro,
  preregistro, verificar-correo, reenviar-verificacion, culturas,
  preferencias, me) que reemplaza a `routes-registro-iniciosesion.js`
  (eliminado).
- Middleware `servidor/middleware/verificarToken.js` (`verificarAcceso`).
- Helpers: `servidor/helpers/jwt.js`, `servidor/helpers/correo.js`,
  `servidor/helpers/cloudinary.js`, `servidor/helpers/imagenes.js`.
- Migración `servidor/DB/migrar_avatar_default.js` (seeds `placehold.co` → NULL)
  e `initDb.js`.
- `INSERT IGNORE` del refresh token (evita 500 `Duplicate entry` en logins
  seguidos).

### Añadido — Frontend de autenticación

- `AuthContext.jsx` (con `/api/me`, `tienePreferencias`, consentimiento de
  cookies en localStorage) y `AuthModalContext.jsx` (modales de
  login/registro unificados).
- `PreferenciasFormulario.jsx` (RQFN11-13, primer acceso).
- `InicioSesion.jsx` con `noValidate` + validación manual (acepta username),
  spinner de carga y toasts portalizados a `document.body`.
- Login/registro unificados, edición de perfil, cambio de contraseña y foto.

### Corregido (durante el desarrollo previo)

- Doble hash de contraseña (frontend+backend) → solo backend.
- `boca` → `labios` (nombre de columna en BD).
- Typos de BD (`caracterisiticas_fisicas`, `formas_ojos`).
- Axios con `validateStatus: (status) => status < 400` (409 no lanzaba).
- Cookie consent convertido de modal a toast "Becky te ha mandado un mensaje".
- Últimos toasts de error invisibles (z-index) → portalizados a `document.body`.
- Input `type=email` sin `noValidate` bloqueaba login con username.
- Zoom issues de la BarraLateral (z-index 100→50, hover solo desktop).

### Conocido

- Lint del frontend: **51 errores baseline preexistentes** de ESLint
  (no corregidos en esta iteración; se documentan, no se arreglan).
- Página de Notificaciones (RQFN69-72) pendiente; solo existe el trigger
  `nuevo_seguidor` (lo crea `POST /seguir`).
- Conversaciones, Crear y Wiki siguen como placeholders sin lógica.
- Las pestañas Guardados/Vistas/Chats del Perfil son solo visuales.

## Historial previo (resumen, sin versionar)

- **Registro y características físicas**: formulario de 7 pasos (ojos → nariz
  → labios → cara → colores → tipo de piel → edad) con imágenes y validación
  escalonada; backend con tabla `caracteristicas_fisicas`.
- **Verificación de correo**: flujo de envío de correo (Nodemailer + Gmail),
  JWT de verificación, `GET /verificar-correo` marca `correo_verificado=1` y
  redirige al frontend; modales `PreregistroConfirmado` y `CuentaConfirmada`.
- **Autenticación JWT**: login/refresh/logout con tokens en BD y cookies
  httpOnly; `GET /api/me`; recuperación de contraseña por correo; eventos MySQL
  de limpieza de usuarios no verificados y tokens expirados (`SCHEMA_VERSION=2`).
- **Barra de navegación**: `BarraLateral.jsx` con blob morphing animado, 6
  ítems, SVG propios, navegación por teclado, sección de auth condicional y
  bottom bar móvil con `safe-area-inset`.
- **Consentimiento de cookies (RQFN1-2)**: toast en `Notificaciones.jsx`
  ("Becky te ha mandado un mensaje") con persistencia de aceptación en
  localStorage.

[1.0.0]: https://github.com/PETHSA-01/B-UNICK/releases/tag/v1.0.0
