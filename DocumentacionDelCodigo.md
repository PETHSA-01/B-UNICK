# Documentación Técnica del Código Frontend - B-unick

## Introducción

Este documento describe la arquitectura y el funcionamiento interno de los componentes del frontend de B-unick, una plataforma social para contenido de maquillaje enfocada en culturas urbanas. El frontend está construido con React 18, Vite como bundler y React Router para navegación. Se comunica con el backend Express mediante una API REST expuesta en `/api` a través de un proxy de Vite.

## Arquitectura General

### Estructura de Carpetas

```
cliente/src/
├── api/
│   └── axios.js                 # Cliente HTTP configurado con interceptores
├── context/
│   └── AuthContext.jsx          # Contexto de autenticación global
├── layout/
│   ├── AppLayout.jsx            # Wrapper de layout con barra lateral
│   └── AppLayout.css            # Clase `app-main` (margen lateral + padding móvil)
├── Componentes/
│   ├── Inicio/                  # Página principal (login/registro)
│   ├── InicioDeSesion/          # Módulo de autenticación
│   ├── Registro/                # Wizard de registro (7 pasos)
│   │   └── CaracteristicasFisicasComponentes/
│   ├── Conversaciones/          # Placeholder conversaciones
│   ├── Crear/                   # Placeholder crear contenido
│   ├── WIKI/                    # Placeholder wiki
│   ├── Perfil/                  # Página de perfil completa (RQFN41-56)
│   └── elementos_pequeños/      # Componentes UI reutilizables
└── main.jsx                     # Punto de entrada y rutas
```

### Patrones de Diseño Utilizados

**Context Pattern**: `AuthContext` provee estado de autenticación global (`user`, `loading`, `isAuthenticated`, `login`, `logout`, `refreshUser`, `cookieConsent`, `setCookieConsent`) a toda la aplicación mediante `AuthProvider` en `main.jsx`.

**Forward Ref + Imperative Handle**: `Notificaciones` expone `addNotification` y `removeNotification` al padre vía `useImperativeHandle`, permitiendo disparar notificaciones sin que el padre gestione estado interno. Adicionalmente, acepta los props opcionales `cookieConsent`, `onCookieAccept` y `onCookieReject` para gestionar la tarjeta toast de consentimiento de cookies (RQFN1-2) cuando el consentimiento está pendiente; si el padre no los pasa, el componente los resuelve por defecto desde `AuthContext` (fallback), de modo que la tarjeta aparece en cualquier montaje de `Notificaciones`.

**Wizard Pattern (State Machine)**: El registro implementa una máquina de estados de 7 pasos (`InicioFormularioCF` → `OjosFormulario` → `NarizFormulario` → `CaraFormulario` → `ColoresFormulario` → `BocaFormulario` → `TiposPielFormulario` → `EdadFormulario`). Cada paso recibe `datosUsuario` (objeto mutado por referencia), `onClose` (vuelve al paso anterior), `notificationsRef` y `closeAll` (callback para cerrar toda la cadena).

**Portal Rendering**: `BarraLateral` usa `createPortal` (de `react-dom`) para renderizar los modales de inicio de sesión y registro en `document.body`, evitando problemas de `z-index` y `overflow` del contenedor padre. `Notificaciones` ya no usa portales: la solicitud de consentimiento de cookies se renderiza como una tarjeta toast dentro de su propio contenedor `.notificaciones-container`.

**Conditional Rendering por Ruta**: `AppLayout` y `BarraLateral` retornan `null` o solo `<Outlet />` cuando `location.pathname === '/verificar-correo'`, ocultando la navegación en la página de verificación.

**Patrón de Consentimiento de Cookies**: El consentimiento de cookies (RQFN1-2) se implementa como una notificación toast estilo "Becky te ha mandado un mensaje" gestionada por el componente `Notificaciones`, con persistencia de la aceptación en `localStorage`. El patrón consta de:
- Estado del consentimiento alojado en `AuthContext`, inicializado con un lazy initializer que lee `localStorage.getItem('cookie-consent')` dentro de un `try/catch` (`null` si la clave no existe o el valor es inválido)
- Significados del estado: `null` = sin decisión (se vuelve a preguntar), `{ accepted: true, timestamp }` = aceptado (persistido en `localStorage`), `{ accepted: false, timestamp }` = rechazado solo para la sesión actual (no persiste)
- Resolución del estado por parte de `Notificaciones`: si el padre pasa las props `cookieConsent`, `onCookieAccept` y `onCookieReject`, se usan tal cual; si no, el componente las deriva de `AuthContext` como fallback (`resolvedConsent = cookieConsent !== undefined ? cookieConsent : auth.cookieConsent`, y `resolvedAccept`/`resolvedReject` que apuntan a las props `onCookieAccept`/`onCookieReject` o a `auth.setCookieConsent`), de modo que la tarjeta toast aparece en todos los puntos donde se monta `Notificaciones`, sin exigir que el padre inyecte las props
- Detección de si debe mostrarse la tarjeta mediante `hasConsent = resolvedConsent?.accepted === true` y `shouldShowCookieToast = !hasConsent && !cookieToastDismissed` en `Notificaciones`
- Tarjeta toast renderizada como `<article className="notificacion notif-cookie">` dentro del `.notificaciones-container`, con header (logo, título "B-unick", botón ✕ que equivale a rechazar), body con gif `/hi.gif` (`.notif-emoji`) y título "Becky te ha mandado un mensaje", y fila de botones `.cookie-consent-buttons` con "Aceptar todo" (`cookie-consent-btn--primary`) y "Rechazar todo" (`cookie-consent-btn--danger`)
- Al decidir, la tarjeta invoca los callbacks resueltos `resolvedAccept` u `resolvedReject` con `{accepted, timestamp}`, que actualizan el estado en `AuthContext` vía `setCookieConsent`; `handleReject` además marca `cookieToastDismissed = true` para cerrar la tarjeta en ese montaje
- Persistencia selectiva: `setCookieConsentFromChild` persiste en `localStorage` solo cuando `accepted === true`; el rechazo no se persiste, por lo que se vuelve a preguntar en cada montaje nuevo del componente (login, registro, rutas) y en cada nueva sesión
- Filtrado de notificaciones de cookies en `Notificaciones` mientras no hay consentimiento: `addNotification` descarta las notificaciones cuyo título es `'Becky te ha mandado un mensaje'` y cuyo mensaje incluye `'cookies'`

### Cliente HTTP (axios.js)

El archivo `cliente/src/api/axios.js` exporta una instancia de Axios configurada con:
- `baseURL: '/api'` (proxy de Vite a `http://localhost:3000`)
- `withCredentials: true` para enviar cookies httpOnly
- `validateStatus: status < 400` para tratar 409 como respuesta válida (necesario para validación de registro)

**Interceptor de respuesta**: Maneja renovación automática de access token ante 401. Mantiene cola de peticiones fallidas (`failedQueue`) y bandera `isRefreshing` para evitar múltiples llamadas concurrentes a `/refresh`. Si `/refresh` falla, rechaza toda la cola y propaga el error. **Nota**: el endpoint `/refresh` no está implementado en el backend al momento de esta documentación.

## Contexto de Autenticación (AuthContext.jsx)

### Propósito
Centraliza la lógica de autenticación: verificación de sesión al cargar la app, login, logout y exposición de estado/reactividad a componentes consumidores. Además gestiona el estado de consentimiento de cookies, inicializándolo desde `localStorage` cuando existe una aceptación previa; la visualización de la tarjeta toast queda a cargo del componente `Notificaciones`.

### Variables y Estado
- `user` (object|null): datos del usuario autenticado (`id`, `email`, `username`, `fotoPerfil`, `descripcion`, `correo_verificado`). El campo `fotoPerfil` viene resuelto por el backend con el icono predeterminado de B-Unick cuando el usuario no tiene foto personalizada (ver "Helper de imágenes del backend")
- `loading` (boolean): `true` durante la verificación inicial con `/api/me`
- `isAuthenticated` (boolean): derivado de `!!user`
- `cookieConsent` (object|null): datos de consentimiento de cookies; se inicializa con un lazy initializer que lee `localStorage.getItem('cookie-consent')` dentro de un `try/catch` (si la clave no existe o el JSON es inválido, queda `null`). `null` = sin decisión (se vuelve a preguntar), `{ accepted: true, timestamp }` = aceptación persistida en `localStorage`, `{ accepted: false, timestamp }` = rechazo válido solo para la sesión actual (no persiste)
- `setCookieConsent` (function): actualizador del estado de consentimiento expuesto al consumidor (implementado como `setCookieConsentFromChild`)

### Funciones Exportadas

**fetchUser** (useCallback)
- Qué hace: invoca `GET /api/me` para validar cookie `accessToken` y obtener datos de usuario
- Cómo lo hace: `await api.get('/me')`; en éxito guarda `response.data.user` en `setUser`; en error o sin usuario establece `null`; siempre finaliza con `setLoading(false)`
- Quién la invoca: `useEffect` al montar `AuthProvider`; `refreshUser` expuesto al consumidor
- Qué entrega: actualiza estado interno `user` y `loading`
- Qué invoca: `api.get('/me')`

**setCookieConsentFromChild** (useCallback)
- Qué hace: actualiza el estado del consentimiento de cookies cuando el usuario decide en la tarjeta toast gestionada por `Notificaciones` y, en caso de aceptación, persiste la decisión en `localStorage`
- Cómo lo hace: recibe `consentData` (objeto `{accepted, timestamp}`) y lo pasa directamente a `setCookieConsent(consentData)`; solo si `consentData.accepted === true` ejecuta `localStorage.setItem('cookie-consent', JSON.stringify(consentData))` dentro de un `try/catch` (los errores de almacenamiento se ignoran). El rechazo (`accepted: false`) NO se persiste: queda únicamente para la sesión actual y se vuelve a preguntar
- Quién la invoca: `Notificaciones` mediante los callbacks `onCookieAccept` y `onCookieReject` cuando el padre los pasa, o a través de los callbacks resueltos `resolvedAccept`/`resolvedReject` (que apuntan a `auth.setCookieConsent`) cuando el padre no los pasa, desde los botones "Aceptar todo"/"Rechazar todo" y desde el botón ✕ de la tarjeta
- Qué entrega: actualiza el estado `cookieConsent`; al recibir una aceptación, `Notificaciones` deja de mostrar la tarjeta y la decisión queda persistida para futuras sesiones
- Nota: se expone en el value del provider con el nombre `setCookieConsent`

**logout** (useCallback)
- Qué hace: cierra sesión llamando `POST /api/logout` y limpia estado local
- Cómo lo hace: `try { await api.post('/logout') } catch { /* ignora */ } finally { setUser(null) }`
- Quién la invoca: componentes que consumen `useAuth()` (ej. `BarraLateral` no la usa directamente aún)
- Qué entrega: estado `user = null`
- Qué invoca: `api.post('/logout')` (endpoint no implementado en backend)

**login** (useCallback)
- Qué hace: establece usuario en estado tras login exitoso
- Cómo lo hace: `setUser(userData)` recibido como argumento
- Quién la invoca: `InicioSesion` tras respuesta exitosa de `/api/login`
- Qué entrega: actualiza `user` e `isAuthenticated`

**useAuth** (hook)
- Qué hace: consumidor del contexto; lanza error si se usa fuera de `AuthProvider`
- Qué entrega: objeto `{ user, loading, isAuthenticated, login, logout, refreshUser, cookieConsent, setCookieConsent }`

## Layout y Navegación

### AppLayout.jsx

**Propósito**: Wrapper que inyecta `BarraLateral` y provee `<Outlet />` para rutas anidadas con margen lateral definido por CSS externo.

**Variables**: `location` (hook `useLocation`). También importa `./AppLayout.css`, que define la clase `app-main` usada en el `<main>`.

**Lógica**: Si `location.pathname === '/verificar-correo'` retorna solo `<Outlet />` sin sidebar ni margen. En otro caso renderiza `<BarraLateral />` y `<main className="app-main"><Outlet /></main>`. El margen lateral ya no se aplica con estilo inline (`style={{ marginLeft: '72px' }}`): lo resuelve la clase `app-main` del archivo externo `AppLayout.css`, que fija `margin-left: 72px` en escritorio y, dentro de `@media (max-width: 768px)`, lo anula con `margin-left: 0` y agrega `padding-bottom: 84px` para que el contenido no quede oculto detrás de la barra inferior móvil de `BarraLateral`.

**Quién lo invoca**: `main.jsx` como elemento padre de rutas autenticadas.

### BarraLateral.jsx

**Propósito**: Barra de navegación lateral responsive (sidebar desktop 72–200px, bottom bar mobile) con animación de "blob" morfo que sigue al ítem activo, integración de autenticación y modales de login/registro.

**Constantes**:
- `NAV_ITEMS`: 5 ítems de navegación principales (inicio, conversaciones, crear, wiki, notificaciones) con `key`, `href`, `icon`, `label`. El perfil ya no forma parte de esta lista: la ruta `/perfil` se alcanza desde el botón de usuario de la sección de autenticación
- `AUTH_ITEMS`: 2 botones (login, register) con `mode` para modal
- `ICON_MAP`: mapa de iconos SVG inline + `logo.svg` para inicio

**Estado**:
- `activeIndex` (number): índice del ítem activo según ruta actual; adopta el valor `-1` en las rutas de perfil (`/perfil` y `/usuarios/*`) para que ninguna sección principal quede marcada como activa
- `containerRef` (ref): referencia al `<nav>` para focus management en navegación por teclado
- El modal de autenticación ya no usa estado local: el componente lee `useAuthModal()` (`{ isOpen, mode, openModal, closeModal, switchMode }`) del `AuthModalContext`, que es el punto único que decide si se muestra `<InicioSesion>` o `<Registro>`

**Efectos**:
1. Sincroniza `activeIndex` con `location.pathname` al cambiar ruta: si la ruta es `/perfil` o empieza con `/usuarios/` fija `activeIndex` en `-1` y calcula `enPerfil = true`; en los demás casos busca el índice del path dentro de `NAV_ITEMS` y, si no hay coincidencia, deja el ítem `inicio` (índice 0) activo
2. Listener global `keydown` (Escape) para cerrar modal cuando el modal de auth está abierto vía `AuthModalContext`

**Eventos**:
- `handleKeyDown(e, index)`: navegación por flechas (izq/der/arriba/abajo), Home, End; actualiza `activeIndex` y hace focus programático al botón correspondiente
- `handleNavClick(href, index)`: actualiza `activeIndex` y navega con `navigate(href)`
- `handleAuthClick(mode)`: abre modal con `openModal(mode)` del contexto
- Modales: el overlay/portal (`auth-modal-overlay` con `z-index: 100` y `auth-modal-content`) lo renderiza el propio `BarraLateral` vía `createPortal` hacia `document.body` cuando `isOpen` es verdadero; el `AuthModalProvider` (en `main.jsx`) solo provee el contexto (`isOpen`, `mode`, `openModal`, `closeModal`, `switchMode`) y decide si se muestra `<InicioSesion>` o `<Registro>`; cierre por ESC/backdrop y cambio de modo siguen al contexto

**Renderizado**:
- Itera `NAV_ITEMS` creando botones con `aria-current="page"` en activo, `onClick` y `onKeyDown`
- `<div className="barra-blob" />`: elemento decorativo animado vía CSS del `::before` de `.barra-lateral`, posicionado por el atributo `data-active-index` del `<nav>` (índices 0-4 en escritorio y móvil); cuando `activeIndex` es `-1` (rutas de perfil) el CSS aplica `opacity: 0` y oculta el blob, pues ninguna sección principal está activa (el resaltado pasa al avatar del usuario)
- Sección auth condicional:
  - `loading`: skeleton avatar
  - `isAuthenticated`: botón con avatar y label; el avatar muestra la fotografía real del usuario (`<img src={user.fotoPerfil}>` dentro de `.barra-lateral-avatar`) cuando `user.fotoPerfil` existe, con fallback a la inicial de `username`/`email` en caso contrario; el click navega a `/perfil`. En rutas de perfil (`enPerfil`) el botón agrega la clase `barra-lateral-auth-btn--activo` y `aria-current="page"`, marcando el perfil como la sección activa
  - `!isAuthenticated`: dos botones (login/register) que abren modal vía contexto
- El overlay con `z-index: 100` y los modales `InicioSesion`/`Registro` se renderizan en `document.body` por el propio `BarraLateral` vía `createPortal`, controlado por el estado `isOpen`/`mode` del `AuthModalContext`

**CSS Key Points** (en `estilospequeños.css`):
- Desktop (`min-width: 769px`): sidebar fija 72px, hover expande a 200px, blob sigue `data-active-index` con `transform: translate(-50%, calc(-50% + Npx))` (N = índice × 64px)
- Mobile (`max-width: 768px`): bottom bar fija, `justify-content: center`, `safe-area-inset-bottom`, botones auth centrados 48px; el blob se desplaza con `translate(calc(-50% + 20% × índice), -50%)`
- `data-active-index="-1"` (rutas de perfil): el `::before` del blob queda con `opacity: 0` y `transform: translate(-50%, -50%)`, es decir, se oculta; el resaltado activo lo toma el botón del usuario con la clase `barra-lateral-auth-btn--activo` y `aria-current="page"`
- `align-items: center` en contenedor principal (fix: antes `left` valor inválido)
- `z-index: 50` en sidebar; modales usan `z-index: 100` en overlay y contenido
- `.barra-lateral-avatar`: avatar circular de 36px con gradiente y `overflow: hidden`; `.barra-lateral-avatar img` rellena el 100% con `object-fit: cover`, de modo que la foto real del usuario se recorta como círculo en lugar de deformarse

## Módulo de Autenticación (InicioDeSesion/)

### InicioSesion.jsx

**Propósito**: Modal de inicio de sesión con validación, show/hide password, enlace a registro y recuperación de contraseña.

**Estado**:
- `email`, `password` (strings)
- `visible` ('login'|'registro'|'olvido'|''): controla qué sub-componente renderizar
- `notificationsRef` (ref a `Notificaciones`)
- `mostrarcontra` (boolean): toggle visibilidad password

**Contexto de autenticación**: consume `useAuth()` para obtener `cookieConsent` y `setCookieConsent`. El primero indica el estado del consentimiento de cookies (`null` sin decisión, `{accepted: true, timestamp}` aceptado y persistido, `{accepted: false, timestamp}` rechazado solo para la sesión); el segundo es el callback que la tarjeta toast invoca para registrar la decisión. Ambos se propagan a `<Notificaciones>`, que es quien renderiza la tarjeta.

**Notificación de cookies**: el componente no gestiona directamente el consentimiento de cookies. Pasa `cookieConsent` junto con los callbacks `onCookieAccept` y `onCookieReject` (ambos con el valor `setCookieConsent`) al componente `Notificaciones`, que se encarga de mostrar la tarjeta toast cuando no hay una aceptación válida (`resolvedConsent?.accepted === true` es falso) y la tarjeta no fue descartada en ese montaje, y de filtrar las notificaciones de cookies mientras no hay consentimiento. Estas props son opcionales: si no se pasaran, `Notificaciones` resolvería el consentimiento desde `AuthContext` (ver sección `Notificaciones.jsx (Componente)`), por lo que este paso explícito ya no es requisito para que la tarjeta aparezca.

**Efectos**: no hay efectos dedicados al consentimiento de cookies; `cookieConsent` y `setCookieConsent` se leen directamente del contexto en cada render y se pasan a `Notificaciones`. El manejo de notificaciones de error y éxito sigue el flujo habitual.

**handleSubmit**:
1. Valida campos no vacíos
2. `await api.post('/login', { email, password })`
3. Si `response.data.success`: cierra modal y `window.location.href = '/'`
4. Si 403 con `requireVerification`: notifica error de correo no verificado con botón de acción "Reenviar correo" que llama `POST /api/reenviar-verificacion`
5. Else: notifica `error.response.data.error` (p.ej. "Credenciales inválidas" en 401)
6. Catch: notifica error de conexión

**Renderizado condicional**:
- `visible === 'olvido'`: `<RecuperarContraseñaCorreo onClose={() => setVisible('login')} />`
- `visible === ''`: `null`
- Default: formulario login con inputs email/password, botón ojo, enlace "¿Olvidaste tu contraseña?", botón submit, enlace a registro vía `switchMode('register')` del `AuthModalContext`, y `<Notificaciones ref={notificationsRef} cookieConsent={cookieConsent} onCookieAccept={setCookieConsent} onCookieReject={setCookieConsent} />`

**Estilos**: Usa `iniciosesion.css` (clases `.fondo`, `.contenedor`, `.dialogo-wrapper`, `.dialogoformulario`, `.textoinput`, `.input-wrapper`, `.ojo-btn`, `.btn-submit`, `.link-olvide`, `.texto-registro`)

### RecuperarContraseñaCorreo.jsx

**Propósito**: Formulario para solicitar enlace de recuperación de contraseña, conectado al endpoint `POST /api/olvido-contrasena` (respuesta neutral: no revela si el correo existe).

**Estado**: `email`, `cargando` (boolean), `notificationsRef`

**Flujo**: Input email → validación → botón "Enviar enlace" con spinner → `await api.post('/olvido-contrasena', { email })` → muestra el mensaje neutral de la respuesta → pantalla de confirmación con instrucciones → botón "Volver al inicio" navega a `/`

### MensajeConfirmacion.jsx

**Propósito**: Componente genérico de mensaje de confirmación con título, mensaje, botón de acción y estilos consistentes. Usado como base para `CuentaConfirmada`.

### ReescribirContraseña.jsx

**Propósito**: Formulario para establecer nueva contraseña tras recuperación, conectado al endpoint `POST /api/recuperar-contrasena`. Se monta en la ruta frontend `/restablecer?token=X` (lee el `token` de la query string).

**Estado**: `tokenFinal`, `nuevaContrasena`, `confirmarContrasena`, `cargando` (boolean), `notificationsRef`

**Flujo**: Lee `token` de URL → nueva contraseña + confirmación con validación (misma y >= 8 caracteres) → `await api.post('/recuperar-contrasena', { token, nuevaContrasena })` → notifica error (enlace expirado/usado) o éxito → `navigate('/')`

### PreferenciasFormulario.jsx

**Propósito**: Formulario de preferencias de cultura/estilo para usuarios nuevos (RQFN11-13). Se muestra en `Inicio.jsx` cuando `isAuthenticated && user.tienePreferencias === false`.

**Flujo**: Carga culturas desde `GET /api/culturas` (público) → selección de 1-3 culturas con subcultura por cada una → `POST /api/preferencias` (protegida por `verificarAcceso`) guarda en `usuario_preferencias` → notifica éxito; las siguientes respuestas de `/me`/`/login`/`/refresh` devuelven `tienePreferencias: true`.

### BarraNavegacion.jsx

**Propósito**: Barra de navegación simple (logo + enlaces) usada en páginas de autenticación standalone. **Nota**: `BarraLateral` la reemplaza en layout principal.

## Wizard de Registro (Registro/)

### Registro.jsx (Orquestador Principal)

**Propósito**: Componente raíz del flujo de registro. Gestiona estado global del wizard, validación inicial, llamada a `/validacionregistro` y `/preregistro`, y renderizado condicional de pasos y modales de confirmación.

**Contexto de autenticación**: consume `useAuth()` para obtener `cookieConsent` y `setCookieConsent`, de la misma manera que `InicioSesion`. `cookieConsent` refleja el estado del consentimiento (`null` sin decisión, `{accepted: true, timestamp}` persistido, `{accepted: false, timestamp}` solo sesión) y `setCookieConsent` es el callback que registra la decisión del usuario en la tarjeta toast.

**Estado**:
- `email`, `password`, `confirmPassword`, `username` (strings)
- `visible` ('registro'|'InicioFormularioCF'|'iniciosesion'|''): paso actual
- `showConfirmada` (boolean): muestra `CuentaConfirmada` (verificación email)
- `showPreregistroConfirmado` (boolean): muestra `PreregistroConfirmado` (éxito preregistro)
- `notificationsRef` (ref a `Notificaciones`)
- `mostrarcontra`, `mostrarconfirm` (booleans): toggles password
- `datosUsuario` (object|null): objeto que viaja por todo el wizard (`{ email, password, username, ojos, nariz, labios, cara, colores, tipospiel, edad }`)

**Notificación de cookies**: el componente no gestiona directamente el consentimiento de cookies. Pasa `cookieConsent` junto con los callbacks `onCookieAccept` y `onCookieReject` (ambos con el valor `setCookieConsent`) al componente `Notificaciones`, que muestra la tarjeta toast mientras no haya una aceptación válida y filtra las notificaciones de cookies. Estas props son opcionales: si no se pasaran, `Notificaciones` resolvería el consentimiento desde `AuthContext` (ver sección `Notificaciones.jsx (Componente)`). Como `Registro` permanece montado durante los 7 pasos del wizard, el estado del consentimiento se mantiene consistente en todo el flujo de registro.

**Funciones**:

**validarPassword(password)** (helper)
- Qué hace: valida longitud ≥8, al menos un número, al menos un carácter especial
- Qué entrega: array de strings con errores

**validarUsuario(username)** (helper)
- Qué hace: rechaza caracteres `; " '`
- Qué entrega: array de errores

**closeAll(origen = 'default')**
- Qué hace: cierra toda la cadena de formularios y muestra modal apropiado
- Cómo lo hace: `setVisible('')`; si `origen === 'preregistro'` → `setShowPreregistroConfirmado(true)` (NO llama `onClose` para mantener `Registro` montado); else → `setShowConfirmada(true)` y `onClose()`

**handleSubmit(e)**:
1. Previene submit default
2. Valida campos requeridos, coincidencia passwords, `validarPassword`, `validarUsuario`
3. `await api.post('/validacionregistro', { email, username })` con `validateStatus < 400`
4. Si `response.data.success`: crea `DatosDelUsuario`, `setDatosUsuario`, `setVisible('InicioFormularioCF')`
5. Si error 409: notifica `response.data.error` (backend devuelve `{ error, field }`)
6. Catch: notifica error de conexión o `error.response.data.error`

**getChildProps(extra)**: helper que propaga `{ datosUsuario, onClose, notificationsRef, ...extra }` a hijos.

**Renderizado**:
- `showPreregistroConfirmado`: `<PreregistroConfirmado closeAll={closeAll} />`
- `showConfirmada`: `<CuentaConfirmada onClose={closeAll} />`
- `visible === ''`: `null`
- `visible === 'InicioFormularioCF'`: `<InicioFormularioCF ... />`
- `visible === 'iniciosesion'`: `<InicioSesion ... />`
- Default: formulario inicial (email, username, password, confirmPassword, toggles ojo, botón submit, enlace a login) + `<Notificaciones ref={notificationsRef} cookieConsent={cookieConsent} onCookieAccept={setCookieConsent} onCookieReject={setCookieConsent} />`

### InicioFormularioCF.jsx (Paso 0 - Introducción)

**Propósito**: Pantalla de bienvenida al wizard de características físicas, muestra barra de progreso (0/7) y botón "Continuar" que inicia `OjosFormulario`.

**Estado**: `visible` ('inicioformulario'|'ojos'|'')

**Constantes**: `TOTAL_BARRAS = 7`, `BARRAS_COMPLETADAS = 0`

**Renderizado**: Si `visible === 'ojos'` retorna `<OjosFormulario ... />`; sino muestra contenedor con barra de progreso (SVG rects), `Dialogo`, explicación y botón "Continuar" que llama `setVisible('ojos')`.

### OjosFormulario.jsx (Paso 1)

**Propósito**: Selección de forma de ojos (9 opciones) con imágenes cargadas vía `import.meta.glob`.

**Variables**:
- `imagenesOjos`: módulos importados eager de `../../../Características Fisicas/Ojos/*.{png,jpg,jpeg,svg}`
- `ojos`: objeto mapeado `nombreArchivo → url`
- `opciones`: array de 9 objetos `{ valor, imagen, texto }`

**Estado**: `visible` ('ojos'|'nariz'|'')

**inputs(valor, imagen, texto)**: retorna JSX de radio button con label, imagen y texto; `onChange` muta `datosUsuario.ojos = e.target.value`

**narizform()**: valida `datosUsuario.ojos !== undefined`; si ok `setVisible('nariz')`; sino notifica error

**close()**: `setVisible('')` y `onClose()`

**Renderizado condicional**: `visible === 'nariz'` → `<NarizFormulario ... onClose={() => { setVisible('ojos'); datosUsuario.ojos = undefined; datosUsuario.nariz = undefined; }} />`; default muestra grid de radios + botón "Continuar"

**Barra de progreso**: `BARRAS_COMPLETADAS = 1`

### NarizFormulario.jsx (Paso 2)

**Propósito**: Selección de forma de nariz (12 opciones). Estructura idéntica a `OjosFormulario`: `imagenesNariz`, `opciones`, `inputs`, `caraform()` valida `datosUsuario.nariz`, avanza a `CaraFormulario` limpiando campos previos en `onClose`.

### CaraFormulario.jsx (Paso 3)

**Propósito**: Selección de forma de cara (9 opciones). Avanza a `ColoresFormulario`.

### ColoresFormulario.jsx (Paso 4)

**Propósito**: Selección de tono de piel (6 opciones). Avanza a `BocaFormulario`.

### BocaFormulario.jsx (Paso 5)

**Propósito**: Selección de forma de labios (9 opciones). **Nota**: campo en BD es `tipo_labios`, frontend usa clave `labios` en `datosUsuario`. Avanza a `TiposPielFormulario`.

### TiposPielFormulario.jsx (Paso 6)

**Propósito**: Selección de tipo de piel (4 opciones). Avanza a `EdadFormulario`.

**Validación corregida**: antes verificaba `datosUsuario.cara`; ahora verifica `datosUsuario.tipospiel`.

### EdadFormulario.jsx (Paso 7 - Final)

**Propósito**: Input numérico de edad (13–100) y envío final a `/preregistro`.

**Estado**: `edad` (string), `isLoading` (boolean)

**handleSubmit(e)**:
1. Previene default
2. Valida edad numérica 13–100
3. `setIsLoading(true)`
4. `await api.post('/preregistro', { ...datosUsuario, edad: parseInt(edad) })`
5. Si éxito: `setIsLoading(false)`, `closeAll('preregistro')`
6. Catch: `setIsLoading(false)`, notifica error

**Renderizado**: Overlay spinner absoluto (`position: fixed`, `z-index: 9999`) cuando `isLoading`; input number + botón "Finalizar Registro"

### PreregistroConfirmado.jsx

**Propósito**: Modal de éxito tras preregistro. Mensaje: "Te hemos enviado un correo de verificación. Por favor revisa tu bandeja de entrada (y spam) para confirmar tu cuenta."

**Efecto**: `useEffect(() => { closeAll('preregistro') }, [])` al montar → cierra wizard y muestra este modal.

**Botón**: "Entendido" llama `closeAll('preregistro')` → `setShowPreregistroConfirmado(false)` + `onClose()` → cierra modal de registro completo.

### CuentaConfirmada.jsx

**Propósito**: Página resultado de verificación de email (ruta `/verificar-correo`). Lee `searchParams` (`success`, `error`).

**Lógica**:
- Si sin params → `<Navigate to="/" replace />`
- `success === 'true'`: muestra éxito, botón "Iniciar Sesión" → `window.location.href = '/'`
- Error: mapea códigos (`token_missing`, `token_expired`, `token_invalid`, `token_invalid_or_expired`, `invalid_token_type`, `server_error`) a mensajes; botón "Cerrar" → home

**Estilos**: Reusa `iniciosesion.css` y `Dialogo`

## Componentes Placeholder (Páginas Principales)

### Inicio.jsx
- Estado actual: renderiza solo "HOLa" + `<Notificaciones />`; al no pasar props de cookies, `Notificaciones` resuelve el consentimiento desde `AuthContext` (fallback) y la tarjeta toast de cookies aparece en este montaje
- Tiene lógica comentada para detectar `?login=success` y abrir modal login
- **Pendiente**: implementar home autenticado (feed, recomendaciones)

### Conversaciones.jsx
- Exporta `const Conversaciones = () => <div>Conversaciones</div>`
- **Pendiente**: lista de conversaciones, filtros, paginación, creación, vista detalle

### Crear.jsx
- Exporta `const Crear = () => <div>Crear</div>`
- **Pendiente**: formulario subida video/imágenes, selección cultura/subcultura, pasos tutorial, tags características físicas, moderación Sightengine

### Wiki.jsx (Portal tipo Fandom, RQFN73-78)

Componente en `cliente/src/Componentes/WIKI/Wiki.jsx` (CSS en `cliente/src/estilos/WikiEstilos/wiki.css`): componente único con tres vistas manejadas por parámetro de ruta — `/wiki` (índice con grid de culturas), `/wiki/:culturaId` (artículo editorial de la cultura) y `/wiki/:culturaId/:subculturaId` (artículo del subestilo). Estructura de portal: `.wiki-bar` superior con pestañas por cultura teñidas con `--wiki-color-tinta` (función pura `tonoAccesible(hex)` que mezcla el color de cultura con #2f2638 hasta contraste ≥4.5:1 con #fff), `.wiki-panel` (artículo) + `.wiki-rail` sticky (≥1200px, módulos "Más de {Cultura}" y "Otras culturas"), infobox flotante `float:right` con filas `dl`, TOC ("Contenido" cuando hay ≥3 apartados), h2 con slug e `id`, categorías y navbox al pie. Contenido en `cliente/src/Componentes/WIKI/datos/wiki.json` (**8 culturas / 75 subestilos, ids 1-75**, template editorial: `tituloEditorial`, Sección 1 (apartados de conteo variable), Sección 2 (grid), Sección 3 (pasos de masterclass), Sección 4 (Beauty Profiling), Sección 5 (Protocolos), Sección 6 (Recursos/Bibliografía) + `ficha` de 5 campos por subestilo; `imagen` con URL real en los 83 items; `items` opcionales `{titulo, texto}` → `<ul class="wiki-sub-lista">`). Rutas registradas en `main.jsx`; botón "Utilizar este estilo" → `/maquillajes?cultura=<id>&subcultura=<id>`.

### Maquillajes.jsx (Placeholder funcional, RQFN79-98 pendiente)

Componente en `cliente/src/Componentes/Maquillajes/Maquillajes.jsx` (CSS en `cliente/src/estilos/MaquillajesEstilos/maquillajes.css`): ruta `/maquillajes` montada en `main.jsx`. Lee `cultura`/`subcultura` de query params, resuelve los nombres desde `wiki.json` y enlaza a la Wiki; el estado vacío está preparado para el feed real (paso 3 del roadmap: scroll infinito 30+30, orden, filtros, pestañas).

### Perfil.jsx

**Propósito**: Página de perfil de usuario, completa (RQFN41-56), con dos modos: propio (`/perfil`) y ajeno (`/usuarios/:id`). Carga los datos desde `GET /api/perfil` o `GET /api/usuarios/:id/perfil`, muestra el header reestructurado con avatar, estadísticas y menú de cuenta, y permite editar perfil (username, descripción y foto), cambiar contraseña, seguir/dejar de seguir y consultar listas de seguidores/siguiendo. Se monta en las rutas `/perfil` y `/usuarios/:id` de `main.jsx`.

**Modo del perfil**: `esMio` es `!id || (user && String(user.id) === String(id))`; cuando es falso, la página carga el perfil ajeno con el botón Seguir/Dejar de seguir en línea (junto al nombre, en `perfil-info-fila`) y usa `yaSigo` de la respuesta para marcar el estado del botón.

**Header rediseñado** (decisión de diseño aprobada por la usuaria; revierte la decisión "solo layout, sin colores ni tipografías nuevas"): el header es un grid `display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 28px; align-items: center` con `padding: 28px 72px 28px 28px` y `box-shadow: 0 16px 32px -20px rgba(83, 60, 94, 0.28)` (el derecho de 72px reserva sitio al engranaje). En la primera columna va el avatar de 112px redondo (`.perfil-header .perfil-avatar`: 112×112, sin borde, con anillo blanco `box-shadow: 0 0 0 4px #fff`; las iniciales del fallback a 40px), en la segunda el bloque de info `perfil-info` (`width: auto; min-width: 0`, username como `<h1 className="perfil-username">` a 22px/600/`letter-spacing:-0.01em`/`overflow-wrap:anywhere` más la descripción a 15px/1.55/máx. 44ch; en perfiles ajenos el botón Seguir/Siguiendo sigue inline en `perfil-info-fila`) y en la tercera el rail de estadísticas `perfil-stats` de 4 columnas `repeat(4, minmax(88px, 1fr))` **sin offset** entre filas: Likes (`likesRecibidos`, icono `IconoEstrella`), Publicaciones (`videos`, `IconoPublicacion`), Seguidores (`seguidores`, `IconoUnaPersona`) y Seguidos (`siguiendo`, `IconoDosPersonas`); cada columna es `display: grid; justify-items: center; align-content: start` con icono a 26px (`--color-acento-fuerte`), número a 15px/600 con `font-variant-numeric: tabular-nums` y etiqueta a 14px (`--color-texto-suave`), y los `div` y los `button` renderizan idéntico. Estadísticas Seguidores/Seguidos son botones (`perfil-stat--btn`) que abren las listas. Se eliminaron del header el correo (`perfil-email`), "Miembro desde" (`perfil-meta`) y la fila `.perfil-actions`.

**Menú de cuenta (solo perfil propio)**: botón engranaje `perfil-gear` (icono `IconoEngranaje`) posicionado absoluto arriba-derecha del header dentro de `perfil-gear-wrap`, con `aria-expanded={menuAbierto}`; su desplegable `perfil-gear-menu` (`role="menu"`) contiene tres items (`role="menuitem"`): "Editar perfil" (cierra el menú y abre `modalEditar`), "Cambiar contraseña" (abre `modalContrasena`) y "Cerrar sesión" (llama `handleLogout`, deshabilitado mientras `cerrandoSesion`). El menú se cierra al hacer clic fuera (listener global `mousedown` que revisa `menuRef`) y con la tecla Escape (listener `keydown`).

**Barra de pestañas (solo visual, sin navegación a rutas)**: `<div className="perfil-tabs" role="tablist" aria-label="Secciones del perfil">` al pie del header, mapeada desde la constante `PESTANAS` (`{ clave, nombre, Icono }` con Publicaciones, Guardados, Vistas y Chats), en grid `repeat(4, 1fr)` con `padding: 0 20px` (≥769px) / `0 12px` (≤768px) idéntico a `.perfil-page`, de modo que los bordes coinciden con la tarjeta. Cada botón es `role="tab"` con `id="tab-<clave>"`, `aria-selected`, `aria-controls="panel-<clave>"`, `tabIndex` roving (0 en activa / -1 el resto) y sin `aria-pressed`; el estado local `tabActiva` (default `'publicaciones'`) marca la activa `.perfil-tab--activa` con fondo blanco y el pseudo-elemento `::after` (el "docket", `top: 100%; height: 14px; z-index:2`) cubre la línea superior de `.perfil-contenido` y funde la pestaña con la zona blanca full-bleed. La navegación con teclado (←/→ con envoltura, Inicio y Fin) la maneja `moverPestana` en el contenedor, moviendo `tabActiva` y el foco vía `tabsRef`. Debajo, `.perfil-contenido` es `role="tabpanel"` con `id="panel-<clave>"` y `aria-labelledby="tab-<clave>"` y renderiza el estado vacío contextual `EstadoVacio`. `EstadoVacio` recibe `clave` y `esMio`, obtiene el icono de la pestaña desde `PESTANAS` y los textos desde la constante `TEXTOS_VACIOS`, que por pestaña devuelve `{ titulo, texto, etiqueta, ruta }`; cuando `esMio` es verdadero muestra un botón `perfil-btn--primary` que navega a la ruta indicada (`/crear` en Publicaciones, `/` en Guardados y Vistas, `/conversaciones` en Chats); en perfiles ajenos solo se muestran título y texto, sin botón de acción.

**Iconos SVG y helpers**: `IconoBase` envuelve SVGs inline estilo feather (`viewBox 0 0 24 24`, `fill="none"`, `stroke="currentColor"`, `strokeWidth="1.8"`, `aria-hidden="true"`); los iconos `IconoEngranaje`, `IconoEstrella`, `IconoPublicacion`, `IconoUnaPersona`, `IconoDosPersonas`, `IconoGuardado`, `IconoVistas` e `IconoChat` se declaran en el mismo archivo y se usan en el header, las stats y las pestañas. La función auxiliar `iniciales(nombre)` produce el fallback del avatar sin foto: toma el texto, lo divide por espacios/guiones bajos, toma hasta dos primeras palabras y devuelve sus iniciales en mayúsculas (p. ej. `'omegawolf_97'` → `'O'`). La constante `TITULO_TOAST` (`'Becky te ha mandado un mensaje'`) fija el título de todos los toasts de la página, que `avisar(message, type)` agrega vía `notificationsRef.current?.addNotification`.

**Lista de seguidores/siguiendo**: `abrirLista(tipo)` consulta `${base}/${tipo}` con `base = esMio ? '/perfil' : '/usuarios/' + id`, guarda `respuesta.data.usuarios` en `listaDatos` y renderiza cada fila usando `u.fotoPerfil` (campo renombrado por el backend y ya resuelto con el icono predeterminado cuando no hay foto) o el fallback de iniciales `u.nombre_usuario`. Cada fila navega a `/perfil` (si es el propio usuario) o `/usuarios/:id` al hacer clic.

**Modales**: `modalEditar` (foto con preview y resize client-side vía canvas a máx. 400px, username y descripción; envía `PUT /api/perfil/foto` y `PUT /api/perfil`, luego `refreshUser()` y `cargarPerfil()`), `modalContrasena` (exige contraseña actual, nueva y confirmación; llama `POST /api/perfil/contrasena`) y `modalLista` (seguidores/siguiendo). El cierre de sesión (`handleLogout`) usa `logout()` del `AuthContext` y navega a `/`. Los toasts de Becky se renderizan portalizados a `document.body` vía `createPortal`.

**Estilos**: `cliente/src/estilos/PerfilEstilos/perfil.css` (ver sección "Estilos y Temas").

### NotificacionesPagina.jsx (Drawer, RQFN69-72)

Componente en `cliente/src/Componentes/Notificaciones/NotificacionesPagina.jsx` que renderiza el **drawer superpuesto de notificaciones**. Por decisión de diseño del equipo, la campana de la BarraLateral ya NO navega a una ruta `/notificaciones`: abre este drawer portalizado en `id="panel-notificaciones"` (escritorio: panel **a la derecha** con `right:0`, `width:min(360px, calc(100vw - 72px))`, `border-left` y `box-shadow:-12px 0 24px -16px rgba(83,60,94,0.28)`, alto completo sobre fondo `var(--color-fondo)`; la página actual —p. ej. Perfil— sigue visible detrás con un backdrop casi transparente; móvil ≤768px: pantalla completa con `top:0; bottom:84px` para no tapar la bottom bar). Cierra con clic en el backdrop, con la ✕ o con `Escape`, y devuelve el foco a la campana. La ruta `/notificaciones` de `main.jsx` redirige con `<Navigate to="/" />`.

**Estados**: `cargando` (spinner en `.notif-drawer-cargando`) → sin sesión = **estado vacío centrado** (`.notif-drawer-vacio` con icono campana 64px, título «Y tus notificaciones son...» Am, cariño, ¿cuál es tu nombre?, explicación y botón primario "Iniciar sesión" que cierra el panel y abre el modal de login) → vacío con sesión = **fila de Becky** (avatar `/logo.svg` + burbuja magenta, RQFN69, sin CTA) → lista persistida del backend.

**Carga y lectura**: al montar, `useEffect` llama `GET /notificaciones`; si `noLeidas > 0`, marca el flag `marcadasLeidas` y dispara `POST /notificaciones/leidas` en segundo plano (todas las pendientes se leen al abrir). El resultado se guarda en `notificaciones` (array de objetos del backend).

**construirAcciones(notif, navigate, onClose)**: devuelve un array de botones por tipo (enum fijo §19.2 de AGENTS.md). Hoy solo se escribe `nuevo_seguidor` (por `POST /seguir`), que genera "Ver perfil" → `/usuarios/:id`. El resto queda renderizado genérico y listo para cuando existan sus triggers: `nuevo_contenido_seguido`/`nuevo_like` → "Ver publicación" → `/video/:id`; `nuevo_comentario`/`like_comentario` → "Ver conversación" → `/video/:id` o `/conversaciones`; `semejanza_baja` → "Cambiar categoría" (→ `/video/:id` o `/maquillajes`) + "Wiki" (→ `/wiki`). Cada acción cierra el drawer con `cerrar` (solo `onClose`) antes de navegar. Las filas con **1 sola acción** son clicables enteras (`<li role="button" tabIndex={0}>` con `onClick` y Enter/Espacio en `onKeyDown`); `semejanza_baja` (2 acciones) renderiza `.notif-burbuja` grande con los botones `.notif-burbuja-accion` dentro (outline blanco).

**renderizarMensaje(notif)**: resalta en el texto el `@usuario` o el `nombre_usuario` del actor con `.notif-item-usuario` (500 / `--color-h1`) y las cifras "N likes/comentarios/votos/seguidores" con `.notif-item-cifra` (500 / `--color-burbuja`); dentro de la burbuja ambos fuerzan `#fff`. La burbuja es un `<div>` (no `<p>`) para mantener HTML válido.

**Helpers**: `iniciales(nombre)` genera el fallback del avatar (misma lógica que en Perfil). Ya NO existe `fechaRelativa` ni `<time>`: el panel no muestra horas.

**Accesibilidad**: el `<aside>` tiene `role="dialog"` + `aria-modal="true"` + `aria-label="Notificaciones"`, `tabIndex={-1}` con foco inicial en el panel, listener de `Escape`; los botones utilizan `:focus-visible` con `--color-acento-fuerte` (intervalo del panel: ningún elemento supera `font-weight: 500`). El retorno de foco a la campana usa `prevFocoRef` + `cerrarConFoco` (ESC, backdrop, botón ✕, "Iniciar sesión"); las acciones de navegación usan `cerrar` a secas para no acceder a refs durante el render.

**Estilos**: `cliente/src/estilos/NotificacionesEstilos/notificaciones.css` (ver sección "Estilos y Temas"). El badge `.barra-badge` de la campana vive en `estilospequeños.css`.

> Nota: el componente toast reutilizable `Notificaciones.jsx` (sistema interno + consentimiento de cookies RQFN1-2) es independiente de este drawer y sigue montado en Inicio/Registro/Perfil/login/recuperación.

## Componentes UI Reutilizables (elementos_pequeños/)

### Dialogo.jsx
- Componente simple: `<div className="dialogo"><p>{label}</p></div>`
- Usado en formularios auth/registro para encabezados conversacionales ("First time here?", "Hello there!!!", "Veamos qué es lo que te hace tan bonita", etc.)

### Notificaciones.jsx (Componente)

Componente reutilizable con dos responsabilidades: mostrar notificaciones toast y gestionar la solicitud de consentimiento de cookies (RQFN1-2) como una tarjeta toast estilo "Becky te ha mandado un mensaje" (ya no como modal). Se monta en `Inicio.jsx`, `InicioSesion.jsx`, `Registro.jsx`, `InicioFormularioCF.jsx`, `RecuperarContraseñaCorreo.jsx` y `ReescribirContraseña.jsx` (la ruta `/notificaciones` hoy redirige a `/`; el drawer lo abre la campana de la BarraLateral, ver sección `NotificacionesPagina.jsx (Drawer)`). Para el consentimiento de cookies el componente importa `useAuth` de `../../context/AuthContext` y aplica un fallback: si el padre no pasa las props de cookies, las deriva del contexto (`resolvedConsent`, `resolvedAccept` y `resolvedReject`), de modo que la tarjeta aparece en cualquier montaje del componente, con o sin props del padre.

**Props** (las tres primeras son opcionales):
- `cookieConsent` (object|null): estado del consentimiento que el componente resuelve; `null` indica sin decisión, `{accepted: true, timestamp}` aceptación persistida, `{accepted: false, timestamp}` rechazo solo de sesión. Si el padre no la pasa, el componente usa `auth.cookieConsent` del contexto
- `onCookieAccept` (function): callback para registrar la aceptación; recibe `{accepted: true, timestamp}`. Si el padre no la pasa, se usa `auth.setCookieConsent`
- `onCookieReject` (function): callback para registrar el rechazo; recibe `{accepted: false, timestamp}`. Si el padre no la pasa, se usa `auth.setCookieConsent`
- `ref` (forwardRef): expone `{ addNotification, removeNotification }` vía `useImperativeHandle`

**Fallback a AuthContext**:
- `const auth = useAuth()`: el componente consume el contexto de autenticación en todo montaje, sin requerir que el padre lo provea
- `resolvedConsent` (object|null): consentimiento efectivo; `cookieConsent !== undefined ? cookieConsent : auth.cookieConsent`. Es la fuente de verdad para decidir si la tarjeta debe mostrarse
- `resolvedAccept` (function): callback efectivo de aceptación; `onCookieAccept || auth.setCookieConsent`
- `resolvedReject` (function): callback efectivo de rechazo; `onCookieReject || auth.setCookieConsent`
- Con este fallback, los padres que pasan props (`InicioSesion`, `Registro`) pueden sobrescribir el comportamiento, pero ya no es requisito: los montajes sin props (`Inicio.jsx`, `RecuperarContraseñaCorreo.jsx`, `ReescribirContraseña.jsx`, `InicioFormularioCF.jsx`) muestran la tarjeta de cookies por igual

**Estado local y valores derivados**:
- `notifications` (array): lista de notificaciones toast activas
- `cookieToastDismissed` (boolean): indica si la tarjeta de cookies fue descartada EN ESTE montaje. Como se resetea con cada montaje, rechazar en `Inicio` no impide que la tarjeta vuelva a aparecer al abrir login/registro (montajes nuevos), cumpliendo RQFN1-2
- `hasConsent` (boolean, derivado): `resolvedConsent?.accepted === true`; solo una aceptación válida cuenta como consentimiento
- `shouldShowCookieToast` (boolean, derivado): `!hasConsent && !cookieToastDismissed`; si es verdadero, la tarjeta se renderiza

**addNotification(notification)** (useCallback, expuesta vía ref)
- Qué hace: agrega una notificación a la lista interna, salvo que sea una notificación de cookies sin consentimiento
- Cómo lo hace: detecta si la notificación es la de cookies (título `'Becky te ha mandado un mensaje'` y mensaje que incluye `'cookies'`); si lo es y `hasConsent` es falso, retorna sin agregarla, pues la tarjeta toma el control y no debe duplicarse; en caso contrario asigna `id = Date.now().toString()` y agrega `{ ...notification, id }` al estado
- Quién la invoca: los componentes padre vía `notificationsRef.current?.addNotification(...)` (ej. `InicioSesion`, `Registro`)
- Qué entrega: actualiza el estado interno `notifications`
- Qué invoca: ninguna función
- Qué recibe: objeto `notification` con `{ title, message, type, showGif }`

**removeNotification(id)** (useCallback, expuesta vía ref)
- Qué hace: elimina una notificación por su `id`
- Cómo lo hace: `setNotifications(prev => prev.filter(notif => notif.id !== id))`
- Quién la invoca: el botón ✕ de cada notificación y cualquier componente padre vía ref
- Qué entrega: actualiza el estado interno `notifications`

**useImperativeHandle**: expone `{ addNotification, removeNotification }` al padre a través de la `ref`, con dependencias `[addNotification, removeNotification]`.

**Tarjeta toast de consentimiento de cookies (RQFN1-2)**
- Renderizado: si `shouldShowCookieToast` es verdadero se crea `<article className="notificacion notif-cookie">` dentro del `.notificaciones-container`, sin portal. La tarjeta reúne el header estándar (`.notif-header` con `.notif-app` de logo + "B-unick" y un botón ✕ `.notif-close` que invoca `handleReject`), el cuerpo (`.notif-body notif-body-with-gif`) con el gif `/hi.gif` (`.notif-emoji`), el título "Becky te ha mandado un mensaje" y el texto explicativo sobre cookies, y la fila `.cookie-consent-buttons` con los botones "Aceptar todo" (`cookie-consent-btn--primary`) y "Rechazar todo" (`cookie-consent-btn--danger`)
- `handleAccept` (useCallback): construye `{ accepted: true, timestamp: Date.now() }` e invoca `resolvedAccept(consentData)` (la prop `onCookieAccept` si el padre la pasó, o `auth.setCookieConsent` en caso contrario); esta aceptación persiste en `localStorage` vía `setCookieConsentFromChild`
- `handleReject` (useCallback): construye `{ accepted: false, timestamp: Date.now() }` e invoca `resolvedReject(consentData)` (la prop `onCookieReject` si el padre la pasó, o `auth.setCookieConsent` en caso contrario) y además ejecuta `setCookieToastDismissed(true)` para cerrar la tarjeta en ese montaje; el rechazo no se persiste
- El botón ✕ del header de la tarjeta hace lo mismo que "Rechazar todo": invoca `handleReject`
- El rechazo solo dura el montaje/sesión: al no persistirse y al resetearse `cookieToastDismissed` con cada montaje, la tarjeta vuelve a aparecer en login/registro (montajes nuevos) y en la próxima sesión

**Renderizado**: contenedor `.notificaciones-container` que incluye la tarjeta de cookies (cuando corresponde) y la lista de artículos `.notificacion` (header con logo, título "B-unick" y botones ⋯/✕; body con gif opcional `.notif-emoji` y texto `.notif-titulo`).

**Estilos** en `estilospequeños.css`: `.notificaciones-container`, `.notificacion`, `.notif-header`, `.notif-body`, `.notif-body-with-gif`, `.notif-emoji`, `.notif-titulo`, y el bloque reducido `.cookie-consent-*` (`buttons`, `btn`, `btn--primary`, `btn--danger`) junto con `.notif-cookie` (`border-left: 4px solid var(--color-fondo3)`). Ya no existen las clases de modal `.cookie-consent-overlay`, `.cookie-consent-modal`, `.cookie-consent-content`, `.cookie-consent-gif` ni `.cookie-consent-text`. En el media query móvil (`max-width: 480px`) el gif se oculta con `.notif-emoji { display: none; }`, lo que también oculta el gif `/hi.gif` de la tarjeta de cookies.

## Integración Backend

### Endpoints Consumidos

| Método | Endpoint | Componente | Descripción |
|--------|----------|------------|-------------|
| POST | `/api/validacionregistro` | `Registro` | Valida email/username disponibles |
| POST | `/api/preregistro` | `EdadFormulario` | Crea usuario + características + envía email verificación |
| GET | `/api/verificar-correo` | Backend → redirect | Valida JWT, marca `correo_verificado=1`, redirige a frontend |
| POST | `/api/login` | `InicioSesion` | Autentica por email o username, setea cookies httpOnly (access+refresh); `user.fotoPerfil` con default resuelto |
| GET | `/api/me` | `AuthContext` | Valida accessToken, retorna usuario (`fotoPerfil` con default resuelto) |
| POST | `/api/refresh` | `axios` interceptor | Renueva accessToken desde refreshToken; `user.fotoPerfil` con default resuelto |
| POST | `/api/logout` | `AuthContext.logout` | Revoca refresh del dispositivo + limpia cookies |
| GET | `/api/perfil` | `Perfil` | Perfil propio + stats; `fotoPerfil` con default resuelto |
| PUT | `/api/perfil` | `Perfil` | Edita username/descripción |
| POST | `/api/perfil/contrasena` | `Perfil` | Cambia contraseña (exige actual + confirmación; revoca otras sesiones) |
| PUT | `/api/perfil/foto` | `Perfil` | Sube foto de perfil (base64/dataURL → Cloudinary) |
| GET | `/api/usuarios/:id/perfil` | `Perfil` | Perfil ajeno + `yaSigo`; `404` si no existe o sin verificar |
| POST | `/api/seguir/:id` | `Perfil` | Seguir/dejar de seguir (toggle); crea notificación `nuevo_seguidor` |
| GET | `/api/perfil/seguidores` · `/api/perfil/siguiendo` | `Perfil` | Listas propias de seguidores/siguiendo (con `yoSigo`) |
| GET | `/api/usuarios/:id/seguidores` · `/api/usuarios/:id/siguiendo` | `Perfil` | Listas ajenas de seguidores/siguiendo (con `yoSigo`) |

### Formato Respuestas

- `/validacionregistro`: 200 `{ success: true }` | 409 `{ error, field }` (field: 'email'|'username')
- `/preregistro`: 200 `{ success, message, usuarioId }`
- `/login`: 200 `{ success, user }` + cookies | 403 `{ requireVerification, error }` | 401 `{ error }`. `user.fotoPerfil` ya trae el icono B-Unick por defecto cuando no hay foto personalizada (`resolverFotoPerfil`)
- `/me`: 200 `{ user: { id, email, username, fotoPerfil, descripcion, correo_verificado, tienePreferencias } }` | 401. `fotoPerfil` con default resuelto
- `/refresh`: 200 `{ success, user }` + regenera `accessToken` (valida refresh en BD: tipo/expiración/usado) | 401. `user.fotoPerfil` con default resuelto
- `/logout`: 200 `{ success }` (marca refresco usado + limpia cookies) | 401
- `/reenviar-verificacion`: 200 respuesta neutral | `/olvido-contrasena`: 200 respuesta neutral
- `/recuperar-contrasena`: 200 `{ success, message }` | 401 `{ error }` (token inválido/expirado/usado)
- `/culturas`: 200 `{ success, culturas[] }` (con subculturas anidadas, público)
- `/preferencias`: 200 `{ success, message }` | 400 `{ error }` (validación 1-3 + pertenencia) | 401 (sin sesión)
- `/perfil`: 200 `{ success, user: { id, email, username, fotoPerfil, descripcion, fechaRegistro, correo_verificado, videos, likesRecibidos, seguidores, siguiendo } }` | 401/404. `fotoPerfil` con default resuelto
- `/usuarios/:id/perfil`: 200 `{ success, user: { id, username, fotoPerfil, descripcion, fechaRegistro, yaSigo, videos, likesRecibidos, seguidores, siguiendo } }` | 400 (id propio o inválido) / 404 (no existe o sin verificar)
- Listas (`/perfil/seguidores`, `/perfil/siguiendo`, `/usuarios/:id/seguidores`, `/usuarios/:id/siguiendo`): 200 `{ success, usuarios: [{ id, nombre_usuario, fotoPerfil, descripcion, yoSigo }] }`. Cada fila pasa por `mapearUsuarioConFoto`, por lo que el campo se llama `fotoPerfil` (renombrado desde `foto_perfil`) y ya viene el default resuelto

### Helper de imágenes del backend (servidor/helpers/imagenes.js)

Archivo CommonJS (`servidor/helpers/imagenes.js`) que centraliza la resolución de la foto de perfil predeterminada (icono B-Unick). Es la fuente única por la que pasan todos los endpoints que exponen la foto de perfil: los valores `NULL`, vacíos o las URLs heredadas de `placehold.co` se sirven como el icono por defecto, mientras que las fotografías personalizadas subidas a Cloudinary se devuelven tal cual.

**FOTO_PERFIL_DEFECTO** (constante)
- Variable: URL constante del icono B-Unick alojado en Cloudinary (`https://res.cloudinary.com/yccuvkhv/image/upload/v1789789407/Icono_B-Unick.png`)
- Qué hace: define la imagen que se sirve cuando el usuario no tiene una foto personalizada
- Qué entrega: la URL del icono por defecto
- Quién la usa: `resolverFotoPerfil`, que la retorna como fallback

**esFotoPersonalizada(url)** (función interna)
- Qué hace: determina si una URL corresponde a una fotografía subida por el usuario o si debe usarse el default
- Variables: `URL_PLACEHOLDER_RE` (expresión regular `^https://placehold\.co/` insensible a mayúsculas), `urlLimpia` (la URL recortada con `trim()`)
- Cómo lo hace: si `url` no es un string retorna `false`; si `urlLimpia` está vacía retorna `false`; si la URL coincide con el patrón de `placehold.co` también retorna `false`; en cualquier otro caso retorna `true`
- Quién la invoca: `resolverFotoPerfil`
- Qué entrega: booleano (`true` si la URL es una foto personalizada real)
- Qué invoca: ninguna función
- Qué recibe: `url` (valor crudo de la columna `usuarios.foto_perfil`, puede ser `null` o un string)

**resolverFotoPerfil(url)** (función exportada)
- Qué hace: resuelve el valor de `fotoPerfil` que se expone en la API, garantizando que ningún endpoint devuelva `NULL`, cadenas vacías o URLs legacy
- Cómo lo hace: delega en `esFotoPersonalizada`; si es verdadero devuelve `url.trim()`, en caso contrario devuelve `FOTO_PERFIL_DEFECTO`
- Quién la invoca: `routes-autenticacion.js` en `/api/login`, `/api/me` y `/api/refresh` (campo `fotoPerfil: resolverFotoPerfil(user.foto_perfil)`); `routes-usuarios.js` en `GET /api/perfil` y `GET /api/usuarios/:id/perfil`; y `mapearUsuarioConFoto` para las listas
- Qué entrega: la URL de la foto de perfil (personalizada o el icono por defecto)
- Qué invoca: `esFotoPersonalizada`
- Qué recibe: `url` (valor crudo de la columna `foto_perfil`)

**mapearUsuarioConFoto(fila)** (función exportada)
- Qué hace: convierte una fila cruda de las consultas de listas (`{ foto_perfil, ...resto }`) en su forma de API (`{ ...resto, fotoPerfil }`) con el default ya resuelto
- Cómo lo hace: desestructura `foto_perfil` y el resto de la fila (`{ foto_perfil, ...resto } = fila || {}`) y agrega `fotoPerfil: resolverFotoPerfil(foto_perfil)`; si `fila` es `null`/`undefined` parte de un objeto vacío
- Quién la invoca: los 4 endpoints de listas de `routes-usuarios.js` (`/api/perfil/seguidores`, `/api/perfil/siguiendo`, `/api/usuarios/:id/seguidores`, `/api/usuarios/:id/siguiendo`), que aplican `...mapearUsuarioConFoto(r)` a cada fila antes de agregar `yoSigo: yoSigo[r.id] === true`
- Qué entrega: objeto de usuario de API con el campo `fotoPerfil` (renombrado desde `foto_perfil`) ya resuelto
- Qué invoca: `resolverFotoPerfil`
- Qué recibe: `fila` (objeto crudo de la base de datos, típicamente con `foto_perfil`)

Complementa a este helper la migración única `servidor/DB/migrar_avatar_default.js`, que normaliza a `NULL` las fotos de los registros con `foto_perfil IS NULL`, vacío o `LIKE 'https://placehold.co%'` (ya ejecutada: normalizó las filas de seed con `placehold.co`); las fotos personalizadas de Cloudinary no se tocan.

### Flujo de Usuario

- Al cargar la aplicación, `AuthProvider` monta y ejecuta `fetchUser()` para validar la sesión con `GET /api/me`; en paralelo, `cookieConsent` se inicializa con un lazy initializer que lee `localStorage.getItem('cookie-consent')`. Si no existe una aceptación previa, el consentimiento resuelto (`resolvedConsent`) es `null` o `{accepted: false}`, por lo que `Notificaciones` calcula `shouldShowCookieToast === true` y la tarjeta toast de cookies aparece.
- Como `Notificaciones` resuelve el consentimiento desde `AuthContext` cuando el padre no pasa props, la tarjeta aparece en todos los puntos donde el componente se monta, no solo en los padres que inyectan `cookieConsent`/`onCookieAccept`/`onCookieReject`: también en `Inicio.jsx`, `RecuperarContraseñaCorreo.jsx`, `ReescribirContraseña.jsx` e `InicioFormularioCF.jsx`.
- Sin aceptación válida, `Notificaciones` renderiza dentro del `.notificaciones-container` la tarjeta `<article className="notificacion notif-cookie">` con el gif `/hi.gif`, el título "Becky te ha mandado un mensaje" y los botones "Aceptar todo" y "Rechazar todo"; `addNotification` descarta cualquier notificación de cookies que intente agregarse para no duplicar la tarjeta.
- Al hacer clic en "Aceptar todo" (`handleAccept`), la tarjeta invoca `resolvedAccept` con `{ accepted: true, timestamp }`; `AuthContext` actualiza `cookieConsent` mediante `setCookieConsent` y persiste la aceptación en `localStorage` (clave `cookie-consent`), por lo que en futuras sesiones la tarjeta no aparece.
- Al hacer clic en "Rechazar todo" (`handleReject`) o en el botón ✕ (que equivale a rechazar), la tarjeta invoca `resolvedReject` con `{ accepted: false, timestamp }` y marca `cookieToastDismissed = true`; el rechazo no se persiste en `localStorage`, queda solo para la sesión y, como el estado local se resetea con cada montaje, la tarjeta vuelve a aparecer al abrir login/registro (montajes nuevos) y en la próxima sesión.
- Con una decisión tomada (aceptada o rechazada), la tarjeta desaparece en ese montaje; `addNotification` deja de filtrar las notificaciones de cookies cuando `hasConsent` es verdadero.
- La persistencia selectiva es una decisión explícita: solo la aceptación se recuerda entre sesiones; el usuario que rechaza puede ser preguntado de nuevo en cada visita.

## Flujo de Autenticación

1. App carga → `AuthProvider` monta → `fetchUser()` → `GET /api/me`; además `cookieConsent` se inicializa desde `localStorage` (o en `null` si no hay aceptación previa), por lo que la tarjeta toast de consentimiento de cookies se muestra automáticamente cuando no hay aceptación (ver "Flujo de Usuario")
2. Si cookie válida → `user` set → `isAuthenticated=true` → UI muestra avatar en `BarraLateral`
3. Login: `POST /api/login` → cookies httpOnly → `window.location.href = '/'` → recarga → `fetchUser()` valida
4. Registro: wizard → `POST /preregistro` → email enviado → usuario `correo_verificado=0`
5. Usuario clic enlace → `GET /api/verificar-correo?token=...` → valida JWT → actualiza `correo_verificado=1` → marca token usado → redirect `FRONTEND_URL/verificar-correo?success=true`
6. Frontend `CuentaConfirmada` lee `success` → muestra éxito
7. Login exitoso de usuario verificado: si el backend responde `tienePreferencias === false`, `Inicio.jsx` monta `PreferenciasFormulario` → `GET /api/culturas` + `POST /api/preferencias` → guarda 1-3 preferencias en `usuario_preferencias`
8. Contraseña olvidada: `POST /api/olvido-contrasena` (neutral) → `POST /api/recuperar-contrasena` valida token tipo `restablecer`, actualiza hash y marca token usado → usuario redirigido al login
9. Cierre de sesión: `POST /api/logout` revoca el refresh del dispositivo (`usado=1`) y limpia cookies

## Flujo de Datos en Registro (Wizard)

```
Registro (estado: email, password, username, datosUsuario=null)
  │
  ├─ handleSubmit → POST /validacionregistro
  │    └─ success → setDatosUsuario({email,password,username}) → setVisible('InicioFormularioCF')
  │
  └─ InicioFormularioCF (recibe datosUsuario, onClose, notificationsRef, closeAll)
       │
       ├─ "Continuar" → OjosFormulario (mutación: datosUsuario.ojos)
       │       │
       │       ├─ "Continuar" → NarizFormulario (mutación: datosUsuario.nariz)
       │       │       │
       │       │       ├─ "Continuar" → CaraFormulario (mutación: datosUsuario.cara)
       │       │       │       │
       │       │       │       ├─ "Continuar" → ColoresFormulario (mutación: datosUsuario.colores)
       │       │       │       │       │
       │       │       │       │       ├─ "Continuar" → BocaFormulario (mutación: datosUsuario.labios)
       │       │       │       │       │       │
       │       │       │       │       │       ├─ "Continuar" → TiposPielFormulario (mutación: datosUsuario.tipospiel)
       │       │       │       │       │       │       │
       │       │       │       │       │       │       ├─ "Continuar" → EdadFormulario
       │       │       │       │       │       │       │       │
       │       │       │       │       │       │       │       └─ handleSubmit → POST /preregistro { ...datosUsuario, edad }
       │       │       │       │       │       │       │             │
       │       │       │       │       │       │       │             └─ success → closeAll('preregistro')
       │       │       │       │       │       │       │                   │
       │       │       │       │       │       │       │                   └─ PreregistroConfirmado (useEffect → closeAll)
       │       │       │       │       │       │       │                         │
       │       │       │       │       │       │       │                         └─ Registro: setShowPreregistroConfirmado(true)
       │       │       │       │       │       │       │
       │       │       │       │       │       │       └─ onClose limpia datosUsuario.ojos/nariz/etc al volver
       │       │       │       │       │       │
       │       │       │       │       │       └─ onClose limpia datosUsuario.cara/colores/labios/tipospiel al volver
       │       │       │       │       │
       │       │       │       │       └─ onClose limpia datosUsuario.colores/labios/tipospiel al volver
       │       │       │       │
       │       │       │       └─ onClose limpia datosUsuario.cara/colores/labios/tipospiel al volver
       │       │       │
       │       │       └─ onClose limpia datosUsuario.nariz/cara/colores/labios/tipospiel al volver
       │       │
       │       └─ onClose limpia datosUsuario.ojos/nariz/cara/colores/labios/tipospiel al volver
       │
       └─ onClose (botón X) → setVisible('registro') → vuelve a formulario inicial
```

**Clave**: `datosUsuario` se pasa por referencia y cada formulario muta su propiedad. Al retroceder (`onClose`), el padre limpia las propiedades de pasos posteriores para evitar datos residuales.

## Estilos y Temas

### estilos.css
Hoja global de diseño que define en `:root` todos los tokens de color, tipografía y radio usados por el resto de las hojas. Entre los tokens ya existentes se agregaron en esta iteración dos colores derivados de la paleta púrpura del proyecto:
- `--color-texto-suave: #5E4380`: texto secundario del módulo de perfil (etiquetas de stats, descripción vacía, pestañas inactivas, engranaje). Cumple WCAG AA con contraste 5.30:1 sobre `--color-fondo2` (`#d8cce8`), 7.22:1 sobre `--color-fondo` (`#f5f0f8`) y 8.11:1 sobre `#fff`
- `--color-acento-fuerte: #6B4E8C`: acento de iconos, pestaña activa, botón primario y foco visible en Perfil. Contraste 6.05:1 sobre `--color-fondo`, 6.79:1 sobre `#fff` y, en texto blanco encima, cumple AA para texto
Ambos tokens garantizan que los textos del módulo mantengan ≥4.5:1 y los iconos ≥3:1 (WCAG AA). Se definen únicamente en `:root` y se consumen como `var(--color-texto-suave)` / `var(--color-acento-fuerte)` en `perfil.css`.

### iniciosesion.css
Estilos base para modales auth/registro: `.fondo` (overlay centrado, `z-index: 100`), `.contenedor` (tarjeta blanca, max-width 420px), `.dialogo-wrapper`, `.dialogoformulario`, `.textoinput`, `.input-wrapper`, `.ojo-btn`, `.btn-submit`, `.link-olvide`, `.texto-registro`, `.BarrasProgreso`, `.barra-progreso-item`, `.cf-scroll-area`, `.contenedorinput`, `.input-container`, `.radio-label`, `.imagenesform`, `.texto_input`, `.instruccionesformulario`, `.close-btn`

### estilospequeños.css
Estilos barra lateral y notificaciones:
- `.barra-lateral`: `position: fixed`, `left: 0`, `top: 0`, `height: 100vh`, `width: 72px`, `z-index: 50`, `transition: width 0.25s`, `display: flex`, `flex-direction: column`, `align-items: center`
- `.barra-lateral:hover` (desktop): `width: 200px`
- El blob decorativo no es un `::before` propio de `.barra-blob` (ese `div` queda como marcador `aria-hidden` en el JSX): el blob visible es el pseudo-elemento `::before` de `.barra-lateral`, posicionado por el atributo `data-active-index` del `<nav>` con `transform: translate(...)` (escritorio: `translate(-50%, calc(-50% + 64px × índice))`; móvil: `translate(calc(-50% + 20% × índice), -50%)`); con `data-active-index="-1"` (rutas de perfil) queda en `opacity: 0`
- `@media (max-width: 768px)`: bottom bar, `width: 100%`, `height: auto`, `bottom: 0`, `flex-direction: row`, `justify-content: center`, `padding-bottom: env(safe-area-inset-bottom)`
- `.barra-lateral-auth`: `margin-top: auto` (desktop) / flex row (mobile)
- `.barra-lateral-auth-btn`: desktop `width: 100%`, `justify-content: flex-start`; mobile `width: 48px`, `justify-content: center` (orden CSS crítico)
- `.barra-lateral-avatar`: avatar circular de 36px con gradiente (`linear-gradient(135deg, var(--color-acento), var(--color-acento2))`) y `overflow: hidden`; `.barra-lateral-avatar img` rellena el 100% del contenedor con `object-fit: cover` y `display: block`, de modo que la foto real del usuario (`user.fotoPerfil`) se recorta como círculo sin deformarse
- `.notificaciones-container`: `position: fixed`, `right: 24px`, `bottom: 24px`, `width: 420px`, `z-index: 999`, `flex-direction: column-reverse`; en móvil (`max-width: 480px`) se vuelve fijo arriba con ancho completo y `padding: 0 12px`
- `.notificacion`: tarjeta con sombra, border-radius, animación entrada
- Solicitud de consentimiento como toast: `.notif-cookie` (`border-left: 4px solid var(--color-fondo3)`), `.cookie-consent-buttons` (`display: flex`, `gap: 0.5rem`, `justify-content: flex-start`, `flex-wrap: wrap`, `padding-top: 0.5rem`), `.cookie-consent-btn` con modificadores `--primary` (fondo `var(--color-fondo3)`, texto `var(--color-texto)`) y `--danger` (fondo `var(--color-elementos)`, texto blanco; reemplaza al antiguo `var(--color-error)`, variable que no está definida en `estilos.css`). No existen `.cookie-consent-overlay`, `.cookie-consent-modal`, `.cookie-consent-content`, `.cookie-consent-gif` ni `.cookie-consent-text` porque el modal se eliminó en favor del toast
- `@media (max-width: 480px)`: `.notif-emoji { display: none; }`, lo que oculta el gif de la tarjeta de cookies en móvil

### AppLayout.css
Archivo nuevo (`cliente/src/layout/AppLayout.css`) que define la clase `app-main` aplicada al `<main>` de `AppLayout.jsx`, reemplazando el margen lateral que antes se aplicaba con estilo inline:
- `app-main`: `margin-left: 72px` (deja sitio a la barra lateral fija de escritorio), `min-height: 100vh` y `transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)` para que el contenido acompañe la expansión de la sidebar al pasar el cursor
- `@media (max-width: 768px)`: `margin-left: 0` (la barra pasa a ser inferior y ya no ocupa espacio lateral) y `padding-bottom: 84px`, que deja espacio al final de la ventana para no tapar contenido con la bottom bar móvil de `BarraLateral`

### perfil.css
Estilos de la página de perfil (`cliente/src/estilos/PerfilEstilos/perfil.css`):
- `.perfil-header`: tarjeta en `display: grid` con `position: relative`, `grid-template-columns: auto minmax(0, 1fr) auto`, `align-items: center` y `column-gap: 28px`; `padding: 28px 72px 28px 28px` (derecho reservado al engranaje), `background: var(--color-fondo)`, `border-radius: var(--radius-card)` y `box-shadow: 0 16px 32px -20px rgba(83, 60, 94, 0.28)` (ver sección `Perfil.jsx`)
- `.perfil-avatar` base: redondo con `object-fit: cover` y `background: var(--color-fondo2)`, **sin tamaño propio** el 112px va acotado a `.perfil-header .perfil-avatar` junto al anillo blanco `box-shadow: 0 0 0 4px #fff` y las iniciales a 40px en `.perfil-header .perfil-avatar--fallback`; `.perfil-avatar--grande` (104px) se mantiene para la vista previa del modal de edición
- `.perfil-info`: bloque de información con `width: auto; min-width: 0` (ya no 260px fijo); `.perfil-username` es `<h1>` a 22px/600/`letter-spacing:-0.01em`/`overflow-wrap:anywhere`; `.perfil-descripcion` a 15px/1.55/máx. 44ch y `.perfil-descripcion--vacia` en `--color-texto-suave` (sin cursiva); `.perfil-info-fila` contiene username y botón Seguir/Siguiendo (inline para perfiles ajenos)
- `.perfil-stats`: rail de 4 columnas `grid-template-columns: repeat(4, minmax(88px, 1fr)); gap: 8px; align-items: start` **sin offset** (se eliminan `.perfil-stat:nth-child(3)` y `:nth-child(4)`); `.perfil-stat` (div y `--btn`) es `display: grid; justify-items: center; align-content: start; gap: 6px; font: inherit; color: inherit; background: none; border: 0; padding: 0` → icono 26px (`--color-acento-fuerte`), número 15px/600 con `font-variant-numeric: tabular-nums`, etiqueta 14px (`--color-texto-suave`); hover de `.perfil-stat--btn .perfil-stat-label` con `--color-acento-fuerte` + subrayado
- `.perfil-gear-wrap`/`.perfil-gear`: botón engranaje absoluto **dentro de la tarjeta** (`position: absolute; top: 14px; right: 14px; z-index: 5`) de 44px en `--color-texto-suave` (hover `--color-h1`/`--color-fondo2`); ya no hay bloque `@media (min-width:769px)` que lo hiciera `fixed` y blanco; `.perfil-gear-menu` desplegable absoluto (`top: 50px; right: 0; z-index: 6`, `min-width: 190px`, `box-shadow: 0 8px 24px var(--color-sombra)`) con items `.perfil-gear-item` y el modificador `.perfil-gear-item--peligro` ("Cerrar sesión")
- `.perfil-tabs`: grid `repeat(4, 1fr)` con `gap: 8px`, `max-width: 1000px`, `margin: 10px auto 0` y `padding: 0 20px` (≥769px) / `0 12px` (≤768px), idéntico a `.perfil-page` para que los bordes coincidan con la tarjeta; `.perfil-tab` con `padding: 16px 8px 14px`, `border-radius: 18px 18px 0 0`, color `--color-texto-suave` (hover `rgba(255,255,255,0.45)` + `--color-h1` en inactivas); `.perfil-tab--activa` en `#fff`/`--color-acento-fuerte`/600 y su `::after` (el "docket", `top: 100%; height: 14px; z-index:2`) cubre el `border-top` de `.perfil-contenido` y funde la pestaña con la zona blanca
- `.perfil-contenido`: zona blanca full-bleed (`background: #fff; flex: 1; border-top: 1.5px solid var(--color-fondo2)`) dentro de `.perfil-pagina` (flex-columna, `min-height: 100vh`) para que el blanco llegue hasta el fondo de la ventana
- `.perfil-vacio`: estado vacío contextual (`EstadoVacio`) en `display: grid; justify-items: center`, círculo `.perfil-vacio-icono` de 64px (`--color-fondo`/`--color-acento-fuerte`, icono 28px), título `.perfil-vacio-titulo` a 18px/600 (`--color-h1`) y texto `.perfil-vacio-texto` a 15px/1.55 (`--color-texto-suave`), además del botón `.perfil-btn--primary` solo en perfil propio
- Foco visible: `:focus-visible` con `outline: 3px solid var(--color-acento-fuerte)` en `.perfil-gear`, `.perfil-gear-item`, `.perfil-stat--btn`, `.perfil-btn` (offset 2px) y `.perfil-tab` (offset -3px)
- Responsive: `@media (max-width: 1000px)` header a 2 columnas (`auto minmax(0,1fr)`, `row-gap: 24px`) y `.perfil-stats` a fila completa (`grid-column: 1/-1`, `padding-top: 22px`, `border-top: 1px solid var(--color-fondo3)`); `@media (max-width: 768px)` apila el header (`flex-direction: column`, avatar 96px centrado, stats 2×2 `repeat(2,1fr)` sin divisor, pestañas `padding: 0 12px`, engranaje `top: 12px; right: 12px`); `@media (max-width: 480px)` oculta `.perfil-tab-nombre` con patrón `visually-hidden` (absolute + `clip: rect(0 0 0 0)`, ya no `display: none`); `@media (prefers-reduced-motion: reduce)` anula las transiciones del módulo

## Puntos Pendientes y Conocidos

### Backend No Implementado
- Aplicar el middleware `verificarAcceso` (`servidor/middleware/verificarToken.js`) en los routers futuros que aún no existen (videos, likes, comentarios, conversaciones); ya se aplica en `/api/preferencias` y en todo el router de usuarios (`routes-usuarios.js`)

### Backend Implementado (reciente)
- `POST /api/refresh` (renovación access token; usa `JWT_REFRESH_SECRET`, valida tipo/expiración/usado en BD)
- `POST /api/logout` (marca refresh del dispositivo como usado + limpia cookies)
- `POST /api/olvido-contrasena` / `POST /api/recuperar-contrasena` (recuperación contraseña con token tipo `restablecer`)
- `POST /api/reenviar-verificacion` (reenvía correo de verificación, respuesta neutral)
- `GET /api/culturas` / `POST /api/preferencias` (RQFN11-13)
- Limpieza de BD por eventos MySQL: `evt_eliminar_usuarios_no_verificados` y `evt_limpiar_tokens_expirados` (`SCHEMA_VERSION = 2`)
- `servidor/helpers/jwt.js` (firmar/verificar por familia: access, refresh, email) y `servidor/helpers/correo.js` (envío de correo)
- `servidor/helpers/imagenes.js` (default de foto de perfil: `FOTO_PERFIL_DEFECTO`, `resolverFotoPerfil`, `mapearUsuarioConFoto`)
- `servidor/DB/migrar_avatar_default.js` (migración única que normaliza a `NULL` las fotos `placehold.co`/vacías; no toca fotos Cloudinary)
- `servidor/Routes/routes-usuarios.js` (router de perfil: `GET/PUT /perfil`, `POST /perfil/contrasena` sin tilde, `PUT /perfil/foto`, `GET /usuarios/:id/perfil`, `POST /seguir/:id`, 4 listas de seguidores/siguiendo)
- `servidor/Routes/routes-notificaciones.js` (NUEVO: `GET /notificaciones` → `{ success, noLeidas, notificaciones }` con actor resuelto, `POST /notificaciones/leidas`; ambos tras `verificarAcceso`)
- Router renombrado a `routes-autenticacion.js` (antes `routes-registro-iniciosesion.js`)

### Frontend Pendiente
- **Notificaciones (RQFN69-72) COMPLETADO** (drawer superpuesto `NotificacionesPagina.jsx`, ver su sección); quedan solo los triggers `nuevo_contenido_seguido`, `nuevo_like`, `like_comentario`, `nuevo_comentario`, `semejanza_baja` cuando existan sus features de origen
- Lógica completa en `Conversaciones` y `Crear` (solo placeholders); Wiki está completo (RQFN73-78) y Maquillajes es placeholder funcional
- Auto-redirect si sesión activa al cargar app (RQFN3)

### Issues Conocidos Documentados
- Sidebar hover en mobile: movido a media query `min-width: 769px`
- Botones auth mobile: orden CSS asegura override de `width: 48px` / `justify-content: center`
- z-index sidebar (50) vs modales (100) resuelto
- Blob animation: posicionamiento suave pendiente de refinamiento
- Doble hashing password: eliminado bcrypt frontend, solo backend
- Axios 409: `validateStatus < 400` añadido
- Campo `boca` → `labios` unificado con BD `tipo_labios`
- Typo `caracterisiticas_fisicas` / `formas_ojos` corregidos en BD
- Email sending: try/catch interno tras commit para no fallar respuesta

## Convenciones de Código

- **Naming**: Componentes PascalCase (`BarraLateral`), hooks camelCase (`useAuth`), constantes UPPER_SNAKE (`NAV_ITEMS`)
- **Props**: Destructuring en firma `({ datosUsuario, onClose, notificationsRef, closeAll })`
- **Estado**: `useState` para UI, `useRef` para refs a DOM/componentes imperativos (`notificationsRef`, `containerRef`)
- **Efectos**: `useEffect` con dependencias explícitas; cleanup en listeners (`keydown`, `resize`)
- **Async**: `async/await` con `try/catch`; notificaciones de error via `notificationsRef.current?.addNotification()`
- **Estilos**: CSS Modules no usados; clases globales con prefijos semánticos (`.barra-lateral-`, `.notif-`, `.dialogo-`)
- **Accesibilidad**: `aria-label`, `aria-current`, `role="navigation"`, focus management programático, `aria-hidden` en decorativos

---

*Documentación generada el 2026-09-16 basada en lectura directa del código fuente en `cliente/src/Componentes/` y archivos relacionados. Actualización (2026-09-16): se reescribió la documentación del consentimiento de cookies (RQFN1-2) al simplificar el flujo a solo Aceptar/Rechazar todo, sin persistencia en `localStorage`; el modal ahora lo gestiona `Notificaciones` y el estado vive en `AuthContext`. Actualización adicional (2026-09-16): `Notificaciones` incorpora un fallback a `AuthContext` (`useAuth`, `resolvedConsent`, `resolvedAccept`, `resolvedReject`), de modo que el modal de consentimiento aparece en cualquier montaje del componente, con o sin props del padre. Actualización (2026-09-17): la solicitud de consentimiento de cookies dejó de ser un modal y ahora se presenta como una tarjeta toast estilo "Becky te ha mandado un mensaje" dentro del `.notificaciones-container`; la aceptación persiste en `localStorage` (clave `cookie-consent`) y el rechazo solo dura la sesión/montaje, por lo que se vuelve a preguntar en cada montaje nuevo y en la próxima sesión. Se eliminaron las clases de modal (`cookie-consent-overlay`, `cookie-consent-modal`, `cookie-consent-content`, `cookie-consent-gif`, `cookie-consent-text`), el botón de rechazo usa `var(--color-elementos)` en lugar de `var(--color-error)`, y `Notificaciones` ya no usa `createPortal` para cookies (los modales de autenticación de `BarraLateral` siguen usándolo). Actualización (2026-09-17): bloque de autenticación completado end-to-end — modales unificados vía `AuthModalContext`, helpers `jwt.js`/`correo.js`, middleware `verificarAcceso`, `POST /api/logout`, `POST /api/olvido-contrasena` + `POST /api/recuperar-contrasena`, `POST /api/reenviar-verificacion`, `GET /api/culturas` + `POST /api/preferencias`, formulario `PreferenciasFormulario` (RQFN11-13) y campo `tienePreferencias` en `/me`·`/login`·`/refresh`. Actualización (2026-09-18): foto de perfil predeterminada (icono B-Unick) — nuevo `servidor/helpers/imagenes.js` con `FOTO_PERFIL_DEFECTO`, `resolverFotoPerfil` y `mapearUsuarioConFoto`; `/api/login`, `/api/me`, `/api/refresh`, `GET /api/perfil` y `GET /api/usuarios/:id/perfil` resuelven `fotoPerfil` con el default, y las 4 listas de seguidores/siguiendo devuelven el campo renombrado `fotoPerfil` (antes `foto_perfil`) con el default ya resuelto. Se documentó `servidor/DB/migrar_avatar_default.js` (migración única que normaliza a `NULL` las fotos `placehold.co`/vacías). En el frontend, la página `Perfil` dejó de ser placeholder: se documentó el header reestructurado (avatar 112px con anillo blanco, rail de 4 stats, menú de cuenta del engranaje, barra de pestañas solo visual y estado vacío contextual) y la `BarraLateral` ahora muestra la foto real del usuario en el avatar vía `user.fotoPerfil` con CSS `.barra-lateral-avatar img`. Actualización (2026-09-18): se documentó el **rediseño de la página Perfil** (decisión de diseño aprobada por la usuaria, revierte la decisión "solo layout"): header en grid `auto minmax(0,1fr) auto` con avatar 112px + anillo blanco, rail de 4 stats sin offset (columnas `repeat(4, minmax(88px,1fr))`, números 15px/600 `tabular-nums`), engranaje dentro de la tarjeta (`top/right:14px`, ya no `fixed`), pestañas `.perfil-tabs` con `role="tablist|tab|tabpanel"` + `aria-selected`/`aria-controls`/`aria-labelledby`, `tabIndex` roving y navegación con ←/→/Inicio/Fin (constante `PESTANAS` + `moverPestana`), estado vacío contextual `EstadoVacio` (con `TEXTOS_VACIOS`, icono de la pestaña y botón de acción solo en perfil propio), `:focus-visible` con el token de acento, `<480px` nombres de pestaña ocultos con patrón `visually-hidden` y `prefers-reduced-motion: reduce`; nuevos tokens `--color-texto-suave: #5E4380` y `--color-acento-fuerte: #6B4E8C` en `estilos.css` (texto ≥4.5:1, iconos ≥3:1, WCAG AA) y responsive ≤1000px con stats a fila completa. Actualización (2026-09-18): layout y navegación — se documentó el nuevo `cliente/src/layout/AppLayout.css` (clase `app-main` con `margin-left: 72px` y `transition` en escritorio; `margin-left: 0` + `padding-bottom: 84px` dentro de `@media (max-width: 768px)`) y el cambio en `AppLayout.jsx` que reemplaza el estilo inline `style={{ marginLeft: '72px' }}` por `className="app-main"`. En `BarraLateral`, `NAV_ITEMS` quedó en 5 ítems (el perfil se trasladó a la sección de autenticación), `activeIndex` toma `-1` en `/perfil` y `/usuarios/*` (el blob decorativo se oculta con `opacity: 0` vía `data-active-index="-1"`) y el botón del usuario muestra la foto real con `aria-current="page"` y la clase `barra-lateral-auth-btn--activo` cuando la ruta es de perfil. Se corrigió en toda la documentación la especificación de los números de las estadísticas de Perfil: 15px/600 (antes se citaban 28px/700).*Actualización (2026-09-18, último): módulo de Notificaciones — página (RQFN69-72) COMPLETADO. Nuevo componente `cliente/src/Componentes/Notificaciones/NotificacionesPagina.jsx`: drawer superpuesto (escritorio: panel derecho ~400px sobre la página actual vía portal `id="panel-notificaciones"` con backdrop casi transparente; móvil ≤768px: pantalla completa), `role="dialog"` + `aria-modal`, foco inicial y ESC para cerrar; estados cargando → "Inicia sesión" → "Nada aquí" (RQFN69, con botón "Explorar B-unick") → lista persistida; marca todas como leídas al abrir (`POST /notificaciones/leidas`); `construirAcciones` renderiza acciones por tipo (enum §19.2) y `fechaRelativa`/`iniciales` como helpers. La campana de `BarraLateral.jsx` ya no navega: `handleNotificacionesClick` alterna el drawer (sin sesión abre login), botón con `aria-expanded`/`aria-controls="panel-notificaciones"` y badge `.barra-badge` con `noLeidas` real (se refresca al cerrar). La ruta `/notificaciones` de `main.jsx` pasó a `<Navigate to="/" replace />`. Backend nuevo `servidor/Routes/routes-notificaciones.js` con `GET /api/notificaciones` (`{ success, noLeidas, notificaciones }` con actor resuelto vía `mapearUsuarioConFoto` o `null` para tipos de sistema) y `POST /api/notificaciones/leidas`, ambos tras `verificarAcceso`; `SCHEMA_VERSION` subió a 3 (`notificaciones.usuario_actor_id` nullable + `fk_notif_actor` + seed de 3 notificaciones) y `POST /seguir` inserta `usuario_actor_id`. CSS nuevo `cliente/src/estilos/NotificacionesEstilos/notificaciones.css` (z-index 90, animaciones `notif-slide-in`/`notif-fade-in` anuladas con `prefers-reduced-motion: reduce`, `:focus-visible` con `--color-acento-fuerte`) y `.barra-badge` en `estilospequeños.css`. También se redujo `.perfil-username` a 22px (antes 28px). El código pasa node --check y build; lint en baseline (51 errores preexistentes). El punto pendiente real es la prueba runtime contra BD local (no disponible en esta máquina).*Actualización (2026-09-19, último): **rediseño del drawer de Notificaciones** (maqueta aplicada) — `NotificacionesPagina.jsx` + `notificaciones.css` + `--color-burbuja:#7a5fa0` en `estilos.css:48`. El panel mutó de "derecho ~400px con z-index 90" a **izquierdo pegado a la barra**: `left:72px; width:min(360px, calc(100vw - 72px))`, z-index **40** (bajo la barra=50), fondo `var(--color-fondo)`, borde y sombra por la derecha; móvil al 100% con `bottom:84px`. Cabecera 56px con título **16px/400** y botón cerrar discreto (36×36, sin borde ni fondo, glyph `✕`). Filas con filetes finos y **burbujas magenta** de Becky (`.notif-burbuja`, blanco sobre `#7a5fa0` 5.29:1); `@usuario` y cifras resaltadas por peso (500) en `--color-h1`/`--color-burbuja`; estado vacío = **fila de Becky** (`/logo.svg` + texto "Nada aquí todavía…", sin CTA). Filas con 1 acción clicables enteras (`<li role="button" tabIndex={0}>` con Enter/Espacio); `semejanza_baja` con botones "Cambiar categoría"/"Wiki" dentro de la burbuja (outline blanco). Se eliminaron `fechaRelativa`, `<time>`, punto de no leído e iconos por tipo. Retorno de foco a la campana (`prevFocoRef` + `cerrarConFoco`; `cerrar` puro para navegación). Regla de pesos del panel: **ningún elemento supera 500**. CSS muerto eliminado (`notif-btn`, `notif-item-acciones`, `notif-boton`, `notif-item-avatar--video`, `notif-item-punto`, `notif-item--nueva`, `notif-item-fecha`). Verificación: lint en baseline (51, sin nuevos), build OK, `node --check` OK. Desviaciones: (1) la barra expandida 250px (hover) se solapa con la parte izquierda del panel (z-index 40<50, no se tocó la barra); (2) el botón cerrar es el glyph `✕` y la burbuja de vacío no lleva CTA. Pruebas visuales/runtime pendientes para la usuaria (sin navegador/BD en este entorno).*
