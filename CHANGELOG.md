# Changelog

Todos los cambios notables del proyecto B-unick se documentan en este archivo.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y el
versionado es [SemVer](https://semver.org/lang/es/).

## [Unreleased]

Rediseño del feed de Conversaciones al estilo foro/Reddit (spec de la usuaria,
sin imágenes de referencia): encabezado de foro en 3 franjas, pestañas de
ordenamiento y tarjetas con columna de votos, borde de cultura, metadatos con
chips, miniatura 64px y avatares de los últimos participantes.

### Cambiado — Feed de Conversaciones (frontend)

- **Barra de foro** `.conv-topbar` (56px, `--color-fondo3`): círculo con glifo
  de conversación + "Conversaciones" a la izquierda; a la derecha, contadores
  reales "N conversaciones · M en esta página".
- **Franja 2 y 3** en `.conv-contenedor` (max-width 1180px, padding estilo
  `.perfil-page`): `h1` 32px/600 + lead; toolbar con "Nueva conversación"
  (píldora `--color-acento-fuerte`), búsqueda con radio 10px y borde, y botón
  de filtros circular 40px.
- **Pestañas de ordenamiento** `.conv-orden` (Recientes/Populares/Sin
  responder/Siguiendo) reemplazan al `<select>` "Ordenar por" del panel de
  filtros; ARIA tablist completa (roving `tabIndex`, ←/→ con envoltura,
  Inicio/Fin); "Siguiendo" sin sesión abre el modal de login.
- **Línea contadora** `.conv-conteo` ("Mostrando X de Y conversaciones", con
  plural correcto) vía nuevo estado `total`.
- **Tarjeta Reddit** `.conv-card`: grid `56px votos + contenido`, borde
  izquierdo 3px con el color de la cultura (`--conv-cultura`, único excepción a
  los tokens); flecha arriba 1.5 que se **rellena** al dar like (`fill:
  currentColor` con `--color-acento-fuerte`), `aria-pressed`, likes 15px/600
  tabular-nums; metadatos (avatar 20px + autor + "·" + tiempo relativo +
  chips Tema/Cultura con punto de 6px); título 17px/600 enlazado (se eliminó el
  overlay `.conv-card-link` para no anidar interactivos); preview clamp de 2
  líneas + miniatura 64px; pie con burbuja+conteo, hasta 3 avatares
  superpuestos (18px, borde blanco, `+N`) y "última respuesta hace Xh".
- Responsive: ≤768px columna de votos 44px, miniatura 56px y toolbar con
  búsqueda a fila completa; ≤480px se ocultan miniatura, "última respuesta" y
  stats de la topbar.

### Cambiado — Feed de Conversaciones (backend)

- `GET /api/conversaciones` ahora usa `obtenerSesion(req)` para datos
  personalizados: cada conversación lleva `estadoPropio{like, denuncie:false}`
  (batch `likes_conversacion` por página), `ultimosParticipantes` (avatares
  resueltos de autores distintos, cap 6, last-response order) y
  `ultimaRespuesta` (fecha del comentario más reciente o null) — vía batch a
  `comentarios` + `usuarios`.
- Nuevos órdenes en el feed: `sin_responder` (sin respuesta primero:
  `(COALESCE(co.cantidad,0) = 0) DESC, fecha DESC, id DESC`) y `siguiendo`
  (`JOIN seguidores fl ON fl.seguido_id = c.usuario_id AND fl.seguidor_id = ?`,
  solo con sesión; `paramsJoin` antepuesto a los params del WHERE en COUNT y
  SELECT por orden posicional del SQL).

## [1.3.0] — 2026-10-01

Cuarto release versionado del proyecto. Cierra el **paso 7 del roadmap**
(Conversaciones RQFN126-141): feed con filtros por tema/cultura/subcultura y
búsqueda, modal de creación con moderación Sightengine de imágenes, detalle con
comentarios anidados (respuestas) y sistema de denuncias con auto-eliminación.
Incluye la corrección del seed de imágenes de conversación (también duplicado en
cada reinicio), los nuevos triggers de notificación y toda la documentación
actualizada (AGENTS.md, TODO_B-unick.md).

### Añadido — Módulo Conversaciones (paso 7 del roadmap)

- **Feed** (`GET /api/conversaciones`): público con sesión opcional; filtros
  `tema` (whitelist `TEMAS = Tips/Dudas/Tutorial/Opiniones/Eventos/Show/Look/
  General`), `cultura`, `subcultura`, `q` (LIKE sobre título/texto/tema), `orden`
  (`fecha`/`likes`) y paginación 30/60. Tarjetas con miniatura, creador, título,
  preview, contador de comentarios y likes.
- **Catálogos públicos** `GET /api/conversaciones/temas` y
  `GET /api/conversaciones/denuncia-motivos` (10 motivos `{id, descripcion}`),
  registradas antes que `/:id` (guarda `/^\d+$/`).
- **Creación** (`POST /api/conversaciones`, `verificarAcceso`): `tema` (≤40),
  `subcultura_id`, `titulo` (≤80), `texto` (≤500) y hasta 3 imágenes
  (`imagenes[]`). Modera con Sightengine solo si hay imágenes (mismos errores
  503/502/422 que Crear); sin imágenes → 201 directo. Transacción inserta
  conversación + `imagenes_conversacion`.
- **Detalle** (`GET /api/conversaciones/:id`): conversación armada + `galeria`,
  `esDueño`, `estadoPropio{like,denuncie}`, comentarios **anidados** (raíces con
  `respuestas[]` por `comentario_padre_id`), `likeDado` y `autor{fotoPerfil}`.
- **Interacciones**: `POST /visto` (incrementa vistas), `POST /like` (toggle con
  `likes_conversacion`, contador `GREATEST-1`, notificación `nuevo_like`),
  `POST /:id/comentarios` (con `comentario_padre_id` opcional → notificación
  `nuevo_comentario`/respuesta) y `POST /:id/comentarios/:cid/like`
  (notificación `like_comentario`).
- **Denuncias con auto-eliminación** (`POST /:id/denuncias`, RQFN141): 400 si es
  propia/sin motivos/motivo inexistente/más de 10; 409 si ya denunció; 404 si no
  existe. Con `vistas >= 20` y `(denuncias/vistas)*100 > 45` borra la conversación
  físicamente en transacción (likes de comentarios → motivos → comentarios y
  respuestas → likes → denuncias → imágenes → notificaciones → conversación).
- **Frontend**: `Conversaciones.jsx` (feed con tabs/orden/filtros/búsqueda y
  scroll infinito + modal de creación), `ConversacionNueva.jsx` (formulario del
  modal con picker de tema/subestilo, contadores y hasta 3 imágenes) y
  `ConversacionDetalle.jsx` (detalle con galería/lightbox, like, comentarios
  anidados, modal de denuncia con `<select multiple>` y aviso de
  auto-eliminación). CSS `conversaciones.css` + `conversaciones-detalle.css`.
- **BD**: `SCHEMA_VERSION = 12` — tablas `conversaciones`, `imagenes_conversacion`,
  `motivos_denuncia`, `denuncias_conversacion`, `denuncia_motivos`,
  `likes_conversacion`, `likes_comentario` y `comentarios.comentario_padre_id`
  nullable; seed de 6 conversaciones con galería completa (16 imágenes) + 10 motivos.

### Corregido — Seed de imágenes de conversación duplicado en cada reinicio

`imagenes_conversacion` usaba `INSERT IGNORE` sin fijar `id` (AUTO_INCREMENT),
así que las 2 imágenes de la conversación 6 se duplicaban en cada arranque de
`initDb.js` (mismo bug que el de notificaciones del 1.2.0; se acumularon 6
filas). Ahora cada una se inserta con
`INSERT ... SELECT ... FROM DUAL WHERE NOT EXISTS (conversacion + orden)` y los
duplicados acumulados se limpiaron (6 → 2).

### Cambiado — Listado de Conversaciones rediseñado (tarjetas, búsqueda y panel de filtros)

Iteración de diseño aprobada por la usuaria sobre el feed de conversaciones
(`Conversaciones.jsx` + `conversaciones.css`):

- **Tarjeta de ancho completo** `.conv-card`: título h3 de una línea (elipsis) +
  2 chips de solo lectura ("Tema: …", "Cultura/Estilo: …"), autor con avatar 24px,
  extracto máx. 300 caracteres **clamp de 4 líneas** + **miniatura única estilo
  Reddit** `.conv-card-thumb` (foto de portada `galeria[0]`, cuadrada, a la
  derecha; desktop 104px / móvil 72px) y pie con 💬 comentarios + ⭐ likes. El
  enlace `.conv-card-link` recorre toda la tarjeta
  (`inset:0`, foco 3px `--color-acento-fuerte`).
- **Búsqueda en píldora** `.conv-buscar` (48px, lupa SVG, ✕ para limpiar) y botón
  de filtros circular `.conv-filtros-toggle` (44px, ícono embudo, `aria-expanded`).
- **Panel de filtros** `.conv-panel` (~280px sticky a la derecha; abajo como hoja
  con backdrop en ≤768px): Tema (radios "Todos" + whitelist), Cultura/Estilo
  (checkboxes multi de las 8 culturas), Fecha (desde/hasta con `IconoCalendario`),
  Ordenar por (fecha/likes), botones "Aplicar filtros" (borrador → aplicados) y
  "Limpiar filtros". Patrón de borradores para no aplicar en cada clic.
- **Aviso de filtros activos** `.conv-avisos` (patrón Maquillajes): marca
  "Filtros personalizados activos" + chips removibles por tema/cultura/desde/hasta/
  búsqueda (`quitarChip`).
- **Backend ampliado** (`GET /api/conversaciones`): `cultura` acepta lista
  separada por comas (`IN (…)`), filtro de **rango de fechas** `desde`/`hasta`
  (`YYYY-MM-DD`, "hasta" incluye todo el día con `DATE_ADD(…, INTERVAL 1 DAY)`) y
  cada tarjeta trae **`galeria`** (miniaturas: batch de `imagenes_conversacion`
  por página, hasta 3, `orden ASC, id ASC`). La UI ya no expone `subcultura`
  (el backend lo conserva).
- **Estados**: skeletons shimmer (6), error con Reintentar, vacío contextual,
  píldora `.conv-fin` "Cargando 30 conversaciones más" / "Eso es todo por ahora (N)".
- A11y: `:focus-visible` con accent-color, ESC cierra el panel, `prefers-reduced-motion`.

### Verificado — Pruebas en vivo

Toda la verificación se hizo contra una instancia temporal (puerto 3002) con la
BD local: feed público 200, detalle con galería y comentarios anidados, like
toggle con `GREATEST-1`, `POST /visto`, denuncia propia 400 (`No puedes denunciar
tu propia conversación`), duplicada 409, **auto-eliminación** (conversación con
20 vistas y denuncia 10/20 = 50 % → `eliminada: true` y 404 posterior), like a
comentario cruzado con notificación y notificaciones `nuevo_like`/`nuevo_comentario`/
`like_comentario`. Tras las pruebas la BD quedó restaurada a estado de seed
(conversaciones 6, usuarios 10, notificaciones 3, `imagenes_conversacion` 16,
comentarios/likes/denuncias 0) y se eliminaron los usuarios temporales
(`conv_tester_tmp`, `conv_tester2`).

## [1.2.0] — 2026-10-01

Tercer release versionado del proyecto. Cierra el **paso 6 del roadmap** (wiring
de notificaciones): los seis disparadores del enum escriben datos reales, con el
nuevo trigger de baja semejanza (`semejanza_baja`) y el copy de comentarios
diferenciado por raíz/respuesta. Incluye la corrección del seed de notificaciones
(ya no se duplica en cada reinicio), el fixture `fixtures-semejanza-baja.js` para
probar el aviso y toda la documentación actualizada.

### Cambiado — Notificaciones: triggers completos (paso 6 del roadmap)

- **`semejanza_baja`** (RQFN71/RQFN72): `servidor/Routes/routes-videos.js` con
  constantes `MINIMO_SEMEJANZA = 40` y `VOTOS_MINIMOS_PARA_AVISAR = 1000` y el
  helper `avisarSemejanzaBaja()` invocado al final de `POST /videos/:id/voto`.
  Solo avisa cuando (1) quien vota no es el dueño, (2) hay más de 1000 votos,
  (3) el porcentaje baja de 40 y (4) no avisó ya para ese video; inserta la
  notificación con actor nulo (avatar de Becky) y la respuesta del voto incluye
  `avisoSemejanza: true`. Un fallo al notificar no revierte el voto.
- **`nuevo_comentario`**: copy diferenciado — raíz `comentó tu video`, respuesta
  `respondió a tu comentario`.
- Los 6 tipos del enum ya escriben en BD: `nuevo_seguidor`, `nuevo_contenido_seguido`,
  `nuevo_like`, `like_comentario`, `nuevo_comentario` y `semejanza_baja`.

### Corregido — Seed de notificaciones duplicado en cada reinicio

`initDb.js` re-ejecuta `bunyk_db.sql` íntegro en cada arranque y el seed usaba
`INSERT IGNORE` sin fijar `id` (AUTO_INCREMENT), así que las 3 filas de prueba se
duplicaban cada reinicio (llegó a haber 31 filas para el usuario 1). Ahora cada
una se inserta con `INSERT ... SELECT ... FROM DUAL WHERE NOT EXISTS (usuario_id
+ tipo + actor)`, verificado corriendo el bloque 3 veces sin añadir filas; los
duplicados acumulados se limpiaron (31 → 4). La fila semilla de `semejanza_baja`
conserva `video_id = NULL` a propósito para no bloquear el trigger real.

### Añadido — Fixture del aviso de baja semejanza

`servidor/scripts/fixtures-semejanza-baja.js`: prepara 1001 votos en el video 1
(39 %, bajo el umbral) para disparar el aviso, `--notificar` inserta el aviso ya
redactado (revisar el drawer sin votar) y `--limpiar` lo revierte restaurando
los contadores del seed (929/81/92). Verificado en vivo contra una instancia
temporal del servidor (puerto 3001, código nuevo): `avisoSemejanza: true` con
390/612 votos y 39 %, segundo voto sin duplicar, y guardas 1 y 3 (dueño votando
su propio video; video sobre 40 %) confirmadas sin aviso.

Sin cambios de esquema: `SCHEMA_VERSION` sigue en 11 (no se borra la cuenta de
prueba de la usuaria ni su video 73).

## [1.1.0] — 2026-09-20

Segundo release versionado del proyecto. Empaqueta los pasos 1 y 2 del roadmap
(Notificaciones — drawer y Wiki — portal editorial), el placeholder funcional
de Maquillajes, mejoras de Perfil/autenticación y toda la documentación
actualizada (AGENTS.md, TODO_B-unick.md, DocumentacionDelCodigo.md, guías de
`wiki/`) junto con las habilidades de opencode usadas para redactar el contenido.

### Añadido — Notificaciones: drawer superpuesto (RQFN69-72, paso 1 del roadmap)

- Backend: nuevo `servidor/Routes/routes-notificaciones.js` con
  `GET /api/notificaciones` (`{ success, noLeidas, notificaciones }`, orden
  desc por fecha, actor con avatar resuelto vía `mapearUsuarioConFoto` o `null`
  para tipos de sistema) y `POST /api/notificaciones/leidas`, ambos tras
  `verificarAcceso`; montado en `servidor/index.js`.
- BD: `SCHEMA_VERSION = 3` — columna `notificaciones.usuario_actor_id`
  (nullable, `fk_notif_actor`) + seed de 3 notificaciones para `test_user_01`;
  `POST /seguir` inserta `usuario_actor_id`.
- Frontend: `cliente/src/Componentes/Notificaciones/NotificacionesPagina.jsx`
  como drawer superpuesto portalizado en `id="panel-notificaciones"`: a la
  **derecha** en escritorio (`right:0`, `width:min(360px, calc(100vw - 72px))`,
  filas con filetes finos y burbujas magenta de Becky, pesos ≤500) y pantalla
  completa en móvil (≤768px, `bottom:84px`); abre con la campana de la
  BarraLateral (con o sin sesión), badge de no leídas, marca leídas al abrir,
  estado vacío = fila de Becky, sin sesión = estado vacío centrado con botón
  "Iniciar sesión", ESC/backdrop/✕ cierran con retorno de foco.
- CSS: nuevo `cliente/src/estilos/NotificacionesEstilos/notificaciones.css`
  (`--color-burbuja: #7a5fa0`, `notif-panel-in`/`notif-fade-in` anuladas con
  `prefers-reduced-motion: reduce`) y `.barra-badge` en `estilospequeños.css`.
- La ruta standalone `/notificaciones` se eliminó de `cliente/src/main.jsx`
  (redirige a `/` con `<Navigate to='/' replace />`); solo existe el trigger
  `nuevo_seguidor` — el resto del enum se renderiza en `construirAcciones` y se
  escribirá cuando existan sus features de origen (paso 6 del roadmap).

### Añadido — Wiki: portal tipo Fandom (RQFN73-78, paso 2 del roadmap)

- `cliente/src/Componentes/WIKI/Wiki.jsx` + `wiki.css`: componente único de
  tres vistas (`/wiki`, `/wiki/:culturaId`, `/wiki/:culturaId/:subculturaId`)
  con barra de pestañas por cultura teñida con `--wiki-color-tinta`
  (`tonoAccesible(hex)` garantiza contraste AA 4.5:1 sobre #fff), panel de
  artículo + riel lateral (≥1200px), infobox flotante con fichas `dl`, TOC,
  categorías, navbox y grid de tarjetas miembro.
- Contenido en `cliente/src/Componentes/WIKI/datos/wiki.json` (nuevo
  directorio `datos/`): **8 culturas / 75 subestilos (ids 1-75)** redactados
  siguiendo el template editorial (Sección 1-6 por cultura con apartados y
  pasos de conteo variable fiel a cada guía MD + `ficha` de 5 campos por
  subestilo) e **imágenes reales en los 83 items** (8 culturas + 75
  subestilos) con URL verificadas (200/206 `image/*`); el sello de iniciales
  queda como respaldo del componente cuando `imagen` no existe.
- Substyle 76 «Otros TikTok» **fusionado en el 75 «Variados TikTok»**
  (2026-09-20): contenido reescrito del MD §11 centrado en historia/contexto de
  los trends de performance; foto del antiguo 75 conservada.
- BD sincronizada: seed de `subculturas_estilos` con **75 filas (ids 1-75)** en
  `servidor/DB/bunyk_db.sql` y `SCHEMA_VERSION = 6` (cultura 9 'Otros'
  eliminada, tabla reemplazada desde `wiki.json`).
- Botón "Utilizar este estilo" en subestilos → `/maquillajes?cultura=<id>&subcultura=<id>`.

### Añadido — Maquillajes: placeholder funcional (paso 3 preparado)

- `cliente/src/Componentes/Maquillajes/Maquillajes.jsx` + `maquillajes.css`:
  ruta `/maquillajes` montada en `main.jsx`; lee `cultura`/`subcultura` de
  query params, resuelve los nombres desde `wiki.json` y enlaza a la Wiki.
  El feed real (scroll infinito 30+30, orden, filtros, pestañas) queda como
  paso 3 del roadmap.

### Añadido — Mejoras de Perfil / autenticación y frontend

- Normalización de pesos tipográficos a **≤500** en todo el frontend (Perfil,
  toast de cookies y Drawer) y grosor de trazo de SVG a 1.5px.
- Avatar de la BarraLateral con foto real (`user.fotoPerfil`) en vez de solo
  la inicial; header de Perfil con username `<h1>` a 22px/500.
- Ajustes menores en formularios de registro, `estilos.css`,
  `estilospequeños.css`, `perfil.css`, `iniciosesion.css`, `BarraLateral.jsx`,
  `Perfil.jsx`, `InicioSesion.jsx`, `routes-usuarios.js` y `servidor/index.js`.

### Añadido — Habilidades de opencode y documentación

- Nuevas skills de opencode: `.opencode/skills/investigacion/` (investiga
  con método y entrega hallazgos verificados, con fuentes y nivel de
  confianza) y `.opencode/skills/redaccion-de-textos/` (redacta textos claros
  con voz propia, con modo para público adolescente).
- Directorio `wiki/` con las 7 guías editoriales fuente (MD por cultura) e
  `IMAGENES_PENDIENTES.md` (checklist de las 83 imágenes con URLs verificadas).
- `AGENTS.md`, `TODO_B-unick.md` y `DocumentacionDelCodigo.md` actualizados
  al estado real (conteos 8/75, `SCHEMA_VERSION = 6`, drawer, Maquillajes
  placeholder); `README.md` con la iteración v1.1.0.

### Conocido

- Lint del frontend: **50 errores baseline preexistentes** de ESLint
  (no corregidos en esta iteración; los nuevos archivos del release no
  introducen errores nuevos; se documentan, no se arreglan).
- Triggers de notificaciones restantes (`nuevo_contenido_seguido`, `nuevo_like`,
  `like_comentario`, `nuevo_comentario`, `semejanza_baja`): renderizados en
  `construirAcciones` pero se escriben cuando existan sus features de origen
  (paso 6 del roadmap).
- Conversaciones y Crear siguen como placeholders sin lógica.
- Las pestañas Guardados/Vistas/Chats del Perfil son solo visuales.
- Feed real de Maquillajes (RQFN79-98): pendiente, paso 3 del roadmap.

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
[1.1.0]: https://github.com/PETHSA-01/B-UNICK/releases/tag/v1.1.0
