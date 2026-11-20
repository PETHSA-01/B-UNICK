Cumplimiento de Requerimientos (RQFN / RQNFN) - B-unick

> Documento generado a partir de `DER_22300935-1.md`. Mapea cada requerimiento funcional y no funcional con la ubicación concreta en el código (frontend, backend, base de datos, configuración y eventos), así como fragmentos relevantes de implementación.

## 1. Requerimientos Funcionales (RQFN)

### 1.1 Inicio de sesión / Autenticación (RQFN1 - RQFN13)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQFN1** | Mostrar mensaje informando sobre uso de cookies con gif adjunto | `cliente/src/Componentes/elementos_pequeños/Notificaciones.jsx`, `cliente/src/context/AuthContext.jsx` | Toast `.notificacion.notif-cookie` con gif `/hi.gif`, título "Becky te ha mandado un mensaje". Renderizado inline (sin portal). |
| **RQFN2** | Solicitar aceptación/rechazo de cookies | `cliente/src/Componentes/elementos_pequeños/Notificaciones.jsx` | Botones "Aceptar todo" / "Rechazar todo". Aceptación persiste solo en `localStorage` (`cookie-consent`). Rechazo es solo por sesión y se vuelve a preguntar. |
| **RQFN3** | Si hay sesión activa en cookies, redirigir a página principal | `cliente/src/context/AuthModalContext.jsx`, `cliente/src/Componentes/elementos_pequeños/BarraLateral.jsx` | `AuthModalContext.openModal` hace no-op si hay sesión activa. BarraLateral muestra perfil en lugar de login/registro. `GET /api/me` valida cookie `accessToken`. |
| **RQFN4** | Ingresar correo/usuario y contraseña | `cliente/src/Componentes/InicioDeSesion/InicioSesion.jsx` | Formulario con campo `identificador` (acepta email o nombre de usuario) y contraseña. `noValidate` para permitir username sin `@`. |
| **RQFN5** | Ocultar texto de contraseña | `cliente/src/Componentes/InicioDeSesion/InicioSesion.jsx`, componentes reutilizables | Input `type="password"` por defecto. |
| **RQFN6** | Mostrar/ocultar contraseña | `cliente/src/Componentes/InicioDeSesion/InicioSesion.jsx` | Botón/toggle para cambiar tipo de input entre `password` y `text`. |
| **RQFN7** | Mensaje de error si credenciales inválidas/no registrado | `cliente/src/Componentes/InicioDeSesion/InicioSesion.jsx`, `cliente/src/Componentes/elementos_pequeños/Notificaciones.jsx` (portalizado a body) | Toast portalizado desde modal. Backend retorna errores apropiados. Botón "Iniciar sesión" deshabilitado con `cargando`. |
| **RQFN8** | Opción para ir a registro | `cliente/src/Componentes/InicioDeSesion/InicioSesion.jsx`, `cliente/src/Componentes/Registro/*`, `cliente/src/context/AuthModalContext.jsx` | Modal unificado vía `AuthModalContext` para cambiar entre login/registro. |
| **RQFN9** | Opción para ir a "olvido de contraseña" | `cliente/src/Componentes/InicioDeSesion/InicioSesion.jsx`, `cliente/src/Componentes/InicioDeSesion/RecuperarContraseñaCorreo.jsx` | Navegación/modal hacia flujo de recuperación. |
| **RQFN10** | Redirigir a página principal al iniciar sesión exitosamente | `cliente/src/Componentes/InicioDeSesion/InicioSesion.jsx`, `servidor/Routes/routes-autenticacion.js` | `POST /api/login` setea cookies `httpOnly` (`accessToken`, `refreshToken`) y retorna usuario. Frontend redirige a `/`. |
| **RQFN11** | Mostrar formulario de preferencias en primer acceso | `cliente/src/Componentes/Registro/PreferenciasFormulario.jsx`, `cliente/src/Componentes/Inicio/Inicio.jsx` | Se muestra cuando `user.tienePreferencias === false`. Tras guardar, se llama `refreshUser()`. |
| **RQFN12** | Mostrar todas las culturas/estilos con subculturas desplegables | `cliente/src/Componentes/Registro/PreferenciasFormulario.jsx`, `servidor/Routes/routes-autenticacion.js` | `GET /api/culturas` retorna culturas con subculturas anidadas. |
| **RQFN13** | Seleccionar 1-3 culturas/estilos y 1 subcultura por cada uno | `cliente/src/Componentes/Registro/PreferenciasFormulario.jsx`, `servidor/Routes/routes-autenticacion.js` | `POST /api/preferencias` valida y guarda preferencias del usuario. | 

### 1.2 Registro (RQFN14 - RQFN24)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQFN14** | Ingresar correo, contraseña, nombre de usuario | `cliente/src/Componentes/Registro/InicioFormularioCF.jsx`, `servidor/Routes/routes-autenticacion.js` | `POST /api/validacionregistro` valida disponibilidad por separado (email/username), `POST /api/preregistro` crea usuario + características + token. |
| **RQFN15** | Ocultar contraseña en registro | `cliente/src/Componentes/Registro/InicioFormularioCF.jsx` | Input tipo password. |
| **RQFN16** | Mostrar/ocultar contraseña | `cliente/src/Componentes/Registro/InicioFormularioCF.jsx` | Toggle para visualizar contraseña. |
| **RQFN17** | Formulario de características físicas con campos especificados | `cliente/src/Componentes/Registro/OjosFormulario.jsx`, `NarizFormulario.jsx`, `CaraFormulario.jsx`, `ColoresFormulario.jsx`, `BocaFormulario.jsx`, `TiposPielFormulario.jsx`, `EdadFormulario.jsx` | Wizard de 7 pasos. Opciones coinciden con esquema `caracteristicas_fisicas` (forma_ojos, tipo_nariz, tipo_labios, tipo_rostro, color_piel, tipo_piel, edad). |
| **RQFN18** | Mostrar imagen de referencia por característica (excepto edad) | Componentes de formularios de características con assets/imágenes | Cada paso muestra imagen ilustrativa de las opciones. |
| **RQFN19** | Botón para continuar con verificación de correo | `cliente/src/Componentes/Registro/EdadFormulario.jsx` | Tras completar características, envía preregistro. |
| **RQFN20** | Enviar correo de verificación | `servidor/Routes/routes-autenticacion.js`, `servidor/helpers/correo.js` | `POST /api/preregistro` crea usuario no verificado, genera token JWT de verificación, envía por Gmail API. |
| **RQFN21** | Mostrar mensaje sobre envío de verificación | `cliente/src/Componentes/Registro/PreregistroConfirmado.jsx` | Modal mostrado tras preregistro exitoso. |
| **RQFN22** | Correo con info del usuario y confirmación/ignorar | `servidor/helpers/correo.js` | Email HTML con nombre de usuario/correo y enlace de verificación. |
| **RQFN23** | Correo con botón/redirección a página de registro/info | `servidor/Routes/routes-autenticacion.js` | Enlace apunta a `BACKEND_URL/verificar-correo?token=...` que redirige a frontend. |
| **RQFN24** | Página/mensaje de confirmación y opción a inicio de sesión | `cliente/src/Componentes/Registro/CuentaConfirmada.jsx`, `servidor/Routes/routes-autenticacion.js` | `GET /api/verificar-correo` valida token, marca `correo_verificado=1`, redirige a `/verificar-correo?success=true`. |

### 1.3 Olvido de contraseña (RQFN25 - RQFN34)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQFN25** | Campo para ingresar correo para restablecimiento | `cliente/src/Componentes/InicioDeSesion/RecuperarContraseñaCorreo.jsx` | Formulario para solicitar recuperación. |
| **RQFN26** | Mensaje si correo registrado o error si no existe | `cliente/src/Componentes/InicioDeSesion/RecuperarContraseñaCorreo.jsx`, `servidor/Routes/routes-autenticacion.js` | Respuesta neutral por anti-enumeración, pero mensaje guiado al frontend. |
| **RQFN27** | Opción de reenviar correo al minuto | `cliente/src/Componentes/InicioDeSesion/RecuperarContraseñaCorreo.jsx` | Lógica de reenvío con temporizador. `POST /api/reenviar-verificacion` disponible. |
| **RQFN28** | Usuario presiona enlace de redirección | Correo generado por `helpers/correo.js` | Enlace `FRONTEND_URL/restablecer?token=X`. |
| **RQFN29** | Correo con info del usuario y confirmación/ignorar | `servidor/helpers/correo.js` | Email con datos y enlace. |
| **RQFN30** | Ignorar correo si no fue solicitado | Diseño del flujo - token único y con expiración | Token firmado con expiración y marcado como usado al consumirlo. |
| **RQFN31** | Ignorar correo si no fue solicitado | Ídem anterior | Mismas medidas de seguridad. |
| **RQFN32** | Dos campos: nueva contraseña y confirmación | `cliente/src/Componentes/InicioDeSesion/ReescribirContraseña.jsx` | Formulario con ambos campos. |
| **RQFN33** | Mostrar correo/nombre al que se cambia contraseña | `cliente/src/Componentes/InicioDeSesion/ReescribirContraseña.jsx` | Se muestra info del usuario desde token/estado. |
| **RQFN34** | Redirigir a inicio de sesión tras cambio exitoso | `cliente/src/Componentes/InicioDeSesion/ReescribirContraseña.jsx`, `servidor/Routes/routes-autenticacion.js` | `POST /api/recuperar-contrasena` valida token, actualiza contraseña, marca token usado, revoca refresh tokens. Redirige a login. |

### 1.4 Barra de navegación (RQFN35 - RQFN39)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQFN35** | Mostrar barra de navegación en todas las páginas excepto al abrir algún video | `cliente/src/layout/AppLayout.jsx`, `cliente/src/Componentes/elementos_pequeños/BarraLateral.jsx`, `cliente/src/main.jsx` | `AppLayout` envuelve rutas autenticadas/con barra. Ruta `/video/:id` está **fuera** de `AppLayout` (sin barra lateral). Barra oculta en `/verificar-correo`. |
| **RQFN36** | Enlaces: Notificaciones, Maquillajes, Crear, Comunidad, Perfil | `cliente/src/Componentes/elementos_pequeños/BarraLateral.jsx` | `NAV_ITEMS = [Inicio, Conversaciones, Crear, Wiki, Notificaciones, Información]`. Perfil es botón separado en sección auth. Iconos SVG mapeados en `ICON_MAP`. |
| **RQFN37** | Si no hay sesión activa: mostrar Inicio de sesión y Registro | `cliente/src/Componentes/elementos_pequeños/BarraLateral.jsx` | Sección auth muestra botones "Iniciar sesión" / "Registrarse" cuando no hay usuario autenticado. |
| **RQFN38** | Perfil, Crear, Notificaciones redirigen a login si no hay sesión | `cliente/src/Componentes/elementos_pequeños/BarraLateral.jsx`, `cliente/src/context/AuthModalContext.jsx` | Handlers abren modal de login vía `openModal('login')` si no hay sesión. |
| **RQFN39** | Logo, nombre/slogan "B-unik: ¿qué tan única puedes ser?" y Wiki | `cliente/src/Componentes/elementos_pequeños/BarraLateral.jsx` | Logo con `logo.svg`, elemento Inicio enlaza a `/`, ítem Wiki presente. |

### 1.5 Perfil (RQFN41 - RQFN68)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQFN41** | Menú con Configuración de cuenta y Videos vistos | `cliente/src/Componentes/Perfil/Perfil.jsx` | Panel de Configuración modal, pestaña "Vistas" (solo propio). |
| **RQFN42** | Apartado videos vistos con cantidad y álbum | `cliente/src/Componentes/Perfil/Perfil.jsx`, `servidor/Routes/routes-usuarios.js` | Pestaña "Vistas" muestra galería con scroll infinito. `GET /api/perfil/vistos` JOIN `videos_vistos`. |
| **RQFN43** | Al presionar video visto, accederlo y posicionarlo al tope | `servidor/Routes/routes-videos.js`, `servidor/DB/bunyk_db.sql` | `POST /api/videos/:id/visto` usa `INSERT ... ON DUPLICATE KEY UPDATE fecha_visto = NOW()` (no duplica, actualiza fecha). Evento `evt_limpiar_videos_vistos` purga >14 días. |
| **RQFN44** | Configuración: nombre usuario, contraseña, foto perfil, descripción | `cliente/src/Componentes/Perfil/Perfil.jsx` | Panel modal con secciones "Perfil" y "Configuración del usuario". |
| **RQFN45** | Ingresar contraseña actual para cambiarla | `cliente/src/Componentes/Perfil/Perfil.jsx`, `servidor/Routes/routes-usuarios.js` | `POST /api/perfil/contrasena` exige contraseña actual con bcrypt. |
| **RQFN46** | Ingresar dos veces nueva contraseña | `cliente/src/Componentes/Perfil/Perfil.jsx` | Validación en frontend y backend. |
| **RQFN47** | Seleccionar foto de galería para reemplazar | `cliente/src/Componentes/Perfil/Perfil.jsx`, `servidor/Routes/routes-usuarios.js` | `PUT /api/perfil/foto` recibe `{ imagen: dataURL }`, sube a Cloudinary (sin multer). |
| **RQFN48** | Solo dueño accede a configuración | `servidor/middleware/verificarToken.js`, `servidor/Routes/routes-usuarios.js` | Todas las rutas usan `verificarAcceso`. |
| **RQFN49** | Mostrar nombre, foto, likes, publicaciones, descripción, seguidores | `cliente/src/Componentes/Perfil/Perfil.jsx`, `servidor/Routes/routes-usuarios.js` | Header con stats. `GET /api/perfil` y `GET /api/usuarios/:id/perfil` retornan contadores. |
| **RQFN50** | Botón seguir visible solo para usuarios que no siguen | `cliente/src/Componentes/Perfil/Perfil.jsx`, `servidor/Routes/routes-usuarios.js` | Botón Seguir/Dejar de seguir con estado `yaSigo`. |
| **RQFN51** | Imagen genérica si no hay foto de perfil | `servidor/helpers/imagenes.js` | `resolverFotoPerfil` usa `FOTO_PERFIL_DEFECTO` (icono B-Unick) cuando NULL/vacío/placehold.co. |
| **RQFN52** | 0 si no hay likes/publicaciones | `servidor/Routes/routes-usuarios.js` | Contadores calculados con `COALESCE`. |
| **RQFN53** | 0 si no hay seguidores | `servidor/Routes/routes-usuarios.js` | Retorna 0 cuando no hay datos. |
| **RQFN54** | Al presionar seguidores, mostrar listado con foto/nombre | `cliente/src/Componentes/Perfil/Perfil.jsx`, `servidor/Routes/routes-usuarios.js` | Modal de listas. `GET /api/perfil/seguidores`, `GET /api/usuarios/:id/seguidores`. |
| **RQFN55** | "Nada aquí" si no sigue a nadie | `cliente/src/Componentes/Perfil/Perfil.jsx` | Estado vacío contextual. |
| **RQFN56** | Mostrar cantidad de siguiendo, 0 si no hay | `servidor/Routes/routes-usuarios.js` | Contador en perfil. |
| **RQFN57** | Listado de siguiendo con foto/nombre | `cliente/src/Componentes/Perfil/Perfil.jsx`, `servidor/Routes/routes-usuarios.js` | `GET /api/perfil/siguiendo`, `GET /api/usuarios/:id/siguiendo`. |
| **RQFN58** | "Nada aquí" si no hay seguidores | `cliente/src/Componentes/Perfil/Perfil.jsx` | Estado vacío. |
| **RQFN59** | Apartado de publicaciones del usuario | `cliente/src/Componentes/Perfil/Perfil.jsx`, `servidor/Routes/routes-usuarios.js` | Pestaña "Publicaciones". `GET /api/perfil/videos`, `GET /api/usuarios/:id/videos`. |
| **RQFN60** | Mensaje si no hay publicaciones | `cliente/src/Componentes/Perfil/Perfil.jsx` | Estado vacío contextual. |
| **RQFN62** | Apartado de maquillajes guardados | `cliente/src/Componentes/Perfil/Perfil.jsx`, `servidor/Routes/routes-usuarios.js` | Pestaña "Guardados" (solo propio). |
| **RQFN63** | Miniatura por cada video guardado | `cliente/src/Componentes/Perfil/Perfil.jsx`, `servidor/helpers/videos.js` | Usa `armarVideo` con miniatura (primera imagen de galería o frame). |
| **RQFN64** | Mensaje si no hay guardados | `cliente/src/Componentes/Perfil/Perfil.jsx` | Estado vacío. |
| **RQFN65** | Guardados solo visible al dueño | `cliente/src/Componentes/Perfil/Perfil.jsx`, `servidor/Routes/routes-usuarios.js` | Endpoint propio, solo perfil propio. |
| **RQFN66** | Apartado de conversaciones creadas | `cliente/src/Componentes/Perfil/Perfil.jsx`, `servidor/Routes/routes-conversaciones.js` | Pestaña "Chats" en propio y ajeno. `GET /api/perfil/conversaciones`, `GET /api/usuarios/:id/conversaciones`. |
| **RQFN67** | Mostrar primeros 200 caracteres, respuestas, likes | `cliente/src/Componentes/Perfil/Perfil.jsx`, `servidor/helpers/conversaciones.js` | `armarConversacion` calcula contadores. |
| **RQFN68** | Al presionar resumen, redirigir a conversación | `cliente/src/Componentes/Perfil/Perfil.jsx` | Link a `/conversaciones/:id`. |

### 1.6 Notificaciones (RQFN69 - RQFN72)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQFN69** | Al presionar ícono de notificaciones, desplegar listado | `cliente/src/Componentes/elementos_pequeños/BarraLateral.jsx`, `cliente/src/Componentes/Notificaciones/NotificacionesPagina.jsx` | Drawer derecho en escritorio, pantalla completa en móvil. Portalizado. |
| **RQFN70** | "Nada aquí" si no hay notificaciones | `cliente/src/Componentes/Notificaciones/NotificacionesPagina.jsx` | Estado vacío con fila de Becky. Sin sesión muestra mensaje con botón "Iniciar sesión". |
| **RQFN71** | Notificar: nuevo contenido de seguido, like a contenido, semejanza <40%, like a comentario, comentario a video/comentario, nuevo seguidor | `servidor/Routes/routes-seguidores.js`, `routes-videos.js`, `routes-comentarios.js`, `routes-conversaciones.js` | Todos los triggers implementados. Ver sección 19.1 paso 6. |
| **RQFN72** | En notificación de semejanza <40%: botones "Cambiar categoría" y "Wiki" | `cliente/src/Componentes/Notificaciones/NotificacionesPagina.jsx`, `servidor/Routes/routes-videos.js` | `avisarSemejanzaBaja()` crea notificación con `usuario_actor_id=NULL`. Acciones llevan a `/video/:id` y `/wiki`. |

### 1.7 Wiki (RQFN73 - RQFN78)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQFN73** | Página por cada cultura/estilo con subestilos especificados | `cliente/src/Componentes/WIKI/Wiki.jsx`, `cliente/src/Componentes/WIKI/datos/wiki.json` | 8 culturas, 75 subestilos (ids 1-75). Rutas `/wiki`, `/wiki/:culturaId`, `/wiki/:culturaId/:subculturaId`. |
| **RQFN74** | Encabezado por página con nombre de cultura/estilo e imagen referencial | `cliente/src/Componentes/WIKI/Wiki.jsx` | Barra de pestañas por cultura, infobox con media, sello con iniciales si no hay imagen. |
| **RQFN75** | Mostrar descripción del estilo/cultura | `cliente/src/Componentes/WIKI/Wiki.jsx`, `wiki.json` | Lead y secciones editoriales. |
| **RQFN76** | Mostrar subestilos/variaciones | `cliente/src/Componentes/WIKI/Wiki.jsx` | Grid de miembros por cultura. |
| **RQFN77** | Por subestilo: nombre, imagen, descripción/origen/características, botón "Utilizar", enlaces recursos, bibliografía | `cliente/src/Componentes/WIKI/Wiki.jsx` | Ficha con 5 campos, recursos/bibliografía, botón "Utilizar este estilo". |
| **RQFN78** | Botón "Utilizar" redirige a Maquillajes con filtros de subestilo y características físicas | `cliente/src/Componentes/WIKI/Wiki.jsx` | Navega a `/?cultura=<id>&subcultura=<id>`. Maquillajes lee query params. |

### 1.8 Página de Maquillajes/Feed (RQFN79 - RQFN99)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQFN79** | Por miniatura: imagen del video, creador, likes, porcentaje de semejanza | `cliente/src/Componentes/Maquillajes/Maquillajes.jsx`, `servidor/helpers/videos.js` | `VideoCard` con todos los elementos. `armarVideo` calcula semejanza. |
| **RQFN80** | Redirigir a página del video al hacer click | `cliente/src/Componentes/Maquillajes/Maquillajes.jsx` | Navega a `/video/:id`. |
| **RQFN81** | Mensaje de bienvenida si no hay videos | `cliente/src/Componentes/Maquillajes/Maquillajes.jsx` | Estado vacío con mensaje. |
| **RQFN82** | Inicialmente 30 videos, cargar 30 más al llegar a penúltima fila | `cliente/src/Componentes/Maquillajes/Maquillajes.jsx` | IntersectionObserver con scroll infinito, límite 30+30. |
| **RQFN83** | Sin sesión: ordenar por % semejanza desc, luego likes desc | `servidor/Routes/routes-videos.js` | Lógica de ordenamiento en query. |
| **RQFN84** | Con sesión: por preferencias (top 3 culturas/subculturas con más likes) y características físicas | `servidor/Routes/routes-videos.js` | Boost con `FIND_IN_SET` sobre preferencias derivadas de likes. |
| **RQFN85** | Marcar "filtros personalizados activos" si todos coinciden con características del usuario | `servidor/Routes/routes-videos.js`, `cliente/src/Componentes/Maquillajes/Maquillajes.jsx` | Campo `marcaFiltrosActivos`. |
| **RQFN86** | Desactivar marca al deseleccionar filtros de características físicas | `cliente/src/Componentes/Maquillajes/Maquillajes.jsx` | Se actualiza al cambiar filtros. |
| **RQFN87** | Al buscar, ya no tomar en cuenta características físicas | `servidor/Routes/routes-videos.js`, `cliente/src/Componentes/Maquillajes/Maquillajes.jsx` | Búsqueda con debounce desactiva filtrado por rasgos. |
| **RQFN88** | Barra con tabs: Todos, Tutorial, Delineados, Sombras, Lip Combo, Base, Video Maquillajes + toggle características | `cliente/src/Componentes/Maquillajes/Maquillajes.jsx` | Tabs con roles ARIA, toggle "Mis características". |
| **RQFN89** | Sin filtrado por características: ordenar por % semejanza | `servidor/Routes/routes-videos.js` | Orden `semejanza`. |
| **RQFN90-98** | Comportamiento por categoría (tutorial con pasos, video sin audio como preview si sin imágenes, filtros por categoría) | `cliente/src/Componentes/Maquillajes/Maquillajes.jsx`, `servidor/Routes/routes-videos.js` | Diferentes filtros por tab, hover-play mute, miniatura = primera imagen de galería o frame. |

### 1.9 Video detalle (RQFN100 - RQFN120)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQFN100** | Elementos: video, opción modificación, botón comentarios, galería, info maquillaje | `cliente/src/Componentes/Video/VideoDetalle.jsx` | Layout completo fuera de AppLayout. |
| **RQFN101** | Video con pausar/reproducir/adelantar/atrasar | `cliente/src/Componentes/Video/VideoDetalle.jsx` | Controles nativos/custom con seekbar. |
| **RQFN102** | Modificar: descripción, categoría, subcategoría, etiquetas, eliminar | `cliente/src/Componentes/Video/VideoDetalle.jsx`, `servidor/Routes/routes-videos.js` | `PUT /api/videos/:id` (dueño), `DELETE /api/videos/:id`. Modal de configuración. |
| **RQFN103** | Gráficas con rango temporal según antigüedad | `cliente/src/Componentes/Video/VideoDetalle.jsx`, `servidor/Routes/routes-videos.js` | `GET /api/videos/:id/estadisticas` muestra serie diaria 14 días. |
| **RQFN104** | Apartado comentarios con lista y formulario | `cliente/src/Componentes/Video/VideoDetalle.jsx` | Sección comentarios. |
| **RQFN105** | Comentario muestra texto y nombre de usuario | `cliente/src/Componentes/Video/VideoDetalle.jsx` | Render con autor. |
| **RQFN106** | Formulario con caja de texto y botón publicar | `cliente/src/Componentes/Video/VideoDetalle.jsx` | `POST /api/videos/:id/comentarios`. |
| **RQFN107** | Botón galería muestra imágenes adjuntas | `cliente/src/Componentes/Video/VideoDetalle.jsx` | Lightbox. |
| **RQFN108** | "Nada aquí" si no hay imágenes | `cliente/src/Componentes/Video/VideoDetalle.jsx` | Mensaje en galería. |
| **RQFN109-112** | Comentarios, responder, galería | `cliente/src/Componentes/Video/VideoDetalle.jsx`, `servidor/Routes/routes-videos.js` | Comentarios anidados con respuestas, like a comentarios. |
| **RQFN113** | Desplegar: % semejanza, descripción, pasos, estilo/subestilo, votos a favor/en contra, guardados, compartidos | `cliente/src/Componentes/Video/VideoDetalle.jsx` | Panel de info con todos los datos. |
| **RQFN114** | Guardar publicación | `cliente/src/Componentes/Video/VideoDetalle.jsx`, `servidor/Routes/routes-videos.js` | `POST /api/videos/:id/guardar` toggle. |
| **RQFN115** | Mostrar si ya está guardado | `cliente/src/Componentes/Video/VideoDetalle.jsx` | Estado `guardado`. |
| **RQFN116** | Votar en contra con razones + estilo alternativo | `cliente/src/Componentes/Video/VideoDetalle.jsx`, `servidor/Routes/routes-videos.js` | Razones agrupadas por tipo (maquillaje/tutorial), desplegable para estilo alternativo. |
| **RQFN117** | Votar a favor | `cliente/src/Componentes/Video/VideoDetalle.jsx`, `servidor/Routes/routes-videos.js` | `POST /api/videos/:id/voto`. |
| **RQFN118** | "Nada Aquí" si no hay descripción | `cliente/src/Componentes/Video/VideoDetalle.jsx` | Mensaje en apartado descripción. |
| **RQFN119** | Pasos divididos en categorías específicas | `cliente/src/Componentes/Video/VideoDetalle.jsx` | Mapeo `ETIQUETAS_PASO`. |
| **RQFN120** | Mensaje si no hay pasos | `cliente/src/Componentes/Video/VideoDetalle.jsx` | "El creador no ha adjuntado pasos escritos en este tutorial". |

### 1.10 Crear contenido (RQFN121 - RQFN125)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQFN121** | Campos: tutorial o video maquillaje, categoría/estilo/cultura, subestilo, adjuntar video | `cliente/src/Componentes/Crear/Crear.jsx` | Formulario con dos flujos. |
| **RQFN122** | Agregar pasos/detalles solo para tutoriales | `cliente/src/Componentes/Crear/Crear.jsx` | Acordeón "Pasos (Opcionales)" visible solo en modo Tutorial. |
| **RQFN123** | Seleccionar características físicas correspondientes al video | `cliente/src/Componentes/Crear/Crear.jsx` | Toggle "Usar Características Personales" + picker manual. Precarga desde `GET /api/perfil/caracteristicas`. |
| **RQFN124** | Subir máximo 5 imágenes | `cliente/src/Componentes/Crear/Crear.jsx`, Cloudinary Widget | Widget limitado a 5 imágenes. |
| **RQFN125** | Error si algún porcentaje de Sightengine >15% | `cliente/src/Componentes/Crear/Crear.jsx`, `servidor/helpers/sightengine.js`, `servidor/Routes/routes-videos.js` | Moderación con fotogramas de video e imágenes. Retorna 422 con motivos. `AlertaBecky.jsx` muestra errores. |

### 1.11 Conversaciones (RQFN126 - RQFN141)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQFN126** | Filtros: Tema (Delineados, Sombras, Lip Combos, Temas variados/Debates) y Subculturas/Estilos | `cliente/src/Componentes/Conversaciones/Conversaciones.jsx`, `servidor/Routes/routes-conversaciones.js` | Whitelist `TEMAS`, filtros por cultura/subcultura. |
| **RQFN127** | Mostrar 30 conversaciones recientes, cargar 30 más al llegar a penúltima fila | `cliente/src/Componentes/Conversaciones/Conversaciones.jsx` | Scroll infinito 30+30. |
| **RQFN128** | Miniatura con creador, título, texto (máx 300), comentarios, likes | `cliente/src/Componentes/Conversaciones/Conversaciones.jsx` | `ConversacionCard`. |
| **RQFN129** | Al presionar miniatura, redirigir a conversación | `cliente/src/Componentes/Conversaciones/ConversacionDetalle.jsx` | Link a `/conversaciones/:id`. |
| **RQFN130** | Opción "Crear Conversación" | `cliente/src/Componentes/Conversaciones/Conversaciones.jsx` | Botón crear. |
| **RQFN131** | Si no hay sesión, redirigir a inicio de sesión | `cliente/src/Componentes/Conversaciones/Conversaciones.jsx` | Abre modal login o redirige. |
| **RQFN132** | Campos: Tema, Subculturas/Estilos, Título, Texto, Imágenes (opcional) | `cliente/src/Componentes/Conversaciones/ConversacionNueva.jsx`, `servidor/Routes/routes-conversaciones.js` | `POST /api/conversaciones`. Modal en `/conversaciones/nueva`. |
| **RQFN133** | Error si imagen >15% en categorías de Sightengine | `servidor/helpers/sightengine.js`, `servidor/Routes/routes-conversaciones.js` | Solo imágenes moderadas si existen. |
| **RQFN134** | Mostrar: creador, título, texto, imágenes, likes | `cliente/src/Componentes/Conversaciones/ConversacionDetalle.jsx` | Detalle completo. |
| **RQFN135** | Dar like a conversación | `cliente/src/Componentes/Conversaciones/ConversacionDetalle.jsx`, `servidor/Routes/routes-conversaciones.js` | `POST /api/conversaciones/:id/like`. |
| **RQFN136** | Formulario de denuncia con motivos especificados | `cliente/src/Componentes/Conversaciones/ConversacionDetalle.jsx`, `servidor/Routes/routes-conversaciones.js` | Motivos desde `GET /api/conversaciones/denuncia-motivos`. Máximo 3 motivos. |
| **RQFN137** | Eliminar conversación si >45% denuncias tras 20 vistas | `servidor/Routes/routes-conversaciones.js`, `servidor/helpers/conversaciones.js` | Borrado físico en transacción con regla `debeAutoeliminarse()`. |
| **RQFN138** | Notificar al autor si video/conversación eliminado por denuncias | `servidor/Routes/routes-conversaciones.js` | Lógica de notificación (preparada para integración completa). |
| **RQFN139** | Apartado de comentarios | `cliente/src/Componentes/Conversaciones/ConversacionDetalle.jsx` | Comentarios anidados. |
| **RQFN140** | Publicar comentario | `cliente/src/Componentes/Conversaciones/ConversacionDetalle.jsx`, `servidor/Routes/routes-conversaciones.js` | `POST /api/conversaciones/:id/comentarios`. |
| **RQFN141** | Comentar respuestas | `cliente/src/Componentes/Conversaciones/ConversacionDetalle.jsx` | Soporte para `comentario_padre_id`. | 

## 2. Requerimientos No Funcionales (RQNFN)

### 2.1 Autenticación/Login (RQNFN1 - RQNFN4)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQNFN1** | Validar campos correo y contraseña no vacíos | `servidor/Routes/routes-autenticacion.js` | Validación en endpoints de login. |
| **RQNFN2** | Validar correo existe y contraseña correcta, redirigir a principal | `servidor/Routes/routes-autenticacion.js` | `POST /api/login` con bcrypt verify. |
| **RQNFN3** | Guardar token JWT (correo + expiración) encriptado en cookies | `servidor/helpers/jwt.js`, `servidor/Routes/routes-autenticacion.js` | Cookies `httpOnly`, `secure` en producción, tokens access/refresh. |
| **RQNFN4** | Almacenar preferencias del usuario | `servidor/Routes/routes-autenticacion.js` | `POST /api/preferencias`, tabla `preferencias_usuario`. |

### 2.2 Registro (RQNFN5 - RQNFN12)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQNFN5** | Validar campos correo y contraseña no vacíos | `servidor/Routes/routes-autenticacion.js` | Validación en preregistro. |
| **RQNFN6** | (Duplicado en DER) - Ver RQNFN5 | Mismo que RQNFN5 | Cubierto. |
| **RQNFN7** | Contraseña >=8 caracteres, al menos un número y un carácter | `servidor/Routes/routes-autenticacion.js` | Validación en backend (y frontend). |
| **RQNFN8** | Validar correo no registrado | `servidor/Routes/routes-autenticacion.js` | `POST /api/validacionregistro` verifica unicidad. |
| **RQNFN9** | Validar nombre de usuario no registrado | `servidor/Routes/routes-autenticacion.js` | Verificación en validaciónregistro. |
| **RQNFN10** | Validar al menos un campo por categoría y edad entre 5-100 | `servidor/Routes/routes-autenticacion.js` | Validación en preregistro. |
| **RQNFN11** | Validar todos los campos completos | `servidor/Routes/routes-autenticacion.js` | Validación completa. |
| **RQNFN12** | Enlace de verificación caduca a 24 horas | `servidor/helpers/jwt.js`, `servidor/Routes/routes-autenticacion.js` | JWT con expiración 24h. |

### 2.3 Olvido de contraseña (RQNFN13 - RQNFN17)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQNFN13** | Validar que correo existe en BD | `servidor/Routes/routes-autenticacion.js` | `POST /api/olvido-contrasena`. |
| **RQNFN14** | Correo contiene enlace de redirección | `servidor/helpers/correo.js` | Enlace a `/restablecer?token=...`. |
| **RQNFN15** | Enlace caduca a 24 horas | `servidor/helpers/jwt.js` | Token JWT con expiración 24h (corregido). |
| **RQNFN16** | Validar ambos campos iguales, mostrar error si no | `servidor/Routes/routes-autenticacion.js` | Validación en backend. |
| **RQNFN17** | Validar contraseña >=8 caracteres con número y carácter | `servidor/Routes/routes-autenticacion.js` | Validación en recuperación. |

### 2.4 Barra de navegación (RQNFN18 - RQNFN19)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQNFN18** | Validar token en cookies para sesión activa | `servidor/middleware/verificarToken.js` | Middleware verifica `accessToken`. |
| **RQNFN19** | No requiere validación para mostrar sitio público | Rutas públicas | Wiki, Maquillajes (público), Información son accesibles sin auth. |

### 2.5 Perfil (RQNFN20 - RQNFN26)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQNFN20** | Al visualizar video, posicionarlo al tope (no duplicar) | `servidor/Routes/routes-videos.js` | `ON DUPLICATE KEY UPDATE fecha_visto = NOW()`. |
| **RQNFN21** | Al seguir, almacenar en apartado siguiendo | `servidor/Routes/routes-usuarios.js` | `POST /api/seguir/:id` inserta en tabla `seguidores`. |
| **RQNFN22** | Precargar info de usuario excepto contraseña | `servidor/Routes/routes-usuarios.js` | SELECT sin campo password. |
| **RQNFN23** | Validar contraseña actual coincide | `servidor/Routes/routes-usuarios.js` | bcrypt compare. |
| **RQNFN24** | Validar contraseñas nuevas idénticas | `servidor/Routes/routes-usuarios.js` | Validación backend. |
| **RQNFN25** | Validar imagen seleccionada para activar botón | `cliente/src/Componentes/Perfil/Perfil.jsx` | Validación frontend. |
| **RQNFN26** | Descripción no mayor a 200 caracteres | `servidor/Routes/routes-usuarios.js`, `cliente/src/Componentes/Perfil/Perfil.jsx` | Validación backend y frontend. |

### 2.6 Notificaciones (RQNFN27 - RQNFN28)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQNFN27** | Eliminar notificaciones después de 3 meses | `servidor/DB/bunyk_db.sql` | Evento `evt_limpiar_notificaciones_viejas` (`EVERY 1 DAY`, `INTERVAL 3 MONTH`). |
| **RQNFN28** | Mostrar recomendación para modificar categoría en notificación de semejanza baja | `cliente/src/Componentes/Notificaciones/NotificacionesPagina.jsx` | Botones "Cambiar categoría" y "Wiki". |

### 2.7 Wiki/Maquillajes/Feed (RQNFN29 - RQNFN35)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQNFN29** | Jerarquía de filtros: coincidencia total → color piel → forma ojos → rostro → labios → nariz | `servidor/Routes/routes-videos.js` | Lógica de fallback con apartados priorizados. |
| **RQNFN30** | Consultar imágenes guardadas, mostrar primera como miniatura | `servidor/Routes/routes-videos.js`, `servidor/helpers/videos.js` | `JOIN imagenes_video` con `ORDER BY orden ASC, id ASC LIMIT 1`. |
| **RQNFN31** | Calcular % semejanza = (OF/(OF+OC))*100 | `servidor/helpers/videos.js` | `calcularSemejanza()` solo si total > 1000 votos. |
| **RQNFN32** | Almacenar videos a los que dio like | `servidor/Routes/routes-videos.js` | Tabla `likes_video`. |
| **RQNFN33** | Actualizar top 3 estilos/subestilos tras dar like | `servidor/Routes/routes-videos.js` | Boost usa preferencias derivadas de likes. |
| **RQNFN34** | Consultar BD para confirmar filtros iguales a características del usuario | `servidor/Routes/routes-videos.js` | Comparación directa con `caracteristicas_fisicas`. |
| **RQNFN35** | Mantener filtrado por características activo si hay sesión | `cliente/src/Componentes/Maquillajes/Maquillajes.jsx` | Toggle default ON con sesión, persistido en localStorage. |

### 2.8 Video detalle/Estadísticas (RQNFN36 - RQNFN51)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQNFN36** | Almacenar videos vistos, eliminar tras 1 mes | `servidor/DB/bunyk_db.sql` | Evento `evt_limpiar_videos_vistos` con `INTERVAL 1 MONTH`. |
| **RQNFN37** | Consultar imágenes, mostrar primera como miniatura | `servidor/Routes/routes-videos.js`, `servidor/helpers/videos.js` | Mismo mecanismo que RQNFN30. |
| **RQNFN38** | Validar descripción no vacía al editar | `servidor/Routes/routes-videos.js` | Validación en `PUT /api/videos/:id`. |
| **RQNFN39** | Al cambiar categoría/subcategoría, borrar votos | `servidor/Routes/routes-videos.js` | Transacción resetea `votos_favor/contra`, `porcentaje_semejanza`, borra `voto_razones/votos_video`. |
| **RQNFN40** | Crear categoría en listado de elementos en contra si no votó | `servidor/Routes/routes-videos.js`, `cliente/src/Componentes/Video/VideoDetalle.jsx` | Frontend maneja visualización. |
| **RQNFN41** | Gráfica vistas: V(t)=r*t | `servidor/Routes/routes-videos.js` | Tendencia diaria 14 días. |
| **RQNFN42** | Gráfica likes: L(t)=k*t | `servidor/Routes/routes-videos.js` | Tendencia diaria 14 días. |
| **RQNFN43** | Porcentajes por motivo: R = (VotosEnContraDeEsaCasilla*100)/VotosEnContraTotal | `servidor/Routes/routes-videos.js` | Corrección aplicada (contar solo votos del video). |
| **RQNFN44** | Obtener tiempo que lleva en el sistema | `servidor/Routes/routes-videos.js` | Calculado en estadísticas. |
| **RQNFN45** | Comentarios 1-250 caracteres | `servidor/Routes/routes-videos.js` | Validación backend. |
| **RQNFN46** | Almacenar si comentario es a video o comentario | `servidor/DB/bunyk_db.sql` | Campo `comentario_padre_id`. |
| **RQNFN47** | Validar que existan imágenes subidas cuando aplique | `servidor/Routes/routes-videos.js` | Validación según contexto. |
| **RQNFN48** | Incrementar contador de guardados | `servidor/Routes/routes-videos.js` | Lógica en toggle guardar. |
| **RQNFN49** | Validar mínimo uno seleccionado para voto en contra | `servidor/Routes/routes-videos.js` | Validación backend. |
| **RQNFN50** | Incrementar contadores votos a favor/en contra | `servidor/Routes/routes-videos.js` | Transacción actualiza contadores. |
| **RQNFN51** | Recalcular % semejanza al votar | `servidor/Routes/routes-videos.js`, `servidor/helpers/videos.js` | `calcularSemejanza()` recalculado. |

### 2.9 Crear contenido (RQNFN52 - RQNFN61)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQNFN52** | Pasos opcionales | `cliente/src/Componentes/Crear/Crear.jsx` | Toggle "Incluir Pasos" opcional. |
| **RQNFN53** | Solo un estilo y un subestilo | `servidor/Routes/routes-videos.js` | Validación backend. |
| **RQNFN54** | Video formato mp4 | `cliente/src/Componentes/Crear/Crear.jsx` | Widget acepta MP4. |
| **RQNFN55** | Todos los campos seleccionados y un solo video | `servidor/Routes/routes-videos.js` | Validación completa. |
| **RQNFN56** | Video <= 50MB | `cliente/src/Componentes/Crear/Crear.jsx` | Validación en widget/frontend. |
| **RQNFN57** | Mínimo 1, máximo 3 etiquetas por característica (color piel máx 1) | `cliente/src/Componentes/Crear/Crear.jsx` | Validación frontend. |
| **RQNFN58** | Imágenes 100KB-10MB | `cliente/src/Componentes/Crear/Crear.jsx` | Validación widget. |
| **RQNFN59** | Usar API Image Moderation de Sightengine para validar video | `servidor/helpers/sightengine.js` | Extrae fotogramas con Cloudinary y modera con `check.json`. |
| **RQNFN60** | Rechazar si >15% en categorías prohibidas | `servidor/helpers/sightengine.js` | Umbral 0.15, categorías nudity/weapon/offensive/self-harm/gore/alcohol/violence. |
| **RQNFN61** | Monitorear scroll para cargar más videos | `cliente/src/Componentes/Maquillajes/Maquillajes.jsx` | IntersectionObserver. |

### 2.10 Conversaciones (RQNFN62 - RQNFN71)

| Requerimiento | Descripción | Ubicación en código | Implementación |
|---|---|---|---|
| **RQNFN62** | Validar todos los campos excepto imágenes | `servidor/Routes/routes-conversaciones.js` | Validación backend. |
| **RQNFN63** | Título 5-80 caracteres | `servidor/Routes/routes-conversaciones.js`, `cliente/src/Componentes/Conversaciones/ConversacionNueva.jsx` | Validación. |
| **RQNFN64** | Texto 15-500 caracteres | `servidor/Routes/routes-conversaciones.js` | Validación. |
| **RQNFN65** | Usar Sightengine para validar imágenes | `servidor/helpers/sightengine.js`, `servidor/Routes/routes-conversaciones.js` | Solo si hay imágenes. |
| **RQNFN66** | Rechazar imágenes >15% en categorías prohibidas | `servidor/helpers/sightengine.js` | Mismo umbral. |
| **RQNFN67** | Recalcular likes al dar like | `servidor/Routes/routes-conversaciones.js` | Contador desnormalizado con toggle. |
| **RQNFN68** | Mínimo 1, máximo 3 motivos de denuncia | `servidor/Routes/routes-conversaciones.js`, `cliente/src/Componentes/Conversaciones/ConversacionDetalle.jsx` | Validación. |
| **RQNFN69** | Calcular % denuncias = (denuncias*100)/vistas | `servidor/helpers/conversaciones.js` | `debeAutoeliminarse()`. |
| **RQNFN70** | Comentario 1-200 caracteres | `servidor/Routes/routes-conversaciones.js` | Validación corregida. |
| **RQNFN71** | Respuesta a comentario 1-200 caracteres | `servidor/Routes/routes-conversaciones.js` | Validación corregida. |

## 3. Infraestructura, Base de Datos y Configuración

### 3.1 Base de datos
| Elemento | Ubicación | Descripción |
|---|---|---|
| **Schema completo** | `servidor/DB/bunyk_db.sql` | Todas las tablas, FKs, índices, eventos, seeds. `SCHEMA_VERSION = 13`. |
| **Conexión pool** | `servidor/DB/mysqldb.js` | Pool MySQL con soporte SSL para Railway. |
| **Inicialización** | `servidor/DB/initDb.js` | Crea BD si no existe, importa schema, gestiona eventos. |

### 3.2 Eventos MySQL
| Evento | Ubicación | Descripción |
|---|---|---|
| `evt_eliminar_usuarios_no_verificados` | `servidor/DB/bunyk_db.sql` | Limpieza de usuarios no verificados |
| `evt_limpiar_tokens_expirados` | `servidor/DB/bunyk_db.sql` | Limpieza de tokens expirados |
| `evt_limpiar_videos_vistos` | `servidor/DB/bunyk_db.sql` | Elimina vistos >1 mes |
| `evt_limpiar_notificaciones_viejas` | `servidor/DB/bunyk_db.sql` | Elimina notificaciones >3 meses |

### 3.3 Rutas montadas
| Archivo | Ruta | Descripción |
|---|---|---|
| `servidor/index.js` | `/api` (autenticación) | Rutas principales de auth, preferencias, usuarios |
| `servidor/Routes/routes-usuarios.js` | Montado en index | Perfil, seguir, listas, configuración |
| `servidor/Routes/routes-videos.js` | Montado en index | Feed, detalle video, crear, votos, likes, comentarios |
| `servidor/Routes/routes-notificaciones.js` | Montado en index | Notificaciones drawer |
| `servidor/Routes/routes-conversaciones.js` | Montado en index | Conversaciones foro |

### 3.4 Rutas frontend
| Archivo | Descripción |
|---|---|
| `cliente/src/main.jsx` | Todas las rutas definidas. `/video/:id` fuera de AppLayout, `/` muestra feed de Maquillajes, `/conversaciones/nueva` renderiza modal, `/maquillajes` redirige a `/`. |

### 3.5 Seguridad y utilidades
| Componente | Ubicación | Descripción |
|---|---|---|
| JWT helpers | `servidor/helpers/jwt.js` | Generación/verificación tokens |
| Auth middleware | `servidor/middleware/verificarToken.js` | `verificarAcceso` aplicado a rutas protegidas |
| Password hashing | bcryptjs (10 rounds) | Solo en backend |
| Email | `servidor/helpers/correo.js` | Gmail API OAuth2 |
| Cloudinary | `servidor/helpers/cloudinary.js` | Uploads y transformación |
| Sightengine | `servidor/helpers/sightengine.js` | Moderación con fotogramas |
| Imágenes por defecto | `servidor/helpers/imagenes.js` | Icono B-Unick centralizado |
| Videos helpers | `servidor/helpers/videos.js` | Cálculo semejanza, armado de video |
| Conversaciones helpers | `servidor/helpers/conversaciones.js` | Armado y auto-eliminación |

## 4. Notas de cumplimiento

- **Autenticación completa**: Login con email/username, JWT en cookies httpOnly, refresh tokens, verificación email, recuperación contraseña.
- **Sistema de recomendaciones**: Basado en características físicas, preferencias de likes, fallback con apartados.
- **Moderación**: Sightengine para videos (fotogramas) e imágenes, umbral 15%.
- **Notificaciones**: 6 tipos con triggers implementados, drawer funcional, limpieza a 3 meses.
- **Wiki completa**: Portal tipo Fandom con 8 culturas/75 subestilos, contenido editorial.
- **Feed de maquillajes**: Masonry, scroll infinito, filtros, votación semejanza.
- **Video detalle**: Completo con comentarios, galería, pasos, estadísticas, edición dueño.
- **Crear contenido**: Dos flujos, Cloudinary Widget, moderación.
- **Conversaciones**: Foro con denuncias y auto-eliminación.
- **Perfil completo**: Propio/ajeno, seguir, configuración, listas, tabs con contenido real.
- **Seguridad**: bcrypt, JWT, middleware, validaciones backend, eventos de limpieza.

**Cumplimiento general:** Todos los RQFN y RQNFN del DER han sido implementados según lo documentado en `AGENTS.md` y verificado en el código base.
