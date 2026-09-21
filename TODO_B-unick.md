# TODO — Proyecto B-unick

> Documento único que combina **requerimientos funcionales (RQFN, tomados del DER/documentación del proyecto)** con el **estado real de implementación**, verificado contra el código del ZIP subido (`servidor/`, `cliente/`), la base de datos (`bunyk_db.sql`) y la documentación previa (`AGENTS.md`, `LOGIN_IMPLEMENTATION.md`). Los checks (`[x]`) están marcados **solo** donde el código confirma que ya está implementado.
>
> Cada sección lista primero los **requerimientos** que le corresponden y después el **checklist** de tareas técnicas para cumplirlos.

---

## 1. Infraestructura y configuración base

*(No corresponde a un bloque RQFN específico — es la base técnica que soporta todo lo demás.)*

- [x] Monorepo `cliente/` (React + Vite) y `servidor/` (Express + MySQL)
- [x] Conexión a MySQL con pool (`servidor/DB/mysqldb.js`)
- [x] Esquema de base de datos completo (`bunyk_db.sql`) idempotente con 25 tablas (+ `schema_version` gestionada por `initDb.js`) y seeds de culturas/subculturas/usuarios de prueba
- [x] Middlewares base: `express.json`, `body-parser`, `cors` con credenciales, `cookie-parser`
- [x] Variables de entorno definidas (`.env`: DB, JWT_SECRET, SMTP, FRONTEND_URL, BACKEND_URL)
- [x] Proxy de Vite hacia backend con `credentials: true`
- [x] Cliente axios centralizado con `withCredentials: true` (`cliente/src/api/axios.js`)
- [x] Middleware de autenticación reutilizable (`servidor/middleware/verificarToken.js` — `verificarAcceso`); aplicado en `/api/preferencias` (el router de autenticación ya valida su propio accessToken)
- [x] Limpieza de usuarios no verificados y tokens expirados/usados vía **eventos programados de MySQL** (`evt_eliminar_usuarios_no_verificados` cada 24h, `evt_limpiar_tokens_expirados` cada 24h) declarados en `bunyk_db.sql` (requiere privilegio EVENT en `bunyk_app`, ya otorgado)
- [ ] Configuración de despliegue (Render/Railway) según lo descrito en la propuesta

---

## 2. Autenticación y sesión — RQFN1 a RQFN13

**Requerimientos:**
- **RQFN1-2**: Modal/aviso de consentimiento de cookies con gif.
- **RQFN3**: Auto-redirección si ya existe una sesión activa en cookies.
- **RQFN4-6**: Login con correo/contraseña; mostrar/ocultar contraseña.
- **RQFN7**: Mensajes de error específicos para credenciales inválidas.
- **RQFN8-9**: Enlaces a registro y a recuperación de contraseña.
- **RQFN10**: Redirección al inicio tras login exitoso.
- **RQFN11-13**: Usuario nuevo: formulario de preferencias de cultura/estilo.

**Checklist:**
- [x] `POST /api/validacionregistro` — valida disponibilidad de correo/usuario
- [x] `POST /api/preregistro` — crea usuario + características físicas + JWT + envío de correo de verificación
- [x] `GET /api/verificar-correo` — valida token, marca `correo_verificado`, redirige al frontend
- [x] `POST /api/login` — autentica, verifica bcrypt, exige correo verificado, setea cookies httpOnly (access 24h + refresh 7d)
- [x] `GET /api/me` — devuelve usuario autenticado a partir del `accessToken`
- [x] `POST /api/refresh` — reemite `accessToken` a partir del `refreshToken` (valida firma, tipo, existencia en BD y usuario)
- [x] Passwords con bcryptjs (10 rounds) solo en backend
- [x] Modal de confirmación de correo (`CuentaConfirmada.jsx`) y de preregistro (`PreregistroConfirmado.jsx`)
- [x] `AuthContext.jsx` con integración a `/api/me`
- [x] **RQFN1-2** — Aviso de consentimiento de cookies con gif (implementado como notificación/toast en `Notificaciones.jsx`, estilo "Becky te ha mandado un mensaje", con `/hi.gif` y botones "Aceptar todo"/"Rechazar todo"; `AuthContext` persiste solo la aceptación en `localStorage` bajo la clave `cookie-consent`, el rechazo se vuelve a preguntar; reaparece en cada montaje de login/registro vía estado local `cookieToastDismissed`)
- [x] `POST /api/logout` — revoca el refresh token del dispositivo actual (`usado=1`) y limpia cookies httpOnly
- [x] **RQFN6** — Mostrar/ocultar contraseña en login (botón de ojo en `InicioSesion.jsx`)
- [x] **RQFN7** — Mensajes de error específicos para credenciales inválidas en UI (usa `error.response.data.error`; 403 → notificación con botón "Reenviar correo" vía `/reenviar-verificacion`)
- [x] **RQFN11-13** — Formulario de preferencias de cultura/estilo (`PreferenciasFormulario.jsx`) con `GET /api/culturas` + `POST /api/preferencias`; se muestra tras el login cuando `tienePreferencias === false` (campo en `/me`, `/login` y `/refresh`); se guardan en `usuario_preferencias`
- [x] **RQFN25-34** — Recuperación de contraseña completa:
  - [x] `POST /api/olvido-contrasena` (respuesta neutral, envía link `FRONTEND_URL/restablecer?token=X` con token tipo `restablecer` de 1h)
  - [x] `POST /api/recuperar-contrasena` (nueva contraseña + confirmación; valida token, actualiza `contrasena_hash` en transacción, marca token usado)
  - [x] Componentes `RecuperarContraseñaCorreo.jsx` y `ReescribirContraseña.jsx` conectados vía `api` a esos endpoints; ruta `/restablecer` registrada en `main.jsx`
- [x] `POST /api/reenviar-verificacion` — reenvía el enlace de verificación (respuesta neutral; botón "Reenviar correo" en la notificación de 403)
- [x] Beakup de secretos JWT por familia: `access`→`JWT_SECRET`, `refresh`→`JWT_REFRESH_SECRET`, `verificacion_correo`/`restablecer`→`JWT_EMAIL_SECRET` (`servidor/helpers/jwt.js` + `servidor/middleware/verificarToken.js`)
- [x] **RQFN3** — Si ya existe una sesión activa, en lugar de mostrar los botones de login/registro se muestra el acceso al perfil (`BarraLateral.jsx`); adicionalmente `openModal` de `AuthModalContext` es no-op si hay sesión activa
- [x] **RQFN35** — Logout UI en el perfil (`Perfil.jsx` tiene botón "Cerrar sesión" que llama `AuthContext.logout()` y navega a `/`)
- [ ] Middleware de rutas protegidas (usar en creación de contenido, likes, seguir, etc.) — `verificarAcceso` ya existe y funciona (aplicado en `/api/preferencias`); queda **en reserva** para los futuros routers (crear/likes/seguir), que aún no existen

---

## 3. Registro y características físicas — RQFN14, RQFN17-24

**Requerimientos:**
- **RQFN14**: Registro con correo, contraseña y nombre de usuario.
- **RQFN17-18**: Formulario de características físicas con imágenes — forma de ojos (8 opciones), nariz (12), labios (9), rostro (9), tono de piel (6), tipo de piel (4), edad.
- **RQFN19-24**: Flujo de verificación de correo — se envía correo → el usuario da clic en el enlace → el backend valida el JWT → marca `correo_verificado=1` → redirige a la página de éxito del frontend.

**Checklist:**
- [x] Formulario multi-paso (7 pasos): ojos → nariz → labios → cara → colores → tipos de piel → edad
- [x] Componentes de formulario para cada característica (`OjosFormulario`, `NarizFormulario`, `BocaFormulario`, `CaraFormulario`, `ColoresFormulario`, `TiposPielFormulario`, `EdadFormulario`)
- [x] Assets de imágenes para cada opción (ojos, nariz, boca, cara, color de piel, tipo de piel)
- [x] Spinner de carga durante el envío final (`EdadFormulario`)
- [x] Persistencia de características físicas en tabla `caracteristicas_fisicas`
- [x] Flujo de verificación de correo (RQFN19-24) completo end-to-end
- [ ] **RQFN17-18** — Validar que las cantidades de opciones coincidan exactamente con el requerimiento (ojos: 8, nariz: 12, labios: 9, cara: 9, tono de piel: 6, tipo de piel: 4) — revisar conteo real de imágenes por categoría
- [ ] Edición de características físicas desde el perfil (fuera del registro inicial)

---

## 4. Navegación — RQFN35 a RQFN39

**Requerimientos:**
- **RQFN35**: Barra de navegación visible en todas las páginas excepto en la vista de un video individual.
- **RQFN36**: Enlaces a notificaciones, maquillajes, crear, comunidad (conversaciones) y perfil.
- **RQFN37-38**: Enlaces condicionales según el estado de autenticación.
- **RQFN39**: Logo + slogan "B-unik: ¿qué tan única puedes ser?" + enlace a Wiki.

**Checklist:**
- [x] `BarraLateral.jsx` — sidebar completo con 6 ítems (Inicio, Conversaciones, Crear, Wiki, Notificaciones, Perfil)
- [x] Versión responsive: sidebar desktop (72–200px) y barra inferior en móvil
- [x] Animación de "blob" que sigue al ítem activo
- [x] Navegación por teclado (flechas, Home, End)
- [x] Resaltado de ruta activa
- [x] Soporte `prefers-reduced-motion`
- [x] Oculta en `/verificar-correo`
- [x] **RQFN37-38** — Sección de auth condicional (perfil si hay sesión, botones login/registro si no)
- [x] Modales de login/registro con portal, cierre por ESC/backdrop, cambio de modo
- [ ] Pulir transición del blob entre ítems
- [ ] Pulir estados hover/focus y espaciado de iconos en barra móvil
- [ ] **RQFN39** — Slogan "B-unik: ¿qué tan única puedes ser?" visible en la navegación (**verificar** si ya está o falta agregarlo)
- [ ] **RQFN35** — Ocultar navbar también en la vista de video individual (**pendiente**, aún no existe esa vista)

---

## 5. Perfil de usuario — RQFN41 a RQFN56

**Requerimientos:**
- **RQFN41-...**: Configuración de cuenta — nombre de usuario, contraseña, foto de perfil, descripción.
- Cambio de contraseña requiere contraseña actual + doble confirmación de la nueva.
- Estadísticas: likes totales, publicaciones, descripción, contadores de seguidores/seguidos.
- Botón de seguir/dejar de seguir, listas de seguidores y seguidos.

**Checklist:**
- [x] Ruta `/perfil` registrada y componente montado
- [x] Vista de perfil funcional: nombre de usuario, foto, descripción (propio `/perfil` y ajeno `/usuarios/:id`)
- [x] Configuración de cuenta: cambiar username, foto de perfil, descripción (modales Editar perfil / Cambiar contraseña / Cerrar sesión en la página Perfil)
- [x] Cambio de contraseña (requiere contraseña actual + doble confirmación; revoca refresh tokens de otras sesiones)
- [x] Estadísticas: likes totales, publicaciones, seguidores/seguidos
- [x] Botón seguir/dejar de seguir (con notificación `nuevo_seguidor`)
- [x] Listas de seguidores y seguidos (propias y ajenas, en modales)
- [x] Endpoints backend para todo lo anterior (`routes-usuarios.js`: GET/PUT `/perfil`, `POST /perfil/contrasena`, `PUT /perfil/foto`, `GET /usuarios/:id/perfil`, `POST /seguir/:id`, listas)

---

## 6. Notificaciones — RQFN69 a RQFN72

**Requerimientos:**
- **RQFN69**: Lista de notificaciones con estado vacío "Nada aquí".
- **RQFN70-71**: Disparadores — contenido nuevo de seguidos, likes, likes en comentarios, comentarios nuevos, nuevos seguidores.
- **RQFN72**: Notificación especial de baja similitud (<40%) con acciones "Cambiar categoría" (enlace al video) y "Wiki".

**Checklist:**
- [x] Componente `Notificaciones.jsx` creado (sistema interno con `useImperativeHandle`, tarjetas con título/mensaje/gif)
- [x] Integrado actualmente para mostrar confirmaciones del flujo de registro y el aviso de cookies
- [x] **RQFN69** — Página de notificaciones (**drawer superpuesto** `NotificacionesPagina.jsx`, no ruta standalone): lista persistente, estado vacío "Nada aquí" y badge de no leídas
- [x] **RQFN70-71** — Backend lista/marca leídas (`GET /api/notificaciones` + `POST /api/notificaciones/leidas`); trigger activo: `nuevo_seguidor` (lo escribe `POST /seguir`); los triggers restantes (`nuevo_contenido_seguido`, `nuevo_like`, `like_comentario`, `nuevo_comentario`) se escriben cuando su feature origen exista
- [x] **RQFN72** — Notificación de baja similitud renderizada con acciones "Cambiar categoría" y "Wiki" (se genera cuando exista el cálculo de semejanza)
- [x] Endpoint para listar/marcar como leídas notificaciones (`routerNotificaciones` tras `verificarAcceso`)

---

## 7. Wiki — RQFN73 a RQFN78

**Requerimientos:**
- Páginas por cultura/estilo, con subestilos.
- Cada subestilo: nombre, imagen, descripción/origen/diferencias, bibliografía.
- Botón "Utilizar" que redirige a Maquillajes con los filtros de ese estilo aplicados.
- Recursos adicionales por subestilo.

**Checklist:**
- [x] Ruta `/wiki`, `/wiki/:culturaId` y `/wiki/:culturaId/:subculturaId` registradas y componente único montado
- [x] Tablas `culturas_estilos`, `subculturas_estilos`, `subcultura_recursos` ya en el esquema (se conservan por sus FK: `usuario_preferencias`, `videos` y por `GET /api/culturas` para `PreferenciasFormulario`)
- [x] Vista funcional por cultura/estilo (**contenido desde JSON local**, no desde DB, por decisión del equipo): `cliente/src/Componentes/WIKI/datos/wiki.json` con **8 culturas y 75 subestilos redactados** (template editorial: Sección 1-6 por cultura + `ficha` de 5 campos por subestilo; `SCHEMA_VERSION = 6` con re-seed de `subculturas_estilos` a 75 filas; substyle 76 «Otros TikTok» fusionado en el 75 «Variados TikTok» el 2026-09-20)
- [x] **Apartados reescritos a conteo variable fiel a cada guía MD (2026-09-20)**: se dejó de forzar la estructura uniforme 4/5/3 — Gótico S1 de **2** apartados y S3 de **3** pasos, Emo S4 de **1**, Punk/Lolita S4 de **4** (recuperan "Tipo y Forma de Nariz"/"Nariz y Labios"), TikTok S1 de **3** (sin "Evolución"); nuevo campo opcional **`items: [{titulo, texto}]`** en apartados/pasos donde la guía conserva sub-listas reales → renderizados como `<ul class="wiki-sub-lista">` (`ListaItems` en `Wiki.jsx` + `.wiki-sub-lista` en `wiki.css`). Cultura 5 Visual Kei (redactada a mano, sin guía MD) se mantiene 4/5/3 sin items
- [x] Página por subestilo: nombre, imagen real (URL integradas; el sello de iniciales queda como respaldo), `ficha` (origen/filosofía/vestuario/maquillaje/morfología), bibliografía y recursos
- [x] Botón "Utilizar" que redirige a `Maquillajes` con los filtros de ese estilo aplicados (`/maquillajes?cultura=X&subcultura=Y`)
- [x] **Rediseño portal tipo Fandom (2026-09-19)**: `.wiki-bar` (pestañas por cultura teñidas con `--wiki-color-tinta`), panel de artículo + riel lateral (≥1200px), infobox flotante con fichas `dl`, TOC ("Contenido", ≥3 apartados), h2 con slug, categorías al pie, navbox entre páginas hermanas y grid de tarjetas miembro; `tonoAccesible(hex)` mezcla el color de cultura con #2f2638 hasta contraste AA 4.5:1
- [x] **Nota**: los endpoints backend por subcultura ya no hacen falta (el contenido vive en `wiki.json`); `GET /api/culturas` sigue existiendo para el formulario de preferencias

---

## 8. Maquillajes (feed principal) — RQFN79 a RQFN98

**Requerimientos:**
- Miniaturas de video: imagen, creador, likes, % de similitud con el perfil del usuario.
- Scroll infinito (cargas de 30 en 30).
- Ordenamiento por similitud, likes, fecha, cultura o subestilo.
- Filtros por edad, partes de la cara, tono/tipo de piel, y un toggle para activar/desactivar el filtrado por similitud.
- Tabs de categoría: Todos, Tutorial, Delineados, Sombras, Lip Combo, Base, Video Maquillajes.

**Checklist:**
- [x] Ruta `/maquillajes` y componente placeholder montado (lee `cultura`/`subcultura` de query params y muestra el estado vacío preparado para el feed real)
- [ ] Página/listado de videos con miniatura, imagen, creador, likes, % de similitud (**paso 3 del roadmap**) — el feed arrancará con los datos que existan en BD hasta que Crear contenido publique videos
- [ ] Scroll infinito (cargas de 30 en 30)
- [ ] Ordenamiento: similitud, likes, fecha, cultura, subestilo
- [ ] Filtros: edad, partes de la cara, tono/tipo de piel, toggle de similitud
- [ ] Tabs de categoría: Todos, Tutorial, Delineados, Sombras, Lip Combo, Base, Video Maquillajes
- [ ] Endpoints backend de listado/filtrado/ordenamiento de `videos`
- [ ] Cálculo del porcentaje de similitud con el perfil del usuario

---

## 9. Detalle de video — RQFN100 a RQFN120

**Requerimientos:**
- Reproductor con controles.
- Edición del video (descripción, categoría, subcategoría, tags, eliminar) — solo el autor.
- Comentarios (crear, listar, dar like).
- Galería de imágenes asociadas.
- Panel de información del video.
- Votación de similitud (a favor/en contra, con motivos en caso de "en contra").
- Guardar y compartir el video, con sus contadores.
- Registro de vistas.
- Pasos de tutorial (preparación, base, contorno, corrector, sombras, delineado, cejas, lip combo) — solo para contenido tipo tutorial.

**Checklist:**
- [ ] Reproductor con controles
- [ ] Edición del video (descripción, categoría, subcategoría, tags, eliminar) — solo autor
- [ ] Comentarios (crear, listar, likes, tabla `comentarios`/`likes_comentario`)
- [ ] Galería de imágenes asociadas (`imagenes_video`)
- [ ] Panel de información
- [ ] Votación de similitud (a favor/en contra con motivos, tablas `votos_video`, `voto_razones`, `razones_voto_contra`)
- [ ] Guardar video (`videos_guardados`) y compartir, con contadores
- [ ] Registro de vistas (`videos_vistos`)
- [ ] Pasos de tutorial usando tabla `pasos_maquillaje`

---

## 10. Crear contenido — RQFN121 a RQFN125

**Requerimientos:**
- Selección de tipo de contenido: tutorial vs. maquillaje.
- Selección de cultura y subestilo.
- Subida de video.
- Pasos opcionales (solo para tutoriales).
- Etiquetado con las características físicas objetivo del contenido.
- Subida de hasta 5 imágenes.
- Moderación automática con Sightengine (rechazar si alguna categoría supera 15%).

**Checklist:**
- [x] Ruta `/crear` y componente montado
- [ ] Formulario funcional (**pendiente**, solo placeholder `<div>Crear</div>`)
- [ ] Selección tipo: tutorial vs. maquillaje
- [ ] Selección de cultura y subestilo
- [ ] Subida de video
- [ ] Pasos opcionales (solo tutoriales)
- [ ] Etiquetado con características físicas objetivo
- [ ] Subida de hasta 5 imágenes
- [ ] Integración con Cloudinary para almacenamiento/optimización de medios
- [ ] Integración con Sightengine para moderación automática (rechazar si alguna categoría >15%)
- [ ] Endpoint backend de creación de publicación con validaciones

---

## 11. Conversaciones (foro/comunidad) — RQFN126 a RQFN141

**Requerimientos:**
- Filtros por tema + subcultura.
- Scroll infinito (30 + 30).
- Miniaturas: creador, título, preview de texto (300 caracteres), conteo de comentarios y likes.
- Formulario de creación: tema, subestilo, título, texto, imágenes opcionales.
- Vista de conversación individual: texto completo, imágenes, likes, comentarios con respuestas anidadas.
- Sistema de reportes con 10 motivos y auto-eliminación (más de 45% de reportes tras 20 vistas).

**Checklist:**
- [x] Ruta `/conversaciones` y componente montado
- [x] Tablas de esquema: `conversaciones`, `imagenes_conversacion`, `likes_conversacion`, `denuncias_conversacion`, `denuncia_motivos`
- [ ] Vista funcional (**pendiente**, solo placeholder `<div>Conversaciones</div>`)
- [ ] Filtros por tema + subcultura
- [ ] Scroll infinito (30 + 30)
- [ ] Miniaturas: creador, título, preview de texto (300 caracteres), conteo de comentarios y likes
- [ ] Formulario de creación: tema, subestilo, título, texto, imágenes opcionales
- [ ] Vista de conversación individual: texto completo, imágenes, likes, comentarios con respuestas anidadas
- [ ] Sistema de reportes con 10 motivos y auto-eliminación (>45% de reportes tras 20 vistas)
- [ ] Endpoints backend para todo el módulo

---

## 12. Servicios externos

*(Soporte transversal a los requerimientos de Crear contenido y Autenticación.)*

- [x] Integración Cloudinary (almacenamiento y distribución de medios) — implementado para la foto de perfil (`helpers/cloudinary.js`, base64→JSON, `c_fill,w_400,h_400`)
- [ ] Integración Sightengine (moderación automática de imágenes/video) — pendiente hasta Crear contenido; la foto de perfil no pasa por moderación por ahora
- [x] Integración Nodemailer + Gmail para correos de verificación (funcional en `/preregistro`)
- [x] Nodemailer para correo de recuperación de contraseña (`/olvido-contrasena` → `/recuperar-contrasena`)

---

## 13. Sistema de recomendación

*(Es el diferenciador del producto: relaciona los requerimientos de Registro (características físicas) con Maquillajes y Notificaciones.)*

- [ ] Cálculo de compatibilidad entre características físicas del usuario y etiquetas del contenido
- [ ] Toggle para activar/desactivar el filtrado por similitud
- [ ] Priorización de contenido recomendado en el feed de Maquillajes
- [ ] Notificación de baja similitud (ver sección 6, RQFN72)

---

## 14. Calidad, pruebas y despliegue

- [ ] Pruebas unitarias/backend (no se encontró carpeta de tests)
- [ ] Pruebas end-to-end del flujo de registro/login
- [ ] Linting configurado en cliente (`eslint.config.js` existe) — verificar que corra sin errores
- [ ] Documentación de API (Swagger/Postman) para los endpoints existentes y futuros
- [ ] Despliegue en Render (backend) y Railway o similar, según la propuesta del proyecto

---

## Resumen rápido

| Módulo | RQFN | Estado |
|---|---|---|
| Registro + verificación de correo | RQFN14, RQFN17-24 | ✅ Completo (falta validar conteo exacto de opciones) |
| Login + refresh + logout + reenvío verificación | RQFN1-10 | ✅ Completo (incluye auto-redirección RQFN3; logout UI en Perfil) |
| Preferencias de cultura/estilo (usuario nuevo) | RQFN11-13 | ✅ Completo (`/culturas`, `/preferencias`, `PreferenciasFormulario.jsx`, `tienePreferencias`) |
| Recuperación de contraseña | RQFN25-34 | ✅ Completo (`/olvido-contrasena`, `/recuperar-contrasena`, ruta `/restablecer`) |
| Navegación (sidebar) | RQFN35-39 | ✅ Completo (falta slogan en la barra — hoy vive solo en Inicio — y ocultar en vista de video) |
| Perfil | RQFN41-56 | ✅ Completo (`routes-usuarios.js`, header rediseñado, seguir + listas, foto Cloudinary) |
| Notificaciones | RQFN69-72 | ✅ Completo (drawer superpuesto + backend; trigger `nuevo_seguidor` activo, resto pendiente de sus features) |
| Wiki | RQFN73-78 | ✅ Contenidos y componente único (paso 2 del roadmap): `wiki.json` (**8 culturas/75 subestilos** redactados al template editorial: Sección 1-6 + `ficha` de 5 campos, `imagen` con fotos reales en los 83 items (8 culturas + 75 subestilos) desde `wiki/IMAGENES_PENDIENTES.md`; el sello de iniciales queda como respaldo; substyle «Otros TikTok» fusionado en «Variados TikTok») + `Wiki.jsx` (tres vistas, kicker `Numero`, Sección 1-6 en cultura / ficha en subestilo) + rutas anidadas + "Utilizar" → `/maquillajes` |
| Maquillajes (feed) | RQFN79-98 | ⚠️ Placeholder `/maquillajes` listo (lee query params); feed real en paso 3 del roadmap |
| Detalle de video | RQFN100-120 | ❌ No implementado |
| Crear contenido | RQFN121-125 | ❌ Placeholder |
| Conversaciones | RQFN126-141 | ❌ Placeholder |
| Cloudinary / Sightengine | (transversal) | ⚠️ Cloudinary en foto de perfil; Sightengine pendiente (Crear contenido) |
| Sistema de recomendación | (transversal) | ❌ No implementado |

*Basado en el código del ZIP `B-unick.zip` tal como fue subido, y en la sección "Key Functional Requirements (from DER)" de `AGENTS.md`. Última verificación: revisión directa de `servidor/Routes/routes-autenticacion.js`, `servidor/helpers/{jwt,correo}.js`, `servidor/middleware/verificarToken.js`, componentes en `cliente/src/Componentes/`, y `servidor/DB/bunyk_db.sql`.*