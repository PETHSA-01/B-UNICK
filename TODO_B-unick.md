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
- [x] Variables de entorno definidas (`.env`: DB, JWT_SECRET, JWT_REFRESH_SECRET, JWT_EMAIL_SECRET, GMAIL_CLIENT_ID/SECRET/REFRESH_TOKEN, CLOUDINARY_*, SIGHTENGINE_*, FRONTEND_URL, BACKEND_URL)
- [x] Proxy de Vite hacia backend con `credentials: true`
- [x] Cliente axios centralizado con `withCredentials: true` (`cliente/src/api/axios.js`)
- [x] Middleware de autenticación reutilizable (`servidor/middleware/verificarToken.js` — `verificarAcceso`); aplicado en `/api/preferencias` (el router de autenticación ya valida su propio accessToken)
- [x] Limpieza de usuarios no verificados y tokens expirados/usados vía **eventos programados de MySQL** (`evt_eliminar_usuarios_no_verificados` cada 24h, `evt_limpiar_tokens_expirados` cada 24h) declarados en `bunyk_db.sql` (requiere privilegio EVENT en `bunyk_app`, ya otorgado)
- [x] Configuración de despliegue (Render + Railway) — blueprint `render.yaml`, static SPA en `servidor/index.js`, `MYSQLDB_PORT`/`MYSQLDB_SSL`, `.env.example`, `bunyk_db.sql` versionado y guía en `README.md`; falta conectar el repo y hacer el primer deploy (ver sección 14)

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
- [x] Middleware de rutas protegidas — `verificarAcceso` aplicado en **todos** los routers del servidor: `routes-autenticacion.js` (preferencias), `routes-usuarios.js`, `routes-notificaciones.js`, `routes-videos.js` (13 usos: crear/like/guardar/voto/visto/comentarios/estadísticas…), `routes-conversaciones.js` (9 usos: crear/like/visto/comentarios/denuncias… y las listas de perfil)

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
- [ ] **RQFN17-18** — Validar que las cantidades de opciones coincidan exactamente con el requerimiento. **Conteo real verificado en `CaracteristicasFisicasComponentes/`**: ojos = **9** (requerimiento: 8 — hay un extra: `almendrados_delgados`), nariz = 12 ✓, labios = 9 ✓, cara = 9 ✓, tono de piel = 6 ✓, tipo de piel = 4 ✓
- [ ] Edición de características físicas desde el perfil (fuera del registro inicial)

---

## 4. Navegación — RQFN35 a RQFN39

**Requerimientos:**
- **RQFN35**: Barra de navegación visible en todas las páginas excepto en la vista de un video individual.
- **RQFN36**: Enlaces a notificaciones, maquillajes, crear, comunidad (conversaciones) y perfil.
- **RQFN37-38**: Enlaces condicionales según el estado de autenticación.
- **RQFN39**: Logo + slogan "B-unik: ¿qué tan única puedes ser?" + enlace a Wiki.

**Checklist:**
- [x] `BarraLateral.jsx` — sidebar completo con 6 ítems de `NAV_ITEMS` (Inicio, Conversaciones, Crear, Wiki, Notificaciones, Información) + botón Perfil en la sección de auth
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
- [ ] **RQFN39** — Slogan "B-unik: ¿qué tan única puedes ser?" visible en la navegación (**verificar**: hoy vive en `InfoInicio.jsx` como `h1` de `/informacion`, no en la `BarraLateral`; el logo de la barra solo tiene `alt="B-unick"`)
- [x] **RQFN35** — Navbar oculto en la vista de video individual: la ruta `/video/:id` (línea 28 de `main.jsx`) se registra **fuera de `AppLayout`**, por lo que `VideoDetalle` no monta la barra lateral (RQFN35 respetado)

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
- [x] Configuración de cuenta: cambiar username, foto de perfil, descripción (**panel de Configuración** único en `/perfil` con secciones "Perfil" y "Configuración del usuario" — contraseña con toggles y correo en flujo 2 pasos con confirmación por enlace)
- [x] Cambio de contraseña (requiere contraseña actual + doble confirmación; revoca refresh tokens de otras sesiones)
- [x] Estadísticas: likes totales, publicaciones, seguidores/seguidos
- [x] Botón seguir/dejar de seguir (con notificación `nuevo_seguidor`)
- [x] Listas de seguidores y seguidos (propias y ajenas, en modales)
- [x] Endpoints backend para todo lo anterior (`routes-usuarios.js`: GET/PUT `/perfil`, `POST /perfil/contrasena`, `POST /perfil/correo`, `PUT /perfil/foto`, `GET /usuarios/:id/perfil`, `POST /seguir/:id`, listas)
- [x] **Galeria Publicaciones/Vistas/Guardados real (2026-09-28)** — pestañas Publicaciones (propio y ajeno), Vistas (propio) y Guardados (propio) muestran el masonry del inicio con **scroll infinito** (`GET /perfil/videos`, `GET /usuarios/:id/videos`, `GET /perfil/vistos`, `GET /perfil/guardados`); Chats y Guardados ajenos siguen como estado vacío contextual

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
- [x] **RQFN70-71** — Backend lista/marca leídas (`GET /api/notificaciones` + `POST /api/notificaciones/leidas`); **los 6 triggers del enum escriben datos reales (paso 6 cerrado 2026-10-01)**: `nuevo_seguidor` (`POST /seguir/:id`), `nuevo_contenido_seguido` (`POST /videos` a seguidores), `nuevo_like` (`POST /videos/:id/like`), `like_comentario` (`POST /videos/:id/comentarios/:cid/like`), `nuevo_comentario` (`POST /videos/:id/comentarios`, copy raíz/respuesta diferenciado) y `semejanza_baja` (`POST /videos/:id/voto`, helper `avisarSemejanzaBaja()` con 4 guardas)
- [x] **RQFN72** — Notificación de baja similitud renderizada con acciones "Cambiar categoría" y "Wiki" y **trigger real** (2026-10-01): se genera con `node scripts/fixtures-semejanza-baja.js` (1001 votos → 39%) y se verificó en vivo (`avisoSemejanza: true`, una sola vez por video)
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
- [x] Botón "Utilizar" que redirige al **feed de Maquillajes del inicio** (`/?cultura=X&subcultura=Y`, el feed vive en `/`)
- [x] **Rediseño portal tipo Fandom (2026-09-19)**: `.wiki-bar` (pestañas por cultura teñidas con `--wiki-color-tinta`), panel de artículo + riel lateral (≥1200px), infobox flotante con fichas `dl`, TOC ("Contenido", ≥3 apartados), h2 con slug, categorías al pie, navbox entre páginas hermanas y grid de tarjetas miembro; `tonoAccesible(hex)` mezcla el color de cultura con #2f2638 hasta contraste AA 4.5:1
- [x] **Nota**: los endpoints backend por subcultura ya no hacen falta (el contenido vive en `wiki.json`); `GET /api/culturas` sigue existiendo para el formulario de preferencias

---

## 8. Maquillajes (feed principal) — RQFN79 a RQFN98

**Requerimientos:**
- Miniaturas de video: imagen, creador, likes, % de similitud con el perfil del usuario.
- Scroll infinito (cargas de 30 en 30).
- Ordenamiento por similitud, likes, fecha, cultura o subestilo.
- Filtros por edad, partes de la cara, tono/tipo de piel, y un toggle para activar/desactivar el filtrado por similitud.
- Tabs de categoría: Todos, Video Maquillajes, Tutorial, Delineados, Sombras, Lip Combo, Base.

**Checklist:**
- [x] Ruta `/maquillajes` como `<RedirigirMaquillajes/>` (el feed real se renderiza en `/` vía `Inicio.jsx`; `/maquillajes` redirige preservando query params)
- [x] **Feed real (paso 3 del roadmap, 2026-09-21)** — `Maquillajes.jsx` reescrito por completo:
  - [x] Miniatura por video: imagen (portada Cloudinary), creador + avatar, likes y % de semejanza (RQFN79)
  - [x] Tarjetas estilo Pinterest que adoptan la `proporcion` del video (`--card-aspect`); "hover" dentro de la card reproduce el video en **mute** (RQFN90/94/96/98), respetando `prefers-reduced-motion` (solo imagen estática)
  - [x] Click en la card → ruta `/video/:id` (RQFN80; **`VideoDetalle.jsx` completo desde 2026-09-26**, ver sección 9)
  - [x] Scroll infinito 30+30 con `IntersectionObserver` + `rootMargin` 600px ≈ llegar a la penúltima fila (RQFN82); siguiente página si `hasMore`
  - [x] Ordenamiento: semejanza, relevantes (comentarios+likes), fecha, cultura, subestilo (RQFN92/93/95/97/99; sin sesión: semejanza↓, luego likes↓ per RQFN83)
  - [x] Tabs de categoría: Todos, Video Maquillajes, Tutorial, Delineados, Sombras, Lip Combo, Base (RQFN88; Video Maquillajes entre Todos y Tutorial desde 2026-09-24)
  - [x] Toggle "Mis características" en la barra superior (RQFN88/RQNFN35, default ON con sesión; requiere sesión, desactivado al buscar)
  - [x] Panel de filtros físicos colapsable por pestaña (RQFN91/93/95/97/99; Delineados y Base usan la analogía más cercana del DER); `GET /videos/filtros` devuelve los valores canónicos (`DISTINCT` de `caracteristicas_fisicas` + `rango_edad`)
  - [x] Marca **"Filtros personalizados activos"** cuando todos los filtros aplicados coinciden con las características del usuario (RQFN85) y cuando está activo el toggle de mis características
  - [x] Búsqueda `q` con debounce (RQFN87): desactiva características físicas y tiende a la descripción
  - [x] Preferencias por likes (RQFN84): con sesión, el feed prioriza las 3 culturas y los 3 subestilos a los que más se les dio like (`FIND_IN_SET` en ORDER BY)
  - [x] Semejanza **por votos (RQNFN31)**: `(OF/(OF+OC))*100`, visible solo con total >1000 (se muestran a sesión abierta o no); `helpers/videos.js` `calcularSemejanza`
  - [x] Endpoints backend: `GET /api/videos` (feed con `categoria/cultura/subcultura/q/filtros físicos/mis_caracteristicas/orden/pagina/limite`, `total/hasMore/marcaFiltrosActivos`) + `GET /api/videos/filtros` (`servidor/Routes/routes-videos.js`, público con sesión opcional por cookie)
  - [x] Seed de los 72 videos actualizado: votos a favor/en contra con **total >1000** (ratios 92→41% ≈ columna `porcentaje_semejanza`) y **`SCHEMA_VERSION = 8`** para re-seed
  - [x] Ruta `/video/:id` registrada en `main.jsx` y componente `VideoDetalle.jsx` **completo** (reproductor/galería/comentarios = RQFN100-120, paso 4 del roadmap)**

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
- [x] Reproductor con controles
- [x] Edición del video (descripción, categoría, subcategoría, **etiquetas**, eliminar) — solo autor
- [x] Comentarios (crear, listar, likes, tabla `comentarios`/`likes_comentario`)
- [x] Galería de imágenes asociadas (`imagenes_video`)
- [x] Panel de información
- [x] Votación de similitud (a favor/en contra con motivos, tablas `votos_video`, `voto_razones`, `razones_voto_contra`)
- [x] Guardar video (`videos_guardados`) y compartir con contadores — **compartir por usuario único** desde 2026-09-28 (`videos_compartidos`, `INSERT IGNORE`, sin +1 optimista)
- [x] Registro de vistas (`videos_vistos`)
- [x] Pasos de tutorial usando tabla `pasos_maquillaje`
- [x] **Paso 4 del roadmap COMPLETADO (2026-09-26)** — `VideoDetalle.jsx` reescrito por completo + `video.css`; ruta `/video/:id` **fuera de AppLayout** (sin barra lateral, RQFN35); endpoints validados en vivo (visto/like/guardar/compartir/voto/comentarios/PUT/DELETE con subcultura vs cultura); **seed de soporte** `servidor/scripts/seed-video-detalle.js` (10 razones ids 1-10, 96 pasos en 12 Tutoriales, 12 imágenes en 3 videos, 6 comentarios con 2 respuestas; `--limpiar` resetea AUTO_INCREMENT → re-seed idempotente)
- [x] **Etiquetas implementadas (2026-09-28)** — tabla `etiquetas_video` (máx 20/video, ≤30 chars, single-misma-cultura validada) + editor en Configuración (chip `#etiqueta`, ✕ al hover/`--hoja`, contador `x/20`); PUT reemplaza el conjunto en transacción y DELETE limpia; **`SCHEMA_VERSION = 9`** con seeds de etiquetas
- [x] **`yaSigo` + motivos de voto (2026-09-28)** — `GET /videos/:id` expone `video.yaSigo` (toggle optimista `POST /seguir/:id` en cine y móvil); motivos = 10 razones de BD (`razones_voto_contra`), se omitió el select "Elige un estilo alternativo…" (decisión del equipo). Pulido: selector de categoría restaurado en el editor, lightbox de escritorio, hoja de voto móvil en 2 pasos, lint del módulo 0 errores, servidor reiniciado con la BD re-seedeada (schema 9 + seeds re-aplicados)
- [x] **Pulido UI de "mostrar video" (2026-09-28, aprobado por la usuaria)** — **controles custom del cine** (spec §3): se quita `controls` nativo, `<video ref>` con onPlay/onPause/onTimeUpdate, play central `.video-cine-play` cuando pausado y barra inferior `.video-cine-controles` (botón play/pausa circular 36px + `.video-cine-barra` con seek por rect propio, `role=progressbar`, aria-valuenow); **posicion de los botones flotantes corregida**: `.video-nav-flotante` pasó de `right: calc(380px - 22px)` a `right: 0` (el `<nav>` vive dentro de `.video-cine-izq`, cuyo ancho ya excluye el panel de 380px; antes quedaban ~358px a la izquierda de la costura); **tooltip de los botones de voto** (`.video-voto-boton::after` con `attr(data-tip)`, solo `@media (hover:hover) and (pointer:fine)`, spec §6); **username móvil clicable** (`video-movil-nombre` → `<Link to=/usuarios/:id>`); **tecla ESC** cierra el nivel más alto abierto (lightbox → hoja móvil → popover de voto); **móvil**: "más" de descripción abre la hoja `descripcion` si es tutorial (inline si no) y el swipe-cerrar del cine solo aplica si el gesto empieza en el cuarto superior de la pantalla. `reproduciendo` inicia en `false`. Build OK + lint del módulo 0 errores
- [x] **Padres de voto agrupados por tipo + desplegable "Selección de estilo alternativo" (2026-09-28, aprobado por la usuaria)** — `razones_voto_contra` con **16 razones** (7 maquillaje + 9 tutorial) y columna `es_alternativo`; `voto_razones` + `estilo_alternativo_id` (FK → `subculturas_estilos`); `GET /videos/:id` filtra las razones por `categoria_contenido` del video (Tutorial→tutorial, resto→maquillaje) y expone `esAlternativo`; `POST /voto` exige estilo alternativo válido (entero, ≠ subcultura del video, existente) cuando se marca la razón alternativa; `<select>` en popover desktop y hoja móvil con opciones de otras subculturas; **`SCHEMA_VERSION = 10`**. Las 4 razones corporales de tutorial quedan siempre visibles (decisión de la usuaria). Verificado en vivo (razones por grupo, 400s de validación, persistencia `estilo_alternativo_id`) + build OK + lint módulo 0
- [x] **Rediseño del bloque del creador en Detalle de video (2026-09-28)** — espacio del username rediseñado: la pastilla "Seguir/Siguiendo" se reemplazó por un **control circular "+"** (`.video-follow`, plum, 34px) que muda a **"✓"** (`video-follow--activo`, outline plum) al seguir; avatar del creador sube a 40px y el nombre a 16px/500. En móvil se **eliminó la pastilla** y el badge "+" del avatar queda como único control (24px, focus-visible con anillo blanco). **Tooltip de los botones de voto corregido**: `white-space: nowrap` hacía que el texto se pintara fuera de su caja de 230px → ahora `white-space: normal` con `max-width: 240px` (envuelve dentro del globo). Nativo `title` en el "+" (no desborda). Build OK + lint módulo 0
- [x] **Perfil: galerías reales + compartir por usuario único (2026-09-28, 3 correcciones aprobadas)** — ① **Publicaciones en Perfil**: pestaña muestra la galería real en masonry del inicio (`VideoCard` de `Maquillajes.jsx`) con **scroll infinito** (30 en 30, IntersectionObserver, sentinel `.maquillajes-observer`) vía `GET /perfil/videos` (propias) y `GET /usuarios/:id/videos` (ajenas, 404 sin verificar). ② **Guardados en Perfil** (solo propias): `GET /perfil/guardados` (JOIN `videos_guardados`, orden por fecha de guardado); Vistas/Chats y Guardados ajenos siguen como estado vacío. Ambos endpoints `{success, videos, total, pagina, limite, hasMore}` (re-exports `COLUMNAS_VIDEO`/`JOINS_VIDEO` de `routes-videos.js` + `armarVideo`); caché por pestaña, anti-race, reset al cambiar de perfil. ③ **Contador de compartidos por usuario único**: nueva tabla **`videos_compartidos`** (PK `usuario_id+video_id`) y **`SCHEMA_VERSION = 11`**; `POST /compartir` hace `INSERT IGNORE` y solo suma si insertó; el frontend copia el enlace siempre y actualiza solo con `cantidadCompartidos` cuando `nuevo===true`. Verificado en vivo: 3 clics mismo usuario → +1, otro usuario → +1; guardar→guardados→desguardar limpio; `GET /perfil/videos`/`/usuarios/11/videos` OK. Build OK + lint módulos tocados 0
- [x] **Vistas en Perfil + panel de Estadísticas del video dueño + fixture de interacciones v73 (2026-09-28, 3 encargos aprobados)** — ① **Pestaña "Vistas" del Perfil propia real**: `GET /perfil/vistos` (JOIN `videos_vistos`, `ORDER BY vv.fecha_visto DESC`, `armarVideo` + paginación idénticas a `/perfil/videos`); el historial es por usuario logueado (verificado: meow `total:5` con videos 73/31/21/41/18). **Retención**: evento MySQL **`evt_limpiar_videos_vistos`** (`EVERY 24 HOUR`, borra vistas >14 días) en `bunyk_db.sql`; **sin bump de `SCHEMA_VERSION`** — `initDb` re-ejecuta el `.sql` íntegro en cada arranque, así que meow/v73 sobreviven al reinicio. ② **Estadísticas del dueño**: `GET /videos/:id/estadisticas` (solo autor; 403/401/400/404) → `{ resumen, diario(14 días), desde, hasta }`, `semejanza` null si total ≤1000 votos; en `VideoDetalle.jsx` la **1ª pestaña "Estadísticas"** (solo dueño) con 7 filas de contadores + barras proporcionales ✓/✕ + **tendencia 14d con tooltip** y entrada en la hoja móvil `menu`; `cargarEstadisticas` refresca en cada apertura (sin ref) y Reintentar en error; CSS `.video-estadisticas*` en `video.css`. **3 bugs de fecha corregidos** en la serie: mysql2 devuelve `DATE` como `Date` JS ("Invalid time value") → getters locales; `toISOString()` desfasaba días cerca del cambio UTC; faltaba `GROUP BY DATE(...)` en las 6 consultas (cada tipo colapsaba a un día). ③ **Fixture `servidor/scripts/fixtures-interacciones-meow.js`**: 11 vistas repartidas en 14 días, 5 likes, 3 guardados, 3 compartidos, 5 favor + 3 contra (con razón ALT `estilo_alternativo_id=60`), comentario padre con 2 likes + respuesta; contadores desnormalizados 11/5/3/3/8/63; guardas (solo video 73 de meow, tablas/contadores vacíos), fechas en hora local, `beginTransaction/commit/rollback` del driver y `--limpiar` (anula `comentario_padre_id` por `fk_com_padre`). Verificado en vivo (estadísticas 200 con diario repartido 09-18→09-28, 403 otro usuario, 401 sin sesión, 400/404; `/perfil/vistos` paginado OK; detalle v73 con razones 1-7[ALT] y comentario+respuesta), `node --check` OK, build OK, lint VideoDetalle/Perfil 0 errores

- [x] **Imagen del video = primera imagen de la galería (2026-09-30, corrección aprobada por la usuaria)** — el sistema ya no usa siempre el primer frame del video como portada/póster: `video.miniatura` ahora es la **primera imagen de `imagenes_video`** (menor `orden`, desempate por `id`) y, si el video no tiene galería, el **primer frame** como fallback. Implementado en las constantes compartidas de `servidor/Routes/routes-videos.js` — `JOINS_VIDEO` gana un `LEFT JOIN imagenes_video img ON img.id = (SELECT g.id FROM imagenes_video g WHERE g.video_id = v.id ORDER BY g.orden ASC, g.id ASC LIMIT 1)` (**1:1**, seguro para los `COUNT(*)` y para la subconsulta `t` del fallback de coincidencia) y `COLUMNAS_VIDEO` expone `img.url_imagen AS imagen_principal` — y en `servidor/helpers/videos.js` (`armarVideo`: `miniatura: fila.imagen_principal || resolverMiniaturaVideo(fila.url_video)`). La URL se sirve **tal cual** (sin transformación Cloudinary = menos recursos; las cards hacen `object-fit: cover`). Cubre los 6 endpoints a la vez (feed, perfil/videos, usuarios/:id/videos, perfil/guardados, perfil/vistos y detalle — el `poster` del player usa la misma miniatura). **Frontend intacto**. Fixture `fixtures-interacciones-meow.js` ampliado: **galería de 3 imágenes** en el video 73 (`woman.jpg`/`couple.jpg`/`sample.jpg`), guarda de `imagenes_video` vacía y `--limpiar` la borra. Sin schema ni `SCHEMA_VERSION` (sigue 11). `node --check` OK, `require` confirma las constantes, build OK. **Sin MySQL en este sandbox**: reiniciar servidor + correr el fixture y verificar en la máquina de la usuaria (v2/11/19/73 con `miniatura = woman.jpg`; v1 sin galería con el frame `so_0`)

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
- [x] Formulario funcional (`Crear.jsx` + `crear.css` con layout 2 columnas y rail sticky)
- [x] Selección tipo: tutorial vs. maquillaje (campo único que cambia de rol)
- [x] Selección de cultura y subestilo (desde `GET /culturas`)
- [x] Subida de video (Cloudinary Upload Widget unsigned, MP4)
- [x] Pasos opcionales (solo tutoriales; acordeón + "Descripción general" como `descripcion_general`)
- [x] Etiquetado con características físicas objetivo (toggle "Usar Características Personales" + picker)
- [x] Subida de hasta 5 imágenes (widget múltiple, JPG/PNG/WEBP, galería 2×3)
- [x] Integración con Cloudinary para almacenamiento/optimización de medios (Upload Widget en el cliente)
- [x] Integración con Sightengine para moderación automática (rechazar si alguna categoría >15%) — `servidor/helpers/sightengine.js`
- [x] Endpoint backend de creación de publicación con validaciones (`POST /api/videos`)
- [x] Fix visual del menú de "Añadir Paso +" (2026-10-01): se quitó `overflow: hidden` de `.crear-acordeon` (recortaba el dropdown absoluto contra el borde inferior del acordeón, dejándolo invisible e inalcanzable sin scroll) + `max-height: min(320px, 55vh)`/`overflow-y: auto` en `.crear-add-paso-menu` para que scrollee interno cerca del borde inferior del viewport

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
- [x] Tablas de esquema: `conversaciones`, `imagenes_conversacion`, `likes_conversacion`, `denuncias_conversacion`, `denuncia_motivos`, `likes_comentario`, `motivos_denuncia`, `comentarios.comentario_padre_id`
- [x] **Vista funcional (COMPLETADO el 2026-10-01, paso 7 del roadmap)**: feed con **tarjetas de ancho completo**, **búsqueda en píldora** (`conv-buscar`), **panel de filtros** (`conv-panel`: Tema radios whitelist `TEMAS` + Cultura/Estilo checkboxes multi + fecha desde/hasta + orden fecha/likes, patrón borradores→aplicados, hoja móvil ≤768px) y **scroll infinito 30+30** con miniaturas `galeria` en abanico; backend `GET /api/conversaciones` ampliado (cultura multi `IN (…)`, rango `desde`/`hasta`, miniaturas batch por página)
- [x] Filtros por tema + subcultura
- [x] Scroll infinito (30 + 30)
- [x] Miniaturas: creador, título, preview de texto, conteo de comentarios y likes
- [x] Formulario de creación (modal en `/conversaciones/nueva`): tema, subestilo, título, texto, hasta 3 imágenes con moderación Sightengine
- [x] Vista de conversación individual (`/conversaciones/:id`): texto, galería, like, comentarios con respuestas anidadas y like a comentarios
- [x] Sistema de reportes con 10 motivos y auto-eliminación (>45% de reportes tras 20 vistas, borrado físico en transacción)
- [x] Endpoints backend para todo el módulo (`servidor/Routes/routes-conversaciones.js`, montado en `/api`)

---

## 12. Servicios externos

*(Soporte transversal a los requerimientos de Crear contenido y Autenticación.)*

- [x] Integración Cloudinary (almacenamiento y distribución de medios) — foto de perfil (`helpers/cloudinary.js`, base64→JSON, `c_fill,w_400,h_400`) + subida de videos/imágenes de Crear por Upload Widget unsigned en el cliente
- [x] Integración Sightengine (moderación automática de imágenes/video) — `servidor/helpers/sightengine.js` (`nudity-2.1,weapon,offensive,self-harm,gore-2.0`, umbral 15%); requiere `SIGHTENGINE_API_USER`/`SIGHTENGINE_API_SECRET` en `.env`; si faltan, `POST /videos` responde 503
- [x] Integración Gmail API (OAuth2 por HTTPS) para correos de verificación (`/preregistro`, `/reenviar-verificacion`)
- [x] Gmail API para correo de recuperación de contraseña (`/olvido-contrasena` → `/recuperar-contrasena` y flujo de cambio de correo del Perfil) — **ya no usa SMTP ni App Passwords** (`servidor/helpers/correo.js`: access token vía `grant_type=refresh_token`, MIME compuesto con `nodemailer/lib/mail-composer` y envío por `POST gmail.googleapis.com/gmail/v1/users/me/messages/send`)

---

## 13. Sistema de recomendación

*(Es el diferenciador del producto: relaciona los requerimientos de Registro (características físicas) con Maquillajes y Notificaciones.)*

- [x] Cálculo de compatibilidad entre características físicas del usuario y etiquetas del contenido — **semejanza por votos** RQNFN31 (`(OF/(OF+OC))*100` en `helpers/videos.js`, visible con total >1000). El feed además resuelve el cruce con las características del usuario registradas: filtrado estricto (`mis_caracteristicas`) con **fallback de coincidencia física** — si da 0, se quitan las condiciones del usuario y se dividen en apartados por el rasgo priorizado que calza (`todos → color_piel → forma_ojos → tipo_rostro → tipo_labios → tipo_nariz`), y si ningún video coincide se sirven todos en orden original con aviso `sinCoincidencia`
- [x] Toggle para activar/desactivar el filtrado por similitud — **toggle "Mis características"** en la barra superior de Maquillajes (RQFN88/RQNFN35, default ON con sesión; persiste apagado en `localStorage` `b-unick:mis-caracteristicas`)
- [x] Priorización de contenido recomendado en el feed de Maquillajes — **boost por preferencias de likes RQFN84** (`FIND_IN_SET` en `ORDER BY` de las 3 culturas/3 subestilos con más likes del usuario) + filtros físicos manuales por pestaña + búsqueda que desactiva rasgos
- [x] Notificación de baja similitud — **trigger `semejanza_baja` (RQFN72, paso 6 cerrado 2026-10-01)**: helper `avisarSemejanzaBaja()` en `POST /videos/:id/voto` con constantes `MINIMO_SEMEJANZA=40` y `VOTOS_MINIMOS_PARA_AVISAR=1000`; 4 guardas (no dueño, >1000 votos, porcentaje <40, una vez por video); acciones "Cambiar categoría" → `/video/:id` y "Wiki"

---

## 14. Calidad, pruebas y despliegue

- [x] **Pruebas unitarias/backend (2026-10-10)** — carpeta `servidor/test/` con **8 archivos y 53 pruebas** usando `node:test` integrado (Node v24, sin dependencias nuevas): `helpers.videos.test.js` (`resolverMiniaturaVideo`, `calcularSemejanza`, `armarVideo`), `helpers.conversaciones.test.js` (`debeAutoeliminarse`, `armarConversacion`, umbrales 20/45), `helpers.imagenes.test.js` (`resolverFotoPerfil`, `mapearUsuarioConFoto`, `FOTO_PERFIL_DEFECTO`), `helpers.jwt.test.js` (familias de secreto, round-trip, expirado, manipulado), `helpers.cloudinary.test.js` (`urlFotogramaVideo`), `helpers.sightengine.test.js` (`UMBRAL_CONTENIDO`, `motivosDeResultado`, `fotogramasVideo`, `modelos`), `helpers.correo.test.js` (`escaparHtml`) y `middleware.verificarAcceso.test.js` (req/res falsos). Script `npm test` = `node --test "test/*.test.js"` → 53 pass
- [x] **Pruebas end-to-end del flujo de registro/login (2026-10-10)** — `servidor/test/e2e.registro-login.test.js`: cubre `validacionregistro` (disponible 200 / falta campo 400), `preregistro` (alta 200 con `usuarioId` / duplicado 409), el **gate de verificación** (`login` 403 `requireVerification`), credenciales inválidas (401) y `olvido-contrasena` (200 neutral). Requiere **servidor + MySQL reales**, por lo que está **desactivado por defecto**: se ejecuta con `BUNYK_E2E=1 npm test` (destino configurable con `BUNYK_E2E_BASE`, default `http://localhost:3000`). En `npm test` normal aparece como 1 prueba *skipped*
- [ ] Linting configurado en cliente (`eslint.config.js` existe) — verificar que corra sin errores
- [x] **Verificación de la sección 14 (2026-10-10)** — `eslint.config.js` existe y el lint corre (baseline del repo con errores preexistentes; `npm run lint` funciona). Completado en esta iteración: pruebas unitarias (`servidor/test/`, 53 pass), pruebas e2e (opcionales con `BUNYK_E2E=1`), documentación de API y **preparación del despliegue** (Render + Railway: `render.yaml`, static SPA, `MYSQLDB_PORT`/`SSL`, `.env.example`, `bunyk_db.sql` versionado). Sigue pendiente solo el **deploy real** (crear BD en Railway y conectar el repo a Render)
- [x] **Documentación de API (2026-10-10)** — `servidor/docs/openapi.yaml` (**OpenAPI 3.0.3**, 53 paths / **58 operaciones** / 21 schemas, validado y contrastado contra las rutas reales: `MISSING []`, `EXTRA []`) + `servidor/docs/postman_collection.json` (**colección Postman v2.1** generada desde el spec, 58 requests en 7 carpetas: Sistema, Autenticación, Culturas, Perfil, Videos, Conversaciones, Notificaciones). Auth por cookie `accessToken` (`cookieAuth`); los endpoints de verificación redirigen a `FRONTEND_URL`
- [x] **Preparación del despliegue (2026-10-10)** — arquitectura **frontend + backend en un único servicio de Render** (Express sirve `cliente/dist` desde el mismo origen) + **MySQL en Railway**: `servidor/index.js` monta `express.static(dist)` + fallback SPA y `trust proxy`; `mysqldb.js`/`initDb.js` soportan `MYSQLDB_PORT` y `MYSQLDB_SSL`; `servidor/package.json` con `engines.node>=20`; **`render.yaml`** (blueprint) y **`.env.example`** de ambos paquetes; `servidor/DB/bunyk_db.sql` versionado (quitado de `.gitignore`); guía en `README.md`. **Pendiente de la usuaria**: crear la BD en Railway, conectar el repo a Render, rellenar secretos y hacer el primer deploy (ver `README.md` → Despliegue)
- [x] **Auditoría de seguridad y endurecimiento (2026-10-10)** — sin hallazgos de SQL injection ni XSS web. Aplicado: (1) guarda de arranque `validarConfiguracion()` (aborta en `NODE_ENV=production` si faltan secretos JWT o `FRONTEND_URL`/`BACKEND_URL`); (2) rate limiting con `express-rate-limit` (`middleware/limitadores.js`: login 10/15min, correo 5/h, registro 20/h); (3) `helmet` (CSP desactivada a propósito por el script inline del tema y el Upload Widget de Cloudinary) + `x-powered-by` desactivado; (4) validación de entrada en `POST /preregistro` (email/username/password/edad/características); (5) helper `escaparHtml` y escapado del username en los 4 correos; (6) `/recuperar-contrasena` revoca los refresh tokens del usuario. Verificado: `npm test` 53 pass + prueba de humo (400 de validación, cabeceras helmet, 429 por rate limit). **Pendiente de la usuaria**: definir secretos fuertes y URLs reales en Render (obligatorio por la guarda)

---

## Resumen rápido

| Módulo | RQFN | Estado |
|---|---|---|
| Registro + verificación de correo | RQFN14, RQFN17-24 | ✅ Completo (pendiente: conteo de opciones — **ojos tiene 9 en vez de 8**) |
| Login + refresh + logout + reenvío verificación | RQFN1-10 | ✅ Completo (incluye auto-redirección RQFN3; logout UI en Perfil) |
| Preferencias de cultura/estilo (usuario nuevo) | RQFN11-13 | ✅ Completo (`/culturas`, `/preferencias`, `PreferenciasFormulario.jsx`, `tienePreferencias`) |
| Recuperación de contraseña | RQFN25-34 | ✅ Completo (`/olvido-contrasena`, `/recuperar-contrasena`, ruta `/restablecer`) |
| Navegación (sidebar) | RQFN35-39 | ✅ Completo (`BarraLateral.jsx` con 6 ítems + blob + teclado + auth condicional; **RQFN35 oculta la barra en `/video/:id`** al registrarse fuera de `AppLayout`) — falta RQFN39: el slogan vive solo en `/informacion`, no en la barra |
| Perfil | RQFN41-56 | ✅ Completo (`routes-usuarios.js`, header rediseñado, seguir + listas, foto Cloudinary) — pestañas **Publicaciones/Vistas/Guardados (propias) = galería real en masonry con scroll infinito** (`GET /perfil/videos`, `/perfil/vistos`, `/perfil/guardados`; Vistas con retención de 14 días vía evento `evt_limpiar_videos_vistos`); Chats y Guardados ajenos = estado vacío contextual |
| Notificaciones | RQFN69-72 | ✅ Completo (drawer superpuesto + backend; **6 triggers escritos**, paso 6 cerrado 2026-10-01) |
| Wiki | RQFN73-78 | ✅ Contenidos y componente único (paso 2 del roadmap): `wiki.json` (**8 culturas/75 subestilos** redactados al template editorial: Sección 1-6 + `ficha` de 5 campos, `imagen` con fotos reales en los 83 items (8 culturas + 75 subestilos) desde `wiki/IMAGENES_PENDIENTES.md`; el sello de iniciales queda como respaldo; substyle «Otros TikTok» fusionado en «Variados TikTok») + `Wiki.jsx` (tres vistas, kicker `Numero`, Sección 1-6 en cultura / ficha en subestilo) + rutas anidadas + "Utilizar" → `/` |
| Maquillajes (feed) | RQFN79-98 | ✅ **Feed completo (paso 3 del roadmap, 2026-09-21)**: backend `routes-videos.js` (publico, sesión opcional; semejanza por votos >1000, orden, filtros físicos por pestaña, toggle "Mis características", búsqueda que desactiva rasgos, boost por preferencias, scroll infinito 30+30), `Maquillajes.jsx` (tabs, masonry con hover-play mute, portada Cloudinary, chip de estilo desde query params, estados vacío/error/skeleton) renderizado **dentro de `Inicio.jsx` en `/`** (`/maquillajes` redirige a `/` preservando query params) y ruta `/video/:id` completa (`VideoDetalle.jsx`, paso 4 del roadmap). Seed 72 videos con votos >1000 → `SCHEMA_VERSION = 8` |
| Detalle de video | RQFN100-120 | ✅ **Completo (paso 4 del roadmap, 2026-09-26 + pulido 2026-09-28)**: `VideoDetalle.jsx` + `video.css` reescritos (cine escritorio / TikTok móvil), ruta `/video/:id` fuera de AppLayout (sin barra, RQFN35), **etiquetas** (`etiquetas_video`, editor con chips + contador, `SCHEMA_VERSION = 9`), **`yaSigo`** con toggle optimista, **razones de voto agrupadas por tipo (16) + desplegable "Selección de estilo alternativo"** (`es_alternativo`, `estilo_alternativo_id` FK, validación backend, `SCHEMA_VERSION = 10`), **panel de Estadísticas del dueño** (`GET /videos/:id/estadisticas`: resumen + tendencia 14d + barras ✓/✕; `semejanza` null ≤1000 votos; sin bump de `SCHEMA_VERSION`), endpoints validados en vivo, seed de soporte `servidor/scripts/seed-video-detalle.js` (16 razones/pasos/imágenes/comentarios con re-seed idempotente) y fixture `servidor/scripts/fixtures-interacciones-meow.js` (vistas/likes/guardados/compartidos/votos/comentarios para el v73). **Pulido UI 2026-09-28**: controles custom del cine (play central + barra inferior con seek, `reproduciendo` inicial false), nav flotante `right:0` (corrige botones demasiado a la izquierda), tooltips de voto (`data-tip`, pointer finos), username móvil clicable, ESC cierra overlays, "más" de descripción → hoja en tutorial, swipe-cerrar solo desde el cuarto superior |
| Crear contenido | RQFN121-125 | ✅ **Completo (paso 5 del roadmap, 2026-09-30)**: `Crear.jsx` + `crear.css` (2 columnas, rail sticky, dos flujos video/tutorial, dropdown que cambia de rol, acordeón Pasos con `descripcion_general`), subida por **Cloudinary Upload Widget unsigned** (`VITE_CLOUDINARY_CLOUD_NAME`/`VITE_CLOUDINARY_UPLOAD_PRESET`), moderación **Sightengine** (`helpers/sightengine.js`, umbral 15%), endpoint **`POST /api/videos`** (valida todo, transacción, notifica `nuevo_contenido_seguido`), `GET /api/perfil/caracteristicas`, `AlertaBecky.jsx` para validaciones/rechazo. Sin bump de `SCHEMA_VERSION` |
| Conversaciones | RQFN126-141 | ✅ **Completo (paso 7 del roadmap, 2026-10-01)**: feed rediseñado estilo foro/Reddit (barra `.conv-topbar` con stats, `h1` + lead, toolbar crear/búsqueda/filtros, **pestañas de orden** Recientes/Populares/Sin responder/Siguiendo con ARIA tablist, línea contadora, tarjeta con columna de votos 56px y like que se rellena, borde de cultura `--conv-cultura`, metadatos con chips, preview clamp 2 + miniatura 64px, avatares de últimos participantes + última respuesta), búsqueda en píldora + panel de filtros (~280px sticky / hoja móvil: Tema radios whitelist `TEMAS`, Cultura checkboxes multi, fecha desde/hasta, patrón borradores→aplicados, chips removibles, `conv-fin` de scroll infinito 30+30) — backend `GET /api/conversaciones` ampliado (`cultura` multi `IN (…)`, rango `desde`/`hasta`, miniaturas batch por página, **`estadoPropio.like` / `ultimosParticipantes` / `ultimaRespuesta` vía `obtenerSesion`**, órdenes `sin_responder` y `siguiendo`); modal de creación en `/conversaciones/nueva` (tema/subestilo/título/texto/hasta 3 imágenes con moderación Sightengine); detalle `/conversaciones/:id` con like, visto, comentarios anidados (respuestas) y like a comentarios; denuncias con 10 motivos y **auto-eliminación** (≥20 vistas y >45% → borrado físico en transacción). `SCHEMA_VERSION = 12`; notificaciones `nuevo_like`/`nuevo_comentario`/`like_comentario`; seed de imágenes corregido contra duplicados. Verificado en vivo (puerto 3002); BD restaurada a seed |
| Cloudinary / Sightengine | (transversal) | ✅ Cloudinary en foto de perfil + subida de Crear (Upload Widget); Sightengine en `POST /videos` (requiere credenciales) |
| Sistema de recomendación | (transversal) | ✅ **Implementado** (sección 13): semejanza por votos >1000, toggle "Mis características" con fallback de coincidencia física en apartados, boost RQFN84 por preferencias, trigger `semejanza_baja` |

*Basado en el código del ZIP `B-unick.zip` tal como fue subido, y en la sección "Key Functional Requirements (from DER)" de `AGENTS.md`. Última revisión de pendientes: 2026-10-10 — se contrastaron los TODOs abiertos contra el código (verificados como completos: `verificarAcceso` en los 5 routers, RQFN35 con `/video/:id` fuera de `AppLayout`, sistema de recomendación completo; conteo real de opciones de características: ojos 9/8, nariz 12, labios 9, cara 9, piel 6, tipo de piel 4; Gmail API reemplazó SMTP). En la misma fecha se añadieron la suite de pruebas (`servidor/test/`, 50 unitarias + e2e opcional), la documentación de API (`servidor/docs/openapi.yaml` + `postman_collection.json`) y el re-seed `SCHEMA_VERSION = 13`; lo único pendiente de la sección 14 queda siendo el despliegue.*