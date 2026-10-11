<!--
═══════════════════════════════════════════════════════════════════════════
  REGLAS DE FORMATO — REPORTE FINAL DE PROYECTO / PROTOTIPO (CETI)
  Estas reglas se llevan como comentario para que el volcado a Word las respete.
═══════════════════════════════════════════════════════════════════════════

1. Hoja tamaño carta (8.5 x 11 pulgadas, 21.5 x 28 cm) con márgenes
   uniformes de al menos 2.54 cm por lado; los márgenes superior e inferior
   pueden ampliarse hasta 3 cm.

2. Cada capítulo inicia en página nueva y su título ocupa una páginaola.
   Los subcapítulos no requieren página nueva.

3. Tipografía Times New Roman, Courier New, Arial o Calibri a 12 puntos.
   Se usan cursivas para títulos de libros, periódicos y publicaciones;
   géneros, especies y variedades; la primera aparición de un término nuevo,
   técnico o clave; palabras o frases citadas como ejemplo lingüístico;
   palabras que pueden leerse erróneamente; símbolos estadísticos y variables
   algebraicas; algunas puntuaciones de pruebas y escalas; números de volumen
   en la lista de referencias; y rangos de una escala.

4. Se usa un tipo de letra distinto y uniforme (en Markdown, `código en línea`)
   para nombres de variables, funciones, objetos, clases, tablas y campos.

5. Texto justificado con interlineado de espacio y medio. Sólo se permiten
   espacios adicionales al inicio de una sección o subsección.

6. Los bloques de código van alineados a la izquierda, con interlineado
   sencillo y tamaño mínimo de 10 puntos. Se permite el tipo de letra y los
   colores de la plataforma de desarrollo, no se permiten fondos negros, y el
   código debe incluirse como texto, nunca como imagen. Se incluyen
   únicamente fragmentos relevantes, nunca archivos completos.

7. Números de página en la esquina superior derecha, en arábigos
   consecutivos, a al menos 2.54 cm de la orilla derecha, entre el borde
   superior y la primera línea de texto. Se exceptúan las páginas destinadas
   a ilustraciones.

8. Portada: la misma del protocolo, con el logo oficial del CETI.

9. Encabezado: nombre corto del título, alineado a la izquierda.

10. Pie de página: nombre o nombres de las y los integrantes del equipo.

═══════════════════════════════════════════════════════════════════════════
  CRITERIOS DE NUMERACIÓN ADOPTADOS EN ESTE DOCUMENTO
  · Capítulos: romanos (I, II, III, IV, V, VI, VII, VIII).
  · Subcapítulos: arábigos de dos números (1.1, 1.2, 1.3), el primero
    indica el capítulo al que pertenecen y el segundo es consecutivo dentro
    de ese capítulo.
  · Imágenes: número de capítulo seguido de consecutivo dentro del capítulo
    (I.1, I.2, …). Es el único criterio usado en todo el documento.
  · Tablas de base de datos: se identifican como "Tabla I.n".
═══════════════════════════════════════════════════════════════════════════
-->

# Documentación del código

Este documento describe, módulo por módulo, la implementación técnica del
sitio web social B-unick. La documentación avanza por orden dentro de la
carpeta de componentes del cliente (`cliente/src/Componentes`). La primera
pasada documentó los tres archivos de la subcarpeta `Conversaciones`, esto es,
el detalle de una conversación, el listado de conversaciones y la ventana que
recoge los datos de una conversación nueva, junto con el archivo
`Crear/Crear.jsx`, que publica una creación de contenido. La segunda pasada
documenta los cuatro archivos de la subcarpeta `elementos_pequeños`, que son
la ventana de alerta con la voz de Becky, la barra de navegación lateral, el
globo de diálogo del asistente y los avisos emergentes con la solicitud de
consentimiento de cookies. Quedan pendientes las demás carpetas de componentes,
entre ellas el registro de la cuenta, el inicio de sesión, el perfil, la
enciclopedia de estilos y el visor de videos, que se documentarán en pasadas
posteriores respetando el mismo orden de carpeta.

El esquema general que se sigue en cada módulo es el siguiente: un primer
apartado que sitúa el componente en el sistema y da cuenta de su papel; un
apartado de inventario que enumera las unidades internas que lo componen; un
apartado por cada función, subcomponente, auxiliar o manejador, redactado en
prosa continua y cubriendo nombre, variables, qué hace, cómo lo hace, quién lo
invoca, qué entrega, a quién invoca y qué recibe; un apartado dedicado al
contrato con los servicios del servidor que el componente consume; un apartado
sobre la construcción del marcado; un apartado sobre la hoja de estilos
asociada; y un apartado final de hallazgos, observaciones y asuntos
pendientes.

**Estado de la numeración:** los diez capítulos de estas tres pasadas y sus
subcapítulos quedan numerados de forma estable y consecutiva. Los capítulos I a
IV corresponden a los módulos de la subcarpeta `Conversaciones` y al módulo de
publicación de contenido; los capítulos V a VIII corresponden a los cuatro
archivos de la subcarpeta `elementos_pequeños`; los capítulos IX y X
corresponden a los dos archivos de la subcarpeta `Inicio`. Cuando se
incorporen los módulos de las carpetas que faltan, la numeración romana de los
capítulos se extenderá a partir del XI y los apartados siguientes a cada bloque
se numerarán de forma consecutiva. [PENDIENTE: renumerar los capítulos y los
apartados al integrar los módulos de las carpetas que quedan pendientes]

## Índice de este documento

El índice enumera los diez capítulos de estas tres pasadas y los apartados de
cada uno de ellos, en el mismo orden en que aparecen en el cuerpo del documento.
Cada capítulo corresponde a un archivo del cliente y respeta el esquema
descrito en la introducción.

- **I. Detalle de una conversación del foro de culturas urbanas**
  - 1.1 Ubicación del módulo y papel dentro del sistema
  - 1.2 Inventario de unidades documentadas
  - 1.3 La constante `TITULO_TOAST`
  - 1.4 El auxiliar `iniciales`
  - 1.5 Los subcomponentes `IconoCorazon`, `IconoBandera` y `Avatar`
  - 1.6 El manejador `avisar`
  - 1.7 Los estados del componente `ConversacionDetalle`
  - 1.8 El efecto de carga y el manejador `cargarConversacion`
  - 1.9 El registro de la visita
  - 1.10 La carga del catálogo de motivos
  - 1.11 El control de teclado y el orden de las capas superpuestas
  - 1.12 La interacción de "me gusta" en la conversación
  - 1.13 El guard de sesión `requiereLogin` y los manejadores de la ventana de denuncia
  - 1.14 La publicación de comentarios y respuestas
  - 1.15 El "me gusta" de comentarios y respuestas
  - 1.16 El envío de la denuncia y el valor derivado `textoCompleto`
  - 1.17 Los valores derivados y las capas superpuestas del renderizado
  - 1.18 El contrato con el servidor: los siete servicios que consume el componente
  - 1.19 La hoja de estilos del módulo
  - 1.20 Hallazgos, observaciones y asuntos pendientes
- **II. El listado de conversaciones del foro de culturas urbanas**
  - 2.1 Ubicación del módulo y papel dentro del sistema
  - 2.2 Inventario de unidades documentadas
  - 2.3 La constante `LIMITE` y el objeto `FILTROS_VACIO`
  - 2.4 El arreglo `TEMAS_FALLBACK`
  - 2.5 El arreglo `ORDEN_TABS` y el conjunto de órdenes del servidor
  - 2.6 El objeto `CULTURAS_COLOR`
  - 2.7 La función `tiempoRelativo`
  - 2.8 La unidad exportada `ConversacionCard`
  - 2.9 Los cinco subcomponentes de icono
  - 2.10 La función auxiliar `iniciales` y su duplicación
  - 2.11 El manejador `cargarMas`
  - 2.12 El manejador `alternarLike` y la línea contadora `textoConteo`
  - 2.13 El par de manejadores `abrirPanel` y `cerrarPanel`
  - 2.14 Los manejadores `cambiarBorrador` y `alternarCulturaBorrador`
  - 2.15 Los manejadores `aplicarFiltros` y `limpiarFiltros`
  - 2.16 Los manejadores `abrirCrear` y `cambiarOrden`
  - 2.17 El manejador `manejarTecladoOrden` y la navegación por teclado
  - 2.18 La función `nombreCultura`
  - 2.19 El cálculo `chipsFiltros` y el manejador `quitarChip`
  - 2.20 Los seis efectos del componente principal
    - 2.20.1 El efecto de carga de catálogos
    - 2.20.2 El efecto de espera de la búsqueda
    - 2.20.3 El efecto de carga y recarga del listado
    - 2.20.4 El efecto del observador de intersección
    - 2.20.5 El efecto que devuelve el foco al abrir el panel
    - 2.20.6 El efecto de la tecla de escape
  - 2.21 Los catorce estados del componente principal y la construcción del listado
  - 2.22 Hoja de estilos del listado de conversaciones
  - 2.23 Hallazgos, observaciones y asuntos pendientes
- **III. La ventana de creación de una conversación**
  - 3.1 Ubicación del archivo y papel dentro del módulo
  - 3.2 Inventario de unidades documentadas
  - 3.3 La constante `MAX_IMAGENES` y los once estados
  - 3.4 Los dos efectos y los dos cálculos derivados
  - 3.5 El manejador `abrirWidgetImagenes`
  - 3.6 Los manejadores `quitarImagen` y `enviar`
  - 3.7 Construcción del marcado y las tres vías de cierre
  - 3.8 La hoja de estilos de la ventana de creación
  - 3.9 Hallazgos, observaciones y asuntos pendientes
- **IV. La publicación de una nueva creación de contenido**
  - 4.1 Ubicación del módulo y papel dentro del sistema
  - 4.2 Inventario de unidades documentadas
  - 4.3 La constante `TITULO_TOAST`
  - 4.4 Las constantes de catálogos y de límites
  - 4.5 La función auxiliar `rangoDesdeEdad`
  - 4.6 Los subcomponentes `Cheveron` y `CajaSubida`
  - 4.7 La referencia de notificaciones y el manejador `avisar`
  - 4.8 Los veintitrés estados del componente
  - 4.9 Los valores derivados `subculturas`, `esModoVideo` y `opcionesEdad`
  - 4.10 El efecto de carga inicial
  - 4.11 Los manejadores `opcionesRasgo`, `limpiarRasgos` y `alternarMisCaracteristicas`
  - 4.12 Los manejadores `abrirWidgetVideo` y `abrirWidgetImagenes`
  - 4.13 El manejador `quitarImagen`
  - 4.14 Los manejadores `agregarEtiqueta` y `quitarEtiqueta`
  - 4.15 Los manejadores de pasos y el cálculo `pasosPayload`
  - 4.16 El manejador `validar`
  - 4.17 El manejador `publicar`
  - 4.18 El contrato con el servidor: los cuatro servicios que consume el componente
  - 4.19 La construcción del marcado y el estado sin sesión
  - 4.20 La hoja de estilos del módulo
  - 4.21 Hallazgos, observaciones y asuntos pendientes
- **V. La ventana de alerta con la voz de Becky**
  - 5.1 Ubicación del módulo y papel dentro del sistema
  - 5.2 Inventario de unidades documentadas
  - 5.3 La función `AlertaBecky` y sus cuatro propiedades
  - 5.4 El portal al documento y el orden de las capas superpuestas
  - 5.5 El efecto de la tecla de escape y las tres vías de cierre
  - 5.6 La construcción del marcado y el avatar
  - 5.7 Los tres módulos que invocan la alerta
  - 5.8 Hoja de estilos relacionada
  - 5.9 Hallazgos, observaciones y asuntos pendientes
- **VI. La barra de navegación lateral del sitio**
  - 6.1 Ubicación del módulo y papel dentro del sistema
  - 6.2 Inventario de unidades documentadas
  - 6.3 Las tres tablas que declaran el contenido de la barra
  - 6.4 El diccionario `ICON_MAP`
  - 6.5 La derivación del botón activo
  - 6.6 Los estados del componente y la referencia del contenedor
  - 6.7 El recorrido con teclado
  - 6.8 El cambio de página por pulsación
  - 6.9 El conteo de notificaciones no leídas
  - 6.10 La campana, el panel superpuesto y su cierre
  - 6.11 La sección de autenticación
  - 6.12 La ventana de acceso y sus dos formas de cierre
  - 6.13 El montaje en el armazón y las rutas que quedan fuera
  - 6.14 Hoja de estilos relacionada
  - 6.15 Hallazgos, observaciones y asuntos pendientes
- **VII. El globo de diálogo del asistente Becky**
  - 7.1 Ubicación del módulo y papel dentro del sistema
  - 7.2 Inventario de unidades documentadas
  - 7.3 La función `Dialogo` y su única propiedad
  - 7.4 La construcción del marcado: el globo y el avatar
  - 7.5 Los diecisiete montajes y sus textos
  - 7.6 Las hojas de estilos que lo dibujan
  - 7.7 Hallazgos, observaciones y asuntos pendientes
- **VIII. Los avisos emergentes y la solicitud de consentimiento de cookies**
  - 8.1 Ubicación del archivo y su doble papel dentro del sistema
  - 8.2 Inventario de unidades del archivo
  - 8.3 La función envoltoria y el contrato con el padre
  - 8.4 La lista de avisos y la función `addNotification`
  - 8.5 La reserva del título de cookies y la función `removeNotification`
  - 8.6 La resolución del consentimiento y su persistencia
  - 8.7 Los manejadores `handleAccept` y `handleReject`
  - 8.8 La tarjeta de consentimiento
  - 8.9 El marcado de un aviso y sus dos barras de acción
  - 8.10 Los once montajes y lo que entrega cada uno
  - 8.11 Hoja de estilos del componente
  - 8.12 La duplicación de reglas en la hoja del acceso
  - 8.13 Relación con los demás módulos del sistema
  - 8.14 Hallazgos, observaciones y asuntos pendientes
- **IX. La pantalla principal del sitio y su puerta de preferencias**
  - 9.1 Ubicación del módulo y papel dentro del sistema
  - 9.2 Inventario de unidades documentadas
  - 9.3 El contexto de sesión y la referencia de avisos
  - 9.4 El estado de cierre y la condición de visibilidad
  - 9.5 El efecto que vuelve a considerar el formulario
  - 9.6 La bienvenida de una sola vez por sesión de navegador
  - 9.7 El manejador `completarPreferencias` y la llamada al contexto
  - 9.8 El marcado que devuelve el componente
  - 9.9 Hoja de estilos relacionada
  - 9.10 Hallazgos, observaciones y asuntos pendientes
- **X. La página informativa del proyecto y su catálogo de culturas**
  - 10.1 Ubicación del archivo y papel dentro del sistema
  - 10.2 Inventario de unidades documentadas
  - 10.3 El diccionario `TAGLINES`
  - 10.4 El auxiliar `iniciales`
  - 10.5 El subcomponente `Sello`
  - 10.6 La función `InfoInicio` y el consumo del archivo de culturas
  - 10.7 El encabezado y las dos secciones de texto
  - 10.8 La retícula de culturas y el contrato con la enciclopedia
  - 10.9 Hoja de estilos del módulo
  - 10.10 Hallazgos, observaciones y asuntos pendientes

---

<!-- SALTO DE PÁGINA: el capítulo I inicia en página nueva y su título ocupa una
     página sola (regla de formato 2). -->

# I. Detalle de una conversación del foro de culturas urbanas

## 1.1 Ubicación del módulo y papel dentro del sistema

El componente documentado en este capítulo es el archivo
`cliente/src/Componentes/Conversaciones/ConversacionDetalle.jsx`, que
implementa la pantalla de detalle de una conversación del foro. Su papel dentro
del sistema es el de ser la terminal de lectura y de interacción de la unidad de
contenido más ligera del proyecto: una conversación es un hilo de tema breve,
con autor, un subestilo asignado, hasta tres imágenes y una lista de
comentarios con respuestas. No lleva video ni pasos de tutorial y, en cambio,
se genera desde el modal de creación del módulo hermano
`ConversacionNueva.jsx` y se lista en el feed del módulo hermano
`Conversaciones.jsx`.

Esta pantalla materializa los requerimientos funcionales RQFN133 a RQFN141. En
concreto, el componente muestra el autor y su estilo, las métricas de la
conversación, la galería de imágenes con un visor ampliado, la acción de
"me gusta" (RQFN134), los comentarios con su formulario de publicación
(RQFN135), el "me gusta" individual de cada comentario y de cada respuesta
(RQFN136), y el sistema de denuncias con catálogo de motivos (RQFN138, RQFN139)
que puede derivar en la eliminación automática del hilo por consenso de la
comunidad (RQFN141).

El componente se monta exclusivamente desde el enrutador de la aplicación. La
declaración de la ruta se encuentra en `cliente/src/main.jsx`, que importa el
componente en la línea 12 y lo asigna a la ruta `/conversaciones/:id` en la
línea 35. Esa ruta cuelga del elemento `<Route element={<AppLayout />}>` abierto
en la línea 31, de modo que el detalle de conversación **sí** se muestra dentro
del armazón con barra lateral, a diferencia de la pantalla de detalle de
video, que en la línea 28 se registra fuera de ese armazón. Conviene precisar un
punto que suele dar lugar a error: el orden en que se declaran estas tres rutas
**no** es lo que las distingue, porque el enrutador que las procesa ordena
internamente sus patrones por especificidad y un segmento literal tiene
prioridad sobre un parámetro. Es decir, la ruta `/conversaciones/nueva` de la
línea 34 gana sobre `/conversaciones/:id` de la línea 35 porque su tercer
segmento es texto fijo, y la ruta `/conversaciones` de la línea 36 solo recibe
la URL cuando no hay un segmento adicional. Sí es en cambio imprescindible el
orden en el router del **servidor**, donde el emparejamiento sí sigue el orden de
declaración; esa distinción se desarrolla en el apartado 1.18.

Quién enlaza hacia esta pantalla, es decir, quién navega hacia
`/conversaciones/<identificador>` para que el enrutador monte el componente, se
determinó buscando el patrón de construcción de esa cadena de texto en todo el
repositorio. Se encontraron tres puntos de entrada. El primero es la tarjeta del
feed, en `cliente/src/Componentes/Conversaciones/Conversaciones.jsx`, donde la
línea 135 calcula la variable `detalleHref` con el valor
`/conversaciones/${conversacion.id}` y la línea 787 llama a `navigate()` con
ese destino cuando el usuario confirma la creación de una conversación nueva y
quiere saltar a ella. El segundo es la pestaña de chats del perfil, en
`cliente/src/Componentes/Perfil/Perfil.jsx`, donde la línea 174 dibuja un
`<Link to={`/conversaciones/${conv.id}`}>` por cada conversación iniciada por
el usuario cuya tarjeta se está mostrando. El tercero es la ruta de escape
en migas, escrita dentro del propio componente en la línea 348, que es un
`<Link to="/conversaciones">` y que por tanto sale de él y no entra.

En cuanto a los servicios del servidor, el componente consume siete rutas del
router `servidor/Routes/routes-conversaciones.js`, cuyo montaje en el servidor
principal se realiza en `servidor/index.js`. De esas siete, cinco exigen
sesión: la validación de vista, el "me gusta" de la conversación, la
publicación de comentarios y respuestas, el "me gusta" de un comentario y el
envío de denuncias. Las dos restantes son públicas: la lectura del detalle y el
catálogo de motivos de denuncia. El detalle de cada una de ellas se desarrolla
en el apartado 1.18.

El componente también depende, de forma directa o indirecta, de cuatro piezas
externas que conviene ubicar antes de leer el resto del capítulo: el cliente de
peticiones HTTP declarado en `cliente/src/api/axios.js`, el contexto de
autenticación `cliente/src/context/AuthContext.jsx`, el contexto del modal de
acceso `cliente/src/context/AuthModalContext.jsx` y el componente de avisos
emergentes `cliente/src/Componentes/elementos_pequeños/Notificaciones.jsx`. La
hoja de estilos que corresponde a este componente es
`cliente/src/estilos/ConversacionesEstilos/conversaciones-detalle.css`, que se
importa en la línea 15 del propio componente y de la que se ocupa el apartado
1.19. Ninguna otra hoja de estilos del proyecto declara selectores `conv-det-*`
o `conv-denuncia-*`: se verificó mediante búsqueda que el prefijo de clases de
este módulo es exclusivo de la hoja de detalle, lo que confirma que el módulo no
comparte su superficie visual con ningún otro.

[IMAGEN I.1 — Diagrama a bloques del módulo de detalle de conversaciones, con
el enrutador de rutas, el contexto de autenticación, el contexto del modal de
acceso, el componente de avisos emergentes, el cliente de peticiones HTTP, el
router de conversaciones del servidor y la hoja de estilos.]

El diagrama anterior representa el módulo como una caja central. A la entrada
llegan el enrutador de rutas, que entrega el identificador de la conversación
extraído de la URL, el contexto de autenticación, que informa si hay sesión
activa, el contexto del modal de acceso, que permite abrir la ventana de inicio
de sesión, y el contexto de avisos emergentes, que aporta el gestor imperativo
de notificaciones. Desde la caja central salen la cliente de peticiones HTTP,
que es el único canal hacia el servidor, y la hoja de estilos. El diagrama no
incluye el resto de componentes del sitio porque no participan en el
intercambio de datos de esta pantalla.

## 1.2 Inventario de unidades documentadas

El archivo tiene quinientas ochenta y cuatro líneas y se organiza en tres
bloques: un bloque de constantes y auxiliares puros, un bloque de subcomponentes
de presentación y, finalmente, el componente principal con sus manejadores de
evento y sus efectos. Las unidades que este capítulo documenta, en el orden en
que aparecen en el archivo, son la constante `TITULO_TOAST`; el auxiliar
`iniciales`; los subcomponentes `IconoCorazon`, `IconoBandera` y `Avatar`; el
componente `ConversacionDetalle` con sus catorce piezas de estado y sus
cuatro efectos; los manejadores `avisar`, `cargarConversacion`,
`requiereLogin`, `cerrarDenuncia`, `abrirDenuncia`, `toggleLike`,
`enviarComentario`, `abrirRespuesta`, `enviarRespuesta`, `toggleLikeComentario`,
`toggleMotivo` y `enviarDenuncia`; el valor derivado `textoCompleto`; los
valores derivados `esDueño` e `yaDenuncie`; y las dos capas superpuestas que el
componente monta al final del árbol, que son el visor ampliado de imágenes y la
ventana de denuncia.

## 1.3 La constante `TITULO_TOAST`

La constante `TITULO_TOAST` se declara en la línea 17 y contiene la cadena de
texto `Becky te ha mandado un mensaje`. No recibe variables ni parámetros,
porque es un valor fijo cuyo propósito es dar a todos los mensajes que esta
pantalla emite la identidad de la asistentevirtual Becky, de modo que el
usuario distinga los mensajes del sistema de los del resto de la aplicación. Se
invoca únicamente desde el manejador `avisar`, descrito en el apartado 1.6, que
la lee al construir cada objeto de notificación; no hay ninguna otra lectura de
esta constante en el repositorio. A su vez, la cadena que contiene es
relevante para el comportamiento del componente de avisos, como se explica en
ese mismo apartado.

## 1.4 El auxiliar `iniciales`

El auxiliar `iniciales` es una función de alcance de módulo declarada en las
líneas 19 a 26 que recibe un parámetro llamado `nombre` y entrega una cadena de
hasta dos letras mayúsculas. Su propósito es proporcionar un
texto alternativo visible
cuando un usuario no tiene foto de perfil, de modo que el avatar nunca aparezca
como un círculo vacío.

El algoritmo que sigue es el siguiente. Primero normaliza el valor recibido con
el operador `||`, de manera que un nombre nulo, indefinido o vacío se convierta
en el signo de interrogación. A continuación separa ese texto en palabras con
la expresión regular `/\s+/`, que parte por cualquier cantidad de espacios en
blanco seguidos o precedidos por otros espacios. Después descarta los
fragmentos vacíos que esa separación puede producir al principio o al final del
texto mediante `filter(Boolean)`, recorta el resultado a las dos primeras
palabras con `slice(0, 2)` y convierte la inicial de cada una a mayúscula con
`map`. Finalmente une esas iniciales sin separador mediante `join('')`. Así, un
nombre como `olatumamauwu` produce `O` y un nombre compuesto como
`Zamora Esqueda` produce `ZE`.

Quién lo invoca es únicamente el subcomponente `Avatar`, en la línea 47, y lo
hace en la rama en que no existe fotografía. Esa es la única llamada en todo el
repositorio, de manera que la función existe al servicio de un solo consumidor y
no recibe ningún otro argumento. No invoca a ninguna otra rutina, porque es una
función pura que no depende de servicios, de red ni del estado de la
aplicación, y entrega directamente su cadena de texto, sin efectos secundarios.

## 1.5 Los subcomponentes `IconoCorazon`, `IconoBandera` y `Avatar`

Los tres subcomponentes de esta sección son declarados en el bloque anterior al
componente principal y comparten la característica de ser presentacionales: no
mantienen estado propio, no llaman a la red y no dependen del contexto de la
aplicación.

El subcomponente `IconoCorazon` se declara en las líneas 28 a 34 y dibuja un
corazón. Recibe un único parámetro llamado `filled`, con valor inicial `false`,
que decide si la figura aparece rellena o solo delineada: cuando el valor es
verdadero asigna el atributo `fill` del elemento vectorial al valor
`currentColor` y cuando es falso le asigna `none`, mientras que el trazo, el
grosor de línea, los remates y las uniones se mantienen fijos. El resto de sus
parámetros de dibujo son literales: el sistema de coordenadas es
`viewBox="0 0 24 24"` y la única forma es una curva descrita en el atributo
`d`. El elemento se marca como decorativo con `aria-hidden="true"`, porque la
información que transmite ya está disponible en el texto adyacente y en el
atributo `aria-pressed` del botón que lo contiene. Entrega un elemento vectorial
y no invoca a ninguna otra rutina.

Quién invoca a `IconoCorazon` se verificó buscando el nombre en todo el
repositorio: hay exactamente tres lugares de uso, todos dentro del mismo
archivo y todos en la misma forma, que es como contenido de un botón y con el
parámetro `filled` atado al valor de estado que corresponde. El primero es el
botón de "me gusta" de la conversación, en la línea 390, donde el parámetro
recibe `conversacion.estadoPropio.like`. El segundo es el botón de "me gusta" de
un comentario raíz, en la línea 447, donde recibe `c.likeDado`. El tercero es el
botón de "me gusta" de una respuesta, en la línea 497, donde recibe
`r.likeDado`. En los tres casos el algoritmo y el resultado son los que se
describen aquí; lo único que cambia entre los tres usos es el tamaño, que el
controlador de estilos resuelve según el contexto: 17 píxeles para el botón de
la conversación según el bloque `.conv-det-accion svg`, y 15 píxeles para los
comentarios según el bloque `.conv-det-comentario-like svg`.

El subcomponente `IconoBandera` se declara en las líneas 36 a 43 y dibuja un
banderín, que es el icono con el que la pantalla representa la denuncia. No
recibe ningún parámetro, porque su forma no depende de ningún estado: se dibuja
siempre delineada, con `fill="none"` y el trazo heredado del color de texto
actual. Su geometría se compone de un contorno cerrado para la tela del
banderín y de una línea vertical que representa el mástil. También está marcado
como decorativo con `aria-hidden="true"`, porque el botón que lo contiene
expone su propósito mediante un texto visible y mediante los atributos
`aria-label` y `title`. Se invoca una sola vez en el repositorio, en la línea
401, dentro del botón de denuncia. No invoca a ninguna otra rutina y entrega
únicamente el elemento vectorial.

El subcomponente `Avatar` se declara en las líneas 45 a 49 y es el responsable
de dibujar el retrato de un usuario. Recibe cuatro parámetros: `tamaño`, con
valor inicial 36, que es un número que se convierte en el sufijo de una clase
de estilo mediante la interpolación `conv-det-avatar--${tamaño}`; `foto`, que
es la dirección de la imagen o un valor vacío; `nombre`, que es el nombre del
usuario; y `usuarioId`, que es el identificador numérico que se usa para
construir el destino del enlace.

Lo que hace es devolver un enlace navegable que contiene, según el caso, una
imagen del usuario o sus iniciales. El algoritmo es breve: compone la clase
`conv-det-avatar` seguida de la clase modificadora del tamaño, arma el destino
`/usuarios/${usuarioId}` y, dentro del enlace, resuelve una condición ternaria
que devuelve una etiqueta de imagen cuando `foto` es un valor verdadero y un
`span` con el resultado de `iniciales(nombre)` en el caso contrario. El enlace
lleva además un `aria-label` construido con la cadena
`Perfil de ${nombre}`, de manera que un lector de pantalla anuncie a quién
pertenece el avatar aunque la imagen no tenga texto alternativo; la imagen, en
cambio, se declara con `alt` vacío porque el nombre ya lo anuncia el enlace.

Quién lo invoca se verificó buscando el nombre en el repositorio: existen
cuatro usos, todos dentro del propio archivo. El primero es el avatar del autor
de la conversación, en la línea 357, con `tamaño={40}` y con los datos
`conversacion.creador.fotoPerfil`, `conversacion.creador.username` y
`conversacion.creador.id`. El segundo es el avatar del autor de un comentario
raíz, en la línea 436, con `tamaño={32}` y con los datos `c.autor.fotoPerfil`,
`c.autor.nombre` y `c.autor.id`. El tercero es el avatar del autor de una
respuesta, en la línea 486, con `tamaño={28}` y con los datos
`r.autor.fotoPerfil`, `r.autor.nombre` y `r.autor.id`. El cuarto uso, en la
línea 486, corresponde al mismo caso del tercero y no requiere descripción
adicional. La diferencia entre los tres usos es, por tanto, únicamente el
tamaño y el origen de los datos: el tamaño 40 se reserva para el autor del hilo,
el 32 para los comentarios de primer nivel y el 28 para las respuestas, lo que
produce una jerarquía visual descendente, y las tres clases modificadoras
correspondientes están definidas en la hoja de estilos con medidas de 40, 32 y 28
píxeles respectivamente.

Los tres subcomponentes no reciben ningún valor de retorno,
porque React no les asigna
ninguna, y no invocan servicios externos. El único servicio al que recurren es el
enrutador de rutas del cliente, a través del componente `Link` en el caso de
`Avatar`, para resolver la navegación al perfil del usuario.

## 1.6 El manejador `avisar`

El manejador `avisar` se declara en las líneas 80 a 82 y es la única vía por la
que el componente habla con el usuario cuando una operación no sucede como se
esperaba. Recibe dos parámetros: `message`, que es el texto que verá el usuario, y
`type`, cuyo valor inicial es `success` y que clasifica el aviso como correcto o
como error.

Lo que hace es pedir que se muestre una notificación emergente con el título
`Becky te ha mando un mensaje`. El algoritmo cabe en una línea: evalúa
`notificationsRef.current?.addNotification`, es decir, busca el método
`addNotification` en el objeto al que apunta la referencia `notificationsRef` y,
si el objeto no existe, no hace nada gracias al encadenamiento opcional. Al
encontrarlo, le entrega un objeto con cuatro propiedades: `title`, que toma el
valor de la constante `TITULO_TOAST`; `message`, que es el texto recibido; `type`,
que es la clasificación recibida; y `showGif`, que se fija en `false` para que la
tarjeta no incluya la imagen animada.

La función se declara con el envoltorio `useCallback` y con un arreglo de
dependencias vacío, de modo que su identidad es estable durante toda la vida del
componente y puede aparecer en la lista de dependencias de otros efectos sin
provocar ejecuciones adicionales. No entrega ningún valor de retorno.

Quién la invoca son siete manejadores de este mismo componente:
`cargarConversacion`
no la invoca, porque en su lugar escribe el error en el estado, pero sí la
invocan `toggleLike` en las líneas 172 y 175, `enviarComentario` en las líneas
196 y 199, `enviarRespuesta` en las líneas 233 y 236, `toggleLikeComentario` en
las líneas 271 y 274, `enviarDenuncia` en las líneas 297, 300, 305 y 307 y, por
último, `enviarDenuncia` también en la línea 298 a través del mismo camino. En
todos los casos se invoca con el mensaje que el servidor devolvió en el campo
`error` de su respuesta, y con el tipo `error` como segundo argumento; el único
exceso es la línea 297, donde se invoca sin segundo argumento para que el tipo
por defecto, `success`, pinte el mensaje de eliminación automática con el estilo
de aviso correcto.

A quién invoca es al componente de avisos `Notificaciones`, que se explica a
continuación. Un detalle relevante para entender el comportamiento es que ese
componente descarta cualquier notificación cuyo título coincida con
`Becky te ha mandado un mensaje` **y** cuyo mensaje contenga la palabra
`cookies`, porque esa combinación está reservada a la solicitud de
consentimiento, que el componente gestiona por su cuenta. Ninguno de los
mensajes que emite esta pantalla contiene esa palabra, de manera que todos los
avisos de `avisar` se agregan efectivamente a la lista y se muestran como
tarjetas.

El componente `Notificaciones` es una función envoltoria creada con
`forwardRef`, declarada en
`cliente/src/Componentes/elementos_pequeños/Notificaciones.jsx`,
que expone hacia su padre dos métodos mediante `useImperativeHandle`: el método
`addNotification`, que agrega un objeto a un arreglo de estado y le asigna un
identificador con `Date.now().toString()`, y el método `removeNotification`, que
filtra el arreglo por ese identificador. El mismo componente administra la
solicitud de consentimiento de cookies: cuando no hay una aceptación registrada,
dibuja una tarjeta con los botones `Aceptar todo` y `Rechazar todo`. En esta
pantalla, ese componente se monta en la línea 578 sin ninguna propiedad, dentro
de la llamada a `createPortal` con destino `document.body`. Al no recibir las
propiedades `cookieConsent`, `onCookieAccept` ni `onCookieReject` de Rechazar,
el componente resuelve el consentimiento desde el contexto de autenticación, de
modo que la tarjeta de cookies **también puede aparecer en el detalle de
conversación** si el usuario no ha aceptado todavía.

## 1.7 Los estados del componente `ConversacionDetalle`

El componente principal se declara en las líneas 51 a 583 y es la unidad que
contiene toda la lógica de la pantalla. Esta sección describe sus estados y
efectos; los manejadores que los modifican se tratan en los apartados
siguientes.

El componente obtiene primero cuatro valores del entorno. La línea 52 extrae
`id` de los parámetros de la ruta mediante `useParams`, y esa es la única fuente
del identificador de la conversación que se muestra. La línea 53 obtiene
`navigate` del enrutador, que usará tanto para volver al feed cuando la
conversación haya sido eliminada como para el botón de retorno del estado de
error. La línea 54 obtiene `isAuthenticated` del contexto de autenticación, que
es un valor booleano derivado de la existencia de un usuario cargado, y la
línea 55 obtiene `openModal` del contexto del modal de acceso, que es la
función que abre la ventana de inicio de sesión.

El estado se organiza en cinco grupos declarados en las líneas 58 a 78. El
primero grupo es el de la carga de datos y contiene tres piezas: `cargando`, un
booleano que arranca en `true` y que mientras sea verdadero impide que se
renderice cualquier contenido de la conversación; `errorCarga`, que arranca en
`null` y que cuando toma un valor de texto hace que la pantalla renderice el
estado de error en lugar del detalle; y `conversacion`, que arranca en `null` y
que, una vez relleno, contiene el objeto completo que devolvió el servidor,
incluidos sus comentarios anidados. El segundo grupo es el de las acciones de
comentario y contiene cinco piezas: `nuevoComentario`, que es el texto del
cuadro de comentario principal; `enviandoComentario`, un booleano que desactiva
el botón de envío mientras la petición está en vuelo; `respondiendoA`, que
almacena el identificador del comentario raíz que está siendo respondido o
`null` si no hay ninguna respuesta abierta; `respuestaTexto`, que es el texto
del cuadro de respuesta; y `enviandoRespuesta`, un booleano equivalente al
anterior para las respuestas. El tercer grupo es el de la visita y contiene una
sola pieza, `vistoEnviadoRef`, una referencia cuyo valor inicial es `false` y que
actúa como bandera de "la visita ya fue reportada". El cuarto grupo es el de la
denuncia y contiene cinco piezas: `motivos`, un arreglo que arranca vacío y que
recibe el catálogo de motivos; `denunciaAbierta`, un booleano que controla la
visibilidad de la ventana de denuncia; `denunciaSeleccion`, un arreglo de
identificadores de motivos que arranca vacío; `enviandoDenuncia`, un booleano
que desactiva los botones del diálogo mientras se envía; y `alerta`, que
guarda un mensaje para una ventana emergente y que, como se documenta en el
apartado 1.20, **nunca recibe un valor distinto de `null`**. El quinto grupo
está formado por `lightbox`, que almacena la dirección de la imagen ampliada
que se está mostrando o `null` si el visor está cerrado.

La referencia `notificationsRef` se declara en la línea 56 con el valor `null` y
es el canal por el que el componente alcanza al gestor de notificaciones
descrito en el apartado 1.6.

## 1.8 El efecto de carga y el manejador `cargarConversacion`

El manejador `cargarConversacion` se declara en las líneas 84 a 99 y es el
encargado de obtener del servidor el objeto de la conversación.

Lo que hace es pedir la conversación al servidor y, según el resultado, dejar la
pantalla en estado de detalle o en estado de error. Recibe únicamente el
identificador de la ruta, que no recibe como parámetro sino que captura del
alcance del componente mediante el arreglo de dependencias.

El algoritmo que sigue tiene cuatro pasos. En el primero escribe `cargando`
en `true` y `errorCarga` en `null`, de manera que cualquier intento
anterior queda anulado y la pantalla vuelve al esqueleto mientras se espera.
En el segundo ejecuta `api.get` contra la ruta `/conversaciones/${id}`, es
decir, contra el servicio de detalle descrito en el apartado 1.18. En el
tercero decide qué hacer con la respuesta mediante una doble condición:
exige que el código de estado sea exactamente 200 y que el cuerpo tenga la
propiedad `success` con valor verdadero. Si se cumple, escribe
`res.data.conversacion` en el estado `conversacion`; si no, escribe en
`errorCarga` el texto del campo `error` de la respuesta o, si ese campo no
existe, la cadena fija `No se pudo cargar la conversación.`. En el cuarto,
el bloque `finally` escribe `cargando` en `false`, de modo que la pantalla
deje el esqueleto tanto en éxito como en error.

La segunda rama del algoritmo es la que se activa cuando la petición falla con
excepción, es decir, cuando hay un error de red o cuando el servidor devuelve un
código de estado que la configuración del cliente HTTP no considera exitoso. Esa
rama vive en el bloque `catch`, que escribe en `errorCarga` el mensaje que el
servidor hubiera enviado en `err.response.data.error` o, en su defecto, la misma
cadena fija anterior.

La declaración se envuelve en `useCallback` con el arreglo de dependencias
`[id]`, de manera que la función cambia de identidad únicamente cuando cambia la
conversación que se está viendo; esa estabilidad es la que hace que el efecto
que la invoca, descrito a continuación, no se dispare en cada renderizado.

Quién la invoca es el efecto de las líneas 101 a 103, que se declara con las
dependencias `[cargarConversacion]` y cuyo cuerpo envuelve la llamada dentro de
`Promise.resolve().then(...)`. Ese envoltorio microtarea cumple una función
concreta: hace que la llamada ocurra fuera del ciclo de dibujado del efecto, de
modo que el primer renderizado, que todavía dibuja el esqueleto, no se
interrumpe. Es la única invocación de `cargarConversacion` en el repositorio.
Como la dependencia de ese efecto es la propia función y la función solo cambia
cuando cambia `id`, el efecto se vuelve a disparar cuando el usuario navega de
una conversación a otra sin desmontar el componente.

Qué entrega la función es, en sentido estricto, una promesa sin valor, porque no
tiene `return`; su efecto es escribir en los estados, y eso es exactamente lo que
el efecto necesita. A quién invoca es al servicio de detalle del servidor, a
través del cliente HTTP descrito en el apartado 1.18, y qué recibe de él es un
cuerpo con la forma `{ success, conversacion }` o, en caso contrario, un cuerpo
con la forma `{ error }` y un código de estado.

## 1.9 El registro de la visita

El efecto de las líneas 107 a 112 es el que hace que la conversación cuente una
vista. Recibe dos dependencias: la constante `convId`, declarada en la línea 106
como `conversacion?.id`, que existe para evitar que el efecto se dispare cuando
todavía no hay conversación cargada, y el valor `isAuthenticated`.

Lo que hace es enviar una sola vez por visita la petición que incrementa el
contador de vistas de la conversación. El algoritmo es el siguiente. Primero
aborta si no hay identificador de conversación, es decir, si la carga todavía no
ha terminado. Segundo, aborta si la bandera `vistoEnviadoRef.current` ya está en
`true`, lo que garantiza que la petición no se repita aunque el efecto vuelva a
dispararse. Tercero, aborta si no hay sesión iniciada, porque el servicio de
vista exige sesión y el detalle es público. Solo cuando las tres condiciones se
superan escribe `true` en la bandera, con lo cual bloquea cualquier intento
posterior, y lanza `api.post` contra la ruta `/conversaciones/${convId}/visto`
prometiendo que un fallo no interrumpe nada, mediante un `catch` vacío.

El uso de una referencia y no de un estado es deliberado: escribir en un estado
provocaría un renderizado adicional, mientras que escribir en `current` no lo
hace. La bandera sobrevive a los re-ejecuciones del efecto dentro de la misma
instancia del componente, lo que es relevante porque la aplicación se monta
dentro de `StrictMode`, en la línea 21 de `cliente/src/main.jsx`, y ese modo
vuelve a ejecutar los efectos al montar en desarrollo. La bandera, en cambio,
**no** sobrevive a un desmontaje y montaje reales, de manera que si el usuario
sale del detalle y vuelve a entrar, la visita se cuenta de nuevo, que es el
comportamiento deseado.

Quién lo invoca es el propio motor de renderizado de React, que dispara el
efecto cuando cambian `convId` o `isAuthenticated`. No es invocado de forma
directa por ningún manejador. A quién invoca es al servicio de vista descrito en
el apartado 1.18, y qué recibe es un cuerpo `{ success: true }` o un código de
estado de error que la aplicación descarta deliberadamente, porque el contador de
vistas no debe alterar lo que el usuario ve.

## 1.10 La carga del catálogo de motivos

El efecto de las líneas 115 a 121 obtiene la lista de motivos de denuncia. Se
declara con un arreglo de dependencias vacío, de modo que se ejecuta una única
vez al montar el componente.

Lo que hace es pedir el catálogo y almacenarlo en el estado `motivos`. El
algoritmo lanza `api.get` contra la ruta `/conversaciones/denuncia-motivos` y,
en el bloque de resolución, comprueba que el código de estado sea 200 y que el
cuerpo tenga `success` con valor verdadero; si se cumple, escribe
`res.data.motivos` o, si esa propiedad no existe, un arreglo vacío. Cualquier
fallo se descarta con un `catch` vacío, lo que deja la lista vacía y hace que la
ventana de denuncia se muestre sin motivos.

Existe una discrepancia entre el comentario que acompaña al efecto, en la línea
114, que dice `Catálogo de motivos al abrir la denuncia`, y el comportamiento
real, que es una carga al montar la página. La consecuencia práctica es que la
petición se emite incluso si el usuario nunca abre la ventana de denuncia. Se
reporta como observación en el apartado 1.20.

Quién lo invoca es el motor de renderizado, al montar el componente, y no hay
ninguna otra invocación. A quién invoca es al catálogo de motivos descrito en el
apartado 1.18, y qué recibe es un cuerpo con la forma
`{ success, motivos }` donde cada motivo es un objeto con las propiedades `id` y
`descripcion`.

## 1.11 El control de teclado y el orden de las capas superpuestas

El efecto de las líneas 142 a 151 instala un escuchador global de teclado. El
algoritmo es el siguiente: crea una función local `alTeclear` que compara la
tecla pulsada con el valor `Escape` y, cuando coincide, cierra la capa superior
que esté abierta, dando prioridad a la más reciente: si hay una imagen ampliada,
escribe `null` en `lightbox`; si no la hay pero la ventana de denuncia está
abierta, invoca `cerrarDenuncia`. Después registra la función como escuchador del
evento `keydown` de la ventana y devuelve la función que la retira, de modo que
el efecto se limpia al desmontar.

Dosetails sobre esta implementación deben quedar registrados. La primera es que
el efecto **no declara arreglo de dependencias**, por lo que React lo ejecuta
después de cada renderizado; en cada una de esas ejecuciones se retira el
escuchador anterior y se instala uno nuevo cuyo cierre léxico corresponde al
renderizado actual. El
comportamiento observable es correcto, porque el cierre léxico
siempre refleja el valor
vigente de `lightbox` y de `denunciaAbierta`, pero el trabajo de registro y
baja del escuchador se repite en cada renderizado. La segunda es que el orden de
comprobación está escrito en el propio `if` como dos ramas: primero la imagen
ampliada y después la denuncia, de manera que el orden de capas superpuestas de
la interfaz es exactamente el inverso al orden en que se apilan en el árbol de
elementos, y la tecla de escape cierra siempre la capa que está visualmente más
encima.

Quién lo invoca es el motor de renderizado de React. A quién invoca es a la
ventana del navegador, que es donde se registra el escuchador, y, en el caso de
la rama de la denuncia, al manejador `cerrarDenuncia` descrito en el apartado
1.13. No recibe ningún valor de retorno.

## 1.12 La interacción de "me gusta" en la conversación

El manejador `toggleLike` se declara en las líneas 154 a 177 y atiende el botón
de "me gusta" del encabezado.

Lo que hace es alternar el "me gusta" del usuario sobre la conversación, de forma
optimista: primero cambia la pantalla y después confirma con el servidor. El
algoritmo tiene cinco pasos. En el primero pide autorización mediante
`requiereLogin()`, que si no hay sesión abre la ventana de acceso y devuelve
falso, con lo cual el manejador termina. En el segundo pide que exista
`conversacion`, otra guarda que en la práctica nunca se activa porque el botón
solo se dibuja cuando la carga terminó con éxito, pero que protege contra un
estado nulo. En el tercero lee el valor anterior en la variable `anterior`, que
guarda `conversacion.estadoPropio.like`, y calcula el estado optimista mediante
una función de actualización: escribe un nuevo objeto de conversación en el que
el campo `like` se niega y el contador `likes` aumenta en uno si el valor
anterior era falso, o disminuye en uno si era verdadero. En el cuarto ejecuta
`api.post` contra la ruta `/conversaciones/${conversacion.id}/like`. En el
quinto, si la respuesta llega con código 200 y `success`, vuelve a escribir el
estado para **sincronizarlo con la verdad del servidor**, tomando tanto el
valor de `like` como el contador de la respuesta; si la respuesta no cumple esa
condición, muestra un aviso de error.

Es importante señalar un comportamiento que la lectura del código deja claro y
que conviene documentar: **la actualización optimista no se revierte cuando la
petición falla**. En efecto, las dos ramas de error, la que atiende una
respuesta no exitosa y la que atiende una excepción, se limitan a invocar
`avisar` y no vuelven a escribir en `conversacion`. En consecuencia, si el
servidor rechaza la operación, el corazón permanece pintado y el contador
permanece alterado hasta que se recargue la página. La misma observación aplica
al manejador del "me gusta" de los comentarios, descrito en el apartado 1.15.

Quién lo invoca es el `onClick` del botón que la línea 387 coloca en el bloque de
acciones del encabezado, y no hay ninguna otra invocación. Entrega un valor de
retorno que es una promesa, porque el manejador es asíncrono. A quién invoca es
al servicio de "me gusta" descrito en el apartado 1.18, y qué recibe de él es un
cuerpo con la forma `{ success, like, cantidadLikes }`, o bien un cuerpo con la
propiedad `error` y un código de estado.

## 1.13 El guard de sesión `requiereLogin` y los manejadores de la ventana de denuncia

El guard `requiereLogin` se declara en las líneas 123 a 127 y es la pieza que
hace que todas las acciones de escritura de la pantalla respeten la existencia
de sesión. Su nombre describe exactamente su contrato: la función no recibe
parámetros, y devuelve un valor booleano que indica si la acción puede continuar
o no. El algoritmo tiene dos ramas: si hay sesión devuelve `true` de inmediato;
si no la hay, invoca `openModal('login')` y devuelve `false`.

Quién lo invoca son cinco manejadores, y el orden de comprobación importa porque
todos empiezan por él: `toggleLike` en la línea 155, `enviarComentario` en la
línea 181, `enviarRespuesta` en la línea 212, `toggleLikeComentario` en la línea
243 y `enviarDenuncia` en la línea 287. A su vez, `abrirDenuncia` lo invoca de
manera indirecta, en la línea 136, a través de una condición que interrumpe el
flujo cuando devuelve falso. No lo invoca `abrirRespuesta` como llamada directa,
pero sí comparte con él la misma lógica al inicio de su cuerpo, como se explica
más adelante.

A quién invoca es al contexto del modal de acceso, cuya función `openModal`
acepta el nombre del modo de diálogo y lo abre. Un detalle de ese contexto es
que la función descarta silenciosamente la petición cuando ya existe una
sesión, de manera que la doble comprobación que hace este guard, primero por
`isAuthenticated` y luego por `openModal`, es coherente con el comportamiento de
dicho contexto.

El manejador `cerrarDenuncia` se declara en las líneas 129 a 133 y es el
responsable de desmontar la ventana de denuncia. El algoritmo empieza con una
guarda: si `enviandoDenuncia` es verdadero, el manejador no hace nada, con lo
que el usuario no puede cerrar el diálogo mientras la petición está en vuelo.
Superada la guarda, escribe `false` en `denunciaAbierta` y un arreglo vacío en
`denunciaSeleccion`, de modo que la ventana desaparezca y la selección de
motivos se reinicie para la próxima apertura.

Quién lo invoca son tres lugares. El primero es el botón `Cancelar` del
diálogo, en la línea 562. El segundo es el manejador `enviarDenuncia`, en las
líneas 295 y 304, una vez que el servidor confirma la denuncia y una vez que el
servidor la rechaza por duplicada. El tercero es el efecto de teclado del
apartado 1.11, cuando se pulsa la tecla de escape con la ventana abierta. Entrega
nada y no invoca a ninguna otra rutina.

El manejador `abrirDenuncia` se declara en las líneas 135 a 139 y es el
responsable de mostrar la ventana de denuncia. Su algoritmo es breve: primero
llama a `requiereLogin()` y, si el resultado es falso, termina, con lo cual un
usuario sin sesión ve la ventana de acceso en lugar de la de denuncia; después
escribe `true` en `denunciaAbierta` y un arreglo vacío en `denunciaSeleccion`.

Quién lo invoca es el `onClick` del botón de denuncia, en la línea 396, y no hay
ninguna otra invocación. Nótese que el botón además se dibuja deshabilitado
cuando la conversación es del propio usuario o cuando ya fue denunciada, según
las variables derivadas que se explican en el apartado 1.17, de manera que la
comprobación del servidor que impide denunciar la propia conversación es, en la
práctica, inalcanzable desde esta interfaz. Entrega nada y no invoca a ninguna
otra rutina salvo el guard de la línea 136.

## 1.14 La publicación de comentarios y respuestas

El manejador `enviarComentario` se declara en las líneas 180 a 203 y atiende el
formulario principal de comentarios. Lo que hace es publicar un comentario raíz
y añadirlo a la lista sin recargar la página.

El algoritmo tiene seis pasos. Primero pide autorización con `requiereLogin()` y
aborta si no la hay. Segundo normaliza el contenido del cuadro de texto con la
variable `texto`, que es `nuevoComentario.trim()`, es decir, el texto del estado
sin espacios al principio ni al final; si el resultado queda vacío, el manejador
aborta, aunque en la práctica el botón ya aparece deshabilitado en ese caso.
Tercero escribe `true` en `enviandoComentario`, lo que deshabilita el botón de
envío y cambia su rótulo por un puntos suspensivos. Cuarto ejecuta `api.post`
contra la ruta `/conversaciones/${conversacion.id}/comentarios` entregando un
cuerpo con una sola propiedad, `texto`. Quinto, si la respuesta llega con código
201 y `success`, construye la variable `nuevo`, que es el objeto de comentario
devuelto por el servidor más una propiedad `respuestas` igual a un arreglo vacío,
porque el servidor no anida respuestas en un comentario recién creado pero el
componente las espera siempre; a continuación escribe el estado con una
actualización que concatena ese objeto al arreglo de comentarios y aumenta en
uno el contador `cantidadComentarios`, y vacía el cuadro de texto. Sexto, el
bloque `finally` restituye `enviandoComentario` a `false`.

Quién lo invoca es el manejador de envío del formulario que la línea 411 declara,
que a su vez impide la recarga nativa de la página invocando
`preventDefault()` sobre el evento antes de llamar a esta función; no hay
ninguna otra invocación. A quién invoca es al servicio de comentarios descrito
en el apartado 1.18, y qué recibe de él es un cuerpo con la forma
`{ success, comentario }` y código 201, donde el comentario trae
`id`, `usuarioId`, `texto`, `cantidadLikes` en cero, `likeDado` en falso, un
indicador `esRespuesta`, el autor con su avatar resuelto y un arreglo `respuestas`
vacío.

El manejador `abrirRespuesta` se declara en las líneas 205 a 209 y es el
responsable de abrir el cuadro de respuesta bajo un comentario. Recibe un
parámetro llamado `comentarioId`, que es el identificador del comentario raíz que
se quiere responder. El algoritmo pide primero autorización con `requiereLogin()`
y aborta si no la hay; después escribe el identificador recibido en
`respondiendoA`, lo que hace que el JSX dibuje el formulario de respuesta
justo debajo de ese comentario, y escribe una cadena vacía en `respuestaTexto`
para que el campo empiece limpio. Su contraparte visual, el atributo `autoFocus`
del campo de la línea 473, hace que el cursor quede ya dentro del cuadro.

Quién lo invoca es el `onClick` del botón `Responder` que la línea 452 coloca en
la barra de cada comentario raíz, y la llamada se hace con el identificador del
comentario como argumento explícito. No hay ninguna otra invocación. Entrega
nada y no invoca a ninguna otra rutina.

El manejador `enviarRespuesta` se declara en las líneas 211 a 240 y es el
equivalente del anterior para las respuestas. Recibe un parámetro llamado
`padreId`, que es el identificador del comentario al que se responde. Su
algoritmo es casi el mismo que el del apartado anterior, con tres diferencias
que conviene señalar. La primera es el cuerpo de la petición: aquí se envían
dos propiedades, `texto` y `comentario_padre_id` con el valor de `padreId`, y esa
segunda propiedad es la que el servidor interpreta para anidar la respuesta y
para decidir a quién dirige la notificación. La segunda es la forma de insertar
el resultado: en lugar de concatenar al final del arreglo, se recorre el arreglo
de comentarios con `map` y se sustituye únicamente el elemento cuyo identificador
coincide con `padreId` por una copia del mismo con su arreglo de respuestas
ampliado en una unidad; los demás elementos se devuelven sin tocar. La tercera es
el cierre: al éxito escribe `null` en `respondiendoA`, con lo que el formulario
desaparece, y vacía `respuestaTexto`.

Quién lo invoca es el `onSubmit` del formulario de respuesta que el JSX dibuja
cuando `respondiendoA` coincide con el identificador del comentario, en las
líneas 461 a 465, y que también previene la recarga nativa. No hay ninguna otra
invocación. A quién invoca es al mismo servicio de comentarios del apartado
anterior, con la única diferencia de que envía el identificador del padre; qué
recibe es el mismo cuerpo `{ success, comentario }` con código 201, en el que el
servidor además marca el indicador `esRespuesta` en verdadero, dato que esta
pantalla no lee porque la posición dentro del árbol ya determina que se trata de
una respuesta.

## 1.15 El "me gusta" de comentarios y respuestas

El manejador `toggleLikeComentario` se declara en las líneas 242 a 276 y atiende
el botón de "me gusta" tanto de los comentarios raíz como de las respuestas. A
diferencia del resto, recibe un parámetro que es el objeto de comentario
completo, y no su identificador, precisamente porque necesita conocer tanto su
estado de "me gusta" como su contador.

Lo que hace es alternar el "me gusta" del usuario sobre un comentario concreto,
recursivamente. El algoritmo tiene cuatro pasos y dos funciones auxiliares. En
el primer paso lee el valor anterior en `anterior`, que es `comentario.likeDado`.
En el segundo define la función `actualizar`, que recibe una lista de
comentarios y devuelve una lista nueva: recorre cada elemento, y si su
identificador coincide con el del comentario pulsado devuelve una copia con el
"me gusta" negado y el contador ajustado en más o menos uno según el valor
anterior; si no coincide, pero el elemento tiene respuestas, vuelve a invocarse
a sí misma sobre su arreglo de respuestas antes de devolverlo, y esa recursión
es lo que permite que un mismo manejador funcione igual para un comentario de
primer nivel y para una respuesta, sin importar la profundidad, y también para
cualquier nivel de anidamiento futuro que el servidor llegue a producir. Con esa
función ya definida, la escribe en el estado de la conversación. En el tercer
paso ejecuta `api.post` contra la ruta
`/conversaciones/${conversacion.id}/comentarios/${comentario.id}/like`. En el
cuarto paso, si la respuesta llega con código 200 y `success`, define una segunda
función llamada `sincronizar`, con la misma estructura recursiva que `actualizar`
pero que en lugar de invertir el valor usa directamente el `like` y el
`cantidadLikes` que devolvió el servidor, y escribe el resultado en el estado;
las dos ramas de error se limitan, otra vez, a invocar `avisar` sin revertir el
cambio optimista.

Como se vio en el apartado 1.12, el cambio optimista tampoco se revierte cuando
la operación falla.

Quién lo invoca son dos lugares, ambos con el argumento explícito y ambos
idénticos en su forma: el `onClick` del botón de "me gusta" de un comentario
raíz, en la línea 444, que entrega el objeto `c`, y el `onClick` del botón de
"me gusta" de una respuesta, en la línea 494, que entrega el objeto `r`. No hay
ninguna otra invocación. A quién invoca es al servicio de "me gusta" de
comentarios descrito en el apartado 1.18, y qué recibe de él es un cuerpo con la
forma `{ success, like, cantidadLikes }`.

## 1.16 El envío de la denuncia y el valor derivado `textoCompleto`

El manejador `toggleMotivo` se declara en las líneas 279 a 284 y es el
responsable de marcar o desmarcar un motivo en la ventana de denuncia. Recibe un
parámetro llamado `motivoId`, que es el identificador del motivo pulsado. Lo que
hace es alternar ese identificador dentro del arreglo de selección. El algoritmo
usa la forma funcional de actualización del estado: recibe la selección
anterior, comprueba con `includes` si el identificador ya estaba; si estaba, la
filtra para quitarlo, y si no, construye un arreglo nuevo con el identificador
añadido al final. Devolver un arreglo nuevo en la rama de adición es lo que
permite que la interfaz detecte el cambio y vuelva a dibujar los botones.

Quién lo invoca es el `onClick` de cada botón de motivo que el JSX dibuja en la
línea 550, una vez por cada elemento del catálogo `motivos`. No hay ninguna otra
invocación. Entrega nada y no invoca a ninguna otra rutina.

El manejador `enviarDenuncia` se declara en las líneas 286 a 314 y es el
responsable de registrar la denuncia. Su algoritmo tiene siete pasos.
Primero pide autorización con `requiereLogin()` y aborta si no la hay.
Segundo aborta si `denunciaSeleccion` está vacío, aunque el botón de envío
ya aparece deshabilitado en ese caso. Tercero escribe `true` en
`enviandoDenuncia`, lo que deshabilita los dos botones del diálogo. Cuarto
ejecuta `api.post` contra la ruta
`/conversaciones/${conversacion.id}/denuncias` entregando un cuerpo con una
sola propiedad, `motivos`, cuyo valor es el arreglo de identificadores
seleccionado. Quinto, con la respuesta exitosa, cierra la ventana con
`cerrarDenuncia` y comprueba la propiedad `eliminada`: si la conversación
fue eliminada, muestra el mensaje que el servidor declaró en su campo
`message` o, en su defecto, la cadena fija
`La conversación fue eliminada por la comunidad.`, y a continuación invoca
`navigate('/conversaciones', { replace: true })` para devolver al usuario al
feed sin dejar la entrada de conversación en el historial del navegador; si
la conversación **no** fue eliminada, muestra el mensaje de agradecimiento
`Denuncia enviada. Gracias por ayudarnos a cuidar la comunidad.` y marca
`denuncie` en verdadero dentro de `estadoPropio`, con lo que el botón de
denuncia queda deshabilitado y muestra la etiqueta `Denunciada`. Sexto, si
la respuesta llega con código 409, que es el código que el servidor emplea
cuando el usuario ya había denunciado esa conversación, cierra igualmente la
ventana y muestra el mensaje de error del servidor o la cadena
`Ya denunciaste esta conversación.`. Séptimo, cualquier otro resultado no
exitoso vuelve a invocar `avisar` con el mensaje disponible, y el bloque
`finally` restituye `enviandoDenuncia` a `false`.

Quién lo invoca es el `onClick` del botón `Enviar denuncia` de la línea 568. No
hay ninguna otra invocación. A quién invoca es al servicio de denuncias descrito
en el apartado 1.18; qué recibe de él es un cuerpo con la forma
`{ success, eliminada }`, que puede incluir además la propiedad `message` cuando
la conversación fue eliminada, o bien un cuerpo con la propiedad `error` y el
código 400, 404, 409 o 500.

El valor `textoCompleto` se calcula en las líneas 316 a 319 mediante el gancho de
memoización. Su propósito es entregar el texto de la conversación en una sola
línea de texto, listo para pintarse en el encabezado sin conservar saltos, con el
fin de que el espaciado se controle por las reglas de la hoja de estilos y no por
el contenido. El algoritmo tiene tres pasos: si no hay conversación devuelve una
cadena vacía; en caso contrario toma el campo `texto`, o una cadena vacía si no
existe, lo sustituye mediante la expresión regular `/\s+/g`, que reemplaza
**toda** secuencia de espacios en blanco, incluidos saltos de línea y tabuladores,
por un único espacio, y finalmente recorta los espacios de los extremos con
`trim`. El gancho declara `[conversacion]` como dependencias, de manera que el
cálculo no se repite en cada renderizado y solo vuelve a ejecutarse cuando cambia
el objeto de la conversación. Lo invoca el propio componente, en la línea 363,
como contenido del párrafo marcado con la clase `conv-det-texto`. No invoca a
ninguna otra rutina y entrega una cadena de texto.

## 1.17 Los valores derivados y las capas superpuestas del renderizado

El componente, una vez superadas las dos salidas tempranas que se describen en el
apartado siguiente, calcula dos valores derivados en las líneas 340 y 341. La
variable `esDueño` toma el valor de `conversacion.esDueño`, es decir, de la
comparación entre el identificador de la sesión y el identificador del creador
que el servidor realizó. La variable `yaDenuncie` toma el valor de
`conversacion.estadoPropio.denuncie`, es decir, de si el usuario ya tiene una
fila en la tabla de denuncias para esa conversación. Ambas se usan juntas en las
líneas 397 a 402 para decidir el estado del botón de denuncia: se deshabilita
cuando cualquiera de las dos es verdadera, y la etiqueta visible alterna entre
`Denunciar` y `Denunciada`, con un `aria-label` y un `title` equivalentes que
explican el motivo de la deshabilitación. Ninguno de los dos valores se escribe
nunca en el estado, de manera que son constantes durante toda la vida de la
conversación cargada.

El renderizado del componente tiene tres salidas tempranas y un cuerpo principal.
La primera salida temprana, en las líneas 321 a 327, se toma cuando `cargando` es
verdadero y dibuja únicamente un contenedor con la clase `conv-det-page` y dentro
de él un bloque con la clase `conv-det-skeleton`, marcado con
`aria-busy="true"` para que un lector de pantalla anuncie que la región está
ocupándose. Ese bloque es un rectángulo de 320 píxeles de alto con un degradado
que se desplaza mediante una animación de 1,2 segundos definida con el nombre
`conv-shimmer`, y la hoja de estilos desactiva esa animación cuando el sistema
pide movimiento reducido. La segunda salida temprana, en las líneas 329 a 338, se
toma cuando hay un error de carga o cuando la conversación sigue siendo nula, y
dibuja el texto del error o, en su defecto, la cadena
`Conversación no encontrada`,
seguido de un botón `Volver a conversaciones` cuyo manejador invoca
`navigate('/conversaciones')`. Conviene observar que esta salida temprana se
coloca **antes** del cálculo de `esDueño` y `yaDenuncie`, de manera que ambas
variables nunca se calculan cuando la carga no ha concluido.

El cuerpo principal, en las líneas 343 a 582, dibuja cuatro
bloques consecutivos. El
primero es el encabezado, marcado como elemento `header`, que contiene las
migas de navegación con un enlace al feed y el nombre del tema, el título de la
conversación bajo una etiqueta que muestra el tema, la fila del autor con su
avatar y con su enlace al perfil, el párrafo del texto y la galería. La galería se
dibuja solo si la conversación trae elementos, y cada imagen se envuelve en un
`<button>` cuya única acción es escribir la dirección de la imagen en `lightbox`,
lo que abre el visor ampliado. Debajo del encabezado, la sección de comentarios
dibuja el título con el contador, el formulario principal y la lista de
comentarios, cada uno de los cuales muestra su barra de
acciones y, si corresponde,
el formulario de respuesta y la lista anidada de respuestas. El segundo bloque
es el visor ampliado, que se dibuja solo cuando `lightbox` tiene un valor y que
incluye un manejador de clic que compara el objetivo del evento con el propio
elemento contenedor para cerrar el visor únicamente cuando el clic ocurre en el
fondo y no sobre la imagen. El tercero es la ventana de denuncia, que se dibuja
solo cuando `denunciaAbierta` es verdadera. El cuarto y último es la línea 578,
que monta el componente de avisos mediante `createPortal` con destino
`document.body`, y la línea 580, que monta la alerta de Becky de manera
condicional.

Sobre esa última línea conviene ser exacto: la condición es `{alerta && …}`, y
el estado `alerta` **nunca se escribe con un valor distinto de `null`** en todo
el archivo. La única escritura que hace la referencia `setAlerta` aparece en el
propio manejador de cierre que se le entrega al componente, en la línea 580, con
lo cual esa rama del renderizado es inalcanzable desde la interfaz actual. En
consecuencia, la alerta de Becky está cableada pero inerte, y todos los mensajes
de error reales de esta pantalla viajan por el canal de las notificaciones
emergentes descrito en el apartado 1.6. Se reporta como observación en el apartado
1.20.

## 1.18 El contrato con el servidor: los siete servicios que consume el componente

Esta sección describe los servicios del servidor que consume el componente y qué
recibe exactamente de ellos. La lectura de todos ellos se hizo sobre
`servidor/Routes/routes-conversaciones.js` y, para el moldeado de la respuesta,
sobre `servidor/helpers/conversaciones.js`.

El servicio de lectura del detalle es `GET /conversaciones/:id`. Es público,
aunque admite sesión por cookie, y esa distinción explica por qué la pantalla se
dibuja completa para un visitante anónimo y por qué las acciones que escriben
necesitan el guard de sesión descrito en el apartado 1.13. Recibe el
identificador por la ruta y no exige ningún parámetro en la cadena de consulta.
Si el identificador no es una cadena de dígitos devuelve un código 400 con el
mensaje `Identificador de conversación inválido.`; si la conversación no existe
devuelve 404 con `Conversación no encontrada.`; y ante un fallo inesperado
devuelve 500 con `Error interno del servidor.`. Cuando todo va bien devuelve un
código 200 cuyo cuerpo tiene la forma `{ success, conversacion }`.

El objeto `conversacion` de esa respuesta se arma en el servidor mediante el
auxiliar `armarConversacion` y después se le enrichece con tres bloques de datos
que solo existen en el detalle. La base del objeto contiene `id`, `tema`,
`titulo`, `texto`, `cultura` con su identificador y nombre, `subcultura` con su
identificador y nombre, `creador` con su identificador, su nombre de usuario y su
foto de perfil ya resuelta por el auxiliar correspondiente, los contadores `likes`
y `vistas`, el conteo `cantidadComentarios` y la marca `fechaPublicacion`. A
eso se le añade la galería, que es un arreglo de objetos con `id`, `url` y
`orden`, y el conteo `cantidadDenuncias`. A eso se le añade el arreglo
`comentarios`, que ya viene anidado: la consulta de raíces trae los comentarios
sin padre y la consulta de respuestas trae los que sí lo tienen, y el servidor
agrupa estas últimas en un diccionario por identificador de padre antes de
adjuntarlas, de modo que cada elemento del arreglo de raíces tiene una propiedad
`respuestas` que contiene las suyas. Cada comentario, raíz o respuesta, trae
`id`, `usuarioId`, `texto`, `cantidadLikes`, `fecha`, `likeDado`, `autor` con su
identificador, su nombre y su foto resuelta, y su arreglo `respuestas`. Por
último, el servidor **redefine** el campo `cantidadComentarios` con la suma del
número de raíces y el número de respuestas, de manera que el contador que ve la
pantalla en el título de la sección coincide exactamente con el número de
elementos que se dibujan, contando respuestas. También se añaden
`estadoPropio`, un objeto con las banderas `like` y `denuncie` que valen `false`
cuando no hay sesión, y `esDueño`, que compara el identificador de la sesión con
el del creador y vale `false` cuando no hay sesión.

Vale la pena registrar dos observaciones que la lectura del código permite
comprobar. La primera es que el servidor obtiene las marcas de "me gusta" propio
de los comentarios con una consulta que trae **todos** los comentarios que el
usuario ha marcado en toda la plataforma, sin filtrar por conversación; el
resultado es correcto porque luego la comprobación se hace por identificador de
comentario, pero la cantidad de filas transferidas crece con la actividad del
usuario en el conjunto del sitio. La segunda es que varios campos que el servidor
entrega no se muestran en pantalla: las vistas de la conversación, su conteo de
denuncias, su fecha de publicación y la fecha individual de cada comentario
llegan en la respuesta pero **no** se leen en ninguna línea del componente. La
consecuencia funcional es que el contador de vistas que incrementa el servicio de
vista existe y se usa para la regla de eliminación automática, pero no es visible
para el usuario en esta pantalla.

El servicio de registro de vista es `POST /conversaciones/:id/visto`. Exige
sesión, valida que el identificador sea numérico con un 400, comprueba con un 404
que la conversación exista y, en caso contrario, ejecuta una actualización que
suma uno al contador de vistas y devuelve un cuerpo `{ success: true }`. No
devuelve el valor del contador, de manera que la pantalla no puede mostrarlo ni
sincronizarlo, lo que es coherente con el hecho de que no lo muestre.

El servicio de "me gusta" de la conversación es `POST /conversaciones/:id/like`.
Exige sesión. Alterna el estado: si encuentra fila en la tabla de "me gusta"
conversación, la borra, decrementa el contador con la protección
`GREATEST(cantidad_likes - 1, 0)` que impide valores negativos y devuelve un
cuerpo `{ success: true, like: false, cantidadLikes }` con el contador ya
calculado; si no la encuentra, inserta la fila, incrementa el contador y devuelve
`{ success: true, like: true, cantidadLikes }`. Cuando el usuario que marca no es
el dueño, el servicio inserta además una notificación de tipo `nuevo_like` con el
texto que anuncia que alguien le dio like a la conversación. Es de notar que al
quitar el "me gusta" no se borra la notificación ya generada, y que el contador
que se devuelve en cada rama se calcula a partir del valor leído antes de
actualizar, de modo que coincide con lo que la base de datos acaba de guardar.

El servicio de comentarios es `POST /conversaciones/:id/comentarios`. Exige
sesión y recibe un cuerpo con la propiedad `texto` y, opcionalmente, la propiedad
`comentario_padre_id`. Valida que el texto no esté vacío y no supere los 250
caracteres, que es el mismo límite que el `maxLength` de los dos cuadros de texto
del componente, comprueba que la conversación exista y, si se indicó un padre,
que ese padre pertenezca a la misma conversación. Responde con un código 201 y un
cuerpo `{ success: true, comentario }` donde el comentario incluye
`cantidadLikes` en cero, `likeDado` en falso, el indicador `esRespuesta` que
distingue raíz de respuesta, el autor con su foto ya resuelta y un arreglo
`respuestas` vacío. Cuando el destinatario de la notificación no es el propio
autor, el servicio genera una notificación de tipo `nuevo_comentario` con un texto
diferente según el caso: si es comentario raíz, el texto anuncia que el usuario
comentó la conversación y el destinatario es el dueño del hilo; si es respuesta,
el texto anuncia que el usuario respondió a un comentario y el destinatario es el
autor de ese comentario padre. La respuesta no incluye la propiedad `fecha`, que
el detalle sí incluye en las lecturas, de modo que un comentario recién publicado
carece de ese dato, aunque la interfaz no lo muestre.

El servicio de "me gusta" de comentarios es
`POST /conversaciones/:id/comentarios/:cid/like`. Exige sesión, valida que ambos
identificadores sean numéricos y que el comentario pertenezca a esa conversación.
Alterna la fila en la tabla de "me gusta" de comentario de la misma manera que el
servicio anterior, con la misma protección contra valores negativos, y devuelve
`{ success, like, cantidadLikes }`. Cuando el autor del comentario es distinto del
usuario que marca, inserta una notificación de tipo `like_comentario`.

El servicio de denuncias es `POST /conversaciones/:id/denuncias`. Exige sesión y
recibe un cuerpo con la propiedad `motivos`, que es un arreglo de
identificadores. El servicio normaliza esos identificadores a números, elimina
los duplicados, exige al menos uno y rechaza más de diez, comprueba que la
conversación exista, rechaza con 400 que el usuario sea el dueño, comprueba con
una consulta si ese usuario ya había denunciado antes la conversación y, en
ese caso, responde con 409, y finalmente verifica que todos los motivos existan
y estén activos antes de aceptarlos. Cuando supera esas validaciones, calcula
cuántas denuncias habría
**incluida** la nueva mediante el auxiliar `debeAutoeliminarse`, que devuelve
verdadero únicamente si la conversación acumula al menos 20 vistas y si la
proporción de denuncias sobre vistas supera el 45 %. Si el resultado es
falso, inserta la denuncia, inserta la asociación de motivos, incrementa el
contador y devuelve `{ success: true, eliminada: false }`. Si el resultado es
verdadero, antes de confirmar la transacción borra en cascada manual los "me
gusta" de los comentarios, las asociaciones de motivo de las denuncias, los
comentarios, los "me gusta" de la conversación, las denuncias, las imágenes, las
notificaciones y, por último, la fila de la conversación, y devuelve
`{ success: true, eliminada: true, message }` con un texto que explica la
eliminación. La eliminación es, por tanto, física y no lógica: la conversación
desaparece de la base de datos, y por eso el componente debe navegar fuera de la
pantalla en lugar de volver a cargar.

El servicio de catálogo de motivos es `GET /conversaciones/denuncia-motivos`. Es
público y devuelve un cuerpo `{ success, motivos }` donde cada motivo tiene
`id` y `descripcion`, filtrando por los motivos activos y ordenados por
identificador. El propio router lleva un comentario que advierte una condición
de orden importante: esta ruta debe permanecer registrada antes
que la del detalle, de
modo que no sea capturada por el patrón de parámetro y respondiera con el 400 de
identificador inválido. La pantalla cumple esa condición porque consume las dos
rutas por su nombre completo.

Por último, y para entender el comportamiento del componente ante fallos de
red, el cliente de peticiones compartido por toda la aplicación está
declarado en `cliente/src/api/axios.js` con una base de ruta `/api`, con
envío de credenciales activado y, sobre todo, con una regla de validación de
estado que **no** considera error ningún código inferior a 400. Esa decisión
implica que las respuestas 400, 404 y 409 **resuelven** la promesa en lugar
de rechazarla, y por eso el componente no se apoya únicamente en el bloque
`catch` para detectar esos casos: los comprueba de forma explícita con
`res.status === 200`, `res.status === 201` y `res.status === 409`. El
bloque `catch` queda entonces reservado para los códigos 500 y superiores y
para los errores de red. Ese mismo cliente incorpora un interceptor que,
ante un 401, intenta renovar la sesión una sola vez por petición y reintenta
la llamada original, de manera que la sesión vencida no produce un fallo
visible durante la lectura del detalle.

[IMAGEN I.2 — Diagrama de secuencia del envío de una denuncia, desde el clic
del botón hasta la posible eliminación automática de la conversación.]

El diagrama anterior representa cinco participantes: el usuario, el componente de
detalle, el servicio de denuncias, el auxiliar de umbral y la base de datos. La
línea de vida del usuario comienza con el clic sobre el botón de denuncia, que el
componente atiende abriendo la ventana y comprobando que hay selección de
motivos antes de enviar la petición. La línea de vida del componente entrega al
servicio el arreglo de identificadores; el servicio normaliza, valida y calcula el
nuevo total de denuncias; ese total se entrega al auxiliar de umbral, que decide
con su regla de veinte vistas y cuarenta y cinco por ciento; si la decisión es
negativa, el servicio escribe en la base de datos y responde que la conversación
no fue eliminada, y el componente se limita a marcar el botón como ya
denunciada; si la decisión es afirmativa, el servicio borra en cascada y responde
que sí fue eliminada, y el componente muestra el mensaje y regresa al feed.

## 1.19 La hoja de estilos del módulo

El componente importa en su línea 15 la hoja
`cliente/src/estilos/ConversacionesEstilos/conversaciones-detalle.css`, que
tiene 590 líneas y constituye la única definición de la superficie visual de esta
pantalla. Al leerla se constata que la hoja está organizada en bloques rotulados
con comentarios que corresponden a las secciones del capítulo: encabezado,
galería, acciones, comentarios, visor ampliado, ventana de denuncia y estados.

La estructura de página se resuelve con la clase `conv-det-page`, que fija un
ancho máximo de 780 píxeles, centra el bloque, aplica un relleno de 28 píxeles
arriba y laterales de 20 píxeles, y organiza el contenido en una sola columna
vertical con una separación de 22 píxeles entre bloques. El encabezado se resuelve
con `conv-det-header`, que es la única superficie blanca del módulo porque usa la
variable de color de tarjeta, con un borde de un píxel, un radio de 20 píxeles,
relleno interior de 24 por 26 píxeles y una sombra muy suave.
El avatar se resuelve
con `conv-det-avatar` más tres modificadores de tamaño, `--40`, `--32` y `--28`,
que fijan ancho, alto y tamaño de letra; y con `conv-det-avatar img`, que
obliga a que la imagen ocupe el círculo por completo mediante el ajuste de
cobertura. Los tres tamaños que el componente usa en el JSX coinciden
exactamente con los tres que la hoja define, de modo que no hay ninguna clase de
tamaño huérfana.

El texto de la conversación se resuelve con `conv-det-texto`, que declara
`white-space: pre-wrap` y `overflow-wrap: anywhere`. La segunda regla es la que
impide que un título o un comentario largo desborde el contenedor; la primera
indica que los saltos de línea del contenido se respetarían, pero como el valor
`textoCompleto` ya colapsa los espacios en blancos a un solo espacio, el efecto
práctico de esa declaración es nulo. Esa redundancia es una observación menor que
se registra en el apartado 1.20.

La galería se resuelve con una rejilla de columnas automáticas de al menos 140
píxeles y una separación de 10 píxeles, y cada miniatura con
`conv-det-galeria-item`,
que fija una proporción de cuatro tercios, el radio de 12 píxeles y el fondo de la
tarjeta cuando la imagen todavía no carga. El visor ampliado se resuelve con
`conv-det-lightbox`, una capa fija que ocupa toda la ventana, con un índice de
capas de 90 y un fondo oscuro semitransparente, y con un botón de cierre circular
de 40 píxeles. La ventana de denuncia se resuelve con `conv-denuncia-overlay`,
capa fija con índice 85 y fondo oscuro más suave, y con `conv-denuncia`, una
tarjeta de 480 píxeles como máximo y 88 por ciento de altura de ventana como
máximo, desplazable verticalmente. Cada motivo es un botón de ancho completo con
un recuadro de 20 por 20 píxeles, `conv-denuncia-check`, que muestra un glifo de
verificación cuando el motivo está seleccionado; la marca de selección se aplica
con la clase `conv-denuncia-motivo--activa`, que tiñe el borde y el fondo. El
envío se habilita con `conv-denuncia-enviar` y se deshabilita con la opacidad
reducida compartida por las demás hojas del proyecto.

Los estados se resuelven con dos clases. `conv-det-vacio` alinea el estado de
error en el centro y `conv-det-vacio-btn` define su botón. `conv-det-skeleton`
define el bloque de espera de 320 píxeles con un degradado en movimiento
animado por `conv-shimmer`, y la consulta de movimiento reducido del proyecto
desactiva esa animación, de modo que el bloque queda como un rectángulo estático
para las personas que lo han pedido así en su sistema.

Cerrando con la accesibilidad declarada en el propio CSS, conviene mencionar que
los anillos de foco visibles se declaran de manera explícita en los elementos
interactivos principales: la miniatura de la galería con un contorno de dos
píxeles del color de acento fuerte desplazado dos píxeles, el cuadro de texto con
un borde del color de acento fuerte y una sombra de dos píxeles del mismo color
al 25 por ciento de opacidad, y los botones de la alerta de Becky con un contorno
de dos píxeles. Esa coherencia de anillos es la que sostiene el nivel AA que el
proyecto declara para el conjunto del sitio, aunque conviene precisar que la
hoja de estilos solo permite verificar la presencia y el color de esos anillos:
el contraste real del texto y el orden de lectura de los nombres accesibles
dependen de una
auditoría con la página montada, que queda fuera de este ejercicio de lectura de
código. [PENDIENTE: confirmar mediante una auditoría de contraste sobre la página
montada si el módulo cumple el nivel AA en su totalidad].

## 1.20 Hallazgos, observaciones y asuntos pendientes

El ejercicio de documentar el módulo dejó al descubierto siete puntos que
conviene reportar al equipo sin modificar el código fuente.

El primero es que el estado `alerta`, declarado en la línea 75, nunca recibe un
valor distinto de `null`, de manera que el componente de alerta de Becky que se
importa en la línea 14 y se monta en la línea 580 es inalcanzable. Todos los
mensajes de error del módulo viajan efectivamente por las notificaciones
emergentes, de modo que no hay ningún fallo funcional, pero sí una rama muerta y
una importación que puede eliminarse o puede completarse según la intención del
equipo. [PENDIENTE: confirmar con el equipo de desarrollo si quiere que
las validaciones de este módulo se muestren como alerta centrada en lugar de como
notificación emergente].

El segundo es que las actualizaciones optimistas de `toggleLike` y de
`toggleLikeComentario` no se revierten cuando la petición falla, porque sus
ramas de error solo invocan `avisar`. Un usuario sin red, o con una respuesta 500,
ve el corazón pintado y el contador alterado hasta que recarga la página.
[PENDIENTE: confirmar con el equipo si se desea que el contador se restituya o
que se vuelva a pedir el detalle completo cuando una operación de "me gusta"
falla].

El tercero es que el comentario de la línea 114 anuncia que el catálogo de
motivos se carga al abrir la denuncia, cuando el efecto que lo carga se ejecuta
al montar la página. El efecto observable es una petición adicional en cada
visita al detalle.

El cuarto es que el servicio de detalle entrega campos que la pantalla no usa:
las vistas de la conversación, su conteo de denuncias, su fecha de publicación y
la fecha de cada comentario. La documentación interna del proyecto afirma que el
detalle muestra métricas de vistas y likes y la fecha, de modo que hay una
divergencia entre lo que el registro del proyecto dice y lo que el código hace.
[PENDIENTE: confirmar con el equipo si las vistas y las fechas deben mostrarse
en el encabezado o si el alcance acordado era únicamente el "me gusta"].

El quinto es que la declaración de `white-space: pre-wrap` en la clase
`conv-det-texto` es inoperante, porque el valor `textoCompleto` ya colapsa todos
los espacios en blanco a un único espacio antes de pintarse.

El sexto es que el efecto que registra la tecla de escape no declara arreglo de
dependencias, de manera que retira y reinstala el escuchador en cada
renderizado del componente. El comportamiento es correcto porque el cierre
refleja el estado vigente, pero es un trabajo innecesario y una desviación de la
práctica habitual de declarar las dependencias.

El séptimo es que el servidor, al calcular las marcas de "me gusta" propio de los
comentarios del detalle, recupera todos los comentarios que el usuario ha marcado
en toda la plataforma sin filtrar por la conversación que se está viendo.

[PENDIENTE: confirmar con el equipo si el volumen esperado de "me gusta" por
usuario justifica optimizar esa consulta antes del despliegue].

Por último, conviene dejar constancia de lo que **sí** quedó verificado. El
componente es invocado desde un solo lugar, que es la ruta `/conversaciones/:id`
declarada en la línea 35 de `cliente/src/main.jsx`, y se llega a él desde tres
enlaces reales, que son la tarjeta del feed, la pestaña de chats del perfil y la
ruta de escape hacia el feed. Todos los manejadores declarados tienen al menos un
punto de invocación real dentro del propio archivo, y ninguno de los servicios
consumidos devuelve una forma de respuesta distinta de la que aquí se ha
documentado.

---

<!-- CONTINUACIÓN DE LA DOCUMENTACIÓN: capítulo II. Sigue el orden de carpeta de
     `cliente/src/Componentes`, por lo que continúa con los dos archivos
     restantes de la subcarpeta de conversaciones. -->

<!-- SALTO DE PÁGINA: el capítulo II inicia en página nueva y su título ocupa una
     página sola (regla de formato 2). -->

---

# II. El listado de conversaciones del foro de culturas urbanas

## 2.1 Ubicación del módulo y papel dentro del sistema

Este capítulo documenta el archivo del listado paginado de
conversaciones, que es el primero de los dos archivos que, junto con el
detalle ya descrito en el capítulo I, completan la subcarpeta de
conversaciones del cliente. Junto con la ventana de creación que se
documenta en el capítulo III, forma la totalidad de la superficie de
conversaciones del sitio. El listado y esa ventana comparten una sola
hoja de estilos.

El listado se declara en el archivo
`cliente/src/Componentes/Conversaciones/Conversaciones.jsx`, que tiene
setecientas noventa y cinco líneas, y declara dos unidades exportadas: el
componente principal `Conversaciones` y la tarjeta `ConversacionCard`. La
ventana de creación que este capítulo sólo menciona se declara en el archivo
contiguo `ConversacionNueva.jsx`, que tiene doscientas ochenta y ocho líneas
y una sola unidad exportada; su documentación completa está en el capítulo III.

El componente principal se monta en dos rutas distintas de
`cliente/src/main.jsx`. La línea 11 lo importa con la forma
`import { Conversaciones }`, y las líneas 34 y 36 lo asignan: la línea 34
lo registra en la ruta `/conversaciones/nueva`, y la línea 36 en la ruta
`/conversaciones`. Ambas rutas cuelgan del elemento
`<Route element={<AppLayout />}>` que el archivo abre en la línea 31, de
modo que el listado **sí** se muestra dentro del armazón con barra lateral.
El montaje es, por tanto, un montaje condicional en el propio componente:
`Conversaciones` no sabe en qué ruta se encuentra salvo por una comparación
de ruta, y esa comparación es la que decide si la ventana modal de creación
se dibuja.

Quién enlaza hacia el listado, es decir, quién navega a `/conversaciones` para
que el enrutador monte el componente, se rastreó en todo el cliente. La búsqueda
de la cadena `Conversaciones` fuera del propio archivo de origen devuelve cuatro
puntos de entrada reales. El primero es el elemento `NAV_ITEMS` de
`cliente/src/Componentes/elementos_pequeños/BarraLateral.jsx`, donde la línea 17
declara la etiqueta del ítem de navegación bajo la clave `conversaciones`, que es
la que la barra lateral usa para resolver su título y su enlace. El segundo es
la fila de migas de
`cliente/src/Componentes/Conversaciones/ConversacionDetalle.jsx`,
donde la línea 348 dibuja un enlace con el texto *Conversaciones* y destino
`/conversaciones`, que es la vía de escape desde el detalle hacia el listado. Los
tercer y cuarto resultados no son invocaciones sino coincidencias de vocabulario:
el comentario de la línea 379 del componente de perfil y tres archivos de hojas
de estilo que citan el listado como canon visual. En conclusión, el componente se
alcanza por la barra lateral y por la ruta de escape del detalle, y no hay ningún
tercer punto de entrada.

Quién invoca a su vez al listado se lee en la ruta de escape del detalle: la
función que lo hace es `cerrarConFoco`, cuyo funcionamiento se describe en el
apartado 1.11, y esa función llama a `navigate` con la ruta `/conversaciones`
para regresar desde una conversación eliminada por la comunidad. El manejador
`enviarDenuncia` del detalle, descrito en el apartado 1.16, es quien la invoca en
esa situación concreta. Esa misma función de navegación es la que este capítulo
usa en su propio manejador de cierre de la ventana modal, según se explica en el
apartado 2.20.

El componente principal declara además una exportación por defecto en la línea
795 que ningún archivo del repositorio consume, como se registra en el apartado
2.23.

## 2.2 Inventario de unidades documentadas

El archivo del listado expone nueve unidades internas o exportadas que este
capítulo describe por separado, además del propio componente principal. Son las
siguientes, en el orden en que aparecen en el archivo fuente.

La primera es la constante `LIMITE`, que se declara en la línea 15 y fija el
tamaño de página del listado. La segunda es el arreglo `TEMAS_FALLBACK`, que se
declara en la línea 19 y actúa como catálogo de respaldo. La tercera es el arreglo
`ORDEN_TABS`, que se declara en las líneas 23 a 28 y describe las pestañas de
ordenamiento. La cuarta es el objeto `CULTURAS_COLOR`, que se declara en las
líneas 32 a 41 y traduce el identificador de una cultura a su color. La quinta es
la función `tiempoRelativo`, que se declara en las líneas 45 a 57 y redacta el
tiempo transcurrido. La sexta es el objeto `FILTROS_VACIO`, que se declara en la
línea 59 y describe el conjunto de filtros vacíos. La séptima es la función
`iniciales`, que se declara en las líneas 61 a 68. La octava es el conjunto de
los cinco subcomponentes de icono, que se declaran entre las líneas 70 y 114: los
subcomponentes `IconoComentar`, `IconoBuscar`, `IconoFiltros`, `IconoCalendario`
e `IconoFlechaArriba`. La novena es la unidad exportada `ConversacionCard`, que se
declara en las líneas 120 a 214.

Sobre esas nueve unidades se apoya una capa de manejadores y
cálculos que el propio
componente declara. Los que atienden datos son `cargarMas` y `alternarLike`, ambos
memorizados con `useCallback`. Los que atienden la interfaz son `abrirPanel`,
`cerrarPanel`, `cambiarBorrador`, `alternarCulturaBorrador`, `aplicarFiltros`,
`limpiarFiltros`, `abrirCrear`, `cambiarOrden`,
`manejarTecladoOrden` y `quitarChip`.
A ellos se suman dos valores derivados que no son manejadores pero sí funciones de
trabajo: `nombreCultura`, también memorizada, y el cálculo
`chipsFiltros`. Los doce
manejadores y la función `nombreCultura` reciben su propio apartado en los
subcapítulos siguientes, y el cálculo `chipsFiltros` comparte el apartado 2.19 con
`quitarChip`. Los seis efectos, que no son manejadores sino unidades
de sincronización con
el exterior, se agrupan en el apartado 2.20.

El archivo contiguo de la ventana modal expone una unidad exportada propia, el
componente `ConversacionNueva`, y su propia constante `MAX_IMAGENES`. Este
capítulo sólo lo menciona, como el punto de montaje de la ventana que el listado
abre en una ruta aparte; el inventario completo de ese archivo y la
documentación de todas sus unidades están en el capítulo III.

## 2.3 La constante `LIMITE` y el objeto `FILTROS_VACIO`

La constante `LIMITE` se declara en la línea 15 del archivo del listado y vale
treinta. Su propósito es fijar cuántas conversaciones pide el componente en cada
petición al servidor. Es el número que el requerimiento funcional de paginación
establece como primer bloque, y además es la cifra que dos textos visibles de la
interfaz repiten: el aviso de la línea 774 anuncia *"Cargando 30 conversaciones
más"*, y ese rótulo está escrito a mano con el mismo número, de modo que cambiar
la constante obligaría a corregir también el texto.

Qué hace es lo único que hace: no contiene lógica. Cómo lo hace no aplica, porque
no ejecuta algoritmo alguno. No recibe nada, no invoca a nadie y no entrega nada,
sino que es leída directamente por los dos sitios que arman los parámetros de la
petición: el efecto de carga inicial, en la línea 325, y el manejador `cargarMas`,
en la línea 283. En ambos casos se copia a la propiedad `limite` de un objeto de
parámetros.

El objeto `FILTROS_VACIO`, declarado en la línea 59, sí tiene contenido propio y
describe la forma del conjunto de filtros del panel. Sus cinco propiedades son
`tema`, que vale `'Todos'` y funciona como el valor neutro del filtro de tema;
`culturas`, que es un arreglo vacío de identificadores; `desde` y `hasta`, que son
cadenas vacías para el rango de fechas; y `orden`, que vale `'fecha'` y por tanto
establece el orden por defecto. Al ser un objeto literal declarado en el módulo,
el mismo valor existe una sola vez, pero el código lo copia con el operador de
dispersión en cada punto en que lo necesita.

Quién lo invoca son tres puntos del componente principal. El primero es la
declaración del estado de filtros aplicados, en las líneas 231 a 234, que lo
extiende para inheritir el valor neutro y luego sobrescribir el tema con el que
venga en los parámetros de la URL. El segundo es la declaración del estado de
borradores, en la línea 241, que lo copia entero. El tercero es el manejador
`abrirPanel`, en la línea 384, que vuelve a copiarlo fusionado con los filtros que
están en vigor. El objeto también aparece en los manejadores `aplicarFiltros` y
`limpiarFiltros`, descritos en los apartados 2.14 y 2.15, y en `quitarChip`,
descrito en el apartado 2.19. No recibe nada y no entrega nada más allá de su
propio valor.

## 2.4 El arreglo `TEMAS_FALLBACK`

El arreglo `TEMAS_FALLBACK` se declara en la línea 19 y contiene nueve cadenas:
`'Todos'`, `'Tips'`, `'Dudas'`, `'Tutorial'`, `'Opiniones'`, `'Eventos'`,
`'Show'`, `'Look'` y `'General'`. Su propósito es ofrecer un catálogo de temas
inmediatamente, antes de que el servidor responda, y sobrevivir a que el servidor
no responda nunca. El propio comentario de la línea 17 lo declara como respaldo
del catálogo que el servidor envía.

Qué hace es proporcionar el valor inicial del estado de temas y, en caso de
fallo, el valor permanente. Cómo lo hace es por sustitución: el efecto de la
línea 261 intenta la carga del catálogo y, solo si la respuesta es correcta **y**
trae al menos un elemento, reemplaza el contenido mediante la línea 265, que
antepone la cadena `'Todos'` al arreglo recibido. Las dos condiciones son
necesarias: la primera descarta respuestas de error, y la segunda evita que una
respuesta válida pero vacía deje al usuario sin ninguna opción.

Quién lo invoca es la declaración del estado `temas`, en la línea 227, que lo usa
como valor inicial. No hay ningún otro punto de lectura directa, porque el resto
del componente siempre lee el estado ya inicializado. A qué invoca no invoca
nada. Qué recibe no recibe nada. Qué entrega entrega el arreglo de cadenas, que
el componente lo recorre en la línea 705 para pintar un control de opción por cada
tema, dentro del panel de filtros cuyos controles se describen
en el apartado 2.14.

Conviene destacar aquí una divergencia entre el respaldo y la fuente real. El
servidor expone ocho temas en su lista de valores admitidos, porque la constante
`TEMAS` del servidor se declara en la línea 17 del archivo de rutas con los ocho
temas, y no incluye `'Todos'`; es el cliente quien antepone `'Todos'`. La
consecuencia
práctica es que el respaldo tiene un elemento más que el catálogo real, pero como
`'Todos'` está en la misma posición y el resto coincide uno a uno, ninguna
interacción observable depende de la diferencia. En efecto, cuando la carga
funciona, el estado pasa a tener exactamente los mismos nueve textos.

## 2.5 El arreglo `ORDEN_TABS` y el conjunto de órdenes del servidor

El arreglo `ORDEN_TABS` se declara entre las líneas 23 y 28 y contiene cuatro
objetos, cada uno con dos propiedades: `valor`, que es la cadena que viaja al
servidor, y `etiqueta`, que es el texto que ve la persona. Las cuatro parejas son
`'fecha'` con *Recientes*, `'likes'` con *Populares*, `'sin_responder'` con *Sin
responder* y `'siguiendo'` con *Siguiendo*. Su propósito es describir el catálogo
de ordenamientos disponibles y, sobre todo, establecer la correspondencia entre el
identificador técnico que viaja en la petición y la etiqueta legible que se
pinta en la pestaña.

Qué hace es proporcionar los datos de origen de las pestañas. Cómo lo hace no
ejecuta algoritmo; el recorrido que las convierte en botones está en el marcado,
en las
líneas 601 a 620, que itera el arreglo con `.map` y extrae el índice y el objeto.
Quién lo invoca es ese único recorrido. La contraparte es la lista de órdenes
que el servidor acepta, que se declara en la línea 19 del archivo de rutas como
un arreglo de cuatro cadenas, y el conjunto derivado que se declara en la línea 20
del mismo archivo. La comparación entre ambos conjuntos es la que permite afirmar
que las cuatro pestañas del cliente corresponden exactamente a las cuatro órdenes
que el servidor sabe ejecutar, sin que ninguna quede sin implementar.

El servidor, además, es más restrictivo que el cliente en un punto: al recibir el
parámetro `orden` lo contrasta contra el conjunto válido en la línea 178 y, si no
coincide, lo sustituye por `'fecha'`. Esa defensa explica por qué el componente
no necesita validar la orden antes de enviarla. La única condición que el
componente sí comprueba por su cuenta es la de la pestaña *Siguiendo*, que exige
sesión, como se explica en el apartado 2.16.

## 2.6 El objeto `CULTURAS_COLOR`

El objeto `CULTURAS_COLOR` se declara entre las líneas 32 y 41 y relaciona los
ocho identificadores de cultura con un color hexadecimal. La cultura uno
corresponde a Gótico y vale `#4A3570`, el dos a Emo y vale `#2F2F3F`, el tres a
Punk y vale `#7A1F2B`, el cuatro a Lolita y vale `#D98BB0`, el cinco a Visual Kei
y vale `#6B4E8C`, el seis a Gyaru y vale `#E07A5F`, el siete a Principiante y
vale `#9B82B8`, y el ocho a TikTok y vale `#E89ABF`. Su propósito es aportar el
color de la cultura a la tarjeta, que lo usa en dos lugares visibles: el borde
izquierdo de tres píxeles de la tarjeta y el pequeño punto que acompaña al chip
de cultura.

Qué hace es traducir un identificador numérico en un color. Cómo lo hace es con
una búsqueda: el código construye la clave convertingiendo el identificador a
cadena, porque en JavaScript las claves de los objetos son cadenas y los
identificadores llegan como números, y luego consulta el objeto con el operador
de acceso entre corchetes. La línea 133 hace exactamente eso, sobre el
identificador de cultura que el servidor entrega en el objeto anidado `cultura`
de cada conversación. Si la consulta no devuelve nada, la expresión entre
corchetes y el operador de alternativa producen `null`, y ese `null` es
deliberado: la tarjeta usa `undefined` como estilo cuando no hay color, de modo
que la propiedad de color no llega a fijarse y el color de borde cae al valor de
respaldo declarado en la hoja de estilo.

Quién lo invoca es la unidad `ConversacionCard`, descrita en el apartado 2.8, y
solo en dos puntos: la línea 133, que resuelve el color, y la línea 171, que lo
pinta en el punto del chip. No recibe argumentos: es una tabla cerrada, no una
función. No entrega un valor de retorno; entrega la posibilidad de leer una
propiedad. No invoca a nadie.

El comentario de las líneas 30 y 31 es importante para entender el diseño: el
propio código reconoce que este objeto es la única excepción a la regla del
proyecto de usar únicamente variables de color, y explica que existe para el
borde y el punto. Esa excepción es coherente con lo que hace la enciclopedia de
estilos, que teñe sus páginas con el color de cada cultura, y con la ficha de
cultura del panel de filtros. Ninguna otra regla de color del módulo se aparta de
los tokens del proyecto.

## 2.7 La función `tiempoRelativo`

La función `tiempoRelativo` se declara entre las líneas 45 y 57 y recibe un único
parámetro, `fecha`, que es la cadena o el objeto de fecha que entrega el
servidor. Su propósito es convertir una fecha absoluta en una expresión breve
relativa al momento presente.

Qué hace es calcular la distancia temporal entre el instante recibido y el
instante actual, y expressarla con la unidad más grande que no exceda un umbral
razonable. Cómo lo hace con una cadena de decisiones que va
de la unidad más fina a la más gruesa. Primero valida la
entrada: si la fecha es nula o vacía devuelve una cadena vacía, y si la
conversión a objeto de fecha produce un valor inválido también devuelve una
cadena vacía, de modo que una fecha corrupta no llega nunca a la pantalla como la
palabra *Invalid Date*. Segundo calcula los minutos transcurridos mediante una
resta de marcas de tiempo dividida entre sesenta mil. Tercero decide la unidad
con cuatro comparaciones sucesivas: menos de un minuto
devuelve la palabra *ahora*;
menos de sesenta minutos devuelve una expresión con los minutos; menos de
veinticuatro horas devuelve una expresión con las horas; menos de siete días
devuelve una expresión con los días. Cuarto, si la fecha es más antigua que una
semana, abandona el formato relativo y delega en el formateador de fechas
incorporado en el lenguaje, al que pide un día numérico y un mes abreviado con el
idioma regional de México. La última decisión del método tiene una consecuencia
de diseño que conviene notar: a partir del octavo día el texto deja de ser
relativo y pasa a ser una fecha absoluta, de manera que el rótulo cambia de
naturaleza sin avisar.

Quién la invoca son tres puntos del archivo. El primero es la línea 166, dentro
de la tarjeta, que la aplica a la fecha de publicación de la conversación. El
segundo es la línea 207, también dentro de la tarjeta, que la aplica a la fecha
de la última respuesta. Ningún otro punto del módulo la consume, y el componente
principal no la usa en ningún punto. Entrega siempre una cadena de texto, nunca un
valor nulo, y no recibe nada más allá de `fecha`. No invoca a nadie salvo al
formateador de fechas del lenguaje en su rama final.

El comentario de la línea 43 documenta que no existe un auxiliar de este tipo a
nivel global del proyecto y que el mismo patrón está replicado en el detalle de
video. Esa replicación se registra como observación en el apartado 2.23.

## 2.8 La unidad exportada `ConversacionCard`

`ConversacionCard` se declara entre las líneas 120 y 214 del archivo del
listado y es una de las dos unidades que ese archivo exporta. Recibe dos
propiedades: `conversacion`, que es el objeto completo que el servidor entregó
para esa fila del listado, y `onLike`, que es el manejador que el componente
principal le pasa para que la tarjeta pueda delegar el voto.

Qué hace es representar una conversación como una tarjeta de foro con la
estructura que el diseño del proyecto Kaló para esta pantalla el 1 de octubre de
2026: una columna estrecha de votos a la izquierda, el contenido a la derecha, y
un pie con métricas de participación. Es puramente apresentacional: no pide
datos, no muta el estado que recibe y no contiene ningún manejador de red.

Cómo lo hace es calculando seis valores derivados antes de construir el marcado.
El primero es el extracto del texto, que se calcula con `useMemo` en las líneas
121 a 124 y cuya dependencia es la propiedad de texto del objeto recibido. Ese
cálculo normaliza primero los espacios: reemplaza cualquier secuencia de uno o más
caracteres de espacio, tabulador o salto de línea por un único espacio, y quita
los sobrantes de los extremos. Solo después mide, y si el texto supera los tres
cientos caracteres, corta por el índice trescientos, elimina el espacio final que
pueda haber quedado y añade un carácter de puntos suspensivos. Ese carácter está
en el propio texto y no es una propiedad de estilo, de manera que el corte
sobrevive a cualquier contexto en que se pinte. El segundo valor es la galería,
que se resuelve en la línea 126 con un arreglo vacío cuando la conversación no
trae la propiedad, lo que evita que la tarjeta tenga que distinguir entre ausencia
y vacío. El tercero es la imagen de portada, que es el primer elemento de esa
galería o `null`. El cuarto es el booleano de voto propio, que la línea 129
construye forzando a booleano un valor que el servidor entrega dentro del objeto
de estado propio. El quinto es el grupo de avatares del pie, donde las tres
primeras líneas cortan la lista de participantes y las dos líneas siguientes
calculan cuántos sobran, de modo que la tarjeta pueda pintar un distintivo de
exceso con el número que falta. El sexto agrupa las dos rutas que la tarjeta
necesita: la del perfil del autor y la del detalle de la conversación.

La construcción del marcado respeta tres decisiones que conviene destacar. La
primera es que la tarjeta **no** se envuelve entera en un enlace. El enlace al
detalle va únicamente en el título, en la línea 179, y el perfil del autor tiene
sus dos propios enlaces, uno sobre el avatar y otro sobre el nombre. Ese cambio
se hizo precisamente para no anidar elementos interactivos, ya que en la versión
anterior de la tarjeta un enlace envolvente contenía el botón de voto y los
enlaces de perfil. La segunda es que la imagen de portada se marca como elemento
decorativo con el atributo de accesibilidad correspondiente, porque la información
que aporta ya está en el texto del título. La tercera es que los avatares de
participantes y su número se marcan también como decorativos, porque el pie solo
es una pista visual y la información textual equivalente es la fecha de la última
respuesta.

Quién lo invoca es el propio componente principal, en la línea 693, que lo recorre
dentro del contenedor de la lista y le pasa el manejador
`alternarLike` descrito en
el apartado 2.11. Una búsqueda en todo el cliente revela un segundo punto que
resulta engañoso y merece precisión: `Perfil.jsx` declara en su línea 170 una
unidad llamada también `ConversacionCard`, y la usa en su línea 820 para la
pestaña de conversaciones del perfil. Esa unidad **no** es la que se documenta
aquí. El archivo del perfil no importa nada del archivo del listado, su firma
recibe una sola propiedad llamada `conv` en lugar de dos, y su contenido es una
tarjeta mucho más reducida que solo muestra miniatura, tema, título, cultura y
tres métricas. Se trata, por tanto, de dos componentes homónimos que no comparten
código. [PENDIENTE: confirmar con el equipo si conviene unificar ambas tarjetas
en una sola unidad reutilizable o si la duplicación responde a que la tarjeta del
perfil vive dentro de un diseño distinto].

Qué entrega es un elemento de artículo, sin valor de retorno. A quién invoca solo
invoca a `onLike`, en la línea 146, mediante una función de flecha que le pasa
la conversación completa; y ese manejador, a su vez, invoca al servicio de voto
descrito en el apartado 2.12. No hay ninguna otra invocación. Qué recibe de
`onLike` es el retorno de una promesa que la tarjeta ignora por completo, de modo
que un fallo en el voto no produce ningún cambio visual en la tarjeta; ese
comportamiento se registra en el apartado 2.23.

## 2.9 Los cinco subcomponentes de icono

El archivo del listado declara cinco subcomponentes que solo existen para dibujar
un glifo vectorial. Ocupan las líneas 70 a 114 y comparten una misma forma de
declaración. Los cuatro primeros son `IconoComentar`, en las líneas 70 a 76,
`IconoBuscar`, en las líneas 78 a 85, `IconoFiltros`, en las líneas 87 a 93, e
`IconoCalendario`, en las líneas 95 a 104. El quinto es `IconoFlechaArriba`, en
las líneas 108 a 114, que se describe aparte porque su comportamiento visual
depende de una clase y no de un atributo.

Qué hacen los cinco es lo mismo: dibujar una forma. No reciben propiedades ni
argumentos, no devuelven valores y no invocan a nadie. Su cuerpo es una sola
expresión que devuelve un elemento de imagen vectorial, y los cuatro primeros se
diferencian únicamente por el atributo de forma que llevan: `IconoComentar`
dibuja un contorno de bocadillo, `IconoBuscar` combina un círculo con una línea
diagonal, `IconoFiltros` dibuja un polígono de embudo y `IconoCalendario` combina
un rectángulo redondeado con dos trazos verticales y uno horizontal. Los cuatro
comparten además los mismos atributos accesibles: declaran el área de dibujo con
un sistema de coordenadas de veinticuatro por veinticuatro, no rellenan, heredan
el color del texto con la propiedad correspondiente, fijan el grosor de trazo en
uno y medio, redondean los extremos y las uniones, y se marcan a sí mismos como
decorativos para que un lector de pantalla no los anuncie.

Quién los invoca se rastreó uno por uno. `IconoComentar` se usa en dos puntos del
marcado: en la línea 193, dentro de la tarjeta, junto al número de comentarios, y
en las líneas 657 y 670, como icono grande de los estados de error y de vacío. De
esa triple invocación, la primera es informativa y las otras dos son decorativas,
porque en los estados vacíos el texto que acompaña al icono ya explica la
situación. `IconoBuscar` se invoca una sola vez, en la línea 567, dentro del
campo de búsqueda. `IconoFiltros` se invoca una sola vez, en la línea 597, dentro
del botón circular que abre el panel. `IconoCalendario` se invoca dos veces, en
las líneas 738 y 749, una junto al campo de fecha inicial y otra junto al campo
de fecha final. Ninguno de los cinco se exporta, de modo que su alcance se limita
este archivo.

El subcomponente `IconoFlechaArriba` merece un párrafo aparte porque su aspecto
depende de una decisión que no está en el marcado sino en la hoja de estilo. El
subcomponente dibuja un camino con la propiedad de relleno ya fijada al color
actual y además el trazo del mismo color, y su comentario de las líneas 106 y
107 explica que por defecto se ve solo el contorno y que el relleno lo decide el
CSS mediante una clase. El efecto funciona porque la hoja de estilo anula el
relleno con un valor transparente en el estado normal y lo restablece con el
color vigente cuando la tarjeta lleva la clase de estado activo. Es decir, el
relleno se controla desde fuera del componente. Su única invocación es la línea
150, dentro del botón de voto de la tarjeta. Como los otros cinco, no recibe
argumentos, no entrega valores y no invoca a nada.

## 2.10 La función auxiliar `iniciales` y su duplicación

La función `iniciales` se declara entre las líneas 61 y 68 del archivo del
listado y recibe un parámetro, `nombre`, que es el nombre de usuario del autor de
la conversación.

Qué hace es construir las iniciales que se pintan dentro del avatar cuando el
usuario no tiene foto de perfil. Cómo lo hace es con cuatro pasos. Primero
sustituye un nombre nulo o vacío por un signo de interrogación, de manera que la
función nunca falla y siempre produce al menos un carácter. Segundo separa el
nombre por cualquier secuencia de espacios en blanco, incluidos tabuladores y
saltos de línea, lo que hace que los nombres compuestos por varias palabras se
traten correctamente aunque lleguen con espacios dobles. Tercero descarta los
trozos vacíos que esa separación pueda haber producido y se queda únicamente con
los dos primeros. Cuarto toma la inicial de cada uno, la pasa a mayúscula y las
concatena sin separador. El resultado es, por tanto, una cadena de uno o dos
caracteres.

Quién la invoca es la línea 161, que la usa como contenido del avatar de la
tarjeta cuando la propiedad de foto de perfil es falsa. No hay ningún otro punto
de lectura en este archivo. Entrega una cadena y no invoca a nadie.

Esta unidad está duplicada de forma literal. La función `iniciales` del apartado
1.4 se declara en las líneas 19 a 26 del archivo del detalle y ejecuta exactamente
el mismo algoritmo con el mismo cuerpo: el mismo valor de reemplazo, el mismo
patrón de separación, el mismo filtro, el mismo corte en dos y la misma
concatenación. Las dos versiones coinciden también en que no reciben más que el
nombre. El comentario de la línea 63 del archivo del listado lo reconoce al
explicitar la expresión regular de separación. La duplicación se reporta en el
apartado 2.23 con la recomendación de extraer la unidad a un módulo compartido.

## 2.11 El manejador `cargarMas`

El manejador `cargarMas` se declara en la línea 283 y está memorizado con
`useCallback`, con un arreglo de dependencias formado por los filtros aplicados,
el texto de búsqueda y el indicador de que hay más resultados. Esa lista de
dependencias es deliberada: los tres valores de los que depende el manejador son
los que determinan qué página sigue, de modo que la memorización existe para no
recrear la función en cada repintado, no para congelarla con un valor antiguo.

Su propósito es agregar al listado el bloque siguiente de treinta
conversaciones. No recibe ningún argumento: todo lo que necesita lo toma de los
estados y de las referencias del propio componente.

Qué hace, en términos observables, es tres cosas: pedir el bloque siguiente,
añadirlo a la lista visible y desbloquear la carga posterior. Cómo lo hace es en
cinco pasos.

El primero es una doble barrera de salida temprana, en la línea 284. La primera
condición lee una referencia llamada `cargandoRef`, declarada en la línea 254 con
valor inicial `false`, y descarta la llamada si ya hay una petición en curso. La
segunda condición descarta la llamada cuando el indicador de que hay más
resultados es falso, lo que evita interrogar al servidor después de haber
consumido la última página. El orden de las dos condiciones importa poco en la
práctica, pero su presencia conjunta explica por qué el manejador es seguro de
invocar desde un evento de observables.

El segundo paso es abrir un sello de secuencia, en la línea 285, incrementando la
referencia `secuenciaRef`, declarada en la línea 255 con valor inicial cero, y
guardando el número obtenido en una constante local. Ese número identifica esta
petición concreta. Su razón de existir se explica más adelante.

El tercer paso es preparar la petición. Primero activa la barrera,
escribiendo `true` en `cargandoRef`, y luego enciende el indicador visual de carga
mediante un estado propio, lo que hace que aparezca la píldora que anuncia que se
están cargando treinta conversaciones más. A continuación calcula el número de
página que sigue, leyéndolo de `paginaRef`, que se declara en la línea 253 con
valor inicial uno y que la carga inicial describe en el apartado 2.20 deja en uno
al terminar. El número resultante es el de la segunda página. Después arma el
objeto de parámetros con la página, con el límite y con el orden vigente, y lo
completa de forma condicional con cuatro claves opcionales. Cada clave se añade
solo si su valor aporta información: el tema se envía únicamente cuando no es el
valor neutro; la lista de culturas se envía únicamente cuando tiene elementos, y
en ese caso se convierte a cadena separando los identificadores con una coma; las
dos fechas de rango se envían únicamente si tienen contenido; y el texto de
búsqueda se envía únicamente si no está vacío. Obsérvese que no se envía ningún
desplazamiento: el cálculo del desplazamiento no ocurre en el cliente sino en el
servidor, que en las líneas 206 a 208 de su archivo de rutas fuerza la página a un
mínimo de uno, limita la longitud a un máximo de sesenta con un mínimo de uno, y
deriva el desplazamiento restando uno a la página y multiplicando por la longitud.
Por último se emite la petición hacia el servicio de listado.

El cuarto paso es procesar la respuesta, en un bloque con tres controles. El
primero es la defensa contra respuestas fuera de orden, en la línea 296: si el
número de secuencia de la respuesta que acaba de llegar es distinto del valor
actual de la referencia, la función retorna de inmediato y descarta el resultado.
Como cada petición incrementa esa referencia, este control garantiza que solo la
última petición iniciada pueda escribir en los estados, y que las respuestas
antiguas, aunque lleguen más tarde, se ignoren. El segundo control, en la línea
297, verifica que la respuesta sea correcta y marcada como exitosa; si no lo es,
registra el resultado en la consola, enciende el estado de error y retorna. El
terzo, en las líneas 301 a 305, agrega los datos: construye el total y el
indicador de que hay más resultados, y solo si el total recibido es un número
finito lo guarda en su estado. La agregación de la lista merece detalle, porque
no es una simple concatenación. Antes de agregar nada, el código construye un
conjunto con los identificadores que ya están en la lista, filtra el bloque
recibido para descartar los elementos cuyo identificador ya esté en ese conjunto,
y solo entonces concatena lo que sobrevivió al filtro. Esa deduplicación
significa que, si el servidor devolviera dos veces la misma conversación —por
ejemplo, si una publicación nueva se insertara entre dos peticiones y desplazara
el límite de una página—, la tarjeta repetida no aparecería dos veces en pantalla.

El quinto paso es restaurar el sistema, en el bloque que se ejecuta tanto si la
petición funcionó como si falló. Ahí se comprueba otra vez el sello de secuencia
y solo si la respuesta sigue siendo la vigente se suelta la barrera y se apaga el
indicador visual. La condición también es necesaria en el camino de error, porque
una respuesta antigua que llega tarde no debe apagar el indicador de carga de la
petición que sí está vigente.

A quién invoca es a un solo servicio: el de listado de conversaciones del
servidor, una vez por ejecución. No invoca ninguna unidad interna. Qué entrega:
nada, porque su retorno se descarta y ni el marcado ni el sistema de observables
leen resultado. Qué recibe: nada.

Dos detalles quedan pendientes de registro en el apartado 2.23: el hecho de que la
carga inicial y este manejador construyen el objeto de parámetros de forma
duplicada en lugar de compartir una función, y el hecho de que la barrera viva en
una referencia mientras el indicador visual vive en un estado, lo que obliga a
mantener ambos sincronizados a mano.

## 2.12 El manejador `alternarLike` y la línea contadora `textoConteo`

El manejador `alternarLike` se declara en la línea 472, está memorizado con
`useCallback` y recibe un parámetro: `conv`, que es el objeto de conversación
completo de la tarjeta que la persona acaba de pulsar.

Su propósito es alternar el voto de esa conversación, y en caso de que la
persona no tenga sesión abierta, abrir la ventana de inicio de sesión. La tarjeta
no distingue esos dos casos: siempre llama al mismo manejador.

Qué hace, en el camino con sesión, es una sola cosa observable: pedir al servidor
que alterne el voto. Cómo lo hace es en cuatro pasos. El primero es una
comprobación de sesión, en la línea 473: si no hay sesión
autenticada, el manejador
pide al contexto de ventanas de autenticación que abra la ventana de inicio de
sesión y retorna, sin emitir ninguna petición. El segundo es emitir la petición,
en la línea 477, hacia la ruta de voto del servicio de servidor con el
identificador de la conversación interpolado en la URL. El tercero es procesar la
respuesta, en las líneas 478 y 479: solo si la respuesta es correcta y marcada
como exitosa se ejecuta la continuación, y cualquier otro resultado se descarta en
silencio, sin registrar nada en la consola ni mostrar un mensaje. El cuarto es
sincronizar la lista visible, en las líneas 480 a 490, que es la parte más
delicada del manejador. La actualización usa la forma que parte del valor anterior
del estado y recorre la lista completa sustituyendo únicamente el elemento cuyo
identificador coincide con el de la conversación que se votó. Los demás elementos
se devuelven sin tocar. Para el elemento que coincide se construye un objeto
nuevo, y no se modifica el existente, con dos cambios: la propiedad de número de
votos recibe el total que devuelve el servidor, y la propiedad de estado propio
se vuelve a construir añadiendo el valor de voto que devuelve el servidor. Esta
decisión de reconstruir en lugar de mutar es la que permite que la tarjeta vuelva
a pintarse con el número y el color nuevos.

Ese bloque tiene además dos efectos colaterales que conviene explicitar. Al
copiar el objeto de estado propio, el código también arrastra la propiedad de
denuncia que el servidor había incluido en ese mismo objeto, de modo que la
tarjeta no pierde ese dato al votarle a una conversación que ya estaba denunciada.
Y al usar el total devuelto por el servidor en lugar de incrementar el número
local en uno, la tarjeta queda sincronizada con el contador desnormalizado que el
servidor mantiene, que es el mismo dato que el módulo de perfil lee para calcular
sus estadísticas.

Quién lo invoca es la unidad `ConversacionCard`, en la línea 146, mediante una
función de flecha que le pasa la conversación completa, como se explicó en el
apartado 2.8. No hay ningún otro punto de invocación en el cliente. A quién
invoca son dos rutas distintas según el estado de la sesión: al contexto de
ventanas de autenticación, cuando no hay sesión, y al servicio de voto del
servidor, cuando sí la hay. El servicio de voto se describe en el apartado 2.12.
Qué recibe la tarjeta del manejador es una promesa que la tarjeta descarta, de
modo que el voto es una operación sin resultado esperado por quien la inició.
Qué entrega el manejador: nada.

Conviene registrar aquí un comportamiento que el requerimiento no especifica y
que se deja abierto a la decisión del equipo: si la petición de voto falla, el
manejador no revierte el estado visual anterior, porque el estado no se modificó
de forma optimista, sino solo cuando la respuesta llegó bien. En la práctica, el
usuario ve que nada ocurre y no recibe ningún aviso. Esa ausencia de mensaje es
una diferencia respecto del módulo de video, que sí muestra una alerta de la
asistente cuando una acción falla. [PENDIENTE: confirmar con el equipo si el
voto fallido debe producir un aviso visible para la persona usuaria].

La unidad `textoConteo` se declara en la línea 497 y está memorizada con `useMemo`
con cuatro dependencias: el indicador de carga, el estado de error, la longitud de
la lista y el total. Su propósito es producir la línea de texto que resume cuántos
elementos se están viendo de cuántos existen. Recibe nada e invoca a nadie.

Qué hace es construir esa frase. Cómo lo hace es con dos guardas y tres pasos. La
primera guarda devuelve una cadena vacía si se está cargando o si hay error, de
modo que la línea desaparece durante los estados transitorios en lugar de mostrar
un conteo engañoso. La segunda cuenta cuántos elementos hay visibles, que es la
longitud de la lista. La tercera decide entre forma singular y plural para dos
sustantivos distintos: el primero compara el total contra uno y la segunda compara
el número de visibles contra uno, de modo que un texto como *Mostrando 1
conversación de 1 conversación* es gramaticalmente correcto. La cuarta interpola
ambos valores. Es notable que el total se lea del estado y no de la respuesta de
la carga actual, lo que hace que la línea refleje el conteo global que el
servidor calculó y no el número de elementos que casualmente hay en esta página.

## 2.13 El par de manejadores `abrirPanel` y `cerrarPanel`

Los dos manejadores que gobiernan la visibilidad del panel de filtros son
simétricos y muy breves. `abrirPanel` se declara en la línea 383 y `cerrarPanel`
en la línea 388.

Qué hace el primero es abrir el panel y, antes de abrirlo, sembrar el conjunto de
borradores con los filtros que están actualmente en vigor. Cómo lo hace es con dos
llamadas. La primera construye el borrador con el operador de dispersión: parte
del conjunto de valores vacíos descrito en el apartado 2.3 y lo sobrescribe
enteramente con los filtros aplicados, de modo que al abrir el panel la persona
ve exactamente lo que está activo, no un formulario en blanco. La segunda enciende
el indicador de apertura. La semilla del borrador se hace al abrir y no de forma
permanente, porque entre abrir y aplicar la persona puede abandonar el panel, y en
ese caso el siguiente intento debe volver a mostrar los filtros en vigor y no los
del intento fallido anterior. Qué recibe: nada. A quién invoca: a dos setters de
estado del propio componente. Qué entrega: nada.

Qué hace el segundo es cerrar el panel. Cómo lo hace es una
sola asignación directa
del indicador de apertura a falso, escrita en forma de flecha con cuerpo de
expresión, que es la forma más breve posible de la misma operación. No limpia el
borrador ni los filtros aplicados, de manera que cerrar el panel sin aplicar
descarta los cambios sin dejar rastro. Qué recibe: nada. A quién invoca: al mismo
setter. Qué entrega: nada.

Quién invoca al primero es el botón circular que lleva el icono de embudo, en la
línea 596 del marcado. El segundo tiene tres invocadores distintos. El primero es
el propio botón del embudo, en la misma línea 596, porque el mismo control sirve
para abrir y para cerrar según el estado del indicador. El segundo es el botón de
cerrar que lleva la propia esquinas superior del panel. El tercero es un
manejador de teclado declarado en las líneas 397 a 405, que registra un
escuchador global de pulsación de tecla cuando el panel está abierto, y que al
detectar la tecla de escape llama a `cerrarPanel`. Ese escuchador se da de baja
en la función de limpieza que el propio efecto devuelve, de modo que al cerrar el
panel el escuchador desaparece.

## 2.14 Los manejadores `cambiarBorrador` y `alternarCulturaBorrador`

Estos dos manejadores editan el borrador sin tocar los filtros aplicados, y por
eso llevan en el nombre la palabra borrador.

`cambiarBorrador` se declara en la línea 410 y recibe dos argumentos: `clave`, que
es el nombre de la propiedad a cambiar, y `valor`, que es el nuevo valor. Qué
hace es sustituir el valor de una propiedad del borrador. Cómo lo hace es con la
actualización funcional del estado: dentro de la función que recibe el borrador
anterior, construye un objeto nuevo con el operador de dispersión y la notación de
propiedad calculada, de modo que la clave puede ser cualquiera de las cinco del
conjunto de filtros. Al no mutar el objeto anterior, la interfaz puede detectar el
cambio comparando identidades. El algoritmo tiene una consecuencia útil: como la
operación es genérica en su clave, un solo manejador sirve tanto para el control
de opción de tema como para los dos campos de fecha, y no hace falta uno por
control. Recibe la clave y el valor, no invoca nada más que el setter, y no
entrega nada.

`alternarCulturaBorrador` se declara en la línea 413 y recibe un argumento, `id`,
que es el identificador de una cultura, que llega como número desde el recorrido
de la lista de culturas. Qué hace es agregar esa cultura al borrador si no está, o
quitarla si ya está. Cómo lo hace es en tres pasos. El primero es leer la clave de
la referencia en el valor de entrada, porque el borrador guarda las culturas como
cadenas: se convierte el identificador a cadena para poder compararlo con lo que
ya hay guardado. El segundo es decidir, con el método de
inclusión sobre el arreglo
de culturas del borrador, si la clave ya está presente. El tercero es construir el
arreglo resultante en cualquiera de los dos sentidos: si estaba, se conserva el
arregro anterior descontando ese elemento; si no, se agrega la clave al final del
arregro anterior. De nuevo se construye un objeto nuevo para el borrador entero,
de modo que el patrón de actualización inmutable es uniforme en todo el archivo.
Recibe el identificador, invoca al setter del borrador, y no entrega nada.

Quién los invoca. `cambiarBorrador` se usa en tres puntos del marcado. El
primero es el control de opción de cada tema, que es un botón de radio
dentro de un grupo con su leyenda *Tema*, y que lo invoca en la línea 712
pasándole la clave del tema y el tema como valor. El segundo es el campo de fecha
inicial, en la línea 742, que lo invoca con la fecha leída del evento de cambio.
El tercero es el campo de fecha final, en la línea 753, con el mismo criterio.

`alternarCulturaBorrador` se usa en un solo punto, la casilla de verificación de
cada cultura, en la línea 726, a la que se le pasa el identificador de esa
cultura. El marcado de esa casilla merece dos observaciones. La primera es que su
estado marcado no lo decide el manejador sino una comparación directa: el código
compara el identificador de la cultura convertido a cadena contra la lista de
culturas del borrador, que es exactamente la conversión que hace el manejador.
Esa duplicación del criterio es necesaria, porque el marcado necesita saber si la
casilla está marcada y el manejador solo sabe cambiarla. La segunda es que las
casillas no comparten atributo de nombre, a diferencia de los botones de opción de
tema que sí lo comparten en la línea 708, lo que es correcto para un grupo de
casillas de verificación, donde la independencia es justamente lo que se quiere.

## 2.15 Los manejadores `aplicarFiltros` y `limpiarFiltros`

Estos dos manejadores son los únicos dos botones de acción del panel de filtros.
`aplicarFiltros` se declara en la línea 422 y `limpiarFiltros` en la línea 427.

Qué hace el primero es confirmar los cambios del borrador y
convertirlos en filtros
activos. Cómo lo hace es con dos operaciones. La primera vuelve a construir los
filtros aplicando sobre el conjunto de valores vacíos el contenido del borrador,
con la misma técnica de dispersión que usa `abrirPanel` y en sentido inverso: allí
el borrador se sembraba con los filtros, y aquí los filtros se siembran con el
borrador. La segunda cierra el panel. El efecto secundario de esa segunda
operación es que el panel se cierra sin devolver el foco a ningún sitio en
particular, lo que deja el foco sobre el botón que la persona acaba de pulsar, que
permanece visible porque el botón vive en la barra de herramientas y no dentro
del panel. Recibe nada, invoca a dos setters de estado, y no entrega nada.

Qué hace el segundo es devolver el módulo a un estado sin filtros ni búsqueda.
Cómo lo hace es con cuatro actualizaciones de estado, y es el manejador más
agresivo del archivo en cuanto a estado, porque toca las cuatro representaciones
que el módulo guarda del mismo conjunto de criterios. La primera restablece los
filtros al conjunto de valores vacíos. La segunda restablece también el borrador a
ese mismo conjunto, de modo que si la persona vuelve a abrir el panel sin haber
aplicado nada, encuentra el formulario en blanco en lugar de con los valores que
iba a descartar. La tercera y la cuarta vacían las dos
representaciones del texto de
búsqueda, el texto visible y el texto ya aplicado.

Lo que el manejador **no** hace es cerrar el panel, y esa omisión es deliberada.
El botón de limpiar vive dentro del panel, pero limpiar no cierra, de modo que la
persona ve cómo se vacían los controles de tema, cultura y fecha sin que el panel
desaparezca bajo su mano. Esa decisión de interfaz es la que hace que el panel se
sienta como una hoja de trabajo y no como un diálogo que se
cierra al confirmar. En
cambio, sí vacía la búsqueda, que vive fuera del panel, y eso sí produce un efecto
visible inmediato en la barra de herramientas. El resultado es una asimetría
intencionada: los filtros se limpian en silencio y a la vista, y la búsqueda se
limpia con efecto inmediato y desde fuera. Recibe nada, invoca a cuatro setters, y
no entrega nada.

Quién los invoca son los dos botones del pie del panel, con las clases de acción
de aplicar y de limpiar. No hay ningún otro punto de invocación.

## 2.16 Los manejadores `abrirCrear` y `cambiarOrden`

`abrirCrear` se declara en la línea 434 y `cambiarOrden` en la línea 444. Los dos
resuelven un problema de la misma familia: qué hacer cuando una acción exige
tener sesión abierta.

Qué hace el primero es abrir la ventana de creación de conversación, o bien
pedir el inicio de sesión. Cómo lo hace es con dos pasos. El primero es una
comprobación de sesión que, si falla, pide al contexto de ventanas de
autenticación que abra la ventana de inicio de sesión y retorna sin navegar. El
segundo es navegar a la ruta de creación. Su ruta objetivo es la que el enrutador
registra en la línea 34 del archivo de rutas del cliente y a la que el propio
componente principal reacciona, como explica el apartado 2.21.
Nótese el paralelismo
con `alternarLike`: ambos manejanadores abren la ventana de inicio de sesión en
lugar de su propio comportamiento cuando no hay sesión, y ninguno de los dos
muestra un aviso previo. Recibe nada, invoca al contexto de ventanas de
autenticación o al enrutador, y no entrega nada.

Qué hace el segundo es cambiar el criterio de ordenamiento del listado. Cómo lo
hace es en tres pasos. El primero es una comprobación de sesión que solo aplica a
un valor concreto: si el valor pedido es el de seguimiento y no hay sesión, se
pide el inicio de sesión y se retorna. La comprobación es necesaria por una
razón de servidor, y no solo de interfaz: la orden de seguimiento exige una
consulta que une la lista de seguidores con la lista de conversaciones, y esa
unión solo puede ejecutarse con un identificador de usuario, que el servidor no
puede inventar cuando no hay sesión. El segundo paso es comparar el valor pedido
con el orden vigente y, si son iguales, devolver el estado sin cambios. Esa
comparación evita un repintado inútil cuando se pulsa la pestaña que ya está
activa. El tercer paso es construir el nuevo conjunto de filtros copiando el
anterior y sustituyendo la propiedad de orden. Recibe el valor de orden, invoca al
setter de filtros y al contexto de ventanas, y no entrega nada.

Quién los invoca. `abrirCrear` se invoca desde el botón de crear de la barra de
herramientas, con una condición interesante: ese botón se pinta siempre, incluso
sin sesión, y es el propio manejador quien decide si pedir el
acceso. `cambiarOrden`
se invoca desde dos sitios. El primero es el manejador de teclado de las
pestañas. El segundo es el manejador de pulsación de cada pestaña
de orden, en la línea
613, que se reduce a llamar a `cambiarOrden` con el valor de su propia pestaña.
No mueve el foco de forma explícita, y no hace falta: el navegador concentra
automáticamente el control pulsado, y como la pestaña recién activa recibe además
el valor cero de tabulación según el marcado de la línea 610, la siguiente
pulsación de tecla parte de ella. El hecho de que solo la pestaña activa tenga
tabulación cero es lo que implementa la técnica de navegación de un único elemento
enfocable dentro de un grupo. [PENDIENTE: confirmar con el equipo
si el botón de crear
debe ocultarse cuando no hay sesión, o si la decisión deliberada de mostrarlo y
pedir el acceso al pulsarlo es la que se quiere conservar].

## 2.17 El manejador `manejarTecladoOrden` y la navegación por teclado

El manejador `manejarTecladoOrden` se declara en la línea 454 y recibe dos
argumentos: el evento de teclado y el índice de la pestaña desde la que se
origina el evento.

Su propósito es permitir recorrer las cuatro pestañas de orden
sin llegar al ratón,
y con la convención de teclado que usan los grupos de pestañas en toda la
interfaz del proyecto. El comentario de la línea 452 lo declara explícitamente y
remite al patrón de las pestañas del perfil, que es la implementación original de
esa convención dentro del proyecto.

Qué hace es trasladar el foco de la pestaña actual a la pestaña vecina que
corresponda a la tecla pulsada, y activar esa pestaña al mismo tiempo. Cómo lo
hace es en cuatro pasos.

El primero es reunir el conjunto de pestañas reales del documento. En lugar de
confiar en el arreglo de configuración `ORDEN_TABS`, el manejador consulta el
contenedor al que apunta la referencia `ordenRef`, declarada en la línea 258, y
selecciona todos los descendientes que declaran el papel de pestaña. Esa consulta
al documento, y no al arreglo de configuración, es lo que permite que el recorrido
incluya exactamente los elementos que están pintados. Si la referencia apunta a
nada, el operador de acceso con valor inicial resuelve el resultado a una lista
vacía y la función retorna, de modo que una pulsación de tecla anterior al montaje
no rompe nada.

El segundo paso es traducir la tecla pulsada a un índice destino, y aquí está el
detalle de diseño que hace legible el manejador: en lugar de una cadena de
condicionales, el código construye un objeto literal de cuatro entradas, cuyas
claves son los nombres de las cuatro teclas relevantes y cuyos valores son
expresiones de cálculo del índice destino. La tecla de flecha a la derecha suma
uno al módulo de la cantidad de pestañas; la de flecha a la izquierda resta uno y
suma la cantidad de pestañas antes de aplicar el módulo, lo que resuelve el
envoltura en el sentido inverso; la tecla de inicio vale cero; y la tecla de fin
vale la cantidad de pestañas menos uno. Los dos módulos son los que producen el
comportamiento envolvente, de modo que al llegar al último elemento y pulsar la
flecha a la derecha se vuelve al primero, y viceversa. Como el objeto se consulta
con el nombre de la tecla, una tecla no contemplada produce un valor indefinido, y
la línea siguiente descarta ese caso con una comparación explícita. La forma
elegida tiene además la ventaja de que agregar una tecla nueva es agregar una
entrada, sin tocar el resto del algoritmo.

El tercer paso es anular el comportamiento por omisión de la tecla, con la línea
que cancela la acción predeterminada del evento. Ese paso es necesario porque, sin
ello, la tecla de inicio desplazaría el documento al principio de la página y la
tecla de fin lo llevaría al final, con lo cual el foco se perdería fuera del grupo
de pestañas.

El cuarto paso es ejecutar el traslado. Se toma el elemento destino, se le da el
foco y se invoca a `cambiarOrden` con el valor de orden que
ese elemento declara en
su atributo de datos. Que el destino se lea del propio elemento pintado, y no del
arreglo de configuración, garantiza que el foco y el orden aplicado no puedan
divergir: si el conjunto de pestañas se llegara a cambiar, el teclado seguiría
activando la pestaña que realmente está bajo el foco.

Quién lo invoca es el manejador de teclado de cada una de las cuatro pestañas, en
la línea 615. No hay más invocadores. A quién invoca, además de a la técnica de
foco incorporada en el lenguaje, está a `cambiarOrden`, descrito en el apartado
2.16, y por esa vía al contexto de ventanas de autenticación cuando la pestaña de
seguimiento se alcanza sin sesión. Qué recibe: el evento y el índice. Qué
entrega: nada.

## 2.18 La función `nombreCultura`

La función `nombreCultura` se declara en la línea 512, está memorizada con
`useCallback` y depende del arreglo de culturas.

Su propósito es traducir el identificador numérico de una
cultura al nombre legible
que el usuario lee. Existe por una razón muy concreta:
hay un único lugar en todo el
componente donde el cliente tiene el identificador de una cultura pero **no** su
objeto, y ese lugar es el aviso de filtros. La función se
apoya en un solo dato: el
arreglo de culturas que el componente ya tiene en memoria.

Qué hace es buscar la cultura cuyo identificador coincida con el que recibe y
devolver su nombre. Cómo lo hace es con una búsqueda sobre el arreglo. La búsqueda
compara el identificador de la cultura con el valor recibido **después de
convertir ambos a cadena**, y esa conversión en los dos lados
es lo que hace que la
función funcione aunque uno de los dos llegue como número y el otro como texto.
Cumplido el recorrido, si no se encontró nada, la función devuelve la cadena fija
*Cultura* en lugar de un valor vacío. Ese valor de respaldo no
es decorativo: evita
que un chip removible muestre un espacio en blanco cuando el identificador de una
cultura no está en el arreglo de culturas que el cliente cargó. Qué recibe: el
identificador, que puede llegar como número o como cadena.
Qué entrega: siempre una
cadena, nunca un valor nulo. A quién invoca: a nadie.

Quién la invoca es, por tanto, un solo punto: el cálculo de los
chips removibles, en
la línea 522, que necesita el nombre para construir la etiqueta
del chip de cultura.
No hay más invocaciones, y conviene subrayarlo porque es
contraintuitivo, porque hay
**dos** sitios más que muestran un nombre de cultura y ninguno de los dos usa esta
función.

El primero es el chip de cultura **del panel de filtros**, que
imprime directamente
la propiedad de nombre del objeto que se está recorriendo, como se vio en el
apartado 2.14, porque en el panel el nombre ya está disponible en el propio objeto
que se está pintando.

El segundo es el chip de cultura **de la tarjeta**, en las líneas 170 a 175, que
imprime la propiedad de nombre anidada en el objeto de cultura que trae cada
conversación y que, ante su ausencia, recurre a la cadena *General*. Ese chip
acompaña un punto de color decorativo, de modo que el color sí se resuelve en el
cliente —con la tabla de colores por cultura del apartado 2.6— mientras que el
nombre llega resuelto desde el servidor.

La razón de esa asimetría es que la función existe solo para el caso en que el
cliente posee el identificador sin el objeto. En el aviso de filtros eso ocurre, y
en los otros dos no. Es también la razón por la que el valor de respaldo de la
función tiene sentido en una etiqueta de chip y no tendría sentido en una tarjeta,
donde el respaldo ya lo aplica el propio servidor.

## 2.19 El cálculo `chipsFiltros` y el manejador `quitarChip`

El cálculo `chipsFiltros` se declara en la línea 517 y está memorizado con
`useMemo`, con tres dependencias: los filtros aplicados, el texto de búsqueda y la
función `nombreCultura`. El manejador `quitarChip` se declara en la línea 530.

Qué hace el primero es construir la lista de avisos que resumen qué filtros están
activos, uno por filtro, cada uno con una clave y una etiqueta legible. Cómo lo
hace es con una construcción acumulativa en cinco pasos. Empieza con un arreglo
vacío. Luego, si el tema activo no es el valor neutro, agrega un elemento cuya
clave es el nombre de ese filtro y cuya etiqueta concatena el rótulo del filtro
con su valor. Después recorre el arreglo de culturas activas y agrega un elemento
por cultura, con una clave compuesta por el prefijo de cultura y el
identificador, y una etiqueta que usa `nombreCultura` para resolver el texto.
Luego hace lo mismo con las dos fechas del rango, cada una con su clave y su
etiqueta. Por último, si hay texto de búsqueda, agrega un elemento más con clave
de búsqueda y una etiqueta que envuelve el texto entre comillas tipográficas. El
resultado es un arreglo de objetos, cada uno con dos propiedades: `clave`, que es
la que despacha el manejador de eliminación, y `etiqueta`, que es lo que se pinta.

El uso de la clave compuesta por cultura es lo que permite quitar una cultura
concreta de entre varias: si todas las claves fueran iguales a una constante, el
manejador no tendría forma de saber cuál quitar. El algoritmo no deduplica ni
ordena los chips; el orden es el orden en que se declaran los filtros, que es
fijo, de modo que los chips salen siempre en la misma secuencia.

Qué hace el segundo es quitar el filtro que corresponde a la clave recibida, y lo
hace **dos veces**: una sobre los filtros aplicados y otra sobre el borrador. Esa
duplicación es el detalle más importante del manejador. Cómo lo hace es con una
bifurcación inicial y dos actualizaciones en cadena.

La bifurcación inicial es la de la búsqueda. Si la clave recibida es la de
búsqueda, el manejador vacía las dos representaciones del texto y retorna de
inmediato, sin tocar ningún conjunto de filtros. La búsqueda
no vive en el conjunto
de filtros sino en un estado propio, y por eso necesita un camino propio.

Si la clave no es la de búsqueda, el manejador actualiza los filtros aplicados con
una función que examina la clave y devuelve un conjunto nuevo. La función tiene
cuatro ramas con resultado y una quinta de salvaguarda. Si la clave es la del
tema, devuelve el conjunto con el tema restituido a su valor neutro. Si es la de
la fecha inicial, la vacía. Si es la de la fecha final, la vacía. Si la clave
empieza por el prefijo de cultura, extrae el identificador quitando ese prefijo y
devuelve el conjunto con la cultura descontada del arreglo de culturas. Y si la
clave no coincide con ninguna de esas cuatro formas, devuelve el conjunto anterior
sin modificar. Esa última rama es una salvaguarda necesaria: sin ella, una clave
desconocida produciría un conjunto de filtros sin la propiedad de orden, y el
módulo se quedaría sin criterio de ordenamiento, lo que rompería la construcción
de la petición descrita en el apartado 2.11.

Inmediatamente después de esa actualización, el manejador repite **exactamente la
misma lógica** sobre el borrador, en las líneas 546 a 555, con la misma cadena de
cuatro ramas y la misma salvaguarda. El efecto de esa segunda pasada es que
quitar un chip mantiene el panel de filtros sincronizado con la lista. Si solo se
actualizaran los filtros aplicados, la persona vería la lista recargarse sin el
filtro, pero al abrir de nuevo el panel encontraría el control
de tema o la casilla
de cultura todavía marcada, porque `abrirPanel` siembra el
borrador con los filtros
aplicados y volvería a mostrarlo. Con la doble actualización,
quitar un chip es una
acción completa y coherente en las dos superficies.

Esa duplicación interna es, sin embargo, frágil: las dos cadenas de condiciones
son copias literales, con la misma condición de salvaguarda que devuelve el objeto
anterior. Un cambio en una de las dos ramas no se propaga a la otra. El
mantenimiento de las dos copias se reporta como observación en el apartado 2.23.

Quién los invoca. El cálculo se invoca una sola vez, en el marcado que dibuja el
aviso de filtros activos. El manejador se invoca desde el botón de eliminación de
cada chip. No hay más puntos de llamada. Ninguno de los dos invoca a servicios de
red: la eliminación es local e inmediata, y el efecto de recarga descrito en el
apartado 2.20 reacciona al cambio de los filtros.

## 2.20 Los seis efectos del componente principal

El componente principal declara seis efectos. Los tres primeros resuelven datos y
carga, los dos siguientes se ocupan de la interfaz, y el
último atiende el teclado.
Se documentan aquí en el orden en que aparecen en el archivo.

### 2.20.1 El efecto de carga de catálogos

El primer efecto se declara en la línea 261, con un arreglo de dependencias vacío,
de modo que se ejecuta una sola vez al montar el componente y nunca más.

Su propósito es traer los dos catálogos que el panel necesita para poder
ofrecerse: el de temas y el de culturas con sus subculturas. No recibe nada.

Qué hace es emitir dos peticiones. Cómo lo hace resulta particular porque las dos
peticiones son independientes y se lanzan en paralelo, sin esperarse entre sí, y
porque ambas tratan el fallo de forma distinta respecto del estado de la interfaz:
las dos vacían su bloque de manejo de error con un cuerpo deliberadamente vacío,
de modo que un fallo de red no produce ni un aviso visible ni un error en la
consola. La primera petición va al catálogo de temas y, si la
respuesta es correcta,
marcada como exitosa y trae al menos un elemento, reemplaza el estado de temas
anteponiendo la cadena *Todos* al arreglo recibido. La segunda va al catálogo de
culturas y, si la respuesta es correcta y exitosa, guarda el arreglo de culturas o
una lista vacía si la respuesta no lo trajo.

Esa última construcción es la que permite que el panel se pinte aunque el catálogo
no llegue: como la alternativa a un valor ausente es una lista vacía y no un valor
nulo, los recorridos posteriores no necesitan protegerse contra la ausencia. El
comportamiento deliberado de no avisar ante un fallo merece un comentario de
equipo, y se recoge en el apartado 2.23: el usuario que no consiga cargar las
culturas verá un panel de filtros sin casillas y sin ninguna explicación de por
qué.

### 2.20.2 El efecto de espera de la búsqueda

El segundo efecto se declara en la línea 277 y depende únicamente del texto de
búsqueda.

Su propósito es no pedir al servidor en cada tecla que la persona escriba, sino
esperar a que se detenga. Qué hace es una sola cosa: programa una ejecución
diferida. Cómo lo hace es con un temporizador que se crea al cambiar el texto y
que se cancela en la función de limpieza antes de cada nueva ejecución y al
desmontar. El valor que finalmente se aplica es el texto recortado con el método
que elimina los espacios sobrantes de los extremos, lo que evita que una búsqueda
compuesta solo de espacios dispare una petición inútil.

La consecuencia de diseño es que el texto que la persona está escribiendo y el
texto que se envía al servidor son dos estados distintos. El campo de entrada se
pinta con el primero y la etiqueta del chip de búsqueda se construye con el
segundo, de modo que durante los cuatrocientos milisegundos de espera el chip
refleja la búsqueda ya confirmada y no la que se está escribiendo. El
comportamiento se registra en el apartado 2.23.

### 2.20.3 El efecto de carga y recarga del listado

El tercer efecto se declara en la línea 325 y depende de los
filtros aplicados, del
texto de búsqueda confirmado y de un contador de reintento.

Su propósito es cargar la primera página del listado y, cada vez que cualquiera de
esas tres entradas cambie, volver a construir la lista desde cero.

Qué hace, en el camino correcto, es sustituir por completo el contenido de la
lista, guardar el total, fijar el indicador de que hay más resultados, apagar el
estado de error y dejar la referencia de página en uno. Cómo lo hace repite casi
exactamente el algoritmo de `cargarMas` descrito en el apartado 2.11, con tres
diferencias y una decisión que merece atención.

La primera diferencia está en la construcción de la petición: aquí la página es
siempre la primera, y no hay lectura de la referencia de página. La segunda
diferencia está en la respuesta: cuando la petición es incorrecta, este efecto
además de encender el estado de error **vacía la lista y desactiva el indicador de
que hay más resultados**. Esa es la razón de ser del comentario que el propio
código dejó en las líneas 344 y 345, que explica que un error de servidor debe
parecer un error y no una lista vacía. La tercera diferencia es que, en el camino
correcto, este efecto apaga explícitamente el estado de error, cosa que
`cargarMas` no hace, porque para `cargarMas` un fallo al añadir una página no debe
invalidar las páginas ya visibles.

La cuarta decisión es la más importante desde el punto de vista de la corrección
del módulo. La llamada que enciende los indicadores de carga no se ejecuta
directamente en el cuerpo del efecto, sino dentro de una promesa resuelta
inmediatamente. El comentario del código y la historia del proyecto explican el
motivo: se hizo para satisfacer la regla de análisis estático que prohíbe escribir
estado de forma síncrona dentro de un efecto. La consecuencia observable es
nula —los indicadores se encienden en el mismo ciclo de dibujo en la práctica—,
pero la explicación de por qué la carga inicial no arranca sus dos indicadores en
la misma línea que el resto, pese a estar ambas en el mismo
bloque, es precisamente
esa indirección.

El contador de reintento es la tercera dependencia y no se usa para nada más. No
aparece en el cuerpo del efecto: el efecto solo lo lee a través de la lista de
dependencias. Esa es la técnica para forzar una reejecución desde fuera, y la
invoca el botón de reintentar del estado de error, que en lugar de repetir la
petición él mismo se limita a incrementar ese contador.

### 2.20.4 El efecto del observador de intersección

El cuarto efecto se declara en la línea 369 y depende del manejador `cargarMas` y
de la longitud de la lista.

Su propósito es detectar cuándo el marcador de scroll llegó a la parte inferior de
la zona visible para pedir el bloque siguiente. No recibe nada.

Qué hace es registrar un observador sobre el elemento al que apunta la referencia
`sentinelRef`, que es el marcador invisible situado al final de la lista. Cómo lo
hace es en cuatro pasos. Primero lee la referencia y retorna si no hay elemento,
lo que protege el caso en que el efecto se ejecuta antes de que el marcado exista.
Segundo construye un observador de intersección cuyo comportamiento se activa
cuando las entradas reportan que el elemento está cruzando el
umbral, y cuyo margen
se amplía seiscientos píxeles en las direcciones vertical y cero en las
horizontales. Esa ampliación es lo que hace que la siguiente página empiece a
cargarse antes de que la persona llegue al final. Tercero, dentro del manejador de
entradas, se invocan dos condiciones: que el elemento esté
cruzando el umbral y que
la lista tenga al menos un elemento. La segunda condición impide que el marcador
dispare una carga cuando la lista está vacía, lo que evita el bucle de peticiones
en el estado de error o de lista vacía. Cuarto, la función que devuelve el efecto
desconecta el observador, de modo que no quedan escuchas vivas cuando el efecto se
vuelve a ejecutar o el componente se desmonta.

Las dos dependencias merecen justificación. La dependencia del manejador existe
porque `cargarMas` cambia de identidad cada vez que cambian los filtros, y el
observador debe consultar siempre la versión vigente, no una copia vieja. La
dependencia de la longitud de la lista existe porque esa longitud es la que
habilita o bloquea la carga, y porque al crecer la lista el marcador se desplaza
hacia abajo: reconectar el observador en cada cambio de longitud evita que un
elemento que quedó muy lejos de la zona activa deje de avisar cuando la persona
vuelve a desplazarse.

### 2.20.5 El efecto que devuelve el foco al abrir el panel

El quinto efecto, en las líneas 391 a 399, hace lo que anuncia el comentario de la
línea 390: al abrir el panel se devuelve el foco al primer
control. Su dependencia es
el indicador de apertura del panel, y por eso solo se ejecuta cuando ese indicador
cambia.

Qué hace es enfocar el primer control interactivo del panel. Cómo lo hace es en
tres pasos. El primero es comprobar que el panel esté abierto:
el cuerpo entero está
dentro de la condición, sin guarda de salida temprana. El segundo es leer de la
referencia del panel el elemento que lo contiene, y comprobar
que esa referencia no
esté vacía. El tercero es programar el enfoque con una espera de treinta
milisegundos en lugar de hacerlo de inmediato.

La espera no es decorativa. Al abrirse el panel, sus controles todavía están en
proceso de montaje, y enfocar un elemento que el navegador aún
no ha pintado produce
un fallo silencioso en varios navegadores. En lugar de esperar
al siguiente ciclo de
dibujado, el código espera un intervalo fijo, lo cual es una
decision mas simple pero
menos precisa.

Ese intervalo tiene dos efectos secundarios que conviene
mencionar. El primero es que
la limpieza del efecto lo cancela, de manera que si el panel se
cierra dentro de esa
ventana de treinta milisegundos el enfoque pendiente se anula y
no llega a aplicarse
sobre un panel que ya no existe. El segundo es que el enfoque no distingue entre
tipos de control: busca el primer elemento que sea un campo de
entrada o un selector,
y en el panel eso resulta ser el primer control de opción del
grupo de temas, porque
los campos de fecha están más abajo. El orden del marcado es, por tanto, lo que
determina qué control recibe el foco.

Quién lo invoca es el motor de renderizado, al cambiar el indicador de apertura. A
quién invoca son la referencia del panel, el objeto global de
la ventana y el primer
control interactivo encontrado dentro del panel. Qué recibe: nada.

### 2.20.6 El efecto de la tecla de escape

El sexto efecto, en las líneas 401 a 408, atiende la tecla de escape. Qué hace es
cerrar el panel de filtros. Cómo lo hace es con un escuchador
global de pulsación de
tecla que compara el nombre de la tecla con el valor de escape
y, si coincide, invoca
el manejador de cierre. Su dependencia es el indicador de
apertura, y esa dependencia
cumple una doble función.

La primera es de corrección: como la dependencia cambia cuando
el panel se abre, el
efecto se vuelve a ejecutar, se da de baja el escuchador
anterior y se registra uno
nuevo. La segunda es de consumo. El cuerpo del efecto empieza con una comprobación
que devuelve temprano cuando el panel no está abierto, y esa comprobación es
precisamente lo que hace que **no** se registre ningún
escuchador en ese estado. Ese
detalle evita un defecto que sería real: si el efecto se ejecutara siempre y solo
dependiera de comprobar el estado dentro del manejador, habría
un escuchador global
permanente que en cada pulsación de escape intentaría cerrar un
panel inexistente. En
la forma en que está escrito, la creacion del escuchador
coincide exactamente con la
ventana de vida del panel.

Este efecto es pariente del efecto de escape de la ventana de
creación, descrito en
el apartado 3.4, pero se comporta de manera distinta ante la misma tecla. Aquí el
cierre es idempotente, porque cerrar un panel ya cerrado es una operación sin
efecto. Allí, en cambio, el cierre significa abandonar la ventana y perder lo
escrito. La diferencia no está en el efecto, que es casi
idéntico, sino en lo que hay
al otro lado de la llamada.

Quién lo invoca es el motor de renderizado, al cambiar el indicador de apertura. A
quién invoca es al manejador de cierre del panel, cuyo
funcionamiento se describe en
el apartado 2.13. Qué recibe: nada.

## 2.21 Los catorce estados del componente principal y la construcción del listado

El componente principal declara catorce estados, repartidos entre cuatro grupos
funcionales. Este apartado los inventaría y explica cómo el conjunto determina
lo que se ve en pantalla, porque la estructura del listado no
está en el marcado de
forma incondicional sino que depende del estado.

El primer grupo son los catálogos, en las líneas 227 y 228. El estado de temas
arranca con el arreglo de respaldo descrito en el apartado 2.4 y el de culturas
arranca vacío. El segundo grupo es el de los filtros y la búsqueda, en las líneas
231 a 242: los filtros aplicados arrancan con los valores vacíos sobrescritos por
el tema que venga en los parámetros de la URL, de modo que la ruta puede abrir el
listado ya filtrado por un tema concreto; existen además dos estados para el texto
de búsqueda, uno para lo que se está escribiendo y otro para lo confirmado; el
borrador arranca en los valores vacíos; y el indicador de apertura del panel
arranca cerrado. El tercero es el del listado, en las líneas
245 a 251: la lista de
conversaciones vacía, el total en cero, el indicador de carga
inicial en verdadero,
el indicador de carga adicional en falso, el indicador de que
hay más resultados en
verdadero, el estado de error en falso y el contador de reintento en cero. Los
Los catorce estados se agrupan así: cuatro son de tema, cultura y catálogos —el
catálogo de temas, el de culturas, los filtros aplicados y el borrador del panel—,
tres son de búsqueda y panel —el texto que se está escribiendo, el texto ya
confirmado y el indicador de apertura—, cinco son de lista y
paginación —la lista, el
total, los dos indicadores de carga y el indicador de que quedan resultados— y dos
son de error y reintento.
A ellos se añaden seis referencias, que no son estados porque
no los almacenan, sino
porque son la puerta de entrada de los tres efectos de carga
que se describen en el
apartado 2.20: la referencia del panel, la del marcador de paginación y la del
marcador de barrera.

Dos de esos valores iniciales merecen justificación. El indicador de carga inicial
arranca en verdadero porque el efecto de carga del apartado 2.20.3 se ejecuta
después del primer dibujado, y sin ese valor inicial la pantalla mostraría un
estado vacío durante un instante antes de encender la carga. El indicador de que
hay más resultados, en cambio, arranca en verdadero de forma optimista, para que
el observador de intersección tenga permiso para intentar la primera carga
adicional; como el efecto de carga fija ese indicador al recibir la respuesta, el
optimismo inicial se corrige en el primer ciclo.

Qué hace el componente, en conjunto, es construir el listado. Cómo lo hace es
siguiendo una cadena de decisiones que se lee de arriba abajo
en el marcado. Primero
pinta la barra de herramientas, en la línea 562, que contiene
el botón de crear, el
campo de búsqueda con su lupa y su botón de limpieza, y el botón circular del
panel. Segundo pinta las pestañas de orden, en la línea 601, que es el elemento al
que apunta la referencia del teclado y que lleva el papel de navegación con su
etiqueta accesible. Tercero, y solo si hay un conteo que mostrar, pinta la línea
contadora, en la línea 622. Cuarto pinta el aviso de filtros activos, en la línea
626, que es donde viven los chips removibles. Quinto decide entre cuatro
situaciones excluyentes.

La primera situación es la de carga inicial, que se resuelve
con seis esqueletos de
contenido en la línea 649. La segunda es la de error, en las líneas 655 a 663,
que reusa la misma clase de estado vacío que el caso siguiente
pero con el icono de
error, un texto explicativo y un botón que incrementa el contador de reintento
descrito en el apartado 2.20.3. La tercera es la de lista vacía, en las líneas
668 a 688, cuyo botón de acción **cambia según el caso**: si hay filtros activos,
limpia los filtros; si no, abre la ventana de creación. Esa bifurcación es lo que
permite que una lista vacía ofrezca la salida correcta.
La cuarta es la de lista con
contenido, que se pinta como una lista de tarjetas y, debajo, la píldora de carga
adicional o la de fin de resultados.

A quién invoca el conjunto de toda esa construcción: a los catorce estados que la
gobiernan, a los doce manejadores ya documentados en los apartados 2.11 a 2.17 y
2.19, a la función memorizada del apartado 2.18, al cálculo de
los chips del apartado
2.19 y a las unidades auxiliares de los apartados 2.9 y 2.10. Estas últimas no se
invocan todas desde el marcado del propio componente principal, y la distinción
merece la pena. De las cinco funciones de icono, el listado invoca directamente
cuatro: la lupa en la línea 567, el embudo en la 597, el globo
de conversación en las
657 y 670 —en los esqueletos de carga y en el estado vacío— y el
calendario en las 738
y 749 para los dos campos de fecha. La quinta, la flecha de
voto, solo la invoca la
tarjeta, en su línea 150. Lo mismo ocurre con la función de iniciales, que solo la
invoca la tarjeta en su línea 161, porque es el avatar del
autor el que la necesita.
A todo eso hay que añadir la tarjeta del apartado 2.8, el
cliente de peticiones del
capítulo I y la ventana de creación que se documenta en el capítulo III.

Quién invoca al componente principal es el enrutador, en la línea 36 del archivo
de rutas del cliente, que lo monta dentro del contenedor de disposición general y
le entrega las propiedades de apertura y cierre de la ventana de creación. Ese
par de propiedades es la única vía por la que el listado controla el modal, y
como el modal no se monta mientras la ruta no sea la de
creación, ambos componentes
nunca coexisten en el árbol.

## 2.22 Hoja de estilos del listado de conversaciones

El listado y la ventana de creación comparten una hoja de estilos única:
`cliente/src/estilos/ConversacionesEstilos/conversaciones.css`, que cuenta con
1.200 líneas. Este apartado documenta la parte de esa hoja que da estilo al
listado; la parte que da estilo a la ventana de creación se documenta en el
apartado 3.8, porque el archivo que la usa es otro.

El alcance de la hoja es exclusivo de la carpeta de conversaciones, aunque
reutiliza variables globales de color y de tipografía del tema, entre ellas
`--color-fondo`, `--color-fondo3`, `--color-acento-fuerte`, `--color-h1` y
`--color-p`. No define fuentes ni reinicios globales. El botón de crear una
conversación, definido en las líneas 24 a 42 como `.conv-crear-btn`, es la
excepción que conviene recordar aquí: vive en el primer bloque de la hoja, el
del listado, pero también es la clase que usa el botón de publicar de la
ventana de creación, como se registra en el apartado 3.8.

Los estilos del listado se organizan en ocho bloques, a los que se suman las
reglas responsivas. El primero es la página (`.conv-page`), que aplica el
fondo completo y el alto mínimo para cubrir la ventana. El segundo es el
contenedor central (`.conv-contenedor`), con un ancho máximo fijo y márgenes
automáticos para mantener la columna de lectura. El tercero es la barra de
herramientas (`.conv-toolbar`), la búsqueda (`.conv-buscar`), el botón de
filtros (`.conv-filtros-toggle`), el botón de creación (`.conv-crear-btn`) y
el grupo de ordenamiento (`.conv-orden`). El cuarto es la línea de conteo
(`.conv-conteo`) y los avisos de filtros activos (`.conv-avisos`,
`.conv-aviso-chip`). El quinto es el panel de filtros (`.conv-panel`), su
fondo de espera (`.conv-panel-backdrop`) y sus controles internos
(`.conv-filtros-titulo`, `.conv-filtros-botones`, `.conv-boton-limpiar`,
`.conv-boton-aplicar`, `.conv-checkbox-item` y `.conv-radios-grupo`). El sexto
es la lista de conversaciones (`.conv-lista`) y los estados de carga y vacío
(`.conv-skeleton`, `.conv-vacio`, `.conv-error`). El séptimo es la tarjeta
(`.conv-card`), que define la rejilla con columna de votos y contenido, el
borde izquierdo teñido por cultura (`--conv-cultura`), la columna de votos
(`.conv-card-votos`, `.conv-voto-btn`, `.conv-voto-num`), el encabezado
(`.conv-card-meta`, `.conv-card-avatar`, `.conv-card-meta-autor`,
`.conv-card-meta-fecha`, `.conv-card-chips`, `.conv-card-chip`), el título, el
cuerpo con miniatura (`.conv-card-cuerpo`, `.conv-card-preview`,
`.conv-card-thumb`), el pie (`.conv-card-pie`, `.conv-card-metrica`,
`.conv-card-intervinientes`, `.conv-card-interv`) y sus estados de interacción
(`:hover`, `:focus-visible`). El octavo es la píldora de fin de resultados
(`.conv-fin`).

Las reglas responsivas son seis bloques. El primero se abre en la línea 212,
con `@media (max-width: 768px)`, y contiene una sola regla que reduce la
tipografía y el relleno de las pestañas de orden. El segundo se abre en la
línea 1108 con `@media (max-width: 1024px)` y apila la columna del contenido
en un solo renglón, de modo que el panel de filtros pasa a ocupar una
columna propia debajo del listado. El tercero se abre en la línea 1114 con
`@media (max-width: 768px)`: reduce el relleno de la página y del
contenedor, permite que la barra de herramientas se reparta en varias filas,
coloca la búsqueda en una fila propia, deja que el botón de creación ocupe
el espacio disponible, estrecha a cuarenta y cuatro píxeles la columna de
votos, reduce el icono de la flecha a dieciséis píxeles, permite que la
línea de metadatos se reparta en dos renglones y lleva la miniatura de la
tarjeta a cincuenta y seis píxeles. Ese tercer bloque contiene además la
regla `.conv-nueva-doble`, que pertenece a la ventana de creación y se
documenta en el apartado 3.8. El cuarto se abre en la línea 1155 con
`@media (max-width: 480px)` y reduce el relleno de la tarjeta, además de
retirar la miniatura y la línea de última respuesta. El quinto se abre en la
línea 1168 con `@media (max-width: 768px)` y es el que convierte el panel de
filtros en una hoja inferior fija, con sus esquinas superiores redondeadas,
su sombra hacia arriba y el fondo oscuro que acompaña al panel; la misma
regla muestra el fondo atenuado. El sexto y último se abre en la línea 1193
con `@media (prefers-reduced-motion: reduce)` y anula la animación de los
esqueletos y las transiciones de la tarjeta para quien haya pedido menos
movimiento en su sistema.

Dos contratos de diseño de esta parte merecen quedar explícitos para evitar
errores futuros. El primero es que el borde izquierdo de la tarjeta toma su
color de la variable personalizada `--conv-cultura`, calculada en tiempo de
ejecución por el componente a partir de `CULTURAS_COLOR`: no existe una clase
por cultura, sino una variable por instancia. El segundo es que el panel de
filtros usa un fondo con transparencia y un borde redondeado en versión móvil,
y se posiciona como hoja inferior (`bottom: 84px`) para dejar espacio a la
barra lateral inferior del diseño móvil; ese valor está ligado a la altura de
esa barra y no debe cambiarse independientemente.

[PENDIENTE: confirmar con el equipo si la hoja de estilos de esta carpeta
debe separarse en hojas parciales antes de crecer, o si el tamaño actual es
aceptable].

## 2.23 Hallazgos, observaciones y asuntos pendientes

El ejercicio de documentar el archivo del listado ha dejado cinco puntos que
conviene reportar al equipo sin modificar el código fuente.

El primero es el modo de exportación del archivo vecino. El listado importa la
ventana de creación con la forma con nombre, en la línea 12, y usa el
identificador que esa función devuelve para navegar a la conversación recién
creada. El archivo importado, en cambio, se exporta dos veces, con nombre en
su línea 10 y por omisión en su línea 288, y su exportación por omisión no
tiene ningún consumidor en el cliente. Para el listado, la consecuencia es que
depende de un modo de exportación concreto de un archivo que no es el suyo, y
un cambio de esa forma de exportar rompería la navegación sin que ninguna
línea del listado cambiara. [PENDIENTE: confirmar con el equipo si conviene
eliminar uno de los dos modos de exportación o si la duplicidad es
intencional].

El segundo es la duplicidad de `ConversacionCard`. Existe una versión en el
listado y otra distinta en el perfil, ambas con el mismo nombre. No son
intercambiables, porque sus firmas, sus dependencias y el formato de los datos
que esperan difieren. Esa duplicidad invita a confusión y dificulta el
mantenimiento. [PENDIENTE: confirmar con el equipo si conviene extraer
`ConversacionCard` a un módulo compartido o renombrar la versión del perfil
para dejar claro que no es la misma unidad].

El tercero es el aviso silencioso al fallar un "me gusta". En la tarjeta del
listado, el manejador `onLike` devuelve una promesa, pero la tarjeta la ignora
por completo. Si la petición falla, no hay cambio visual ni aviso alguno. En
el mismo listado, `alternarLike` sí informa del fallo mediante el estado de
error del listado, pero la tarjeta no reacciona al fallo de su propia
interacción. [PENDIENTE: confirmar con el equipo si el fallo de un voto debe
mostrar un aviso de Becky o al menos revertir el estado optimista de la
tarjeta].

El cuarto es el comportamiento de la carga de paginación. El efecto del
observador reprograma el observador cada vez que cambia la longitud de la
lista, lo que es correcto, pero el indicador `hayMas` arranca en verdadero
mientras la carga inicial está en curso. Una respuesta con cero resultados
deja ese indicador en verdadero durante un instante entre la petición y la
respuesta, lo cual no produce un error visible pero sí una condición de
carrera teórica en el cálculo de paginación. [PENDIENTE: confirmar con el
equipo si conviene bloquear la reactivación de la observación mientras
`cargando` es verdadero para evitar cualquier petición adicional
innecesaria].

El quinto es el enfoque del panel de filtros. Al abrirse el panel, el efecto
de las líneas 391 a 399 enfoca el primer control con un retardo fijo de
treinta milisegundos. Ese retardo depende del tiempo de pintado y no del ciclo
de dibujado; en terminales lentos podría llegar tarde, y en terminales muy
rápidos podría ser innecesario. Además, el primer control que encuentra es el
primero de los botones de radio de tema, lo que es correcto por el orden del
marcado, pero no está garantizado si el marcado cambia en el futuro.
[PENDIENTE: confirmar con el equipo si conviene sustituir el intervalo fijo
por `requestAnimationFrame` o por una espera basada en el primer cuadro
pintado].

Por último, conviene dejar constancia de lo que **sí** quedó verificado. El
listado consume los catálogos, aplica filtros, respeta la paginación con
deduplicación por secuencia, gestiona el teclado de las pestañas de orden,
construye los chips de filtros y los quita correctamente, y nunca emite
peticiones duplicadas mientras una carga está en curso. Todos los manejadores
declarados tienen al menos un punto de invocación real dentro del propio
archivo, y ninguno de los servicios consumidos devuelve una forma de respuesta
distinta de la que aquí se ha documentado.

---

<!-- CONTINUACIÓN DE LA DOCUMENTACIÓN: capítulo III. El archivo
documentado es el segundo de
     la subcarpeta de conversaciones, aquel que el listado monta como ventana superpuesta
     para crear una conversación. -->

<!-- SALTO DE PÁGINA: el capítulo III inicia en página nueva y su título ocupa una
     página sola (regla de formato 2). -->

# III. La ventana de creación de una conversación

Este capítulo documenta el componente `ConversacionNueva`, el archivo que el
listado monta en la ruta de creación para recoger los datos de una
conversación nueva y devolverlos al listado. Por su naturaleza de ventana
superpuesta, se trata de un archivo distinto del que ocupa el capítulo II, con
su propio conjunto de estados, sus propios efectos y su propio contrato con el
servidor, aunque comparta con el listado el acceso a los catálogos de temas y
de estilos y la hoja de estilos que lo da estilo.

## 3.1 Ubicación del archivo y papel dentro del módulo

El segundo archivo de la subcarpeta es
`cliente/src/Componentes/Conversaciones/ConversacionNueva.jsx`. Exporta dos
veces la misma unidad, una con nombre en la línea 10 y otra
por omisión en la línea
288. Solo la primera se consume: el archivo del listado la
importa por su nombre en
la línea 12. La exportación por omisión no tiene ningún consumidor en el cliente,
lo que se registra en el apartado 3.9.

El componente se presenta como la ventana de creación de una conversación, y el
comentario de las líneas 8 y 9 declara dos decisiones que conviene repetir porque
explican casi toda su estructura: vive en una ruta propia, la
de creación, en vez de
un estado dentro del listado; y se dibuja en un portal sobre el cuerpo del
documento, de manera que la ventana flota por encima del listado y no queda
atrapada en el contexto de apilamiento de la barra lateral ni del contenedor de
disposición.

La decisión de darle una ruta propia tiene una consecuencia que atraviesa todo el
archivo: el componente no controla si está abierto o cerrado. No hay un estado de
visibilidad, no hay una propiedad que lo apague y no hay un botón de salida que lo
descarte. Quien lo monta es el archivo del listado, y ese montaje se produce
únicamente cuando la ruta activa es la de creación. Cerrar, por tanto, significa
navegar de vuelta. Esa es la razón por la que el componente recibe dos
propiedades: una para cerrar y otra para avisar que la creación terminó.

## 3.2 Inventario de unidades documentadas

El archivo expone una sola unidad, el componente `ConversacionNueva`, que
exporta dos veces como se detalla en el apartado 3.1. Antes del componente, el
archivo declara una constante de límite y diecinueve unidades de apoyo: once
estados, dos efectos, dos cálculos derivados y tres manejadores. La constante
`MAX_IMAGENES` y los once estados se describen en el apartado 3.3; los dos
efectos —el que carga los catálogos y el que atiende la tecla de escape— y los
dos cálculos derivados —las subculturas de la cultura elegida y el tema final
que se envía—, en el apartado 3.4; el manejador que abre el selector de
imágenes, en el apartado 3.5; los manejadores que retiran una imagen y que
envían el formulario, en el apartado 3.6; y la construcción del marcado, en el
apartado 3.7. El componente recibe dos propiedades del archivo del listado,
`onCerrar` y `onCreada`, y no declara ninguna otra unidad de apoyo.

## 3.3 La constante `MAX_IMAGENES` y los once estados

La constante `MAX_IMAGENES` se declara en la línea 6 y vale tres. Su propósito es
fijar el número máximo de imágenes que admite una conversación. La usan tres
puntos del archivo: el cálculo de cuántas imágenes quedan por subir, el botón de
subida que se deshabilita al alcanzar el máximo, y el texto de la etiqueta que
explica que las imágenes son opcionales. Nótese que el mismo límite existe en el
servidor, que es quien lo aplica de verdad; el valor del cliente existe para dar
respuesta inmediata y no para sustituir la validación del servidor.

Los once estados del componente se agrupan en cuatro familias. La primera son los
dos del tema: el tema elegido y el texto libre que aparece cuando el tema elegido
es el de otros. La segunda es la del estilo, con la cultura elegida, el subestilo
elegido, y los dos catálogos de temas y culturas que sirven para poblarlos. La
tercera es la del contenido, con el título, el texto y el
arreglo de direcciones de
imagen ya subidas. La cuarta es la de control, con un
indicador de envío en curso y
la alerta visible.

De esos once, ninguno arranca con datos. Seis arrancan con la cadena vacía —el
tema, el texto libre, la cultura, el subestilo, el título y el texto—, tres con el
arreglo vacío —los catálogos de culturas y temas y el arreglo de imágenes—, el
indicador de envío en falso, que es lo que permite que el botón de publicar esté
habilitado al abrir la ventana, y el estado de alerta en nulo, que es la condición
que evita montar el componente de alerta en el primer dibujado.

## 3.4 Los dos efectos y los dos cálculos derivados

El componente declara dos efectos y dos cálculos derivados.

El primer efecto, en las líneas 24 a 35, carga los dos catálogos. Es gemelo del
efecto homónimo del listado descrito en el apartado 2.20.1 y emite las mismas dos
peticiones en paralelo, hacia el catálogo de temas y hacia el
catálogo de culturas.
Se diferencia en dos detalles. El primero es que **no** antepone el valor neutro
*todos* al arreglo de temas: el selector de la ventana ya incluye su propio texto
de invitación inicial, de modo que el valor neutro no hace
falta. El segundo es que
el reemplazo del estado de temas no comprueba que el arreglo recibido tenga
elementos, y por eso su alternativa a un valor ausente es también una lista vacía.
Ambos errores de red se descartan con un cuerpo vacío, igual que en el listado, y
la consecuencia de esa decisión se registra en el apartado 3.9.

El segundo efecto, en las líneas 44 a 50, atiende la tecla de escape. Qué hace es
cerrar la ventana. Cómo lo hace es con un escuchador global de pulsación de tecla
que compara el nombre de la tecla con el valor de escape y, si coincide, invoca la
propiedad de cierre. El escuchador se da de baja en la función de limpieza. Dos
detalles importan. El primero es que el efecto **no**
comprueba que la ventana esté
visible, porque no puede: el componente no existe en el árbol cuando la ruta no es
la de creación. El segundo es que la condición de cierre incluye además una
comprobación del indicador de envío, de manera que la tecla de escape se ignora
mientras hay una creación en curso. Esa es una decisión de protección deliberada:
interrumpir el formulario a mitad de una subida dejaría a la persona con datos
escritos y ninguna explicación.

El primer cálculo, en las líneas 38 a 41, deriva el arreglo de subestilos
disponibles a partir de la cultura elegida. Qué hace es encontrar el objeto de
cultura cuyo identificador coincida con el elegido y devolver su arreglo de
subculturas. Cómo lo hace es con una búsqueda y una alternativa: la búsqueda
compara ambos identificadores **después de convertirlos a cadena**, y la
alternativa devuelve un arreglo vacío cuando no hay
coincidencia o cuando el objeto
encontrado no trae subculturas. La conversión en los dos lados es necesaria por la
misma razón que se explicó en el apartado 2.18. El comentario de la línea 37 es
explícito al señalar que se trata de un valor derivado y no de
una copia de estado,
lo que es la decisión correcta: guardar las subculturas en un estado propio
exigía además un segundo efecto que las mantuviera sincronizadas.

El segundo cálculo, en la línea 52, deriva el tema que realmente se enviará. Qué
hace es decidir entre el tema elegido y el texto libre. Cómo lo hace es con una
comparación contra la cadena literal `Otros`: si el tema elegido coincide con ese
texto, el resultado es el texto libre recortado con el método que elimina los
espacios sobrantes de los extremos; en cualquier otro caso, el resultado es el
propio tema elegido. El recorte es importante, porque el campo
de texto libre impone
un máximo de caracteres en el navegador pero **no** recorta
espacios, de manera que
sin este paso un tema escrito con espacios finales llegaría al servidor con ellos.
Este cálculo se consume en el envío, en la línea 108, y es la única vía por la que
el texto libre podría llegar a la base de datos.

Sin embargo, esa vía está cerrada. El comentario del servidor que declara su lista
de temas afirma que esa lista incluye la opción libre `Otros`, pero la lista
efectiva no lo contiene: son ocho entradas y ninguna es `Otros`. El selector del
cliente construye sus opciones exclusivamente con un texto de invitación vacío y
con las entradas del catálogo recibido, sin añadir ninguna opción propia. En
consecuencia, ninguna opción con el valor `Otros` llega a
existir, la comparación del
cálculo derivado nunca es verdadera y el campo de texto libre nunca se monta. La
consecuencia práctica es que el estado del texto libre, el cálculo derivado y la
comprobación de tema vacío son alcanzables solo a través de las ocho entradas
previstas, y que la función de escritura libre de tema —que el requerimiento
identifica como parte del diseño acordado— no es utilizable en la interfaz actual.
Se reporta como hallazgo en el apartado 3.9.
[PENDIENTE: confirmar con el equipo si la opción de tema libre debe incorporarse
como una novena entrada del catálogo o como una opción fija del selector].

## 3.5 El manejador `abrirWidgetImagenes`

El manejador `abrirWidgetImagenes` se declara en la línea 55 y no recibe ningún
argumento. Su propósito es abrir el selector de archivos para subir imágenes y
registrar las direcciones devueltas por el servicio de almacenamiento de archivos.

Qué hace, en el camino correcto, es abrir el selector y, más adelante, acumular
las imágenes que se suban con éxito. Cómo lo hace es en cuatro fases.

La primera fase son dos guardas de salida temprana. La primera comprueba que el
script del servicio de almacenamiento esté disponible en el objeto global de la
ventana; si no lo está, en lugar de fallar en silencio fija un
mensaje de alerta que
pide recargar la página, y retorna. Esa guarda existe porque el script de ese
servicio se carga desde una red externa y puede no haber llegado cuando el usuario
pulsa el botón. La segunda guarda calcula cuántos huecos quedan restando el máximo
declarado menos la cantidad ya acumulada, y si el resultado no es positivo fija un
mensaje de alerta que anuncia el límite y retorna.

La segunda fase es construir el selector. Se invoca la fábrica del servicio de
almacenamiento con dos argumentos: un objeto de configuración y una función de
respuesta. La configuración lleva nueve propiedades.
La primera y la segunda son el
nombre de la nube y el nombre de la configuración de subida, y ambos se leen del
entorno de compilación del cliente. La tercera declara que el
recurso a subir es de
tipo imagen, que es lo que impide subir un video por este camino. La cuarta admite
que el archivo venga del dispositivo o de una dirección, lo
que abre la posibilidad
de pegar un enlace en lugar de elegir un archivo.
La quinta admite varios archivos a
la vez. La sexta acota el número de archivos al de huecos que
quedaban, de modo que
el límite se impone en el propio selector y no solo después de subir. La séptima
acota los formatos admitidos a cuatro: dos variantes del mismo formato de imagen
comprimido, una con vocal y otra sin ella, y dos formatos más. La octava fija la
carpeta de destino, lo que agrupa las imágenes de este módulo
en una rama propia del
almacenamiento y las separa de las de otros módulos.
La novena fija el idioma de la
interfaz del selector al español.

La tercera fase es la función de respuesta, que recibe un error y un resultado. Si
llega un error, fija un mensaje de alerta con un tono informal que incluye una
emoticona y retorna. Si no hay error pero el evento no es de
éxito, no hace nada: el
servicio de almacenamiento emite muchos más eventos que el de éxito —por ejemplo
el de progreso y los de error ya tratado— y esta función los ignora en silencio.
Cuando el evento sí es de éxito, extrae la dirección segura que
devuelve el servicio
y la añade al arreglo de imágenes mediante una actualización funcional. Esa
actualización tiene tres salidas posibles: si el arreglo ya alcanzó el máximo, lo
devuelve sin cambios; si la dirección ya estaba en el arreglo, también lo devuelve
sin cambios; y solo en el caso contrario devuelve un arreglo
nuevo con la dirección
al final. La segunda de esas tres salidas es la que evita que una imagen repetida
aparezca dos veces en la galería, y la actualización funcional garantiza que
comparar contra el arreglo anterior es seguro incluso si dos
subidas terminan en el
mismo instante.

La cuarta fase es abrir el selector, con una llamada al método
de apertura sobre el
objeto devuelto por la fábrica.

La señal que más merece atención, porque es una defensa en dos capas, es la
comparación de longitud del arreglo de imágenes ya guardadas. El máximo se
comprueba dos veces con dos mecanismos distintos: una vez al
abrir el selector, que
falla si no queda sitio, y otra vez dentro de la actualización del arreglo, que
descarta cualquier dirección que haya llegado mientras tanto. Como esa segunda
comprobación se hace dentro de la actualización funcional, que parte del valor
anterior del estado y no de una copia congelada, el resultado es correcto incluso
si dos imágenes terminan de subir en el mismo instante.

Quién lo invoca es un solo punto: el botón de subir imágenes, en la línea 249. Ese
botón se deshabilita cuando el arreglo de imágenes alcanzó el máximo, de modo que
cuando la tercera guarda interna se activa por el botón, es porque se alcanzó el
límite desde otra vía. Qué recibe: nada. A quién invoca: al script del servicio de
almacenamiento, mediante la fábrica global que ese script publica, y al estado de
imágenes y al de alerta. Qué entrega: nada.

## 3.6 Los manejadores `quitarImagen` y `enviar`

El manejador `quitarImagen` se declara en la línea 94 y recibe
un argumento, `url`,
que es la dirección de la imagen que se desea retirar. Qué hace es quitar esa
dirección del arreglo de imágenes. Cómo lo hace es con una actualización funcional
que filtra el arreglo anterior descartando el elemento igual a la dirección
recibida. La operación es por identidad de cadena y no por posición, de manera que
es indifferentente el orden en que se pinte la galería. Recibe la dirección,
invoca al setter de imágenes, y no entrega nada. Su único invocador es el botón de
eliminación que acompaña a cada miniatura, en la línea 262, que
le pasa la dirección
de esa miniatura concreta.

El manejador `enviar` se declara en la línea 96 y es el único manejador asíncrono
del componente. No recibe argumentos. Su propósito es validar
el formulario, enviar
la conversación al servidor y avisar al listado cuando se creó.

Qué hace tiene tres caminos. El primero es el camino de validación local, que
aborta antes de emitir ninguna petición. El segundo es el camino de éxito. El
tercero es el camino de fallo, que produce un aviso.

Antes de cualquiera de los tres, la función limpia el estado de alerta en la línea
97. Ese paso es lo que hace que un reintento no arrastre el aviso del intento
anterior, y es la razón por la que el mensaje de validación aparece siempre
limpio y no acumulado.

El camino de validación local es una cadena de seis retornos tempranos. Cada uno
comprueba una condición y, si se cumple, fija un mensaje de alerta y retorna el
resultado de esa asignación, que es un valor inútil que existe únicamente para
interrumpir la función. El orden de las comprobaciones no es arbitrario y sigue el
orden de lectura del formulario. La primera comprueba que el tema derivado tenga
valor, y su mensaje pide elegir un tema. La segunda comprueba que se haya elegido
subestilo, y su mensaje pide elegir cultura y subestilo juntos, aunque el
comprobante real sea solo el subestilo: la razón es que el control de subestilo
empieza deshabilitado mientras no haya cultura, de manera que un formulario vacío
llega siempre a esta comprobación con ambos vacíos y el mensaje debe explicar las
dos acciones. La tercera comprueba que el título tenga
contenido tras recortar, y la
cuarta que el texto también. La quinta y la sexta comprueban
las longitudes máximas
de ochenta y quinientos caracteres, y aquí hay un detalle de diseño que conviene
notar: la comprobación de longitud se hace **después** de la de contenido vacío, y
sobre el texto recortado. Como los dos campos de entrada ya
imponen su máximo en el
navegador, esas dos comprobaciones son la red de seguridad para cuando la
validación del navegador no aplica. El recorte previo también evita que un título
de ochenta caracteres rodeado de espacios sea rechazado.

El camino de éxito empieza encendiendo el indicador de envío, y tiene tres pasos.
El primero es emitir la petición, y el objeto que envía tiene
cinco propiedades: el
tema derivado, el subestilo convertido a número, el título recortado, el texto
recortado y el arreglo de direcciones. La conversión del subestilo a número es
necesaria porque el control de selección entrega siempre cadenas y el servidor
compara contra un entero. El segundo paso es comprobar que la respuesta indique
creación correcta: el estado esperado es el de creación, que es distinto del
correcto que se comprueba en el resto del módulo, porque crear un recurso no es
leerlo ni modificarlo. El tercer paso es invocar la propiedad de creación con el
identificador recibido convertido a número, y esa invocación es la que hace que el
listado pueda llevar a la persona directamente a la conversación recién creada.

El camino de fallo tiene dos variantes. La primera es la de una respuesta recibida
pero no exitosa, y ahí se distinguen dos casos por código de estado. Si el código
es el de contenido no procesable, el mensaje se construye con un texto propio que
explica que el contenido no pasó la moderación e incluye la
lista de motivos que el
servidor devolvió, unidos por comas; si esa lista no es un arreglo, se recurre al
mensaje genérico del servidor. En cualquier otro código se muestra directamente el
mensaje de error de la respuesta o, si no lo hay, uno
genérico. La segunda variante
es la de una excepción, y en ese caso se recurre al mensaje de
error de la respuesta
de la excepción o, si tampoco lo hay, al mismo texto genérico.

La construcción del mensaje de moderación merece una observación técnica: ese
mensaje no es una cadena sino un elemento de interfaz, construido con una etiqueta
de envoltura y una interpolación en su interior. El estado de
alerta, por tanto, no
guarda siempre texto, sino a veces un elemento ya construido. Esa capacidad del
componente de alerta de recibir contenido enriquecido es lo que permite presentar
los motivos de moderación como una enumeración legible en lugar de una cadena con
comas pegadas. La consecuencia es que el estado de alerta
mezcla dos tipos de dato,
lo que se reporta en el apartado 3.9.

Ambos caminos terminan en un bloque común que apaga el
indicador de envío, y esa es
la razón por la que el botón de publicar vuelve a quedar habilitado después de un
fallo y la persona puede reintentar sin recargar la ventana.

Quién lo invoca es el botón de publicar, en la línea 273, que a su vez es
deshabilitado mientras el indicador de envío está encendido y cuyo texto cambia a
una forma de progreso mientras tanto. A quién invoca son tres
cosas: al servidor de
creación de conversaciones, al estado de alerta, y a la
propiedad de creación que le
entregó el listado. Qué recibe: nada.

## 3.7 Construcción del marcado y las tres vías de cierre

El componente entrega, mediante una llamada de portal, el contenido completo de la
ventana dirigido al cuerpo del documento. La ventana se declara con el papel de
diálogo, con la marca de modal y con una etiqueta accesible que anuncia su
propósito.

Su contenido se organiza en siete bloques. El primero es el botón de cierre, que
ocupa la esquina superior y lleva un icono vectorial de aspa, decorativo, y una
etiqueta accesible que nombra la acción. El segundo es el título de la ventana. El
tercero es el campo del tema, que es un selector con un texto
de invitación inicial
y, debajo, un campo de texto libre que solo se monta cuando el tema elegido
coincide con la cadena `Otros`. El cuarto son los dos selectores de estilo,
dispuestos en dos columnas: el de cultura, que al cambiar vacía el subestilo
elegido, y el de subestilo, que se deshabilita mientras no haya cultura y cuyas
opciones se derivan del cálculo del apartado 3.4. El quinto son los dos campos
de contenido largo, el título y el texto, cada uno con su
contador de caracteres ya
escritos sobre el máximo. El sexto es el bloque de imágenes,
con el botón de subida,
la fila de miniaturas que solo se pinta cuando hay al menos una
imagen y el botón de
eliminar de cada miniatura. El séptimo y último es el botón de
publicar. Por encima
de esos siete bloques, y como hermano de la ventana y no dentro
de ella, se monta el
componente de alerta de la asistente cuando hay un aviso. Esa posición es
deliberada: al ser hermano y no hijo, el aviso queda por encima de la ventana sin
depender del desplazamiento interno de esta.

Las imágenes de las miniaturas se insertan con un texto
alternativo vacío, porque en
ese contexto son decorativas y la información que aportan ya
está en el resto de la
ventana. El botón de eliminar, en cambio, sí lleva etiqueta
accesible, y su glifo es
una aspa tipográfica y no el icono vectorial del botón de
cierre. La coexistencia de
ambos criterios dentro de una misma ventana es una inconsistencia menor que se
registra en el apartado 3.9.

El documento deja además dos observaciones que merecen registrarse porque no
coinciden con lo que la interfaz sugiere.

La primera es que el fondo de la ventana **no** tiene manejador de pulsación. Es
decir, no se cierra al pulsar fuera del formulario. Las tres vías de cierre son el
botón de la aspa, la tecla de escape —salvo que haya una creación en curso— y la
navegación de vuelta que decide el listado cuando la ruta deja de ser la de
creación. Un fondo que se cerrara al pulsarse habría exigido además decidir si esa
pulsación debe ignorarse cuando el evento ocurre dentro del formulario.

La segunda observación es la asimetría entre las dos vías de cierre disponibles
durante un envío. La tecla de escape está condicionada por el indicador de envío y
se ignora mientras haya una creación en curso, pero el botón de la aspa no lo
está: su manejador es una referencia directa a la propiedad de cierre y no
comprueba nada. En consecuencia, la protección que el código
declara para el teclado
no tiene equivalente en el puntero, y quien quisiera abandonar a medias una subida
consigue cerrarla con el ratón. La incoherencia es pequeña
pero real, y la decisión
sobre cuál de los dos comportamientos es el correcto corresponde al equipo.
[PENDIENTE: confirmar con el equipo si la protección de la tecla de escape durante
un envío debe replicarse en el botón de la aspa, o si la protección debe
retirarse de la tecla de escape].

La tecla de escape tiene además una interacción no prevista con el componente de
alerta. Ese componente, que es la unidad `AlertaBecky` de la
subcarpeta de elementos
pequeños y que el capítulo I no documenta por no pertenecer al módulo que aquí se
estudia, declara en sus líneas 15 a 22 un efecto que registra un escuchador global
de la misma tecla para poder cerrarse. El resultado es que,
con una alerta visible,
la tecla de escape cierra **las dos cosas**: la alerta y la ventana entera. No hay
ninguna condición que coordine ambos escuchadores, y como los
dos se dan de baja de
forma independiente, ninguno de los dos sabe que el otro
existe. La consecuencia es
que la alerta ni siquiera cumple su función de proteger el
formulario, porque quien
quiso cerrarla únicamente termina cerrando la ventana. Se reporta en el apartado
2.23.

El contraste con el fondo es instructivo y merece anotarse,
porque `AlertaBecky` sí
resuelve el cierre por pulsación fuera. En sus líneas 29 a 31, el fondo lleva un
manejador de pulsación que compara el objetivo de la pulsación
con el propio fondo y
solo entonces cierra. Esa comparación es la que impide que un
clic dentro del texto
de la alerta la cierre. El fondo de `ConversacionNueva` no
tiene equivalente, lo que
explica por qué las dos unidades se comportan de forma
distinta ante el mismo gesto
y por qué la divergencia del cierre por clic del apartado anterior no es una
omisión aislada sino una decisión que se tomó en un componente y no en el otro.
[PENDIENTE: confirmar con el equipo cuál de los dos comportamientos es el
deseado para las ventanas de este módulo].

## 3.8 La hoja de estilos de la ventana de creación

La ventana de creación no declara hoja de estilos propia. Toma todas sus
clases de `cliente/src/estilos/ConversacionesEstilos/conversaciones.css`, la
misma que da estilo al listado, y este capítulo se ocupa aquí únicamente de la
parte de esa hoja que le corresponde. La hoja completa se reparte entre dos
apartados: el 2.22 documenta la parte que da estilo al listado y este 3.8 la
que da estilo a la ventana, de modo que aquí no se repite su alcance ni su
relación con las variables globales del tema.

Las clases de la ventana se agrupan en cuatro bloques contiguos, entre las
líneas 885 y 1105. El primero es el fondo y el marco: `.conv-nueva-overlay`,
que cubre la pantalla y fija su opacidad, y `.conv-nueva`, que es el panel que
se centra sobre él. El segundo es el encabezado, con el botón de cierre
`.conv-nueva-cerrar`, su icono vectorial y su estado de foco visible, más el
título `.conv-nueva-titulo`. El tercero agrupa los controles del formulario:
el contenedor de campo `.conv-nueva-campo` y su etiqueta, la etiqueta sin
texto `.conv-nueva-label-solo`, los selectores `.conv-select` con su variante
ancha `.conv-select--ancho` y sus estados de foco y deshabilitado, los campos
de texto `.conv-nueva-input` y `.conv-nueva-textarea`, el contador de
caracteres `.conv-nueva-contador` y la rejilla de dos columnas
`.conv-nueva-doble` que empareja la cultura con el subestilo. El cuarto agrupa
la subida de imágenes y la acción final: el botón `.conv-nueva-subir` con sus
estados de paso y deshabilitado, la tira de miniaturas
(`.conv-nueva-miniaturas`, `.conv-nueva-miniatura` y su aspa
`.conv-nueva-miniatura-x`) y el botón de publicar con su variante ancha
(`.conv-crear-btn--ancho` y su estado deshabilitado).

El botón de publicar tiene una particularidad que conviene no pasar por alto:
no tiene estilo propio en ese tramo de la hoja, sino que reutiliza la clase
`.conv-crear-btn`, que está definida en las líneas 24 a 42, dentro del primer
bloque de la hoja y por tanto del ámbito del listado. Esa reutilización es lo
que vincula visualmente la creación con el resto del módulo, pero también
significa que cualquier cambio en esas reglas afecta a los dos puntos de
entrada: el botón de la barra de herramientas del listado y el botón de la
ventana.

De las seis reglas responsivas de la hoja, solo dos mencionan a la ventana,
y las dos están en el bloque que se abre en la línea 1114 con
`@media (max-width: 768px)`. La primera, en la línea 1129, declara
`.conv-crear-btn { flex: 1 1 auto }`, con lo que el botón de publicar ocupa
el ancho disponible en pantallas estrechas. La segunda, en la línea 1150,
declara `.conv-nueva-doble { grid-template-columns: 1fr }`, con lo que la
rejilla que empareja la cultura con el subestilo se apila en una sola
columna. Ninguna otra regla responsiva de la hoja modifica la ventana, de
modo que sus dimensiones en móvil dependen únicamente de esas dos
declaraciones y de las anchuras máximas del panel.

## 3.9 Hallazgos, observaciones y asuntos pendientes

El ejercicio de documentar el archivo de la ventana de creación ha dejado ocho
puntos que conviene reportar al equipo sin modificar el código fuente.

El primero es el doble modo de exportación del propio archivo.
`ConversacionNueva` se exporta con nombre en la línea 10 y por omisión en la
línea 288, y solo la primera tiene un consumidor, como se registra en el
apartado 2.23. Se trata de un residuo de organización del código que no afecta
al funcionamiento, pero sí dificulta la trazabilidad de los módulos.
[PENDIENTE: confirmar con el equipo si conviene eliminar uno de los dos modos
de exportación o si la duplicidad es intencional].

El segundo es la opción libre de tema. El comentario de las líneas 14 a 16 de
`servidor/Routes/routes-conversaciones.js` declara que el campo guarda el tema
elegido, incluida la opción libre `Otros`, pero el arreglo que ese archivo
declara en su línea 17 no la contiene. El selector del cliente construye sus
opciones únicamente con el texto de invitación y con las entradas del catálogo
recibido, de modo que nunca existe una opción con el valor `Otros`. La
consecuencia es que el campo de texto libre, el cálculo `temaFinal` y toda la
rama de validación que lo ampara nunca llegan a montarse, aunque están
escritos en el componente. [PENDIENTE: confirmar con el equipo si la opción
de tema libre debe añadirse al catálogo o convertirse en una opción fija del
selector del cliente].

El tercero es el tipo de dato que almacena el estado `alerta`. En la mayoría
de los casos se guarda una cadena de texto. En el caso del rechazo por
moderación, en las líneas 120 a 123, el código está escrito para guardar un
elemento de interfaz con un elemento interno y una interpolación, de modo que
el estado está declarado para mezclar dos tipos de dato. El componente
`AlertaBecky` acepta cualquier contenido válido para su hijo, de modo que la
mezcla no rompería nada, pero hace más difícil razonar sobre el estado y no es
coherente con el resto del módulo. [PENDIENTE: confirmar con el equipo si
conviene normalizar el aviso de moderación a cadena de texto o formalizar que
el estado de alerta acepta contenido enriquecido].

El cuarto es una rama que nunca se ejecuta, y es la razón por la que el
hallazgo anterior no llega a verse en la interfaz. El manejador `enviar`
comprueba la respuesta dentro del bloque de éxito, con una condición que
pregunta por el código `422`, pero el cliente de peticiones compartido declara
que solo acepta como respuesta válida la que tiene un código menor que
cuatrocientos. Una respuesta de moderación rechazada, que el servidor emite
con ese código, lanza entonces la promesa rechazada y entra por el bloque de
captura, que solo lee el texto de `error`. El resultado es que la enumeración
de motivos que el archivo construye en las líneas 120 a 123 no llega nunca a
la pantalla, y la persona usuaria ve un texto suelto en lugar del detalle de
lo que la moderación detectó. [PENDIENTE: confirmar con el equipo si conviene
mover la construcción de la alerta al bloque de captura para que los motivos
de la moderación vuelvan a llegar a la persona usuaria].

El quinto es la coordinación de la tecla de escape entre la ventana y la
alerta. `AlertaBecky` registra su propio escuchador global para esa tecla, y
la ventana registra el suyo. Cuando la alerta está visible, la pulsación de
escape los cierra a ambos, porque no hay ninguna coordinación entre ellos y
cada uno se da de baja de forma independiente. El efecto práctico es que la
alerta no protege la ventana: quien intenta cerrarla termina cerrando la
ventana entera. [PENDIENTE: confirmar con el equipo si conviene que la alerta
capture y trate la tecla de escape antes de propagarla, o si conviene que la
ventana desactive su escuchador mientras la alerta esté visible].

El sexto es la asimetría de protección durante un envío. La tecla de escape
ignora la pulsación mientras `enviando` es verdadero, pero el botón de cierre
de la aspa no comprueba ese indicador y sigue llamando a `onCerrar`. En
consecuencia, el teclado protege la subida en curso y el puntero no lo hace.
[PENDIENTE: confirmar con el equipo si debe replicarse la protección en el
botón de la aspa o si debe retirarse la protección de la tecla de escape].

El séptimo es el cierre por pulsación fuera de la ventana. `AlertaBecky`
compara el objetivo de la pulsación con el fondo para cerrar solo cuando se
pulsa fuera de su contenido. La ventana no tiene ese manejador en su fondo, de
modo que solo se cierra con el botón de la aspa, con la tecla de escape o con
la navegación. [PENDIENTE: confirmar con el equipo si la imposibilidad de
cerrar pulsando fuera de la ventana de creación es deliberada, o si es una
omisión que conviene corregir].

El octavo es la carga de catálogos. El efecto de las líneas 24 a 35 pide en
paralelo los catálogos de temas y de culturas, pero, a diferencia del efecto
del listado, no antepone el valor neutro `Todos` al arreglo de temas y, en
caso de error, deja el arreglo vacío sin ningún aviso al usuario. Dado que el
selector exige elegir un tema, una respuesta vacía deja la ventana inusable
sin explicación. [PENDIENTE: confirmar con el equipo si conviene mostrar una
alerta cuando algún catálogo no carga, para que la persona pueda reintentar].

Por último, conviene dejar constancia de lo que **sí** quedó verificado. La
ventana valida en el cliente, delega la moderación al servidor, abre el
selector de almacenamiento con sus límites y formatos, acumula hasta tres
imágenes sin duplicados, y avisa al listado para que navegue a la conversación
recién creada. Todos los manejadores declarados tienen al menos un punto de
invocación real dentro del propio archivo, y ninguno de los servicios
consumidos devuelve una forma de respuesta distinta de la que aquí se ha
documentado, salvo en el camino de error de la moderación que se describe en
el cuarto hallazgo.

---

<!-- CONTINUACIÓN DE LA DOCUMENTACIÓN: capítulo IV. El archivo documentado está en
     otra subcarpeta de componentes y corresponde al proceso de publicación de una
     creación de contenido nueva. -->

<!-- SALTO DE PÁGINA: el capítulo IV inicia en página nueva y su título ocupa una
     página sola (regla de formato 2). -->

# IV. La publicación de una nueva creación de contenido

## 4.1 Ubicación del módulo y papel dentro del sistema

Este capítulo documenta el formulario de publicación de contenido del sitio,
declarado en el archivo `cliente/src/Componentes/Crear/Crear.jsx`, que tiene
setecientas cincuenta y dos líneas. El módulo es el único punto de entrada del
proceso de creación: a partir de él nacen los videos de maquillaje y los
tutoriales que después consulta el feed descrito en el capítulo II y que
detallan el catálogo de culturas y subestilos, el de valores de filtros y el

El componente se monta en una sola ruta. La línea 13 de
`cliente/src/main.jsx` lo importa con la forma `import { Crear }`, y la
línea 37 lo registra en la ruta `/crear`. Esa ruta cuelga del elemento
`<Route element={<AppLayout />}>` que el mismo archivo abre en la línea 31,
de modo que el formulario **sí** se muestra dentro del armazón con barra
lateral, a diferencia de la página de detalle de una publicación, que se
registra fuera de ese armazón en la línea 28.

Quién enlaza hacia el formulario, es decir, qué punto del cliente navega a
`/crear` para que el enrutador monte el componente, se rastreó en todo el
repositorio. La búsqueda de la cadena `Crear` fuera del propio archivo de origen
devuelve un solo punto de entrada real: el elemento `NAV_ITEMS` de
`cliente/src/Componentes/elementos_pequeños/BarraLateral.jsx`, donde el ítem de
navegación con clave `crear` es el que la barra lateral resuelve como título y
como enlace. La segunda coincidencia es la declaración de la ruta en
`cliente/src/main.jsx`, y la tercera es una hoja de estilos que nombra el módulo
como referencia visual. En conclusión, el formulario se alcanza desde la barra
lateral y desde ningún otro lugar del cliente.

Quién invoca a su vez al formulario, es decir, qué componente o función lo llama
como si fuera una función, no ocurre: `Crear` no se importa en ningún otro
archivo del cliente, y por eso no expone manejadores que otro módulo pueda
invocar. Lo que sí hace el componente es invocar a su vez al servicio de
navegación cuando la publicación termina con éxito, con la ruta
`/video/{identificador}`, para trasladar a la persona autora a la página de su
propia publicación recién creada.

El componente consume dos contextos. El primero es el contexto de autenticación,
del que toma el valor `isAuthenticated` mediante el gancho `useAuth`, y que le
sirve tanto para decidir si muestra el formulario como para decidir si pide las
características físicas del usuario. El segundo es el contexto de ventanas de
autenticación, del que toma el manejador `openModal` mediante el gancho
`useAuthModal`, y cuyo funcionamiento se describe en el apartado 1.11 por
tratarse del mismo guard de sesión. Ambos contextos se documentan en el
capítulo I cuando el detalle de una conversación los invoca, de manera que aquí
solo se registra su uso particular: abrir la ventana de inicio de sesión cuando
la persona visitante no tiene sesión.

El archivo importa además el componente `Notificaciones` y el componente
`AlertaBecky`, ambos de `cliente/src/Componentes/elementos_pequeños`, y los monta
con `createPortal` sobre `document.body`. El primero se usa para los avisos de
éxito y el segundo para los avisos de error y para el rechazo de la moderación.
Su funcionamiento interno no se reexpone aquí porque ya está descrito en los
apartados 1.6 y 1.13 del capítulo I; lo que este capítulo documenta es el modo
en que el formulario los invoca.

## 4.2 Inventario de unidades documentadas

El archivo expone una unidad exportada con nombre, el componente `Crear`, y una
segunda unidad exportada por omisión en la línea 752 que ningún archivo consume,
como se registra en el apartado 4.21. Antes del componente, el archivo declara
once constantes de módulo y tres unidades auxiliares.

Las once constantes, en el orden en que aparecen, son `TITULO_TOAST` en la línea
11, `CLAVES_RASGOS` en la 14, `ETIQUETAS_RASGOS` en la 16, `MAPA_FILTROS` en la
26, `TIPOS_TUTORIAL` en la 35, `PASOS_MENU` en la 37, `ETIQUETA_PASO` en la 48,
`RANGOS_EDAD` en la 53, `PROPORCIONES` en la 54, `MAX_IMAGENES` en la 55 y
`MAX_ETIQUETAS` en la 56. Estas once declaraciones se agrupan en el apartado 4.3
y en el 4.4. Las tres unidades auxiliares son la función `rangoDesdeEdad`, que se
declara en las líneas 58 a 65; el subcomponente `Cheveron`, que se declara en las
líneas 67 a 73; y el subcomponente `CajaSubida`, que se declara en las líneas 75
a 88. Las tres tienen su propio apartado en el 4.5 y en el 4.6.

Sobre esas catorce unidades se apoya la capa de trabajo del componente principal,
que se compone de una referencia, un valor derivado memorizado, dos manejadores
memorizados, trece manejadores que se recrean en cada renderizado y dos valores
derivados que se calculan en línea. La referencia es `notificationsRef`, que se
declara en la línea 94. El valor derivado memorizado es `subculturas`, que se
declara en la línea 122. Los dos manejadores memorizados con `useCallback` son
`avisar`, en la línea 127, y `opcionesRasgo`, en la línea 172. Los trece
manejadores que se recrean en cada renderizado son `limpiarRasgos`,
`alternarMisCaracteristicas`, `abrirWidgetVideo`, `abrirWidgetImagenes`,
`quitarImagen`, `agregarEtiqueta`, `quitarEtiqueta`, `agregarPaso`,
`actualizarPaso`, `quitarPaso`, `pasosPayload`, `validar` y `publicar`. Los dos
valores derivados en línea son `esModoVideo` y `opcionesEdad`.

El componente declara además un solo efecto, el de carga inicial de catálogos, que
se documenta en el apartado 4.10, y veintitrés estados, que se agrupan en el
apartado 4.8. El contrato con los cuatro servicios del servidor que el módulo
consume se documenta en el apartado 4.18, la construcción del marcado en el
apartado 4.19, la hoja de estilos en el 4.20 y las observaciones del archivo en
el 4.21.

## 4.3 La constante `TITULO_TOAST`

La constante `TITULO_TOAST` se declara en la línea 11 y vale la cadena
`'Becky te ha mandado un mensaje'`. Su propósito es dar el título común a todos
los avisos que el formulario lanza a través del componente `Notificaciones`. La
variable no se usa en el marcado: solo aparece dentro del manejador `avisar`, que
la interpola en la propiedad `title` de cada aviso.

Lo que hace es fijar una sola cadena para todo el módulo. Lo que hace internamente
es nada: es una asignación de valor literal, sin cómputo ni conversión. La
invocan un solo punto, el manejador `avisar` de la línea 127, que es el único
lugar del archivo que construye avisos de éxito. A su vez, ese manejador
invoca al componente `Notificaciones` a través de la referencia
`notificationsRef`, y no invoca ningún otro servicio. No recibe nada, porque es
una constante, y no entrega nada más allá del texto que almacena.

La cadena coincide con la que ya usan los componentes de conversaciones y con la
que usa la tarjeta de consentimiento de cookies, según se documenta en el
apartado 1.6. Esa coincidencia deliberada es lo que hace que toda la interfaz
hable con la misma voz: el sitio no se presenta a sí mismo con un nombre de
marca en los avisos, sino con el nombre de la fiera que los redacta.

## 4.4 Las constantes de catálogos y de límites

El archivo declara un bloque de constantes que sirven para tres cosas distintas:
traducir claves del servidor a textos visibles, declarar listas de valores que el
servidor acepta, y fijar límites de cantidad. Se documentan aquí por bloques,
porque ninguna de ellas se invoca por separado: todas leen su valor desde el
propio cuerpo del componente o desde los manejadores que se describen más
adelante.

El primer bloque son las tres constantes que relacionan las claves de las
características físicas con lo que el servidor expone. `CLAVES_RASGOS`, declarada
en la línea 14, es un arreglo de seis cadenas —`forma_ojos`, `tipo_nariz`,
`tipo_labios`, `tipo_rostro`, `color_piel` y `tipo_piel`— que declara el orden
de los seis rasgos y que coincide con el orden de las columnas de la tabla de
características físicas. `ETIQUETAS_RASGOS`, declarada en las líneas 16 a 23, es
un objeto que traduce cada una de esas claves a su texto visible: *Forma de
ojos*, *Forma de la nariz*, *Forma de labios*, *Forma de la cara*, *Color de
piel* y *Tipo de piel*. `MAPA_FILTROS`, declarada en las líneas 26 a 33, es otro
objeto que traduce cada clave de rasgo al nombre del arreglo que devuelve el
servidor en el endpoint de filtros: `ojos`, `narices`, `labios`, `rostros`,
`coloresPiel` y `tiposPiel`. Las tres constantes tienen el mismo conjunto de
claves y por eso se declaran juntas y se recorren juntas en el marcado, en el
apartado 4.19, y en el manejador `opcionesRasgo`, en el apartado 4.11.

El segundo bloque son las tres constantes que declaran catálogos de valores
aceptados. `TIPOS_TUTORIAL`, en la línea 35, es un arreglo de seis cadenas:
`Tutorial`, `Delineados`, `Sombras`, `Lip Combo`, `Base` y `Video Maquillajes`.
`PASOS_MENU`, en las líneas 37 a 46, es un arreglo de ocho objetos, cada uno con
las propiedades `tipo` y `etiqueta`, que corresponde a los ocho tipos de paso que
admite el servidor: preparación, base, contorno, corrector, sombras, delineado,
cejas y *lip combo*. `ETIQUETA_PASO`, en las líneas 48 a 51, es un objeto que se
construye a partir del arreglo anterior con una reducción, de modo que asocia
cada clave `tipo` con su texto; ese objeto es el que permite pintar el título de
un paso ya agregado. `RANGOS_EDAD`, en la línea 53, declara los cuatro rangos
que el servidor acepta —`13-17`, `18-24`, `25-30` y `31+`— y `PROPORCIONES`, en
la línea 54, declara las seis proporciones de encuadre que también acepta el
servidor: `1:1`, `4:5`, `3:4`, `2:3`, `5:4` y `9:16`.

El tercer bloque son las dos constantes de límite. `MAX_IMAGENES`, en la línea 55,
vale cinco y fija cuántas imágenes puede tener la galería de una publicación.
`MAX_ETIQUETAS`, en la línea 56, vale veinte y fija cuántas etiquetas puede
aceptar una publicación. Ambas constantes se consultan en varios puntos del
componente: el límite de imágenes, en el manejador `abrirWidgetImagenes` del
apartado 4.12, en el manejador `validar` del apartado 4.16 y en los contadores
del marcado; el límite de etiquetas, en el manejador `agregarEtiqueta` del
apartado 4.14 y en el campo de captura del marcado.

Lo que entregan estas constantes es un contrato local que debe coincidir con el
contrato del servidor, y esa coincidencia no es automática: la tabla de
características físicas, los tipos de paso, los rangos de edad, las proporciones,
el número máximo de imágenes y el de etiquetas están repetidos en el servidor, y
cada duplicación es un punto en el que ambos lados pueden divergir. El límite de
caracteres por etiqueta es el caso más claro de esa duplicación, porque no
existe constante alguna que lo contenga en ninguno de los dos lados, como se
reporta en el apartado 4.21.

## 4.5 La función auxiliar `rangoDesdeEdad`

La función `rangoDesdeEdad` se declara en las líneas 58 a 65 y es la única
función auxiliar del archivo que realiza un cálculo. Recibe un argumento, `edad`,
que puede llegar como número o como cadena porque el servidor lo entrega así. Su
propósito es convertir la edad exacta que el usuario registró en el rango de edad
que el servidor usa como criterio de recomendación.

Lo que hace es devolver una de las cuatro cadenas de `RANGOS_EDAD`. Lo que hace
internamente es declarar una variable `n`, que es el resultado de `Number(edad)`,
y luego recorrer una cadena de condiciones: si el valor no es un número
apropiado —cuando `Number.isFinite` devuelve falso, lo que ocurre si la edad
llegó vacía, nula o como texto no numérico— devuelve el rango por omisión
`'18-24'`; si el número es menor o igual que diecisiete devuelve `'13-17'`; si es
menor o igual que veinticuatro devuelve `'18-24'`; si es menor o igual que treinta
devuelve `'25-30'`; y en cualquier otro caso devuelve `'31+'`. La primera
condición resuelve los tres casos en los que la edad no es utilizable, de modo
que la función nunca devuelve una cadena vacía.

Quién la invoca son dos puntos, ambos del propio componente y ninguno de otro
archivo. El primero es el efecto de carga inicial, en su línea 160, que la aplica
a la edad que el servidor devuelve junto con las características del usuario
para precargar el selector de rango de edad. El segundo es el manejador
`alternarMisCaracteristicas`, en su línea 193, que la vuelve a aplicar cuando la
persona vuelve a encender el interruptor de características personales. No
invoca a ningún otro servicio, no recibe nada más allá de su argumento y entrega
una sola cadena.

La función no se exporta y no se importa en ninguna parte del cliente, de modo
que su comportamiento solo puede observarse a través de los dos puntos de
invocación indicados. Su valor de retorno se usa directamente como valor del
selector de rango de edad, sin conversiones intermedias, y por eso su salida debe
coincidir exactamente con las cuatro cadenas de `RANGOS_EDAD`: cualquier texto
adicional, como un espacio o una mayúscula, sería rechazado por el servidor con
un error de rango inválido.

## 4.6 Los subcomponentes `Cheveron` y `CajaSubida`

El archivo declara dos subcomponentes sin estado que existen únicamente para
evitar repetir marcado. Se documentan juntos porque cumplen la misma función
decorativa y porque los dos son privados del archivo.

`Cheveron` se declara en las líneas 67 a 73 y dibuja el galón que aparece a la
derecha de cada selector y en la cabecera del acordeón de pasos. No recibe
propiedades, no usa estado y no invoca ningún servicio. Lo que entrega es un
elemento de imagen vectorial con la clase `crear-select-chevron`, dibujado con
una polilínea de tres puntos y con el trazo en `currentColor`, de manera que
hereda el color del texto del control que lo contiene. Es invocado en siete
puntos del marcado: los dos selectores de cultura y subestilo, el selector de
tipo, los seis selectores de rasgos, los selectores de rango de edad y
proporción y la cabecera del acordeón. Su apariencia, incluido el giro que
produce el atributo `aria-expanded` de esa cabecera, se describe en el apartado
4.20.

`CajaSubida` se declara en las líneas 75 a 88 y dibuja el marco de cada bloque
del riel de multimedia. Recibe cuatro propiedades: `titulo`, que es el texto del
encabezado; `ayuda`, que es el texto de ayuda opcional; `requerido`, que es un
valor booleano que decide si se imprime un asterisco de campo obligatorio; y
`children`, que es el contenido que se coloca dentro de la caja. Lo que hace es
componer la marca exterior del bloque, con la clase `crear-caja`, su encabezado
con las clases `crear-caja-cabecera`, `crear-caja-titulo` y `crear-caja-ayuda`, y
después el contenido recibido. Lo que hace internamente es condicionar el
asterisco con `requerido &&` y el texto de ayuda con `ayuda &&`, de modo que
ambas propiedades opcionales desaparecen de la marca cuando no se pasan.

Quién lo invoca son dos puntos, y ambos están en la rama derecha del marcado: la
caja del video en la línea 686 y la caja de imágenes en la línea 700. En el
primer caso se le pasa `titulo` con el texto de subida de video, `ayuda` con un
texto que cambia según el modo —*Obligatorio · MP4* cuando la publicación es un
video y *Opcional · MP4* cuando es un tutorial—, y `requerido` con el valor del
mismo modo. En el segundo caso se le pasa un texto fijo, una ayuda que incluye el
número máximo de imágenes y los formatos aceptados, y `requerido` con el valor
inverso del modo. La contradicción aparente entre los dos usos —el video es
obligatorio en un flujo y opcional en el otro, y las imágenes obligatorias en
el otro— es deliberada: el componente invierte la marca según el flujo activo.

## 4.7 La referencia de notificaciones y el manejador `avisar`

El componente declara una referencia en la línea 94, `notificationsRef`, que se
inicializa con `null` y que existe para poder hablar con el componente
`Notificaciones` que se monta más adelante en el marcado. Esa referencia es la
única vía por la que el componente lanza avisos de éxito, porque el componente
de notificaciones expone su API por una referencia y no por propiedades.

Sobre esa referencia trabaja el manejador `avisar`, que se declara en las líneas
127 a 134 y está memorizado con `useCallback` sin dependencias, lo que garantiza
que su identidad no cambie entre renderizados. Recibe dos argumentos: `message`,
que es el texto del aviso, y `type`, que es el tipo de aviso y que vale
`'success'` por omisión. Su propósito es encapsular la forma en que este módulo
registra un aviso, de modo que ningún manejador tenga que conocer la forma del
objeto que espera la referencia.

Lo que hace es invocar el método `addNotification` del componente de
notificaciones, usando el operador de existencia sobre la referencia —la forma
`notificationsRef.current?.addNotification(...)`—, y le entrega un objeto con
cuatro propiedades: `title`, que toma su valor de la constante `TITULO_TOAST`;
`message`, que es el texto recibido; `type`, que es el tipo recibido; y
`showGif`, que se fija en falso para que el aviso no lleve la imagen animada que
sí llevan los avisos de la interfaz general. La existencia del operador `?.`
significa que si el componente todavía no se ha montado la llamada se descarta en
silencio, sin lanzar error.

Quién lo invoca es un solo punto: el manejador `publicar`, en su línea 348, que
lo llama con el texto de éxito cuando el servidor confirma la publicación. No hay
ningún otro punto de invocación en el repositorio. A quién invoca es al
componente `Notificaciones` a través de la referencia. Lo que recibe son los dos
argumentos ya descritos.

## 4.8 Los veintitrés estados del componente

El componente declara veintitrés estados con `useState`, repartidos en las
líneas 96 a 120. Se agrupan aquí por la función que cumplen dentro del
formulario, porque cada estado se documenta con detalle en el apartado del
manejador que lo escribe.

El primer grupo son los cinco estados que governan el modo y la clasificación de
la publicación: `modo`, que vale `'video'` o `'tutorial'` y decide cuál de los
dos flujos se muestra; `tipoTutorial`, que guarda la categoría concreta cuando
el modo es tutorial; `culturaId`; `subculturaId`; y `descripcion`. El segundo
grupo son los cuatro estados del contenido multimedia: `urlVideo`, `imagenes`,
`etiquetas` y `etiquetaDraft`, que es el texto que el usuario está escribiendo
en el campo de etiquetas antes de confirmarla. El tercero son los tres estados
de los rasgos físicos: `usarMisCaracteristicas`, que es el valor del interruptor;
`misCaracteristicas`, que guarda el objeto que devuelve el servidor y que puede
ser `null`; y `rasgos`, que es un objeto de seis claves que el usuario está
eligiendo. El cuarto grupo son los dos estados de edad y encuadre:
`rangoEdad`, cuyo valor inicial `'18-24'` coincide con el rango por omisión del
servidor, y `proporcion`, cuyo valor inicial `'4:5'` coincide con la proporción
por omisión del servidor.

El quinto grupo son los cuatro estados de los datos que llegan del servidor:
`culturas`, que empieza como arreglo vacío; `filtros`, que empieza en `null` y
que solo se llena si el endpoint de filtros responde; y, junto a ellos, los dos
estados de la biblioteca de pasos: `pasosAbiertos`, que decide si el acordeón
está desplegado, e `incluirPasos`, que decide si los pasos entran en la
publicación. El sexto grupo son los tres estados de edición de pasos:
`descripcionGeneral`, que es la introducción opcional del tutorial; `pasos`, que
es el arreglo de pasos agregados; y `menuPasoAbierto`, que decide si el menú de
tipos de paso está desplegado. El último grupo son los dos estados de
interacción: `enviando`, que deshabilita el botón de publicar mientras la
petición viaja, y `alerta`, que guarda el contenido del aviso de error o el
descarte de la moderación, y que vale `null` cuando no hay aviso.

Dos observaciones de diseño se siguen de esa agrupación. La primera es que los
estados de datos del servidor y los de edición conviven sin una marca que los
separe, de modo que un cambio de sesión —por ejemplo, un cierre de sesión— no
vacía `culturas` ni `filtros`. La segunda es que `rasgos` se declara como objeto
con las seis claves ya presentes y vacías, lo que evita tener que distinguir el
caso de un rasgo ausente del caso de un rasgo vacío, aunque tiene el efecto
secundario de que `validar` puede detectar los huecos con una sola comprobación,
como se explica en el apartado 4.16.

## 4.9 Los valores derivados `subculturas`, `esModoVideo` y `opcionesEdad`

El componente calcula tres valores a partir de los estados. `subculturas` se
declara en las líneas 122 a 125 y es el único de los tres que usa `useMemo`, con
las dependencias `culturas` y `culturaId`. Su propósito es resolver la lista de
subestilos que pertenece a la cultura elegida, porque el servidor devuelve la
jerarquía anidada en un solo objeto y el formulario necesita solo el nivel
seleccionado.

Lo que hace es buscar dentro del arreglo `culturas` el elemento cuyo identificador
coincide con el valor de `culturaId`, comparando ambos como cadena para tolerar
que uno llegue como número y el otro como texto. Si lo encuentra, devuelve la
propiedad `subculturas` de ese elemento; si no lo encuentra, devuelve un arreglo
vacío. La comparación por cadena es necesaria porque el valor del selector es
siempre una cadena mientras que el identificador que llega del servidor es un
número. Al devolver un arreglo vacío cuando no hay cultura elegida, el selector
de subestilo queda sin opciones y además deshabilitado, como se ve en el
apartado 4.19.

`esModoVideo` se calcula en la línea 388, después de la salida temprana por falta
de sesión, y vale `true` cuando `modo` es `'video'`. Es un alias de una
comparación que el marcado y los manejadores consultan muchas veces, y su
propósito es evitar repetir la comparación literal en el marcado. No está
memorizado, lo cual es correcto porque su cálculo es trivial y no depende de
ninguna función auxiliar.

`opcionesEdad` se calcula en la línea 389 y es el más elaborado de los tres. Su
propósito es ofrecer en el selector de rango de edad no solo los cuatro rangos
que declara la constante local, sino también cualquier rango que ya exista en las
publicaciones guardadas, porque el servidor toma ese arreglo de la tabla de
videos y no de una lista fija. Lo que hace internamente es comprobar si el
objeto de filtros ya llegó y si su propiedad `edades` tiene elementos; si no es
así, devuelve directamente la constante `RANGOS_EDAD`. Si sí lo es, concatena la
constante con los valores que llegaron, elimina duplicados con un conjunto y
devuelve el resultado. El detalle de que la constante local se coloque primero
significa que el orden del selector empieza por los cuatro rangos conocidos, y
que cualquier rango adicional aparece al final, aunque el servidor los entregue
en otro orden.

## 4.10 El efecto de carga inicial

El componente declara un solo efecto, en las líneas 138 a 170. Es el efecto que
prepara el formulario antes de que la persona pueda interactuar con él, y su
propósito es traer del servidor los tres conjuntos de datos que el formulario no
puede inventar: las culturas con sus subestilos, los valores canónicos de los
seis rasgos físicos y, si hay sesión, las características físicas de la persona
que está publicando.

Lo que hace el efecto es declarar una variable `activo`, inicializada en
verdadero, y llamar a una función interna `cargar` que es asíncrona. La función
construye un arreglo de peticiones: primero la del catálogo de culturas, luego la
de los filtros, y solo si `isAuthenticated` es verdadero agrega la de las
características del perfil. Espera las tres en paralelo con `Promise.all`, y
después, si la bandera `activo` sigue en verdadero, vuelca cada respuesta en su
estado: el arreglo de culturas, el objeto de filtros y el objeto de
características. Si ese último objeto existe, desarma sus seis rasgos sobre el
estado `rasgos` y calcula el rango de edad con la función `rangoDesdeEdad`. Al
final de la función, devuelve una función de limpieza que pone `activo` en falso,
de modo que si el componente se desmonta antes de que terminen las peticiones, las
respuestas que lleguen después se descarten.

El mecanismo de la bandera es lo que evita el error clásico de este patrón: como
las tres peticiones viajan juntas y la de características solo existe con
sesión, las respuestas no siempre están en el mismo orden, y el código no las
lee por posición sino que comprueba la existencia de la tercera antes de
desarmarla. El bloque de captura, en las líneas 163 a 166, se limita a registrar
el error en la consola y a no hacer nada más: si el catálogo de culturas no llega,
el formulario se muestra con los selectores vacíos y sin mensaje alguno para la
persona usuaria, lo que se reporta como observación en el apartado 4.21.

Quién lo invoca es el propio componente, porque los efectos los invoca el motor
de React al montar y cada vez que cambia una dependencia. La dependencia
declarada es `isAuthenticated`, de modo que el efecto se ejecuta una vez al
montar y se vuelve a ejecutar si la sesión aparece o desaparece mientras el
formulario está abierto. Lo que entrega son tres estados ya poblados. No recibe
nada.

El efecto llama a los tres servicios del servidor que se describen en el apartado
4.18, y es el único punto del archivo que consume el servicio de características
propias, porque ese dato solo se necesita para precargar el formulario.

## 4.11 Los manejadores `opcionesRasgo`, `limpiarRasgos` y `alternarMisCaracteristicas`

El componente agrupa aquí tres funciones que gobiernan los seis selectores de
rasgos físicos, porque las tres se invocan desde el mismo bloque del marcado, el
de características físicas objetivo, y porque comparten el mismo objeto de estado
`rasgos`.

`opcionesRasgo` se declara en las líneas 172 a 175 y está memorizado con
`useCallback` con `filtros` como dependencia. Recibe un argumento, `clave`, que es
el nombre de uno de los seis rasgos, y entrega el arreglo de valores que el
servidor ofrece para ese rasgo. Lo que hace internamente es comprobar si el objeto
de filtros llegó —si vale `null`, devuelve un arreglo vacío— y, si llegó,
consultar el objeto `MAPA_FILTROS` con esa clave para obtener el nombre del
arreglo correspondiente y devolver ese arreglo o, si el nombre no existiera, un
arreglo vacío. La traducción de nombres es la razón de ser de la función: el
cliente llama a los rasgos por el nombre de la columna y el servidor los entrega
bajo un nombre de arreglo abreviado.

`limpiarRasgos` se declara en las líneas 177 a 179 y no está memorizado. No
recibe argumentos y no devuelve nada. Lo que hace es reponer el estado `rasgos` a
un objeto con las mismas seis claves y todas vacías. Existe para poder repetir
esa misma operación en un solo lugar, porque el objeto con las seis claves vacías
aparece también en la declaración del estado y en el manejador
`alternarMisCaracteristicas`.

`alternarMisCaracteristicas` se declara en lasLines 181 a 197 y no está
memorizado. Es el manejador del interruptor de la línea 503. Lo que hace es
calcular el valor contrario del interruptor, guardarlo, y reaccionar a él: si el
interruptor acaba de encenderse y el servidor entregó características propias,
vuelca los seis rasgos sobre el estado y recalcula el rango de edad; si el
interruptor acaba de apagarse, llama a `limpiarRasgos`. La variable local
`siguiente` existe para que las dos ramas lean el mismo valor nuevo y no el
anterior, que es el mismo cuidado que el documento registra en el capítulo I para
el manejador de voto del detalle de una publicación.

Quién invoca a los tres es el bloque de características del marcado, en las líneas
498 a 530: el interruptor invoca a `alternarMisCaracteristicas` en su manejador de
clic, y los seis selectores invocan a `opcionesRasgo` al construirse sus
opciones. `limpiarRasgos` no lo invoca el marcado: lo invoca internamente
`alternarMisCaracteristicas`, en su línea 195. Ninguno de los tres llama a
servicios del servidor, y ninguno entrega un valor al marcado.

## 4.12 Los manejadores `abrirWidgetVideo` y `abrirWidgetImagenes`

El formulario no sube archivos por sí mismo: delega la subida en el cargador que
el proveedor de almacenamiento de medios expone como variable global
`window.cloudinary`. Los dos manejadores de este apartado son los dos únicos
puntos del archivo que hablan con ese cargador.

`abrirWidgetVideo` se declara en las líneas 200 a 229 y es el manejador del botón
de área de arrastre del video. No recibe argumentos y no devuelve nada. Lo que
hace es comprobar que el cargador global exista; si no existe, escribe un aviso
de error y termina. Si existe, crea una instancia de cargador con diez
propiedades: el nombre de la nube y el conjunto de carga, que se leen del entorno
de compilación del cliente; el tipo de recurso, que es `'video'`; los orígenes
permitidos, que son el archivo local y una dirección de red; la indicación de que
no se admiten varios archivos y el máximo de un archivo; los formatos aceptados,
que se reducen a `mp4`; la carpeta de destino, que es `bunyk/videos`; el idioma
de la interfaz, que es el español; y el texto de los botones en español. Al
crear la instancia, le entrega una función de retorno que se ejecuta en cada
evento del cargador: si el evento trae error, escribe el aviso de formato; si el
evento es de éxito, guarda en el estado la dirección segura del archivo.

`abrirWidgetImagenes` se declara en las líneas 231 a 268 y tiene la misma forma,
con cuatro diferencias. La primera es que antes de crear la instancia calcula una
variable `restantes`, que es la resta entre `MAX_IMAGENES` y la cantidad de
imágenes ya cargadas, y si esa resta no es positiva escribe un aviso y termina.
La segunda es que la instancia se crea con tipo de recurso `'image'`, con varios
archivos permitidos y con el máximo restante como tope, y con los formatos
`jpg`, `jpeg`, `png` y `webp`, y con la carpeta `bunyk/galeria`. La tercera es que
su función de retorno, en lugar de reemplazar un valor, agrega a un arreglo, y
dentro de ese agregado descarta el archivo si ya se alcanzó el máximo o si su
dirección ya estaba en la lista. La cuarta es que guarda un objeto con dos
propiedades —la dirección y el nombre original del archivo—, porque el nombre se
usa después como texto alternativo de la miniatura.

Quién invoca a los dos es la rama derecha del marcado: el botón de área de
arrastre del video, en su línea 693, y el botón de añadir imágenes, en su línea
701. Ninguno de los dos recibe argumentos ni entrega valores. Los dos invocan al
cargador global, que es código de un tercero declarado en el archivo
`cliente/index.html`, y ninguno llama a un servicio del servidor: el servidor no
recibe archivos, solo direcciones, como se explica en el apartado 4.18.

## 4.13 El manejador `quitarImagen`

El manejador `quitarImagen` se declara en la línea 270 y es la función más corta
del archivo. Recibe un argumento, `url`, que es la dirección de la imagen que se
quiere retirar de la galería, y su propósito es revocar del formulario una imagen
que la persona ya no quiere publicar.

Lo que hace es actualizar el estado `imagenes` con una función que recibe la lista
anterior y devuelve esa misma lista sin el elemento cuya dirección coincide con
el argumento. La actualización es funcional —recibe `prev` y devuelve un arreglo
nuevo—, de modo que dos retirees simultáneos no se pisan entre sí. No invoca
ningún servicio, no devuelve nada y no escribe en ningún otro estado.

Quién lo invoca es el botón de aspa de cada miniatura de la galería, en la línea
710 del marcado, que lo hace con la dirección de esa miniatura como argumento. Es
el único punto de invocación del archivo y, por lo tanto, el único lugar en el
que el componente retira una imagen. Lo que no hace es borrar el archivo en el
almacenamiento de medios: la dirección sigue existiendo en el servicio externo
después de que el usuario la quita del formulario, lo que se reporta en el
apartado 4.21.

## 4.14 Los manejadores `agregarEtiqueta` y `quitarEtiqueta`

Las etiquetas del formulario son texto libre que la persona escribe y confirma.
Los dos manejadores de este apartado implementan esa confirmación y su reversa.

`agregarEtiqueta` se declara en las líneas 273 a 288 y no está memorizado. No
recibe argumentos: lee el texto pendiente del estado `etiquetaDraft`. Su
propósito es convertir ese texto en una etiqueta válida o explicar por qué no se
puede. Lo que hace internamente es recortar el texto y reducir sus espacios
internos a un solo espacio; si queda vacío, termina sin hacer nada. Si el texto
supera los treinta caracteres, escribe un aviso y termina. Si ya hay veinte
etiquetas, escribe otro aviso y termina. Si la lista no contiene ya una etiqueta
que coincida con ese texto sin distinguir mayúsculas, agrega el texto limpio a
la lista. Y en cualquiera de los cuatro caminos, vacía el campo de texto, lo que
hace que el texto que superó el límite también se pierda, un comportamiento que
se señala en el apartado 4.21.

`quitarEtiqueta` se declara en la línea 290 y no está memorizado. Recibe un
argumento, `valor`, que es el texto exacto de la etiqueta que se retira, y
actualiza el estado `etiquetas` con una función que devuelve la lista sin ese
elemento. Su propósito es el inverso del anterior: quitar del conjunto lo que la
persona ya no quiere etiquetar.

Quién los invoca es el bloque de etiquetas del marcado, en las líneas 569 a 598.
`agregarEtiqueta` se invoca desde dos puntos del mismo campo: el manejador de
tecla, que la llama cuando la tecla es Intro o cuando es la coma e impide el
comportamiento por omisión del navegador, el manejador de pérdida de foco, que la
llama sin condición para que la etiqueta se confirme sola al salir del campo.
Las dos invocaciones comparten esa forma. `quitarEtiqueta` se
invoca desde el botón
de aspa de cada etiqueta ya confirmada. Ninguno de los dos manejadores llama a
un servicio del servidor.

## 4.15 Los manejadores de pasos y el cálculo `pasosPayload`

El acordeón de pasos del formulario tiene cuatro funciones: tres manejadores que
modifican el arreglo de pasos y un cálculo que lo traduce al formato que espera
el servidor.

`agregarPaso` se declara en las líneas 293 a 297 y recibe un argumento, `tipo`,
que es una de las ocho claves que declara `PASOS_MENU`. Lo que hace es agregar al
final del arreglo `pasos` un objeto con dos propiedades, el tipo recibido y un
contenido vacío; después cierra el menú de tipos y despliega el acordeón. Las dos
acciones posteriores existen porque agregar un paso desde un menú que se
despliega hacia abajo dejaría ese menú abierto encima del paso recién creado, y
porque el usuario necesita ver la lista para poder llenar el paso que acaba de
agregar.

`actualizarPaso` se declara en las líneas 299 a 301 y recibe dos argumentos, el
índice del paso y el nuevo contenido. Lo que hace es recorrer el arreglo
construyendo uno nuevo en el que el elemento de ese índice queda copiado con el
contenido cambiado y todos los demás se copian sin modificar. Esa copia por
índice es lo que permite editar un paso sin tocar el resto.

`quitarPaso` se declara en la línea 303 y recibe el índice del paso que se
retira. Lo que hace es construir un arreglo nuevo sin el elemento de ese índice,
de modo que los índices de los pasos posteriores se recalculan solos.

`pasosPayload` se declara en las líneas 305 a 314 y no es un manejador sino un
cálculo que se invoca en el momento de publicar. No recibe argumentos: lee el
estado `descripcionGeneral` y el arreglo `pasos`. Su propósito es descartar los
pasos vacíos y añadir la descripción general como un paso más. Lo que hace
internamente es crear un arreglo de resultado, recortar la descripción general y,
si no quedó vacía, agregar al resultado un objeto de tipo
`'descripcion_general'` con ese texto; después recorre los pasos, y por cada uno
recorta su contenido y lo agrega al resultado únicamente si no quedó vacío. El
resultado es un arreglo que puede tener cero, uno o tantos elementos como pasos
tenga el usuario, más la descripción general cuando existe.

Quién los invoca es el bloque del acordeón, en las líneas 601 a 681: `agregarPaso`
desde cada botón del menú de tipos, en su línea 670; `actualizarPaso` desde el
área de texto de cada paso, en su línea 651; `quitarPaso` desde la aspa de cada
paso, en su línea 644; y `pasosPayload` desde el manejador `publicar`, en su
línea 344. Los tres primeros invocadores son del marcado y el cuarto es el
mismo manejador que envía la publicación.

## 4.16 El manejador `validar`

El manejador `validar` se declara en las líneas 316 a 324 y es la primera barrera
del proceso de publicación: decide si la publicación puede enviarse o si hay que
explicarle a la persona usuaria qué falta. No recibe argumentos, no escribe en
ningún estado y no llama a ningún servicio.

Lo que hace es recorrer una serie de condiciones en un orden fijo y devolver la
primera que se cumple. La primera exige que se hayan elegido cultura y
subestilo, y devuelve el texto *Elige una cultura y un subestilo.* La segunda
exige que la descripción no esté vacía una vez recortada, y devuelve *La
descripción es obligatoria.* La tercera y la cuarta dependen del modo: si la
publicación es un video, exige que exista una dirección de video; si es un
tutorial, exige que la galería tenga al menos una imagen. La quinta vuelve a
comprobar el número de imágenes, y la sexta exige que las seis claves del objeto
`rasgos` tengan un valor no vacío, lo que se resuelve con una sola comprobación
porque el objeto se declara con las seis claves presentes. Si ninguna condición
se cumple, devuelve `null`, que es la señal de que todo está en orden.

El orden de las comprobaciones no es arbitrario y conviene dejarlo escrito porque
determina qué mensaje ve la persona. Como el primer caso que se resuelve es el
de la clasificación, una publicación sin cultura elegida nunca llega a mostrar un
aviso sobre la descripción, aunque las dos falten. Y como la comprobación de los
rasgos es la última, un formulario con seis selectores vacíos produce un único
aviso que los cubre a los seis.

Quién lo invoca es el manejador `publicar`, en su línea 327, y solo en ese punto
del repositorio. El valor que devuelve se usa como condición: si es distinto de
`null`, el manejador escribe ese texto como aviso y termina sin enviar nada.

## 4.17 El manejador `publicar`

El manejador `publicar` se declara en las líneas 326 a 365, es asíncrono y es el
único manejador del archivo que invoca un servicio de escritura. No recibe
argumentos: lee el estado completo del formulario y lo traduce al cuerpo de la
petición.

Lo que hace, en orden, es lo siguiente. Primero llama a `validar` y, si el
resultado no es `null`, escribe ese texto como aviso y termina. Segundo, pone el
estado `enviando` en verdadero, lo que deshabilita el botón de publicar. Tercero,
arma un objeto con diez propiedades y lo envía al servicio de creación de
videos. La categoría se calcula con una condición: si el modo es video, la
categoría es siempre `'Video Maquillajes'`; si el modo es tutorial, la categoría
es el valor de `tipoTutorial`. La cultura y el subestilo se convierten a número,
porque el servidor espera identificadores numéricos y el selector entrega
cadenas. La dirección del video se envía como `null` cuando no hay, en lugar de
como cadena vacía. La descripción se envía ya recortada. La galería se envía como
un arreglo de direcciones, sin los nombres. Las etiquetas se envían tal como
están. Los pasos se envían únicamente si el modo es tutorial y si el usuario
encendió el interruptor de incluirlos, y en ese caso se envían como el resultado
del cálculo `pasosPayload`; en cualquier otro caso se envía un arreglo vacío. Y
las características se envían como el objeto de seis rasgos.

Cuarto, al recibir la respuesta, el manejador comprueba que el cuerpo indique
éxito. Si lo indica, avisa con el mensaje de éxito y llama a la navegación con la
ruta de la publicación recién creada, cuyo identificador viene en el mismo cuerpo.
Si no lo indica, escribe en el aviso el mensaje de error que venga del servidor o,
en su defecto, un texto genérico. Quinto, el manejador captura los errores de la
petición y distingue tres casos por el código de estado: si es `422` y el cuerpo
trae un arreglo de motivos, escribe un aviso de moderación con esos motivos; si
es `503`, escribe el mensaje del servidor sobre la moderación no configurada; y
en cualquier otro caso escribe el mensaje del servidor o un texto genérico. Sexto,
en todos los caminos, la rama final vuelve a poner `enviando` en falso.

Quién lo invoca es el botón de publicar, en su línea 721. No invoca a ninguna otra
función del archivo salvo a `validar` y a `pasosPayload`. A quién invoca es al
servidor de creación de videos y, en el camino feliz, a la función de navegación
del enrutador.

## 4.18 El contrato con el servidor: los cuatro servicios que consume el componente

El formulario habla con cuatro servicios del servidor, y todos se piden con el
cliente de peticiones común del cliente, que tiene como base la ruta `/api` y
que envía las cookies de sesión. La sección documenta, para cada uno, qué pide,
qué recibe, quién lo invoca en este componente y qué regla del servidor se está
respetando.

El primer servicio es el catálogo de culturas, que se pide con `GET /culturas` en
la línea 142. Es un servicio público: no exige sesión. El servidor responde con un
objeto que trae el indicador de éxito y un arreglo `culturas`, y cada elemento de
ese arreglo trae identificador, nombre, descripción, referencia de imagen y un
arreglo `subculturas` con los subestilos de esa cultura y los mismos campos. El
componente usa el identificador y el nombre de cada cultura, y del arreglo de
subculturas usa identificador y nombre. El valor derivado `subculturas` del
apartado 4.9 es quien lee ese segundo nivel, y el servidor entrega la jerarquía
anidada en una sola respuesta precisamente para que el cliente no tenga que
pedir un endpoint por cultura.

El segundo servicio es el de valores canónicos de los filtros, que se pide con
`GET /videos/filtros` en la línea 142, también en la misma línea y por tanto en la
misma petición agrupada. Es un servicio público. El servidor responde con un
objeto que trae el indicador de éxito y un arreglo `filtros` con siete
propiedades: `ojos`, `narices`, `labios`, `rostros`, `coloresPiel`, `tiposPiel` y
`edades`. Los seis primeros son los valores distintos que existen en la tabla de
características físicas; el séptimo son los rangos de edad que existen en las
publicaciones guardadas. El componente usa los seis primeros para llenar los
selectores de rasgos, a través del manejador `opcionesRasgo`, y el séptimo para
construir el valor derivado `opcionesEdad`. El comentario del propio servidor
advierte que esta ruta debe seguir registrada antes de la ruta de detalle de una
publicación, porque de lo contrario el identificador de la ruta la capturaría y
respondería con un error de validación.

El tercer servicio es el de características propias, que se pide con
`GET /perfil/caracteristicas` en la línea 143 y solo se pide si hay sesión. Es el
único de los cuatro que exige autenticación. El servidor responde con el
indicador de éxito y un objeto `caracteristicas` que trae los seis rasgos más la
edad, o bien con ese mismo objeto en `null` cuando la persona usuaria todavía no
tiene un conjunto de características registrado. El componente usa ese objeto para
volcar los seis selectores y para calcular el rango de edad inicial.

El cuarto servicio es el de creación de videos, que se pide con `POST /videos` en
la línea 334 y exige autenticación. El cuerpo es el objeto de diez propiedades
que arma el manejador `publicar`. El servidor lo valida en ocho pasos y devuelve
cuatro respuestas distintas. Con código `400` devuelve un objeto con un mensaje
de error, y esos casos son: categoría no válida, cultura o subestilo no
numéricos, subestilo que no pertenece a la cultura elegida, descripción vacía,
descripción de más de dos mil caracteres, rango de edad o proporción no
aceptados, video ausente cuando la categoría no es de tutorial, ausencia de
imágenes cuando la categoría sí es de tutorial, dirección de video que no es una
dirección web, más de cinco imágenes, imagen sin dirección web, etiquetas que no
son una lista, etiqueta de más de treinta caracteres, más de veinte etiquetas,
pasos que no son una lista, pasos enviados en una publicación que no es tutorial,
demasiados pasos, tipo de paso desconocido, paso de más de dos mil caracteres,
características ausentes o rasgo vacío o demasiado largo. Con código `422`
devuelve el mensaje de que el contenido no pasó la moderación y
el arreglo `motivos`
con las razones, que es el único caso en el que el formulario muestra motivos y no
un texto suelto. Con código `503` devuelve el mensaje de que el servicio de
moderación no está configurado. Con código `502` devuelve el mensaje de error del
servicio de moderación, y con `500` un mensaje genérico de error interno.

Que esos códigos lleguen al bloque de captura del manejador no es un detalle
del componente, sino una consecuencia de una decisión que vive en otro
archivo: el cliente de peticiones compartido declara que solo acepta como
respuesta válida la que tiene un código menor que cuatrocientos, de modo que
una respuesta de cuatrocientos o más lanza la promesa rechazada y entra por la
rama de error. Esa relación es también una dependencia: si alguien cambia esa
regla en el cliente compartido, el formulario dejaría de mostrar los motivos
de la moderación y pasaría a mostrar un texto suelto, sin que ninguna línea de
este archivo haya cambiado.

Dos reglas del servidor condicionan el diseño del formulario y conviene
apuntarlas. La primera es que la categoría decide qué se exige: el servidor
considera una publicación como tutorial cualquier categoría distinta de
`'Video Maquillajes'`, y esa definición es la que hace que el cliente necesite
un interruptor propio de pasos, como se documenta en el apartado 4.19. La
segunda es que el servidor guarda el conjunto de características físicas destino
reutilizando la fila existente que coincida con los seis valores, y crea una
nueva si no existe, de manera que las combinaciones que nunca se han publicado
se acumulan en esa tabla sin que el usuario lo note.

## 4.19 La construcción del marcado y el estado sin sesión

El componente construye su marcado en dos ramas. La primera se resuelve antes de
cualquier cálculo de presentación, en las líneas 367 a 386: si la persona no
tiene sesión, el componente no devuelve el formulario sino un bloque reducido que
lleva el título del módulo, una frase que explica que hace falta iniciar sesión
para compartir, y un botón que invoca a la ventana de inicio de sesión. Ese
bloque monta además el contenedor de avisos con un portal, de modo que los avisos
de esa rama tienen dónde aparecer.

La segunda rama es el formulario completo, y se apoya en una rejilla de dos
columnas: la izquierda contiene el formulario y la derecha contiene el riel de
multimedia, que queda fijo al desplazarse. El riel se describe en el apartado 4.6
y su estilo en el 4.20. La columna del formulario se ordena en siete bloques. El
primero es el campo de tipo, que es un solo selector cuyo papel cambia según el
modo: cuando la publicación es un video, el selector muestra dos opciones, *Crear
video* y *Crear Tutorial*, y su manejador solo reacciona cuando el valor elegido
es el segundo; cuando la publicación es un tutorial, el mismo campo muestra las
seis categorías de `TIPOS_TUTORIAL` y debajo aparece un botón que devuelve el
formulario al modo de video. El segundo bloque empareja los dos selectores de
cultura y subestilo, y el de subestilo queda deshabilitado mientras no haya
cultura elegida, con el arreglo de opciones que entrega el valor derivado
`subculturas`. El tercero es el área de texto de la descripción, con un contador
de caracteres que llega hasta dos mil. El cuarto es el bloque de características
físicas, que lleva el interruptor de características personales y los seis
selectores de rasgos, más los dos selectores de rango de edad y proporción. El
quinto es el bloque de etiquetas, que muestra cada etiqueta confirmada como una
pastilla con una aspa, acompaña el campo de captura de un contador y deshabilita
ese campo cuando se alcanza el máximo. El sexto es el acordeón de pasos, que solo
se renderiza cuando la publicación es un tutorial, y que en su interior lleva un
segundo interruptor, el de incluir los pasos, el área de texto de la descripción
general, la lista de pasos agregados y el botón que abre el menú de tipos de paso.
El séptimo bloque es el botón de publicar, que vive en el riel de multimedia.

Dos detalles de construcción merecen quedar escritos. El primero es que el
acordeón de pasos no se monta en absoluto cuando la publicación es un video, de
modo que sus cuatro estados quedan inertes en ese modo; y que, en el modo
opuesto, montar el acordeón no implica enviar pasos: hace falta además encender el
interruptor interior, y esa doble condición es la que evalúa el manejador
`publicar` al armar el cuerpo de la petición. El segundo es que el contenedor de
avisos se monta con un portal en las dos ramas del renderizado, lo que duplica una
línea de marcado que podría vivir una sola vez, como se registra en el apartado
4.21.

## 4.20 La hoja de estilos del módulo

El formulario importa su hoja de estilos en la línea 9 del archivo, que es la
declaración `import '../../estilos/CrearEstilos/crear.css'`. Esa hoja tiene
seiscientas cincuenta y dos líneas y no la comparte con ningún otro módulo: es la
única hoja que este componente necesita y la única que declara. Su alcance es
exclusivo del formulario, aunque consume las variables globales de color y de
tipografía del tema, entre ellas `--color-tarjeta`, `--color-fondo`,
`--color-fondo3`, `--color-acento-fuerte`, `--color-texto-suave`, `--color-acento`
y `--color-h1`, además de la propiedad `safe-area-inset` del sistema.

Los estilos se organizan en catorce bloques. El primero es la página
(`.crear-page`), que fija un ancho máximo de mil ciento ochenta píxeles, centra el
contenido y define su relleno. El segundo es la rejilla (`.crear-grid`), que
reparte el espacio en una columna flexible y una columna fija de trescientos
cuarenta píxeles, con un separación de veintiocho píxeles y alineación al inicio
para que el riel pueda fijarse. El tercero es la columna del formulario
(`.crear-form`), con su encabezado, su título, su subtítulo y los estilos
generales de campo, etiqueta y asterisco de campo obligatorio. El cuarto agrupa
los selectores: el contenedor con el galón (`.crear-select-wrap`), el select, su
variante pequeña, su estado deshabilitado, su estado de foco visible, el propio
galón y el botón de retorno al modo de video. El quinto agrupa las áreas de texto
y los insumos, con sus variantes, su foco visible y el contador de caracteres. El
sexto es el interruptor (`.crear-toggle`, `.crear-toggle-pastilla` y su estado
encendido), que se dibuja como una pastilla con un elemento interior que se
desplaza. El séptimo agrupa los rasgos, con la rejilla de selectores y la fila
adicional de edad y proporción. El octavo agrupa las etiquetas, con el contenedor
de pastillas, la pastilla, su aspa, el campo de captura y su estado de foco.

El noveno es el acordeón de pasos, con su cabecera, su chevron que gira cuando la
cabecera está desplegada, su cuerpo, cada paso con su cabecera y título, y el
grupo de pasos con su botón y su menú desplegable. El décimo es el riel de
multimedia, que se fija con `position: sticky`, la caja de cada bloque con su
cabecera, título y texto de ayuda, el área de arrastre con su signo de más y su
texto, la vista previa del video y su aspa de quitar. El undécimo es la galería de
miniaturas, que se distribuye en dos por tres. El duodécimo es el botón de
publicar, con su estado de reposo, de envío, deshabilitado y de
foco visible, más su
variante en línea que se usa en el estado sin sesión. El decimotercero es el
estado sin sesión, con su bloque centrado y su texto. El último son las reglas
responsivas y de movimiento.

Las reglas responsivas son tres. Con un ancho máximo de mil píxeles la rejilla
pasa a una sola columna y el riel deja de fijarse, de modo que la multimedia pasa
de columna lateral a bloque apilado al final del formulario. Con setecientos
sesenta y ocho píxeles se reducen el relleno de la página y el tamaño del título,
y los campos que iban emparejados, así como la rejilla de rasgos, pasan a una
sola columna. Con cuatrocientos ochenta píxeles la galería de imágenes pasa de
tres columnas a dos. Por último, la consulta de movimiento reducido anula las
transiciones de la pastilla del interruptor, del área de arrastre y del botón de
publicar.

Dos contratos de esta hoja conviene fijarlos. El primero es que el riel se fija
con `top: 24px`, de modo que el margen superior del contenido visible y ese
valor forman un par que no debe cambiarse por separado. El segundo es que la caja
del riel y el acordeón de pasos se pintan con `--color-tarjeta`, que es la misma
superficie blanca que usan las tarjetas de los demás módulos del sitio, mientras
que los controles de formulario —selectores, áreas de texto, campos de captura y
el menú desplegable de pasos— se pintan con el color de fondo del tema; esa
distinción es deliberada y es la que permite que el formulario se lea como un
conjunto de bloques y no como una tabla.

## 4.21 Hallazgos, observaciones y asuntos pendientes

El ejercicio de documentar el archivo de publicación de contenido ha dejado doce
puntos que conviene reportar al equipo sin modificar el código fuente.

El primero es que el límite de treinta caracteres por etiqueta no existe como
constante en ninguno de los dos lados. En el cliente aparece dos veces, escrita
como número en el manejador `agregarEtiqueta`, en su línea 276, y como atributo
`maxLength` del campo de captura, en su línea 584; en el servidor aparece dos
veces más, en la comparación de longitud y en el texto del mensaje de error. Los
cuatro puntos pueden divergir sin que nada lo advierta. El mismo hallazgo incluye
una diferencia de redacción entre los dos mensajes: el del cliente dice *Máximo 20
etiquetas por publicación* y el del servidor dice *Máximo 20 etiquetas por video*,
de modo que el mismo error se anuncia con dos palabras distintas.
[PENDIENTE: confirmar con el equipo si conviene declarar una constante compartida
para el límite de caracteres y unificar el texto de los dos mensajes].

El segundo es que el arreglo de categorías de tutorial incluye
`'Video Maquillajes'`, que es exactamente la categoría que el servidor
reserva para las publicaciones que no son tutoriales, porque su comprobación
de si una publicación es tutorial consiste en preguntar si la categoría es
distinta de ese texto. La consecuencia es que: si una persona elige tutorial
y luego la categoría *Video Maquillajes*, el cliente le exige al menos una
imagen, mientras que el servidor, que ya considera esa publicación un video,
le exigiría un video. Las dos validaciones se contradicen y la persona
usuaria queda con un formulario que no puede satisfacer. [PENDIENTE:
confirmar con el equipo si la categoría *Video Maquillajes* debe quitarse
del arreglo de tutoriales o si el servidor debe decidir el tipo de
publicación por otro campo que no sea la categoría].

El tercero es que el cambio de modo de tutorial a video no limpia los datos de
los pasos. El estado conserva el interruptor de incluirlos, la descripción
general y el arreglo de pasos, y el manejador de publicación simplemente deja de
enviarlos. Si la persona vuelve al modo de tutorial, encuentra el interruptor
encendido y los pasos que había escrito, lo cual puede resultar inesperado, pero
también evita que se pierda trabajo. El comportamiento es defendible en ambos
sentidos y por eso conviene decidirlo de forma explícita.
[PENDIENTE: confirmar con el equipo si al volver al modo de video se deben
vaciar los pasos o si su conservación es la conducta deseada].

El cuarto es que quitar un video o una imagen del formulario solo los saca del
estado: la función de quitar imágenes filtra el arreglo local y la aspa del video
deja la cadena vacía, y en ninguno de los dos casos se invoca ninguna operación
que borre el archivo del almacenamiento de medios. Los archivos que la persona
sube y luego retira se quedan guardados en la carpeta del
servicio externo, y solo se
limpian si el proveedor los depura por su cuenta.
[PENDIENTE: confirmar con el equipo si se debe añadir una eliminación de los
archivos retirados, ya sea desde el cliente o mediante una tarea de limpieza
programada].

El quinto es que la instancia del cargador de archivos se descarta. Las dos
funciones que crean el cargador lo hacen con una llamada cuyo valor de retorno no
se guarda en ninguna variable, de modo que el componente no tiene forma de cerrar
el cargador programáticamente ni de cancelar una subida en curso. Si la persona
navega a otra página mientras el cargador está abierto, el cargador queda
desvinculado del formulario y sus resultados ya no tienen dónde escribirse.
[PENDIENTE: confirmar con el equipo si conviene conservar la instancia para
poder cerrarla al desmontar el componente].

El sexto es que las dos funciones del cargador repiten literalmente las mismas dos
cadenas de texto: la que avisa que el cargador no está listo y la que avisa que el
archivo no tiene el formato solicitado. Las dos aparecen dos veces en el archivo,
sin constante que las una. No es un problema funcional, pero es el tipo de
duplicación que hace que una corrección se aplique a una mitad y se olvide de la
otra.

El séptimo es que el componente solo atiende el evento de éxito del cargador.
Los eventos de progreso, de archivo subido y de cancelación se ignoran, de modo
que no hay ninguna señal de que una imagen grande se está subiendo y tampoco hay
forma de distinguir, para la persona usuaria, entre una subida que falló y una
subida que nunca terminó de empezar.

El octavo es el mismo modo de exportación duplicada que se reporta en los otros
módulos: el componente se exporta con nombre en la línea 90 y por omisión en la
línea 752, y el enrutador lo importa con la forma con nombre, de modo que la
exportación por omisión no tiene consumidor.
[PENDIENTE: confirmar con el equipo si se conserva uno solo de los dos modos de
exportación].

El noveno es que el contenedor de avisos se monta con un portal en las dos ramas
del renderizado: aparece en la línea 382, dentro del estado sin
sesión, y en la línea
747, al final de la rama principal. Como las dos ramas son excluyentes solo se
monta una a la vez, de modo que no hay duplicación real en el árbol de nodos, pero
sí hay una línea duplicada que puede desincronizarse si una de las dos se
modifica.

El décimo es que el interruptor de características personales permanece encendido
aunque la persona no tenga características registradas. El servidor responde con
el objeto en `null` cuando la persona todavía no ha elegido sus rasgos, y en ese
caso el interruptor sigue mostrando el estado encendido, pero los seis selectores
quedan vacíos y el rango de edad conserva su valor inicial. Quien use el
formulario en esas condiciones cree que sus características personales se están
aplicando, cuando en realidad no hay ninguna que aplicar, y la publicación solo
se logra porque la validación del cliente exige los seis rasgos de todos modos.
[PENDIENTE: confirmar con el equipo si el interruptor debe ocultarse o
deshabilitarse cuando el servidor no devuelve características].

El undécimo es que el formulario depende de una convención que vive fuera de
su archivo para distinguir los dos motivos de fallo que el servidor puede
devolver con el mismo código. El formulario los separa por el contenido de la
respuesta: si el cuerpo trae el arreglo `motivos`, construye el aviso que los
enumera; si no, muestra el texto de `error`. Esa distinción no depende del
código, sino del cuerpo de la respuesta, y por eso funciona. Pero tampoco está
aislada del cliente de peticiones compartido que describió el apartado 4.18:
si la regla de códigos aceptados cambiara ahí, las respuestas pasarían a
resolverse y el bloque que enumera los motivos dejaría de ejecutarse, sin que
este archivo haya cambiado.

El duodécimo es que el formulario no es un elemento de formulario del lenguaje: no
hay etiqueta de formulario alrededor de los campos, de modo que la tecla Intro
dentro de un área de texto no publica nada y no hay validación nativa del
navegador. Toda la comprobación depende del manejador `validar`, que se ejecuta
únicamente cuando la persona pulsa el botón de publicar. Tampoco hay confirmación
de salida: si la persona navega a otra página con el formulario lleno, el trabajo
se pierde sin aviso.

Por último conviene dejar constancia de lo que **sí** quedó verificado. El
componente envía al servidor exactamente las diez propiedades que ese endpoint
espera y en el orden de validación que el servidor impone; los cuatro servicios
que consume responden con las claves que el componente lee; los selectores de
rasgo se llenan con los valores que el servidor expone y no con catálogos
locales, de modo que una publicación nunca puede quedar fuera del rango de
valores que el sistema reconoce; y la moderación se invoca desde el servidor
antes de tocar la base de datos, de modo que ninguna publicación rechazada deja
rastro en el sistema.

<!-- SALTO DE PÁGINA: el capítulo V inicia en página nueva y su título ocupa una
     página sola (regla de formato 2). -->

# V. La ventana de alerta con la voz de Becky

## 5.1 Ubicación del módulo y papel dentro del sistema

El archivo documentado en este capítulo está en
`cliente/src/Componentes/elementos_pequeños/AlertaBecky.jsx` y tiene cincuenta y
dos líneas. Es la unidad más pequeña de toda la carpeta de elementos pequeños y,
a la vez, la única que abre una capa superpuesta propia: una ventana modal
centrada en la que el asistente Becky habla en primera persona. Su función es la
de una vía de comunicación obligatoria para el usuario, no la de un aviso
discreto: aparece cuando una acción no puede completarse y desaparece cuando la
persona reconoce que la leyó.

El nombre del archivo proviene del papel que la unidad tiene dentro del proyecto.
En varios módulos del sitio —el formulario de publicación de contenido, la
ventana de creación de una conversación y la hoja de detalle de una
conversación— Becky es la voz que anuncia a la persona usuaria que ha ocurrido
algo que debe corregir. Esa voz se materializa en un componente con el nombre
del asistente y una imagen de su logotipo, de modo que el mismo personaje que
habla en el globo de diálogo del capítulo VII es el que habla aquí, aunque con
un formato muy distinto: el globo es decorativo y breve, la ventana es
modal y exige una respuesta.

El lugar que ocupa la unidad en el árbol de la aplicación es particular. No
depende de ninguna ruta, porque no es una página, y no se registra en el
enrutador del cliente. Se monta desde los módulos que la necesitan, siempre
con una condición de visibilidad delante, y esa es precisamente la razón por la
que el archivo no tiene ningún estado propio: no necesita saber si está visible
porque solo se monta cuando lo está.

El capítulo se ocupa, en el mismo orden en que se recorre el archivo, de las
cuatro propiedades que la función recibe, del efecto que registra el
escuchador de la tecla de escape, de la construcción del marcado que devuelve y
de los tres módulos que lo invocan. El comportamiento de la tecla de escape y
su conflicto con la ventana de creación de conversaciones ya está reportado en
el quinto hallazgo del apartado 3.9 y no se vuelve a explicar aquí; lo que este
capítulo añade es el punto de vista de la propia alerta.

## 5.2 Inventario de unidades documentadas

El archivo expone dos modos de exportación de la misma función, uno con nombre
en la línea 9 y otro por omisión en la línea 52, y no contiene ninguna otra
unidad: no hay constantes, ni funciones auxiliares, ni subcomponentes, ni
estados. Todo el comportamiento vive dentro del cuerpo de una sola función de
cuarenta y dos líneas.

La lista completa de unidades del archivo, con su ubicación exacta, es la
siguiente. La función `AlertaBecky`, declarada en las líneas 9 a 50, es la
unidad central y la única que se documenta de forma completa. El efecto de la
tecla de escape, en las líneas 15 a 22, se documenta en el apartado 5.5 junto
con las otras dos vías de cierre que la unidad ofrece. El marcado que la función
devuelve, en las líneas 24 a 49, se documenta en los apartados 5.4 y 5.6. Las
cuatro propiedades que recibe —`children`, `onCerrar`, `textoBoton` y
`etiquetaCerrar`— se documentan en el apartado 5.3. La exportación por omisión
de la línea 52 se comenta en el apartado 5.9.

Las tres líneas de importación merecen una mención aparte porque explican dos
declaraciones que no se usarían en ninguna otra parte. La línea 1 trae el
efecto `useEffect` y la línea 2 trae `createPortal` de la biblioteca de
renderizado del navegador; la tercera línea importa la hoja de estilos
compartida del proyecto.

## 5.3 La función `AlertaBecky` y sus cuatro propiedades

La función `AlertaBecky` se declara en la línea 9 y recibe un único objeto de
propiedades, que el lenguaje de JavaScript desestructura en la misma línea de
apertura. Las cuatro propiedades que desestructura son `children`, que no tiene
valor por omisión y contiene el contenido que se muestra dentro de la ventana;
`onCerrar`, que tampoco lo tiene y es la función que el módulo anfitrión
proporciona para cerrar la alerta; `textoBoton`, cuyo valor por omisión es la
cadena `Okey :3`; y `etiquetaCerrar`, cuyo valor por omisión es la cadena
`Cerrar alerta`. El valor de la propiedad de contenido es lo que permite que la
misma unidad sirva tanto para un texto suelto como para un contenido con
elementos dentro, que es la diferencia entre los tres módulos que la invocan.

Qué hace la función es mostrar una ventana modal con el contenido recibido y un
botón que la cierra. Lo que entrega es un elemento de interfaz, que es el
resultado de invocar la creación de portal con el marcado y con el destino
`document.body`. A quién invoca es al constructor de portal de la biblioteca de
renderizado del navegador, en su línea 24, y a la función que el módulo
anfitrión le entrega como `onCerrar`. Lo que recibe son las cuatro propiedades
descritas, y nada más: no hay contexto de sesión, ni cliente de peticiones, ni
estados que lean de un contexto superior.

Quién la invoca son tres módulos, todos ellos descritos en capítulos anteriores
de este mismo documento: el formulario de publicación de contenido, en su línea
730; la ventana de creación de una conversación, en su línea 279; y la hoja de
detalle de una conversación, en su línea 580. Los tres la importan con la forma
con nombre y los tres la montan detrás de una condición de visibilidad. Ningún
otro archivo del repositorio la importa, y ninguno la importa por omisión.

Cómo lo hace es un asunto de una sola sentencia. La función no contiene estado,
no calcula nada y no llama a ningún servicio; todo su comportamiento está en el
elemento que devuelve. Por eso puede decirse que su trabajo consiste
enteramente en decidir qué se dibuja y cómo se cierra, y no en obtener,
transformar o enviar información.

## 5.4 El portal al documento y el orden de las capas superpuestas

La primera decisión de la función es no dibujarse en el lugar donde vive el
módulo que la invoca, sino en el cuerpo del documento. Para conseguirlo, la
línea 24 envuelve el marcado en una llamada al constructor de portal, y la línea
48 indica que el destino es `document.body`. El efecto de esa decisión es doble
y conviene explicarlo despacio. Por un lado, la ventana queda por encima de
cualquier ancestro que declare una propiedad de apilamiento, es decir, por
encima de contenedores con `transform`, con `filter` o con su propia propiedad de
profundidad, de modo que nunca queda recortada ni tapada por el módulo que la
invoca. Por otro lado, al vivir en el cuerpo del documento, la ventana sobrevive
a la reorganización del árbol del módulo anfitrión y desaparece solo cuando ese
módulo deja de montarla.

El comentario de las líneas 5 a 8 del propio archivo explica que la unidad se
portaliza precisamente para no quedar atrapada en ningún contexto de
apilamiento, y ese es un problema que ya se había presentado antes en otros
módulos del proyecto. La hoja de estilos compartida conserva dos ejemplos de capas
superpuestas anteriores que son precisamente el resultado de haberse chocado con
ese problema: el fondo de la ventana de acceso, por ejemplo, declara una
profundidad de cien en su línea 539, y el montaje de los avisos dentro de esa
ventana tuvo que portalizarse aparte para poder verse.

La segunda decisión de esta parte es el orden relativo de las capas. La hoja de
estilos asigna a la ventana de alerta una profundidad de ciento veinte, en su
línea 783. Ese valor la coloca por encima de la ventana de acceso, que declara
ciento, y por debajo del contenedor de avisos emergentes, que declara
novecientos noventa y nueve en su línea 54. La consecuencia práctica es
favorable para la alerta, porque tapa el fondo de la ventana que la invoca, y
desfavorable frente a los avisos, porque un aviso que llegue mientras la alerta
está abierta se dibuja por encima de ella.

## 5.5 El efecto de la tecla de escape y las tres vías de cierre

La función registra un efecto en las líneas 15 a 22 cuyo único propósito es
atender la tecla de escape. El cuerpo del efecto empieza con una condición de
salida temprana: si el módulo anfitrión no pasó la propiedad `onCerrar`, el
efecto devuelve `undefined` y no registra nada, de modo que la unidad tolera que
se le monte sin poder cerrar. Cuando sí hay función, el efecto crea una función
de nombre `alTeclear` que recibe el evento, compara la tecla con la cadena
`Escape` y, si coincide, invoca `onCerrar` sin argumentos. El efecto registra esa
función como escuchador de la ventana global en la línea 20 y devuelve la
función que la da de baja en la línea 21, con lo que la limpieza es correcta
aunque el módulo se desmonte. La única dependencia del arreglo es la propia
función de cierre, de modo que el escuchador se vuelve a registrar cada vez que
el módulo anfitrión cambia la función que le entrega.

Las tres vías de cierre que ofrece la unidad son independientes entre sí. La
primera es esa tecla, ya descrita. La segunda es el botón de la ventana, un
elemento de la línea 37 cuyas propiedades de clic y de etiqueta accesible se
toman directamente de las dos propiedades recibidas. La tercera es la pulsación
fuera de la ventana: el manejador de la línea 29 compara el elemento que
recibió la pulsación con el elemento que la maneja y solo invoca el cierre
cuando ambos son el mismo, es decir, cuando la pulsación cayó en el fondo y no
en el contenido. Esa comparación es la que impide que un clic dentro del texto
cierre la ventana. La diferencia entre esta ventana y la ventana de creación
de una conversación, que no cierra pulsando fuera, ya está reportada en el
séptimo hallazgo del apartado 3.9 y no se repite aquí.

Lo que no ofrece la unidad es ninguna de las dos piezas de accesibilidad que
acompañan habitualmente a una ventana modal. No mueve el foco al interior de la
ventana cuando aparece, de modo que el foco permanece donde estaba, es decir, en
el control que la abrió; no atrapa el foco, de modo que la persona puede recorrer
con la tecla de tabulación los controles que quedan por debajo del fondo; y no
devuelve el foco al control que la abrió cuando se cierra. Ese último punto
contrasta con el panel de notificaciones que monta la barra lateral, que sí lo
hace de forma explícita y cuyo comportamiento se documenta en el apartado 6.10.

## 5.6 La construcción del marcado y el avatar

El marcado que devuelve la función tiene una estructura de dos niveles. El
nivel exterior es el fondo, un elemento de la línea 25 que lleva la clase
`alerta-becky-overlay`, declara el papel `dialog` y el atributo
`aria-modal` con el valor verdadero, y es el que lleva el manejador de cierre por
pulsación exterior. El nivel interior es la tarjeta, un elemento de la línea 33
con la clase `alerta-becky`, que se dibuja en el centro del fondo porque la hoja
de estilos lo coloca en una retícula de dos columnas.

Dentro de la tarjeta hay dos partes. La primera es el avatar, un elemento de
imagen en la línea 34 que carga el archivo `logo.svg` desde la carpeta pública
del cliente, lleva el texto alternativo `Becky` y la clase
`alerta-becky-avatar`. Esa imagen es la misma que aparece en el globo de diálogo
del capítulo VII y en la cabecera de los avisos del capítulo VIII, y en los tres
casos se escribe como una cadena de ruta literal, sin llegar a importarla. La
segunda parte es el cuerpo, un elemento de la línea 35 con la clase
`alerta-becky-cuerpo`, que se organiza en columna y contiene a su vez el
contenido recibido y el botón de cierre.

El contenido recibido se dibuja sin transformación dentro de un elemento de la
línea 36 con la clase `alerta-becky-texto`. Esa decisión tiene una consecuencia
que conviene anotar: la ventana no sabe qué tipo de contenido recibe y no lo
envuelve en ninguna etiqueta de párrafo, título ni lista, de modo que quien
invoca la unidad es responsable de que el contenido sea adecuado
semánticamente. Es exactamente lo que hace el formulario de publicación, que
aprovecha esa libertad para
intercalar un elemento con su propia clase entre el texto y cada motivo, y lo
que hacen los otros dos módulos, que entregan una cadena suelta.

El botón de cierre, en las líneas 37 a 44, es un elemento de la clase
`alerta-becky-btn` con el tipo explícito `button`, de modo que no dispara el
envío de ningún formulario por accidente. Su etiqueta accesible se toma de la
propiedad `etiquetaCerrar` y su texto visible se toma de `textoBoton`. Ninguno de
los tres módulos que invocan la unidad pasa ninguna de esas dos propiedades, de
modo que la ventana siempre muestra el mismo texto.

## 5.7 Los tres módulos que invocan la alerta

Los tres módulos que montan la unidad comparten una misma forma de invocación:
condicional, con la función de cierre atada a un estado que se vacía. La forma es
siempre la misma, porque los tres escriben una expresión de la forma que se
describe a continuación, donde el estado de la alerta guarda el contenido y la
función de cierre lo borra con `setAlerta(null)`.

El primero es el formulario de publicación de contenido. Su alerta aparece en las
líneas 729 a 745, y su particularidad es que el estado guarda dos tipos de
contenido distintos. Cuando el aviso es una validación del propio formulario, el
estado guarda una cadena y la ventana la muestra tal cual. Cuando el aviso es un
rechazo de la moderación automática, el estado guarda un objeto del que la
ventana lee una marca de moderación, un arreglo de motivos y un mensaje; en ese
caso el formulario construye el contenido, y lo hace enumerando los motivos con
un elemento de la clase `alerta-becky-motivo` y separándolos con comas, de modo
que la ventana muestra una frase que nombra cada cosa que el análisis detectó.
El comportamiento de ese camino y el motivo por el que no llega a verse se
reportan en el tercer y el cuarto hallazgo del apartado 3.9, y no se repiten aquí.

El segundo es la ventana de creación de una conversación, que monta la alerta en
las líneas 278 a 282. El contenido es el estado directamente, sin construcción
intermedia, y el módulo escribe en ese estado una cadena ya redactada. El tercero
es la hoja de detalle de una conversación, que monta la alerta en su línea 580
con la misma forma, también con una cadena como contenido y con la misma función
de cierre que vacía el estado.

## 5.8 Hoja de estilos relacionada

Los estilos de la unidad viven en la hoja compartida del proyecto, en el archivo
`cliente/src/estilos/estilospequeños/estilospequeños.css`, que el propio
componente importa en su línea 3. El bloque que corresponde a esta unidad
ocupa las líneas 779 a 841 y se identifica en la hoja con el comentario que lo
introduce. La hoja es la misma que sirve a los otros tres componentes de esta
carpeta, de modo que los cuatro capítulos comparten una sola fuente de estilos y
cualquier corrección de color o de espaciado se propaga a los cuatro a la vez.

Las reglas del fondo, en las líneas 780 a 790, lo fijan en todo el espacio
visible, centrando su contenido en ambos ejes, con un relleno de veinte píxeles
para que la tarjeta nunca toque el borde de la pantalla, con un fondo
semiopaco oscuro y con una animación de aparición de ciento sesenta
milisegundos. Las
reglas de la tarjeta, en las líneas 791 a 801, la convierten en una retícula de
dos columnas, fijan su ancho máximo en cuatrocientos cuarenta píxeles, le dan
relleno, borde de un píxel, esquinas redondeadas y sombra.

Las reglas del avatar, en las líneas 802 a 808, lo fijan en cuarenta y cuatro
píxeles de lado, lo convierten en un círculo y le ajustan el recorte de la imagen
para que llene ese círculo. Las reglas del cuerpo, en las líneas 809 a 814, lo
convierten en una columna con separación de dieciséis píxeles entre el contenido
y el botón, y con un ancho mínimo de cero para que el texto largo pueda encogerse
dentro de la tarjeta en lugar de desbordarla. Las reglas del texto, en las
líneas 815 a 820, fijan el tamaño de letra, el interlineado y el color, y añaden
la propiedad que permite cortar una palabra larga en cualquier punto, lo que
evita que un motivo de moderación sin espacios desborde la tarjeta.

El botón de cierre se define en las líneas 825 a 835 con relleno horizontal
amplio y esquinas completamente redondeadas, fondo tomado del color de acento
fuerte y texto blanco; las líneas 836 y 837 añaden el cambio de color al pasar
el puntero y un contorno visible al recibir el foco por teclado. El bloque cierra
con la definición de la animación de aparición en la línea 838 y con una regla
que la desactiva cuando el sistema pide reducir el movimiento, en las líneas 839
a 841. Esa última regla significa que la ventana respeta la preferencia de
movimiento reducido del sistema operativo.

## 5.9 Hallazgos, observaciones y asuntos pendientes

El ejercicio de documentar el archivo de la ventana de alerta ha dejado nueve
puntos que conviene reportar al equipo sin modificar el código fuente.

El primero es el doble modo de exportación. La función se exporta con nombre en
la línea 9 y por omisión en la línea 52, y solo la primera tiene consumidores,
porque los tres módulos que la invocan la importan con la forma con nombre. Se
trata del mismo residuo de organización que ya está reportado en el primer
hallazgo del apartado 3.9 y en el octavo del apartado 4.21. [PENDIENTE:
confirmar con el equipo si conviene eliminar uno de los dos modos de exportación
o si la duplicidad es intencional].

El segundo es que la ventana declara el papel de diálogo y el atributo de
diálogo modal, pero no declara ningún nombre accesible. No hay atributo que
apunte a un título ni hay un título dibujado; el único texto que la ventana
contiene es el que cada módulo entrega. Un lector de pantalla anunciará por tanto
que apareció un diálogo sin decir de qué trata. [PENDIENTE: confirmar con el
equipo si conviene que los módulos entreguen también un título, o que la unidad
lo declare a partir de una propiedad nueva].

El tercero es la ausencia total de gestión del foco. La unidad no mueve el foco
al abrirse, no lo atrapa mientras está abierta y no lo devuelve al control que
la abrió al cerrarse. La consecuencia más visible es la última: cuando la
alerta se cierra, el foco desaparece y la persona que navega con teclado queda
sin saber dónde está, de modo que la siguiente pulsación de tabulación la lleva al
principio de la página en lugar de devolverla al formulario. El panel de
notificaciones sí resuelve ese último punto y el apartado 6.10 da cuenta de cómo.
[PENDIENTE: confirmar con el equipo si conviene añadir el movimiento del foco
al abrir y su devolución al cerrar].

El cuarto es que la tecla de escape se registra en la ventana global. El
escuchador de la línea 20 se añade a `window`, que es el destino más alto de la
jerarquía de eventos, de modo que la pulsación se atiende después de que la hayan
atendido los escuchadores del documento y de los elementos. No hay ninguna
coordinación con el escuchador que registra la ventana de creación de
conversaciones, de modo que una sola pulsación cierra las dos. El conflicto ya
está reportado en el quinto hallazgo del apartado 3.9; lo que este capítulo
añade es que el orden de los escuchadores es también un factor y que ninguno de
los dos lados detiene la propagación. [PENDIENTE: confirmar con el equipo si
conviene que la alerta atienda la tecla antes que la ventana, por ejemplo
registrándola en fase de captura].

El quinto es que dos de las cuatro propiedades nunca se personalizan. La
propiedad `textoBoton` tiene un valor por omisión escrito con una seguida de una
emoticon, y la propiedad `etiquetaCerrar` tiene un valor por omisión en español
correcto, pero ninguno de los tres módulos que invocan la unidad pasa alguna de
las dos. El resultado es que la capacidad de cambiar el texto del botón existe en
la interfaz de la unidad pero no se ejerce en ninguna parte del sitio.
[PENDIENTE: confirmar con el equipo si la ventana debe ofrecer textos distintos
según el motivo del aviso, lo que obligaría a que al menos un módulo pasara esas
propiedades].

El sexto es que la propiedad de cierre es opcional en la práctica pero
obligatoria en el uso. El efecto la trata como opcional, con la condición de
salida de la línea 16, y el manejador del fondo la invoca con el operador de
existencia, en la línea 30; pero el botón de la línea 40 la recibe directamente
como manejador. Si algún módulo montara la unidad sin pasar esa propiedad, la
ventana se dibujaría sin ninguna forma de cerrarse con el botón, porque el
atributo de clic recibiría un valor inexistente. Ninguno de los tres módulos
actuales comete ese error, de modo que el defecto está latente.
[PENDIENTE: confirmar con el equipo si conviene que el botón se deshabilite o se
oculte cuando no hay función de cierre].

El séptimo es que el orden de las capas coloca la alerta por debajo de los
avisos. La ventana declara una profundidad de ciento veinte y el contenedor de
avisos declara novecientos noventa y nueve, de modo que un aviso que aparezca
mientras la alerta está abierta se dibuja encima de ella. La situación es real
en los tres módulos que la invocan, porque los tres montan también el
componente de avisos en el mismo árbol, y en al menos uno de ellos la alerta se
abre precisamente después de que un servicio haya respondido, que es el momento
en el que puede haber un aviso en pantalla. [PENDIENTE: confirmar con el equipo
si la alerta debe situarse por encima del contenedor de avisos o si los avisos
deben inhibirse mientras la alerta esté visible].

El octavo es que los comentarios del archivo y de la hoja de estilos están
atrasados. El comentario de las líneas 5 a 8 dice que la unidad sigue la
maqueta del formulario de creación de contenido, y el comentario que abre el
bloque de estilos, en la línea 779 de la hoja, añade entre paréntesis el mismo
nombre de módulo. De los tres módulos que la invocan, solo uno es ese
formulario; los otros dos pertenecen al foro de conversaciones. El comentario no
afecta al funcionamiento, pero induce a quien lea el archivo a buscar la unidad
en el módulo equivocado. [PENDIENTE: confirmar con el equipo si conviene
actualizar ambos comentarios para que nombren los tres módulos consumidores].

El noveno es la mezcla de tipos en el contenido, que ya está reportada en el
tercer hallazgo del apartado 3.9 por el módulo que la origina. Lo que este
capítulo añade es que la hoja de estilos resuelve bien ese caso: existe una regla
propia para el elemento `alerta-becky-motivo`, en las líneas 821 a 824, con el
color de burbuja y un peso de letra medio, de modo que los motivos de moderación
se distinguen del resto del texto sin que la unidad tenga que saber nada de
ellos. Es el acierto de que el estilo del contenido enriquecido viva en la hoja
compartida y no en el módulo que lo produce.

Por último conviene dejar constancia de lo que **sí** quedó verificado. La
unidad ofrece las tres vías de cierre que ofrece una ventana modal —el botón, la
tecla de escape y la pulsación exterior— y las tres funcionan sin depender del
estado interno. La comparación que decide si la pulsación fue exterior está
escrita correctamente, de modo que un clic dentro del texto no cierra la
ventana. La baja del escuchador de la tecla de escape está escrita en la función
de limpieza del efecto, de modo que no quedan escuchadores huérfanos cuando el
módulo se desmonta. Y la tarjeta respeta la preferencia de movimiento reducido
del sistema, porque la hoja desactiva su animación cuando esa preferencia está
activa.


<!-- SALTO DE PÁGINA: el capítulo VI inicia en página nueva y su título ocupa una
     página sola (regla de formato 2). -->

# VI. La barra de navegación lateral del sitio

## 6.1 Ubicación del módulo y papel dentro del sistema

El archivo documentado en este capítulo está en
`cliente/src/Componentes/elementos_pequeños/BarraLateral.jsx` y tiene trescientas
cinco líneas. Es la unidad que dibuja la barra de navegación del sitio y, al
mismo tiempo, la que hace posible buena parte de la navegación misma, porque sin
ella no habría cambio de página, ni ventana de acceso, ni apertura del panel de
notificaciones. Es, de los cuatro archivos de esta carpeta, el que tiene más
conexiones hacia el exterior.

Su papel dentro del sistema tiene tres dimensiones. La primera es visual, porque
la barra es el marco que acompaña a todas las páginas salvo al visor de un video
aislado y aporta identidad al sitio mediante un logotipo, un color propio y una
firma animada que persigue al botón de la sección activa. La segunda es de
navegación, porque sus seis botones son la vía declarada de cambio de página: los
enlaces del resto de la interfaz se limitan a desplazamientos internos de cada
módulo. La tercera es de integración, porque la barra monta dos piezas que no le
pertenecen, la ventana de acceso y el panel de notificaciones, y además consulta
un servicio para saber cuántas notificaciones hay sin leer.

La barra se dibuja en una sola posición de la aplicación: el armazón que
envuelve todas las rutas salvo el visor de video. Su archivo no declara estados
de ruta propios ni efectos de carga de datos propios; toda su vida está atada al
lugar donde el armazón lo coloca. Ese armazón es un archivo de quince líneas que
importa la barra y el componente de salida del enrutador, escribe el elemento
principal de la página y monta la barra como hermana de ese elemento, de modo que
el contenido de cada ruta queda como hueco anidado dentro del armazón.

Este capítulo recorre el archivo en el orden en que está escrito: primero las
tres tablas que declaran qué hay en la barra, después el diccionario de iconos,
luego los estados y las funciones internas, y por último el marcado que la unidad
devuelve. El capítulo V documenta la ventana de alerta que la barra no monta pero
que comparte con ella la política de capas superpuestas, y el capítulo VIII
documenta el componente de avisos que el sitio usa para informar a la persona.
El panel de notificaciones que la barra monta en su sexta sección no es uno de
los cuatro archivos de este encargo, de modo que aquí se documenta únicamente
la manera en que la barra lo invoca y se deja constancia de lo que falta.

## 6.2 Inventario de unidades documentadas

El archivo contiene diez unidades de código, todas declaradas en el nivel del
módulo o del componente. No hay clases, ni tipos, ni librerías de terceros aparte
de las cuatro utilidades de la biblioteca de renderizado que importa, más el
cliente de peticiones y el diccionario de contextos de autenticación.

La tabla `LABELS`, en las líneas 14 a 21, asocia a cada clave de sección su texto
visible y se documenta en el apartado 6.3 junto con `NAV_ITEMS` y `AUTH_ITEMS`.
El diccionario `ICON_MAP`, en las líneas 37 a 87, se documenta en el apartado
6.4. El componente `BarraLateral`, declarado en las líneas 89 a 303, se
documenta repartido en los apartados 6.5 a 6.13.

Dentro del componente se declaran tres estados y una referencia, en las líneas
94 a 97, que se documentan en el apartado 6.6. La función `indiceDesdeRuta`, en
las líneas 102 a 109, y el valor derivado `enPerfil`, en la línea 116, se
documentan en el apartado 6.5. El manejador `handleKeyDown`, en las líneas 118 a
136, se documenta en el apartado 6.7. El manejador `handleNavClick`, en las
líneas 138 a 141, se documenta en el apartado 6.8. El efecto que carga el conteo
de notificaciones no leídas, en las líneas 144 a 157, se documenta en el
apartado 6.9. El manejador `handleNotificacionesClick`, en las líneas 161 a 174,
y el manejador `cerrarNotificaciones`, en las líneas 176 a 186, se documentan en
el apartado 6.10. El manejador `handleAuthClick`, en las líneas 188 a 190, el
efecto que atiende la tecla de escape de la ventana de acceso, en las líneas 193
a 206, y el manejador `handleOverlayClick`, en las líneas 209 a 211, se
documentan en el apartado 6.12. La exportación por omisión de la línea 305 y las
tres rutas que el enrutador coloca dentro o fuera del armazón se documentan en
los apartados 6.13 y 6.15.

## 6.3 Las tres tablas que declaran el contenido de la barra

Las tres tablas que declaran el contenido de la barra están escritas una detrás
de otra en las primeras treinta y cinco líneas del archivo, y su diseño revela
que la barra se construyó por capas sucesivas.

La primera, `LABELS`, es un objeto de seis entradas, una por sección navegable.
Cada entrada asocia una clave corta a su texto completo: `inicio` a Inicio,
`informacion` a Información, `conversaciones` a Conversaciones, `crear` a Crear,
`wiki` a Wiki y `notificaciones` a Notificaciones. El orden de las claves no
coincide con el orden en que se muestran los botones, lo que indica que el objeto
se fue completando a medida que se añadían secciones. Esta tabla tiene dos
consumidores reales dentro del archivo: el marcado la consulta en la línea 236
para el texto visible de cada botón. No tiene entradas para la sección de perfil
ni para las dos acciones de acceso, porque ninguna de las dos se dibuja como un
botón más del listado.

La segunda, `NAV_ITEMS`, es el arreglo que declara los seis botones de sección.
Cada entrada tiene cuatro propiedades: `key`, que es la clave que la enlaza con
la tabla de textos; `href`, que es la ruta a la que navega; `icon`, que es la
clave de su icono en el diccionario; y `label`, que es el texto que el elemento
declara como nombre accesible. Las cuatro propiedades se escriben en ese orden en
las seis entradas, consecuencia directa de que el arreglo se haya ampliado
copiando la forma de la primera. Las rutas que declara son la raíz del sitio, el
foro, el formulario de creación, la enciclopedia, el panel de notificaciones y la
página de información.

La tercera, `AUTH_ITEMS`, es un arreglo de dos entradas que declara las acciones
de acceso. Cada entrada tiene `key`, `icon`, `label` y `mode`; la propiedad `mode`
es la que se entrega al gestor de la ventana de acceso para que sepa si debe
mostrar el formulario de acceso o el de registro. El texto visible de estas dos
acciones no se consulta en la tabla de textos, sino en la propiedad `label` de
cada entrada, de modo que las secciones y las acciones tienen dos fuentes
distintas para sus textos. Esa asimetría tiene una consecuencia menor pero real:
cambiar el texto de Inicio en `LABELS` lo cambia en un solo sitio, mientras que
cambiar el texto de acceso obliga a editar la entrada del arreglo.

## 6.4 El diccionario `ICON_MAP`

El diccionario `ICON_MAP`, en las líneas 37 a 87, asocia cada clave de icono al
elemento que se dibuja. Hay ocho entradas, seis para las secciones y dos para las
acciones de acceso. Siete de las ocho son elementos de interfaz ya construidos
cuando el archivo se carga, porque están escritos directamente como literales de
marcado; la octava, la del inicio, es una función sin parámetros que devuelve un
elemento de imagen con el logotipo del sitio.

Esa diferencia de forma no es homogénea. La entrada del inicio no puede ser un
elemento literal porque necesita dos atributos de tamaño y una propiedad de
recorte que no están en el resto; las demás no necesitan nada que justifique
envolverlas. La consecuencia es que el marcado tiene que preguntar por la forma
de cada entrada antes de dibujarla, y esa pregunta está escrita dos veces en el
archivo, en las líneas 237 y 272, con la misma forma condicional.

Las siete entradas dibujadas como vector siguen el mismo patrón: un elemento con
atributo `aria-hidden` para que el lector de pantalla no lo anuncie, un sistema
de coordenadas de veinticuatro por veinticuatro, trazo sin relleno con extremos
y uniones redondeados, y entre uno y cuatro elementos de camino o figura.
Ninguno de ellos declara el grosor del trazo; ese valor se fija una sola vez en
la hoja de estilos, en la línea 417, con un punto y medio de píxel, que es la
decisión que permite cambiar el grosor de todos los iconos del sitio desde un
solo lugar. La octava entrada no es un vector sino una imagen, y por eso no
hereda esa regla de trazo sino la de tamaño y recorte declarada en la línea 45.

## 6.5 La derivación del botón activo

La barra necesita saber cuál de sus seis botones corresponde a la página que se
está viendo, y esa información no se le pasa: la deduce. La función
`indiceDesdeRuta`, declarada en las líneas 102 a 109, es la que hace la
deducción, y recibe como único argumento la ruta actual.

Qué hace la función es devolver la posición del botón que corresponde a la ruta.
Lo que entrega es un número entero entre menos uno y cinco. A quién invoca es al
propio componente, que la llama desde tres lugares distintos: el efecto de la
línea 113 y los dos manejadores de las líneas 168 y 179. Lo que recibe es la
cadena de la ruta.

Cómo lo hace es una cadena de dos pasos. El primero es una condición que
comprueba si la ruta es la del perfil propio o empieza por el prefijo del perfil
ajeno; en ese caso la función devuelve el valor menos uno, que no corresponde a
ningún botón. El segundo es una búsqueda de la primera entrada de `NAV_ITEMS`
cuya ruta coincide exactamente con la recibida, o cuya clave es la del inicio y
cuya ruta es la raíz del sitio. Cuando la búsqueda no encuentra nada, la función
devuelve cero, es decir, el botón de inicio.

El valor menos uno tiene un significado que conviene explicar despacio, porque
es la razón por la que el archivo declara un caso que ningún botón representa.
En las páginas de perfil no hay ninguna sección de navegación activa: la persona
está viendo su propia ficha o la de otra persona, no el foro, ni la enciclopedia,
ni el formulario de publicación. En lugar de elegir un botón cualquiera, la
función devuelve un valor centinela que la hoja de estilos reconoce: la regla de
la línea 516 de la hoja compartida deja la mancha animada completamente
transparente, de modo que en el perfil no hay mancha detrás de ningún icono. El
atributo que transporta ese valor desde el componente hasta la hoja de estilos es
`data-active-index`, escrito en la línea 219 del elemento contenedor.

El valor derivado `enPerfil`, en la línea 116, repite la misma comprobación que
la primera línea de la función. Existe porque el marcado necesita la respuesta en
forma de verdadero o falso, y no en forma de posición, para aplicarla a dos
cosas distintas: la clase del botón del avatar y su atributo de página actual.
La duplicación de la condición es pequeña pero real, y se reporta en el
apartado 6.15.

El efecto de las líneas 112 a 114 es quien mantiene el estado al día. Su
dependencia es la ruta, de modo que se ejecuta al montar la barra y cada vez que
cambia la página, y su único efecto es escribir en el estado la posición que la
función dedujo. Como la función devuelve cero para las rutas que no reconoce, la
barra destaca el botón de inicio en páginas que no son la de inicio; ese
comportamiento se reporta en el apartado 6.15.

## 6.6 Los estados del componente y la referencia del contenedor

El componente declara tres estados, en las líneas 94 a 96, y una referencia, en
la línea 97. Los tres estados guardan valores que el marcado consume
directamente, y ninguno de los tres se declara con un valor calculado a partir de
otra cosa.

El primero, `activeIndex`, es el número que la barra usa para saber qué botón
resaltar y hacia dónde va la mancha animada. Se declara con el valor cero, es
decir, con el botón de inicio resaltado desde el primer momento, antes de que
llegue ninguna ruta. Es el único estado de la barra que escriben cuatro fuentes
distintas: el efecto de la ruta, el manejador de teclado, el manejador de
pulsación y los dos manejadores de la campana.

El segundo, `notificacionesAbiertas`, es un valor de verdad que decide si el panel
de notificaciones está montado. Se declara en falso, de modo que el panel no
existe en el árbol hasta que la persona abre la campana; no hay ninguna animación
de apertura porque la montaje y el desmontaje son instantáneos. El tercero,
`noLeidas`, es un contador que se declara en cero y que solo se escribe cuando hay
sesión iniciada, porque es el único estado que depende de un dato que llega de la
red.

La referencia `containerRef` se inicializa con nulo y se enlaza al elemento de la
línea 215, que es el contenedor de la barra. Su único uso es el manejador de
teclado, que la consulta para desplazar el foco al botón que corresponde a la
posición que acaba de calcular. No se usa para medir tamaños, ni para detectar
visibilidad, ni para nada más, de modo que podría ser una referencia local al
alcance de ese manejador.

## 6.7 El recorrido con teclado

El manejador `handleKeyDown`, en las líneas 118 a 136, convierte la barra en un
recorrido con teclado. Recibe el evento y la posición del botón que recibió la
pulsación, y devuelve nada.

Qué hace el manejador es decidir si la tecla pulsada es una de las cuatro que
mueven la selección y, en ese caso, calcular la posición siguiente, actualizar el
estado y llevar el foco al botón correspondiente. Lo que entrega es un cambio de
foco visible en la barra. A quién invoca es a la función de navegación entre
elementos del navegador, en su línea 135, y al escritor del estado de la posición
activa. Lo que recibe son el evento de teclado y un número.

Cómo lo hace empieza con una variable de nombre `newIndex` que recibe la posición
actual, y sigue con cuatro condiciones excluyentes. Con la flecha derecha o la
flecha abajo, la posición nueva es el mínimo entre la posición más uno y la
última de la lista. Con la flecha izquierda o la flecha arriba, es el máximo entre
la posición menos uno y cero. Con la tecla de inicio, es cero. Con la tecla de
fin, es la última posición de la lista. Si la tecla no es ninguna de esas cuatro,
el manejador retorna sin hacer nada. Solo en el camino útil continúa con dos
pasos: impedir el comportamiento por omisión de la tecla, que en el caso de las
flechas evitaría que la página se desplazara, y escribir la posición nueva en el
estado.

El manejador está enlazado en la línea 234 a los seis botones de sección, con lo
que el recorrido con teclado alcanza únicamente esas seis posiciones. Los dos
botones de acceso y el botón del avatar no lo tienen, de modo que el recorrido no
llega a ellos y quien navega solo con teclado debe alcanzarlos con la tecla de
tabulación. Tampoco el recorrido da la vuelta, como se explica en el apartado
6.15, criterio que contrasta con el de los módulos de pestañas del proyecto,
documentado en el apartado 2.17.

Hay una consecuencia de este diseño que conviene anotar porque no es evidente al
leer el código: el manejador escribe el mismo estado que decide el resaltado, y
el resaltado alimenta el atributo de página actual que se escribe en la línea
226. Es decir, moverse con las flechas cambia también lo que la barra declara
como página actual, aunque la ruta no haya cambiado, y desplaza la mancha
animada hacia un botón que no corresponde a la página visible. La barra queda
declarando una página actual que no es la que se está viendo.

## 6.8 El cambio de página por pulsación

El manejador `handleNavClick`, en las líneas 138 a 141, es la parte más corta del
archivo y la que ejecuta el propósito principal de la barra.

Qué hace es escribe en el estado la posición del botón que se pulsó y navegar a
la ruta que ese botón declara. Lo que entrega es un cambio de página. A quién
invoca es al escritor del estado de la posición activa y a la función de
navegación del enrutador, en su línea 140. Lo que recibe son la ruta, que es la
propiedad `href` de la entrada pulsada, y la posición, que es el índice que el
recorrido del listado entrega al manejador de cada botón.

Cómo lo hace son dos instrucciones consecutivas y en ese orden: primero la
escritura del estado y después la navegación. El orden importa poco en la
práctica, porque el efecto de la ruta vuelve a escribir el mismo valor en cuanto
la navegación termina, salvo en el caso de las rutas que la función de deducción
no reconoce, en el cual la escritura del manejador es la que gana.

El manejador está enlazado en la línea 232 solo para las cinco primeras
secciones. La sexta, la de notificaciones, no pasa por aquí: el manejador de
pulsación de la línea 230 bifurca según la clave de la entrada y, cuando esa clave
es la de notificaciones, delega en el manejador de la campana que se documenta en
el apartado 6.10. Esa bifurcación es la razón por la que la ruta que la sexta
entrada declara nunca se navega, como se reporta en el apartado 6.15.

## 6.9 El conteo de notificaciones no leídas

El contador de la campana lo alimenta un efecto declarado en las líneas 144 a 157,
el único punto del archivo que consulta un servicio.

Qué hace el efecto es pedir al servidor cuántas notificaciones tiene sin leer la
persona que ha iniciado sesión y escribir ese número en el estado, o dejarlo en
cero si la petición falla. Lo que entrega es el número que la línea 240 usa para
decidir si hay insignia y qué texto lleva. A quién invoca es al cliente de
peticiones compartido, en su línea 149, y al escritor del estado del contador.
Lo que recibe es la decisión de si hay sesión, que toma del contexto de
autenticación.

Cómo lo hace empieza con una bandera de nombre `activo`, declarada en la línea 145
e inicializada en verdadero, cuyo propósito es impedir que una respuesta tardía
escriba en un componente que ya no existe. La primera instrucción es una
condición de salida temprana: si no hay sesión, el efecto devuelve una función
que solo apaga la bandera y no pide nada, de modo que no hay petición inutile
para las personas que no han entrado. Si hay sesión, la cadena de la petición
escribe el número recibido o cero si el servidor no lo envía, y su rama de error
escribe cero; ambas ramas consultan antes la bandera para no escribir en un
componente desmontado. El efecto devuelve la función que apaga la bandera, con lo
que la limpieza es correcta.

El arreglo de dependencias del efecto tiene dos entradas: si la sesión cambia, y
la ruta actual. La segunda dependencia es la que hace que el contador se vuelva a
pedir en cada cambio de página, aunque el número muy probablemente no haya
cambiado. Ese comportamiento, junto con la lectura que hace el propio panel al
abrirse y la que hace el manejador de cierre que se documenta en el apartado
6.10, concentra tres lecturas del mismo dato en una sola interacción, como se
reporta en el apartado 6.15.

## 6.10 La campana, el panel superpuesto y su cierre

La sexta sección de la barra no navega: abre una pieza que se dibuja fuera del
flujo normal de la página. Las dos funciones que lo hacen están en las líneas 161
a 186.

El manejador `handleNotificacionesClick` recibe la posición de su botón y
funciona como una alternancia: si el panel está abierto lo cierra, y si está
cerrado lo abre. Lo que entrega es el estado nuevo. A quién invoca es a los dos
escritores de estado del componente. Lo que recibe es un número.

Cómo lo hace escribe el estado de apertura mediante una función que recibe el
valor anterior y devuelve el valor contrario. Esa función es el lugar donde se
escribe también el estado de la posición activa, y lo hace en dos ramas: cuando
el panel se cierra, escribe la posición que la función de deducción devuelve
para la ruta actual, de modo que la mancha regrese al botón que corresponde a la
página; cuando el panel se abre, escribe la posición de la campana, de modo que
la mancha se quede detrás del icono mientras el panel está abierto. Escribir un
estado dentro de la función que actualiza otro estado es un patrón que la
biblioteca de renderizado no garantiza y que se reporta en el apartado 6.15.

El manejador `cerrarNotificaciones` es la función que la barra entrega al panel
como su vía de cierre. Qué hace es cerrar el panel, devolver la mancha al botón de
la ruta y, si hay sesión, volver a pedir el contador. Lo que entrega es nada: el
panel se encarga de cerrar por su cuenta y llama a esta función para que la barra
se entere. A quién invoca es a los dos escritores de estado y,
condicionalmente, al cliente de peticiones. Lo que recibe es nada.

Cómo lo hace son tres pasos en orden: cerrar el panel, escribir la posición que
la deducción devuelve para la ruta actual y, solo si hay sesión, pedir el
contador otra vez. El último paso tiene una particularidad: su rama de error está
vacía, de modo que si la lectura falla el contador conserva el valor anterior, en
lugar de volver a cero como hace el efecto de carga.

Ese último paso no es el único punto donde la barra entra en contacto con el
panel. El panel, por su parte, envuelve la función que recibe en una suya propia
que devuelve el foco al elemento que estaba activo antes de abrirse, y que es la
campana; esaenvoltura está en las líneas 179 a 185 de su propio archivo. Ese es
el comportamiento al que se refiere el tercer hallazgo del capítulo V cuando
compara el tratamiento del foco de las dos ventanas superpuestas del proyecto.

El montaje del panel está en las líneas 295 a 300 y merece una mención aparte
porque usa el mismo mecanismo que la ventana de acceso: un portal al final del
documento. La barra entrega al panel la función de cierre, y el panel se
responsable de llamarla tanto cuando se pulsa fuera como cuando se pulsa la tecla
de escape o el botón de cerrar, porque esos tres caminos pasan por su propia
envoltura. La barra, en cambio, no escucha la tecla de escape para el panel: no
tiene ningún efecto registrado para ese propósito, de modo que el cierre por
tecla depende enteramente del panel.

## 6.11 La sección de autenticación

La parte baja de la barra, entre las líneas 250 y 278, decide entre tres
aspectos distintos según el estado de la sesión, y esa decisión se toma con dos
condiciones encadenadas sobre el valor `loading` y el valor `isAuthenticated`, los
dos tomados del contexto de autenticación en la línea 92.

El primer aspecto es el de espera. Mientras el contexto no sabe todavía si hay
sesión, la barra dibuja un disco del tamaño del avatar con tres puntos
suspensivos y un fondo tomado del color de fondo tres, para que la parte baja
no salte de altura cuando llegue la respuesta del servidor.

El segundo aspecto es el de sesión iniciada. En ese caso se dibuja un botón que
lleva la clase del botón de sección más dos modificadores: el de usuario y,
cuando la ruta es la del perfil, el de activo. El botón navega a la ruta del
perfil propio y declara esa ruta como página actual únicamente cuando ya está
en ella. Dentro del botón hay un círculo de avatar y una etiqueta con el nombre
de usuario o, en su defecto, con el correo. El círculo del avatar tiene dos
formas: si el contexto entrega una foto, dibuja una imagen con el nombre de
usuario como texto alternativo; si no, escribe la inicial en mayúscula del nombre
o, en su defecto, del correo, y como último recurso la letra mayúscula de la
constante de uso.

El tercer aspecto es el de sesión no iniciada. En ese caso se dibuja un
contenedor con los dos botones de acceso, recorriendo el arreglo `AUTH_ITEMS`.
Cada botón lleva la clase del botón de sección más el modificador de sección de
autenticación y, solo el de registro, el modificador propio de ese registro; su
pulsación entrega a `handleAuthClick` el valor `mode` de la entrada.

## 6.12 La ventana de acceso y sus dos formas de cierre

La barra monta la ventana de acceso en las líneas 281 a 292, y para hacerlo
necesita tres cosas del contexto de ventanas: saber si alguna está abierta, cuál
de las dos es, y disponer de tres operaciones que son abrir, cerrar y cambiar de
una a otra. Esas cinco piezas se toman en la línea 93.

El marcado del portal tiene dos niveles. El exterior es el fondo oscurecido, y es
lo único que está en el archivo de la barra: recibe la propiedad de pulsación que
cierra la ventana y lleva la profundidad que lo pone por encima de todo lo demás.
El interior es el contenedor del formulario, y su única responsabilidad es
detener la propagación de la pulsación para que un clic dentro del formulario no
lo cierre. El contenido del formulario no lo escribe la barra, sino que delega en
dos componentes distintos según el valor del modo: el de acceso, al que entrega
la operación de cerrar, y el de registro, al que entrega esa misma operación y
además la de cambiar de modo, que es lo que permite pasar de un formulario al
otro desde dentro de la ventana.

Qué hace el manejador `handleAuthClick`, en las líneas 188 a 190, es recibir el
modo y entregárselo a la operación de abrir. Lo que entrega es nada, porque abrir
no produce un valor de retorno. A quién invoca es al gestor de ventanas. Lo que
recibe es el modo que el recorrido del arreglo le entrega en la línea 270. Es un
encadenamiento sin trabajo propio, y su existir se explica por la uniformidad
del patrón de manejadores que el resto del archivo respeta.

El efecto de las líneas 193 a 206 es quien cierra la ventana con la tecla de
escape. Su cuerpo crea una función que compara la tecla con la cadena `Escape` y,
si coincide y la ventana está abierta, pide el cierre. La condición de apertura
está dentro de la función y además se repite como guarda del registro del
escuchador, de modo que el escuchador solo se añade cuando la ventana está
visible; la función de limpieza, en cambio, se devuelve siempre, y quitar un
escuchador que no se añadió no produce ningún efecto. El punto negativo de esta
unidad ya está reportado en el cuarto hallazgo del capítulo V, porque afecta a
ambas ventanas superpuestas del proyecto por el mismo motivo, y no se repite aquí.

El tercer manejador, `handleOverlayClick`, en las líneas 209 a 211, es el que
cierra al pulsar fuera y no contiene más que la llamada de cierre. La duplicación
de la profundidad de la ventana de acceso, declarada a la vez en la hoja de
estilos y en línea de estilo, se reporta en el apartado 6.15.

## 6.13 El montaje en el armazón y las rutas que quedan fuera

El archivo no se importa en ningún otro lugar del proyecto que no sea el
armazón. La importación es la tercera línea de ese archivo y usa la forma con
nombre, mientras que el propio archivo de la barra exporta además una forma por
omisión en su línea 305 que no tiene consumidores. El armazón coloca la barra
como hermana del elemento principal de la página, no dentro de él, de modo que la
barra y el contenido comparten el mismo nivel de anidamiento y la barra puede
usar una posición fija respecto de la ventana.

El enrutador de la aplicación coloca tres rutas fuera de ese armazón y el resto
dentro. La primera es la del visor de video, registrada en la línea 28 con su
parámetro numérico, que es la única página que se ve sin barra y que por eso
necesita su propia superficie oscura. La segunda es la de verificación de correo,
registrada en la línea 42 dentro del armazón, que muestra el resultado de la
confirmación del correo con barra lateral visible. La tercera es la del panel de
notificaciones, registrada en la línea 44 como reemplazo inmediato a la raíz,
de modo que esa ruta no existe como página: es una puerta que lleva
inmediatamente a otra parte. Ese reemplazo es la confirmación de que la sexta
sección de la barra no navega, y de que su ruta declarada es un residuo, como se
reporta en el apartado 6.15.

Conviene dejar constancia de una discrepancia entre el código y la nota de
mantenimiento del proyecto, porque afecta a lo que se ve en una de esas rutas.
La nota de mantenimiento afirma que la barra se oculta en la ruta de verificación
de correo, pero esa ruta está registrada dentro del armazón, de modo que la barra
sí se dibuja. [PENDIENTE: confirmar con el equipo si la nota de mantenimiento debe
corregirse o si la ruta de verificación de correo debe moverse fuera del
armazón].

## 6.14 Hoja de estilos relacionada

La barra no tiene hoja de estilos propia. Sus reglas viven en la hoja
compartida de los elementos pequeños, `estilospequeños.css`, en la hoja que se
documenta como canónica en el resto de los capítulos de este documento.

Lo primero que declara esa hoja para la barra son seis variables, en las líneas
299 a 307: el ancho recolhido de setenta y dos píxeles, el ancho expandido de
doscientos cincuenta, la altura de la barra inferior en móvil, la duración y la
curva de la transición, el tamaño de los iconos y el grosor de su trazo. Los dos
anchos son la base de la decisión de diseño que se ve en pantalla: la barra se
muestra con el ancho pequeño y se estira a doscientos cincuenta píxeles cuando
recibe el puntero o cuando algún elemento de su interior recibe el foco.

La regla principal, en las líneas 310 a 325, fija la posición fija pegada a las
esquinas superior e izquierda, la altura completa de la ventana, el ancho
recolhido, el fondo, el borde derecho, la disposición en columna con centrado y
espaciado, la profundidad de cincuenta y la transición de ancho. La profundidad
de cincuenta es la que coloca la barra por debajo del panel de notificaciones,
cuya profundidad es cuarenta en su contenedor pero cuyo fondo se dibuja por
encima de todo, y por debajo de la ventana de acceso, que declara cien. Ese orden
de tres niveles está descrito en el apartado 1.11 y no se repite aquí.

La mancha animada no es un elemento que la barra llegue a ver: es el
pseudoelemento `::before` de la barra, declarado en las líneas 360 a 372. Mide
cuarenta y ocho píxeles, tiene las esquinas redondeadas, un fondo degradado
entre los dos colores de acento, una opacidad baja y un desenfoque de doce
píxeles, no recibe pulsaciones y se traslada con una transición suave. La
opacidad sube cuando la barra recibe el puntero. Su posición se decide en la
hoja de estilos a partir del atributo `data-active-index`, con seis reglas de
desplazamiento vertical de sesenta y cuatro píxeles cada una para escritorio,
otras seis de desplazamiento horizontal del seis coma seis por ciento para
móvil, y una séptima que la deja invisible cuando el valor es menos uno, que es
el caso de las páginas de perfil.

El resto de las reglas se ocupan del comportamiento de los botones. La regla base,
en las líneas 379 a 394, les da tamaño, forma, fondo transparente, cursor y
transiciones de color, fondo, escala y ancho. Las reglas de puntero y de foco, en
las líneas 396 a 401, cambian el color, pintan el fondo y aplican una escala
ligeramente mayor. Las reglas de la expansión por puntero, en las líneas 404 a
411, están dentro de una consulta de medio mínimo de769 píxeles, que es la
decisión que impide que en un dispositivo táctil la barra crezca al tocarla.

Las etiquetas de texto se declaran en las líneas 453 a 468 como elementos
absolutos que empiezan fuera de la barra, con opacidad cero, y se revelan cuando
la barra recibe el puntero o el foco. En móvil se ocultan por completo con una
regla de la línea 478. La insignia de notificaciones no leídas se declara en las
líneas 426 a 443 como una píldora de diecisiete píxeles de alto con fondo de
acento fuerte, sin relleno, y con una regla en móvil que la separa diez píxeles de
los bordes. La sección de autenticación recibe su margen superior automático en
la línea 568, de modo que se pegue al borde inferior de la barra.

Finalmente, tres reglas delatan trabajo a medias. El selector de la insignia
existe y se usa, pero el elemento `barra-blob` que la barra dibuja en su línea
247 no tiene ninguna regla, porque la mancha es el pseudoelemento. De las dos
clases modificadoras de los botones de autenticación, una se escribe y no tiene
regla, y la otra tiene regla y nunca se escribe. Y la regla del botón resaltado,
en las líneas 490 a 494, declara el color dos veces. Los tres casos se reportan
en el apartado 6.15.

## 6.15 Hallazgos, observaciones y asuntos pendientes

El ejercicio de documentar el archivo de la barra lateral ha dejado doce puntos
que conviene reportar al equipo sin modificar el código fuente.

El primero es el doble modo de exportación, el mismo residuo de organización que
ya está reportado en el primer hallazgo del apartado 3.9 y en el octavo del
apartado 4.21. El componente se exporta con nombre en la línea 89 y por omisión
en la 305, y solo la primera tiene un consumidor, porque el armazón la importa con
esa forma. [PENDIENTE: confirmar con el equipo si conviene eliminar uno de los dos
modos de exportación o si la duplicidad es intencional].

El segundo es la importación sin uso de la biblioteca de renderizado en la línea
1. El archivo no escribe el espacio de nombres de la biblioteca en ninguna parte,
porque el compilador de interfaces traduce las etiquetas por sí solo, de modo que
la importación no aporta nada. Es el mismo tipo de residuo que el anterior y se
resuelve de la misma manera.

El tercero es la duplicidad de los textos. La propiedad `label` de cada entrada de
`NAV_ITEMS` y de `AUTH_ITEMS` se asigna tomando el valor de la tabla de textos, de
modo que nunca contiene una cadena distinta de la que ahí está escrita. Esa
propiedad existe únicamente para alimentar el nombre accesible de cada botón, y el
texto visible de las secciones se consulta por separado en la tabla. El efecto es
que cada nombre de sección está escrito dos veces en el archivo y que cambiarlos
obliga a editar dos lugares, aunque en el caso de las secciones el cambio se
propague solo. [PENDIENTE: confirmar con el equipo si conviene que el nombre
accesible se calcule a partir de la tabla de textos].

El cuarto es el segundo parámetro del recorrido de `AUTH_ITEMS`, en la línea 266.
El recorrido entrega la posición de cada entrada y el manejador nunca la usa,
porque la clave de la entrada ya sirve para identificar el botón. Es un argumento
sobrante que el analizador de código reporta.

El quinto es la declaración de página actual incorrecta. La función de deducción
devuelve cero para toda ruta que no corresponde a una sección, de modo que la
barra declara como página actual el botón de inicio en la página de
verificación de correo, en la de reescritura de contraseña y en la de
maquillajes. El valor centinela que evita ese falso positivo existe, pero solo se
aplica a las rutas de perfil. [PENDIENTE: confirmar con el equipo si las páginas
que no pertenecen a la barra deben declarar ninguna sección activa].

El sexto es una ruta que nunca se navega. La sexta entrada del arreglo declara la
ruta del panel de notificaciones, pero el manejador de pulsación bifurca antes, de
modo que esa propiedad solo se lee cuando la ruta actual coincide exactamente con
ella, y el enrutador declara esa misma ruta como reemplazo inmediato a la raíz.
Las dos cosas juntas convierten la propiedad en un residuo. [PENDIENTE: confirmar
con el equipo si conviene retirar la propiedad o mantenerla como documentación de
la sección].

El séptimo es la escritura de un estado dentro de la función que actualiza otro,
en la línea 164. El manejador de la campana entrega al escritor de apertura una
función que devuelve el valor contrario y que, en su cuerpo, escribe además la
posición activa. Ese patrón no está soportado: en desarrollo, el modo estricto de
la biblioteca de renderizado ejecuta dos veces la función de actualización, de
modo que la escritura interior ocurre dos veces. [PENDIENTE: confirmar con el
equipo si conviene sacar la escritura del estado activo fuera de la función de
actualización].

El octavo es un comentario que describe un comportamiento más estrecho que el
real. El comentario de las líneas 164 a 167 afirma que la mancha se queda fija en
la campana mientras el panel está abierto, pero eso solo ocurre cuando el panel se
abre pulsando la campana; si el panel se abre de otra forma, la mancha se queda
donde estuviera. El comentario no miente en el caso normal y sí engaña en el
resto.

El noveno es el número de lecturas del mismo dato. El efecto de la línea 144 pide
el contador al montar y en cada cambio de página, el panel vuelve a pedirlo al
abrirse y marca todas las notificaciones como leídas, y el manejador de cierre lo
pide una tercera vez. Una sola apertura del panel llega a producir tres lecturas
del mismo recurso. El patrón de volver a pedir al cerrar está justificado, porque
el panel marcó las leídas; las otras dos lecturas podrían resolverse con una sola
petición y una señal de cambios desde el panel.

El décimo es el recorrido con teclado que no da la vuelta. En la última posición
la flecha derecha no avanza y en la primera la izquierda no retrocede. Los
módulos de pestañas del proyecto sí dan la vuelta, de modo que el criterio no es
homogéneo entre módulos. La diferencia está descrita en el apartado 2.17 y no se
repite aquí.

El undécimo es que el recorrido con teclado no alcanza los tres controles de la
parte baja, porque su manejador solo está enlazado a los seis botones que
declaran el atributo de recorrido. Quien navega solo con teclado llega a ellos por
tabulación, lo cual funciona, pero rompe la expectativa de que las flechas
recorran toda la barra. El mismo manejador, además, escribe el estado que
alimenta el atributo de página actual y la posición de la mancha, de modo que
moverse con las flechas sin pulsar el botón cambia lo que la barra declara como
página actual y desplaza la mancha hacia un icono que no corresponde a la ruta.
Ambos efectos se describen en el apartado 6.7.

El duodécimo es la clase `barra-blob` de la línea 247. El elemento se dibuja y no
tiene ninguna regla en la hoja compartida, porque la mancha animada es el
pseudoelemento `::before` de la barra. El elemento no pinta nada, no ocupa espacio
porque es una caja sin contenido ni tamaño, y puede eliminarse sin cambio visible.

Quedan además tres observaciones menores que no llegan a ser hallazgos: la
clase `barra-lateral-auth-btn--user` se escribe en la línea 254 y no tiene
regla, mientras que la clase `barra-lateral-auth-btn--login` tiene regla en
las líneas 637 a 640 y nunca se escribe; la profundidad de la ventana de
acceso está declarada dos veces, en la línea 539 de la hoja compartida y en la
línea de estilo de la línea 282; y la regla del botón resaltado declara el
color dos veces, de modo que la primera queda anulada por la segunda. El
atributo `role="navigation"` de la línea 217 es redundante, porque el elemento
`nav` que lo envuelve ya tiene ese papel implícito, y no es un error sino una
redundancia inocua.

[PENDIENTE: confirmar con el equipo si el acceso al perfil debe seguir siendo un
botón en la parte baja de la barra o si conviene convertirlo en una séptima
sección del listado, lo que obligaría a resolver la mancuera del valor centinela
que hoy solo se aplica a las rutas de perfil].

[PENDIENTE: documentar en una pasada posterior el archivo
`NotificacionesPagina.jsx`, que este capítulo solo integra como pieza montada: sus
tres caminos de cierre, el retorno del foco a la campana, el marcado de sus
estados y la hoja de estilos que lo dibujan quedan fuera de este capítulo por no
formar parte de los cuatro archivos del encargo].


<!-- SALTO DE PÁGINA: el capítulo VII inicia en página nueva y su título ocupa una
     página sola (regla de formato 2). -->

# VII. El globo de diálogo del asistente Becky

## 7.1 Ubicación del módulo y papel dentro del sistema

El archivo documentado en este capítulo está en
`cliente/src/Componentes/elementos_pequeños/Dialogo.jsx` y tiene dieciocho líneas.
Es, con diferencia, la unidad más pequeña del proyecto que se documenta aquí, y
a la vez la que aparece más veces: se monta en diecisiete sitios repartidos en
dieciséis archivos distintos. Ese contraste entre tamaño y presencia es lo que
hace que merezca un capítulo propio, porque su comportamiento cabe en un párrafo
pero su integración no.

Qué es la unidad, en términos de sistema, es la voz del asistente. El sitio
adopta la figura de una usuaria llamada Becky que habla en primera persona, tanto
en los mensajes que anticipan una acción como en los que confirman que la acción
se hizo. Los dos vehículos de esa voz son piezas distintas: las notificaciones
emergentes, que documenta el capítulo VIII, y este globo, que aparece siempre
encabezando un formulario o un resultado. La diferencia entre ambos es de
naturaleza: la notificación es transitoria y se va sola, mientras que el globo
permanece mientras el formulario está en pantalla.

La pieza tiene tres rasgos que la hacen reconocerse en todo el sitio. El primero
es el texto, que siempre está en primera persona y nunca es un simple rótulo de
campo. El segundo es el avatar, un círculo con el logotipo del proyecto que
coloca a la persona del asistente al lado del texto, no encima. El tercero es la
posición, porque el globo no vive dentro de la tarjeta del formulario: la hoja de
estilos lo saca hacia arriba y hacia fuera en pantallas pequeñas, de modo que
flota sobre el formulario como si la persona estuviera hablando desde fuera de él.

Ese papel de mediador tiene una consecuencia de diseño que conviene anotar desde
el principio: el globo no sabe nada del formulario que acompaña. No recibe el
nombre del formulario, ni su estado, ni el resultado de ninguna operación. Solo
recibe una cadena de texto, y quien decide qué dice esa cadena es cada uno de los
dieciséis archivos que lo montan. Esa independencia es la razón por la que el
componente no se ha roto al crecer el registro de siete pasos ni al añadirse el
formulario de preferencias de cultura, y también la razón por la que los textos
se han ido acumulando sin ningún criterio común.

## 7.2 Inventario de unidades documentadas

El archivo declara una sola unidad de código: la función `Dialogo`, en las líneas
4 a 18. No hay constantes, ni funciones auxiliares, ni estados, ni efectos, ni
clases, y tampoco hay una segunda forma de exportación, porque el archivo no
exporta por omisión. Los dos import de las líneas 1 y 2 no son unidades de
código, sino las dependencias del archivo, y los dos se documentan en los
apartados 7.4 y 7.6 porque uno de ellos está escrito pero no se usa.

Esa forma de exportación es la única del proyecto que se consume siempre con
nombre, y por eso es también la única de las cuatro que no arrastra el
doble modo de exportación que ya está reportado en el primer hallazgo del
apartado 3.9, en el octavo del apartado 4.21, en el primero del capítulo V y en
el primero del capítulo VI.

## 7.3 La función `Dialogo` y su única propiedad

La función `Dialogo` es la unidad completa del archivo. Recibe un objeto de
propiedades del que solo extrae una, y no declara ningún otro parámetro: ni
eventos, ni referencias, ni propiedades de estilo.

Qué hace es devolver el globo de diálogo con el texto recibido. Lo que entrega
es un elemento de interfaz compuesto por dos hijos. A quién invoca es a ninguno,
porque es el extremo final de la cadena: no llama a ninguna función, no lee
ningún contexto y no consulta ningún servicio. Lo que recibe es un objeto con la
propiedad `label`.

Cómo lo hace son dos líneas. La primera declara la función y su parámetro, y en
esa declaración se le da a la propiedad un valor por omisión, de modo que si
nadie la entrega la función usa ese texto. La segunda es la devolución del
marcado, que es un elemento contenedor del que cuelgan los dos hijos.

La propiedad `label` es el único punto de contacto entre la unidad y el resto del
proyecto. Todo lo que la pieza sabe del mundo entra por ella, y todo lo que la
pieza dice del mundo sale por ella. La consecuencia práctica es que la unidad no
tiene estados ni variantes: no sabe si está dpiendo una bienvenida, una
confirmación o una disculpa, y esa distinción la aporta el texto.

## 7.4 La construcción del marcado: el globo y el avatar

El marcado que devuelve la función tiene dos niveles. El exterior es un contenedor
que lleva la clase `dialogoContenedor`, y cuyo único trabajo es poner en fila
el texto y el avatar. El interior son esos dos hijos, y su orden es
fijos: primero el globo con el texto y después el avatar.

El primero de los dos hijos es el globo. Es un elemento de texto que lleva la
clase `dialogo-globo` y cuya única propiedad es el texto recibido, sin ninguna
transformación: lo que el módulo entrega es exactamente lo que se pinta. No
hay escapar de caracteres, no hay recorte, no hay salto de línea automático
declarado en el archivo, y no hay ningún elemento que distinga las partes del
texto. Los acentos y los signos de apertura que usan varios de los textos
recibidos son los que escriben los módulos que lo montan, no la unidad.

El segundo hijo es el avatar. Es un contenedor circular que lleva la clase
`dialogo-avatar` y que dentro tiene un elemento de imagen cuyo origen es una
ruta escrita como cadena de texto, cuyo texto alternativo es la palabra
"Logo" y cuyo tamaño se fija con dos declaraciones de estilo en línea, al
 cien por cien. El tamaño en línea es lo que hace que la imagen llene el círculo
dentro del cual la hoja de estilos la recorta, porque ese círculo declara su
propio tamaño y su recorte. La imagen es la misma que el logotipo de la barra
lateral, aunque en esta unidad no se importa como recurso sino como ruta escrita
a mano.

El primer import del archivo, en la línea 1, trae ese mismo recurso por su ruta
declarativa. La imagen del avatar no lo usa: escribe la ruta directamente en la
línea 11. La importación existe, ocupa una línea del archivo y no se referencia
en ninguna parte, como se reporta en el apartado 7.7.

## 7.5 Los diecisiete montajes y sus textos

El globo se monta en diecisiete sitios y en ningún otro lado. Los dieciséis
archivos que lo montan se pueden agrupar en tres familias según la fase del
producto en la que aparecen.

La primera familia es la del registro y la de la cadena de características
físicas, y ocupa nueve archivos. Lo abren el propio formulario de registro, que
escribe el texto "First time here?" en su línea 225, y la pantalla que anuncia
la cadena, que escribe "Veamos qué es lo que te hace tan bonita" en su línea
71. Después vienen los siete pasos de la cadena, que avanzan en el orden en que
cada uno nombra al siguiente: los ojos, que escriben "Que bonitos ojos tienes
debajo de esas cejas" en su línea 110; la nariz, que escribe "Intenta ver más
allá de tu nariz para encontrar la respuesta" en su línea 113; el óvalo del
rostro, que escribe "En esta casa no se habla de la simetría" en su línea 107;
el color de la piel, que escribe su pregunta sobre el fucsia en su línea 105;
los labios, que escriben "Ya casi acabamos, te lo prometo" en su línea 107; el
tipo de piel, que escribe su declaración de amor en su línea 102; y la edad,
que se trata aparte porque monta el globo dos veces. Los seis pasos intermedios
repiten exactamente la misma estructura de tres elementos: un contenedor con la
clase del envoltorio, el globo y el formulario.

La segunda familia es la de la confirmación y la de las preferencias, y ocupa
tres archivos. Son el componente que confirma que el preregistro se completó,
que escribe "¡Checkpoint!" en su línea 24; el que informa del resultado de la
verificación del correo, que escribe "¡Checkpoint!" o "¡Ups!" según el resultado
de la consulta de la ruta en su línea 57; y el formulario de preferencias de
cultura, que se muestra la primera vez que alguien entra con la cuenta recién
creada y que escribe "Casi terminamos" en su línea 145.

La tercera familia es la del acceso y la de la recuperación de contraseña, y
ocupa cuatro archivos. Son el formulario de acceso, que escribe "Hello
there!!!" en su línea 137; el de solicitud de restablecimiento, que escribe
"¿Apoco muy olvidadizo?" en su línea 78; el de reescritura de contraseña, que
escribe "Pero que no se te vuelva a olvidar" en su línea 128; y el componente
de mensaje de confirmación, que escribe "¡Checkpoint!" en su línea 23.

Tres detalles de esa distribución merecen atención. El primero es que el archivo
de la edad monta el globo dos veces, en sus líneas 121 y 146, y las dos
montajes están en ramas de retorno distintas: el primero pertenece a la rama en
que el formulario se sustituye por el indicador de carga del registro y escribe
"Creando tu personaje...", y el segundo a la rama en reposo, donde está el
formulario de la edad. El segundo es que el texto de esa segunda rama, "Intenta
ver más allá de tu nariz para encontrar la respuesta", es el mismo que escribe
el paso de la nariz, de manera que quien está eligiendo su edad recibe un consejo
sobre la nariz. El tercero es que tres de los diecisiete textos son el mismo
"¡Checkpoint!", lo que convierte esa palabra en la fórmula del proyecto para
confirmar que algo se logró, y dos de esos tres aparecen en archivos de familias
distintas.

Ninguno de los dieciséis archivos necesita importar la hoja de estilos del
globo, porque la unidad la importa ella misma en su línea 2. Los archivos sí
importan la hoja de estilos de la otra familia, y lo hacen todos, como se
explica en el apartado 7.6.

## 7.6 Las hojas de estilos que lo dibujan

El globo se dibuja con reglas de dos hojas distintas, y la reparto de
responsabilidades entre las dos es lo contrario de lo que sugiere el nombre de
cada una.

La primera hoja es la de los elementos pequeños, y la importa la propia unidad en
su línea 2. En ella están las tres reglas que definen la forma del globo, en las
líneas 3 a 43: la del contenedor, que lo dispone en fila con el avatar pegado al
borde inferior, la del globo, que le da el fondo, las esquinas con un solo lado
recto, el relleno, el tamaño de letra y el crecimiento hasta ocupar el espacio
libre, y la del avatar, que le da el diámetro, la forma circular, el fondo
degradado, el borde, la sombra y el recorte. Hay una cuarta regla, la del vector
dentro del avatar, que no se describe más abajo porque no llega a aplicarse.

La segunda hoja es la del acceso, en `iniciosesion.css`, y en ella están las
reglas que deciden dónde se coloca el globo respecto del formulario: el
envoltorio que los módulos usan a su alrededor, y el formulario que va debajo.
Ese formulario está además en la primera hoja, en las líneas 181 a 189, con
valores casi iguales, de manera que su regla está escrita en los dos sitios.
Las reglas del envoltorio están en las líneas 71 a 79, que lo centran y le dan
los márgenes, y en las líneas 350 a 359, dentro de la consulta de pantalla
pequeña de esa hoja, que lo despegan de la tarjeta y lo suben doscientos píxeles
por encima del borde superior de ella. El nombre de esa hoja es la causa de la
confusión: no es una hoja del acceso sino que es, de hecho, la hoja del
contenedor del globo para todo el proyecto, y lo es porque el formulario de
acceso fue el primer sitio donde se diseñó.

La tercera hoja, ya dentro de la primera, es la consulta de pantalla pequeña de
la propia hoja de elementos pequeños, abierta en la línea 141 y cerrada en la
243. Ahí están las reglas que vuelven a sacar el globo hacia arriba, en las líneas
162 a 179, con una posición absoluta y una altura medida respecto de la ventana,
y una tercera regla, en las líneas 191 a 198, que no llega a aplicarse por
causa del selector con el que está escrita.

Esa superposición de dos reglas que compiten por la misma propiedad no es un
problema, porque cada una está dentro de una consulta de medio distinta. La regla
general, en las líneas 3 a 12, declara una posición relativa, y la regla de
pantalla pequeña, en las líneas 162 a 169, declara una posición absoluta. Como la
segunda solo se aplica por debajo del ancho máximo de cuatrocientos ochenta
píxeles, el diálogo sale hacia arriba en el móvil y se queda dentro de la tarjeta
en el escritorio.

## 7.7 Hallazgos, observaciones y asuntos pendientes

El ejercicio de documentar el archivo del globo de diálogo ha dejado diez
puntos que conviene reportar al equipo sin modificar el código fuente.

El primero es la importación de recurso que no se usa, en la línea 1. El archivo
importa el logotipo como recurso, pero la imagen del avatar escribe la ruta como
texto en la línea 11 y nunca referencia el identificador que la importación
entrega. La consecuencia práctica es que el analizador de código reporta la
importación como sobrante y que la ruta del recurso está escrita en dos lugares
distintos del repositorio.

El segundo es el valor por omisión de la propiedad `label`. La función declara un
texto por omisión, pero ninguno de los diecisiete montajes lo utiliza, porque
todos entregan su propio texto. Además el texto por omisión y el más parecido a
él, el del formulario de acceso, difieren en un signo de exclamación, lo que
sugiere que el valor por omisión es una copia antigua del texto que se pasó a
escribir en el módulo consumidor. [PENDIENTE: confirmar con el equipo si el valor
por omisión debe conservarse para usos futuros o eliminarse por ser inalcanzable].

El tercero es el texto del segundo montaje del archivo de la edad. Ese montaje
escribe "Intenta ver más allá de tu nariz para encontrar la respuesta", la misma
frase que escribe el formulario de la nariz, en un paso donde no se pregunta nada
sobre la nariz. El texto se reproduce de un archivo al siguiente por copiado, sin
revisar a qué paso corresponde. [PENDIENTE: confirmar con el equipo qué frase
debe accompanies el paso de la edad].

El cuarto es el texto alternativo de la imagen. La imagen del avatar declara la
palabra "Logo" como texto alternativo, de modo que un lector de pantalla anuncia
"imagen, Logo" cada vez que el globo aparece, sin decir quién habla ni qué papel
cumple. La etiqueta podría identificar al asistente o, simplemente, declarar la
imagen como decorativa para que se omitiera.

El quinto es que el globo no es una región activa. No declara ningún papel ni
ningún atributo de anuncio, de modo que cuando el texto cambia de un estado a
otro, como ocurre en el componente de confirmación del correo, que escribe
"¡Checkpoint!" o "¡Ups!" según la consulta de la ruta, ese cambio no se anuncia.
La consecuencia es especialmente molesta en el estado de error, que es el que
cambia sin que la persona haya solicitado ningún cambio de página.

El sexto es el tamaño de la imagen declarado en línea. La imagen del avatar es la
única parte de los cuatro archivos documentados que usa estilo en línea, y lo usa
para declarar su ancho y su alto. El círculo que la contiene ya declara su
propio diámetro y su recorte, de modo que el tamaño en línea es redundante y
coloca una decisión de presentación fuera de la hoja de estilos, que es donde
viven las demás decisiones del módulo.

El séptimo es la regla del vector dentro del avatar, en las líneas 40 a 43 de la
hoja de estilos. El avatar contiene una imagen y no un vector, de modo que la
regla no se aplica a ningún elemento. Es la consecuencia de haber previsto
el avatar con un vector y haberlo cambiado después por una imagen sin retirar la
regla. La sustitución se hizo bien en el marcado y a medias en la hoja de estilos.

El octavo es el selector de la línea 191. La regla busca un elemento con la clase
`dialogo` dentro de un contenedor, pero ningún elemento del proyecto lleva esa
clase: el contenedor real se llama `dialogoContenedor`, que es un nombre
distinto y que por eso no coincide con el selector. La regla, que declara el
comportamiento del globo en pantalla pequeña, no se aplica.

El noveno es el reparto invertido de las hojas de estilos. La unidad importa su
propia hoja, de modo que el globo está bien definido donde está, pero el
envoltorio que lo coloca respecto del formulario vive en la hoja de estilos del
acceso, y cada uno de los dieciséis módulos que monta el globo tiene que importar
esa hoja del acceso para que el conjunto se dibuje bien. El formulario que va
debajo tiene el problema añadido de estar declarado en las dos hojas, con lo que
el mismo nombre de clase recibe dos veces las mismas declaraciones. Ninguno de
esos dieciséis archivos pertenece al acceso, y la hoja del acceso tiene además
otras reglas que nada tienen que ver con este módulo. [PENDIENTE: confirmar con el
equipo si conviene trasladar el envoltorio a la hoja de los elementos pequeños y
dejar de importar la hoja del acceso desde los módulos del registro].

El décimo es la mezcla de estilos de nombre entre clases hermanas. El contenedor
usa un nombre en que van juntas mayúscula y minúscula, con la primera palabra
pegada a la segunda, mientras que el globo, el avatar, el envoltorio y el
formulario usan nombres con guiones. No produce ningún efecto visible, pero
obliga a recordar dos convenciones distintas dentro del mismo grupo y dificulta
buscar las reglas relacionadas en la hoja de estilos.

[PENDIENTE: documentar en una pasada posterior los dieciséis módulos que montan el
globo, de los que este capítulo solo recoge su texto y su posición, porque la
cadena de siete pasos del registro, el formulario de preferencias de cultura y
los cuatro módulos del acceso todavía no tienen capítulo propio].


<!-- SALTO DE PÁGINA: el capítulo VIII inicia en página nueva y su título va en
     una página sola (regla de formato 2). -->

# VIII. Los avisos emergentes y la solicitud de consentimiento de cookies

## 8.1 Ubicación del archivo y su doble papel dentro del sistema

El archivo documentado en este capítulo está en
`cliente/src/Componentes/elementos_pequeños/Notificaciones.jsx` y tiene
ciento noventa y nueve líneas. Es el componente más grande de los cuatro
documentados aquí después de la barra de navegación, y el único que administra
dos compromisos distintos con la persona que usa el sitio.

Qué es la unidad, en términos de sistema, es el canal de mensajes breves del
producto. Todo lo que el sitio le dice a quien está dentro como consecuencia de
una acción que acaba de hacer pasa por aquí: que el video se eliminó, que la
contraseña se cambió, que el comentario se publicó, que la publicación se creó.
A eso se suma un segundo papel, el de la solicitud de consentimiento de cookies,
que no es un aviso de resultado sino una pregunta que el sitio hace una sola vez
por navegador y que se presenta con la misma apariencia que los avisos, como si
la pregunta fuera una más entre las que habla la persona que acompaña al usuario.

Esa decisión de presentar la pregunta como un aviso tiene una consecuencia
técnica que ordena todo el archivo: la tarjeta de cookies no es un modal, no
ocupa la pantalla, no tiene fondo oscurecido y no bloquea la interacción. Es una
tarjeta más dentro de la pila de tarjetas, y por eso comparte con ellas casi
todas sus reglas de estilo. De hecho, el texto que la acompaña, el logotipo que
la firma, el título "Becky te ha mandado un mensaje" y hasta el saludo animado
son los mismos que usa un aviso común, de manera que la diferencia entre un
mensaje del sistema y una pregunta legal se apoya únicamente en el texto del
cuerpo y en los dos botones del pie.

El archivo importa su propia hoja de estilos en la línea 3, de modo que quien lo
monta no tiene que importar nada para que las tarjetas aparezcan. Esa
autosuficiencia, junto con el hecho de que el componente acepte que se le
entreguen o no las propiedades del consentimiento, explica que esté montado en
once sitios distintos sin que ninguno de ellos tenga que hacer nada especial.

## 8.2 Inventario de unidades del archivo

El archivo declara catorce unidades de código dentro de su único componente:
cinco funciones, siete valores derivados y dos estados. No hay constantes de
nivel de módulo, ni efectos, ni funciones auxiliares fuera del componente, ni una
segunda forma de exportación, porque el componente se exporta únicamente con
nombre, en la línea 10.

Las cinco funciones son el propio componente `Notificaciones`, que envuelve el
cuerpo visible; `addNotification`, que inserta un aviso en la lista;
`removeNotification`, que retira un aviso por su identificador; y los dos
manejadores `handleAccept` y `handleReject`, que registran la respuesta a la
pregunta de las cookies. Estos dos últimos se documentan juntos en el apartado
8.7, porque hacen lo mismo con dos valores distintos.

Los siete valores derivados se declaran al principio del cuerpo del componente,
antes de cualquier manejador. Son `auth`, que es lo que devuelve el contexto de
autenticación; `resolvedConsent`, `resolvedAccept` y `resolvedReject`, que eligen
entre las propiedades que llegan del padre y las que ofrece el contexto;
`hasConsent`, que dice si la respuesta guardada es una aceptación;
`shouldShowCookieToast`, que combina ese booleano con el estado de descarte para
decidir si la tarjeta se dibuja; y `cookieToast`, que no se declara al principio
sino al final del cuerpo y que recibe el marcado de la tarjeta cuando la
condición se cumple.

Los dos estados son `notifications`, que es la lista de avisos visibles, y
`cookieToastDismissed`, que recuerda si la tarjeta de cookies ya se descartó
dentro de este montaje. El primero se declara en la línea 24 con un arreglo
vacío por omisión, y el segundo en la línea 29 con el valor falso, de manera que
en el primer renderizado de cualquier montaje la tarjeta de cookies está lista
para mostrarse.

## 8.3 La función envoltoria y el contrato con el padre

El componente `Notificaciones` es una función envoltoria creada con
`forwardRef`, declarada en las líneas 10 y 199. Recibe dos argumentos: el objeto
de propiedades y la referencia que el padre le entrega. La referencia es lo que
permite que el padre controle la lista sin conocer el estado interno, y su
exposición se hace en las líneas 63 a 66 con `useImperativeHandle`, que publica
un objeto de dos métodos: `addNotification` y `removeNotification`.

Qué hace la función es mantener la lista de avisos, decidir si debe dibujarse la
tarjeta de consentimiento y devolver el marcado de ambas cosas. Lo que entrega
es un único elemento contenedor. A quién invoca es a las cuatro funciones que
ella misma declara, es decir, `addNotification`, `removeNotification`,
`handleAccept` y `handleReject`, y a la función de actualización del estado que
React entrega, a la que llama en las líneas 51 y 59. Lo que recibe es el objeto
de propiedades, del que en la línea 13 extrae tres valores, y nada más.

Ese contrato con el padre ya fue descrito desde el punto de vista de quien lo
consume en el apartado 1.6, donde se explica por qué los avisos de una pantalla
terminan siempre en la lista. Este apartado lo documenta desde el lado de la
implementación, y el 1.6 debe leerse como el resumen de este.

## 8.4 La lista de avisos y la función `addNotification`

La función `addNotification` se declara en las líneas 41 a 55. Su parámetro se
llama `notification` y es el objeto que el padre entrega. La función no declara
ningún otro parámetro ni devuelve ningún valor: su efecto es todo.

Qué hace es agregar un aviso a la lista, salvo en un caso reservado que se
explica en el apartado siguiente. Lo que entrega es el resultado de la
actualización del estado, que React usa para volver a dibujar. A quién invoca es
a la función de actualización del estado, en la línea 51. Lo que recibe es un
objeto con, al menos, un título y un mensaje, y opcionalmente un indicador de
saludo animado y una o varias acciones.

Cómo lo hace son cuatro pasos. Primero calcula si el aviso recibido es el de la
tarjeta de cookies, comparando el título con una cadena escrita a mano y
buscando la palabra "cookies" dentro del mensaje. Segundo, si es ese aviso y no
hay aceptación registrada, devuelve sin hacer nada, porque la tarjeta de cookies
se dibuja por su cuenta. Tercero, en los demás casos, genera un identificador
con la hora actual, convertido a cadena. Cuarto, agrega a la lista una copia del
objeto recibido con ese identificador ya puesto, usando la forma de
actualización funcional del estado para no depender del valor anterior.

Las dos últimas operaciones merecen atención porque son el centro de los
problemas que se reportan en el apartado 8.14: el identificador se genera
siempre, aunque el objeto recibido ya traiga uno, y se genera con la hora del
reloj, de modo que dos avisos agregados en el mismo milisegundo reciben el
mismo identificador.

La función está memorizada con `useCallback` y su dependencia es `hasConsent`,
el valor que se define en la línea 34 y que se explica en el apartado 8.6. Esa
dependencia es necesaria porque la función lee ese valor, y su efecto secundario
es que cambia de identidad cada vez que cambia el estado del consentimiento,
lo que a su vez cambia el objeto que `useImperativeHandle` publica.

Quién invoca esta función son los diez módulos que montan el componente, a través
de la referencia que le entregan. Todos lo hacen con la misma forma, la llamada
opcional con encadenamiento al método, de manera que si la referencia todavía no
está disponible la llamada simplemente no ocurre y el aviso se pierde en lugar de
producir un error.

## 8.5 La reserva del título de cookies y la función `removeNotification`

La condición de las líneas 42 a 43 deserves un apartado propio, porque es la
regla que evita que la tarjeta de consentimiento aparezca dos veces. La función
comprueba que el título sea exactamente la cadena "Becky te ha mandado un
mensaje" y que el mensaje contenga la palabra "cookies". Si se cumplen las dos
cosas y no hay aceptación, la función sale sin agregar nada.

Qué hace, en términos de sistema, es reservar una combinación de título y
palabra para el componente. El caso nunca se presenta en la práctica, porque la
tarjeta de cookies no se dibuja desde la lista sino desde el bloque que se
documenta en el apartado 8.8, y ese bloque nunca pasa por `addNotification`. La
comprobación es, por tanto, una defensa que hoy no impide nada, escrita
como si la tarjeta se agregara alguna vez a la lista.

La función `removeNotification` se declara en las líneas 58 a 60 y es la más
pequeña del archivo. Su parámetro se llama `id` y es el identificador del aviso
que se quiere retirar. Qué hace es quitar de la lista el aviso que tiene ese
identificador. Lo que entrega es el resultado de la actualización del estado. A
quién invoca es a la función de actualización del estado, en la línea 59. Lo que
recibe es el identificador, y no hay comprobación previa de que exista.

Su implementación compara el identificador recibido con el de cada aviso de la
lista y conserva solo los que no coinciden. La comparación es estricta, de modo
que el valor recibido tiene que ser exactamente el mismo tipo de dato que se
guardó. El identificador se guardó como cadena, porque la línea 50 convierte la
hora a cadena, de manera que un identificador numérico descarta todos los avisos
en lugar de uno.

Quién invoca esta función son dos caminos. El primero está dentro del propio
archivo: la equis de la tarjeta de cada aviso, en la línea 144, y los botones de
acción, en las líneas 166 y 185. El segundo es el padre, a través de la
referencia, y en el proyecto entero hay una sola llamada externa, en el detalle
de video, que se comenta en el primer hallazgo del apartado 8.14.

## 8.6 La resolución del consentimiento y su persistencia

El componente no decide por sí mismo si el consentimiento está dado. Para eso
resuelve tres valores en las líneas 18 a 21, y esa resolución es el mecanismo
más importante del archivo después de la lista.

La línea 18 obtiene el contexto de autenticación con `useAuth`. La línea 19
compara el valor recibido por props con el valor del contexto y elige el
primero cuando existe, de manera que el padre tiene prioridad. La línea 20
resuelve la función de aceptación con la misma prioridad, y la línea 21 hace lo
mismo con la de rechazo.

Sobre esos tres valores se calculan los dos que gobiernan la tarjeta. La línea
34 comprueba si el consentimiento registrado es una aceptación, comparando el
campo de aceptación con el valor verdadero, y ese es el resultado que se llama
`hasConsent`. La línea 35 combina ese resultado con el estado local de descarte y
produce `shouldShowCookieToast`, que es verdadero exactamente cuando no hay
aceptación y la tarjeta no se ha descartado en este montaje. La comparación con
el valor verdadero es deliberada: un consentimiento con el campo de aceptación
falso, que es lo que deja el rechazo, no cuenta como aceptación.

El lugar donde ese consentimiento se persiste está fuera de este archivo, en el
contexto de autenticación, y son solo tres partes. El estado se declara con un
iniciador perezoso en la línea 35 de ese archivo, que lee el almacenamiento
local del navegador bajo la clave "cookie-consent" y devuelve lo que encuentra,
o nulo si no hay nada o si el contenido no se puede interpretar. La función que
lo actualiza se declara en la línea 47 y escribe primero en el estado de React y
después, solo si el campo de aceptación es verdadero, en el almacenamiento
local. Los errores de almacenamiento se silencian dentro de un bloque de
protección, de manera que un navegador que no permita escribir no interrumpe el
sitio. Finalmente, el valor de la línea 35 y el de la línea 79 de ese archivo son
las dos propiedades que este componente recibe del contexto.

## 8.7 Los manejadores `handleAccept` y `handleReject`

Los dos manejadores de la tarjeta de consentimiento se declaran en las líneas 69
a 74 y 76 a 83, y resuelven la misma decisión desde dos lados opuestos.

`handleAccept` no recibe parámetros. Qué hace es construir un objeto con el campo
de aceptación en verdadero y la hora actual, y entregarlo a la función de
aceptación resuelta en la línea 73. Lo que entrega es el resultado de esa
llamada, o nada cuando la función no existe. A quién invoca es a la propiedad
de aceptación del padre o, en su defecto, a la función del contexto de
autenticación descrita en el apartado 8.6. Como esa función escribe en el
almacenamiento local cuando la aceptación es verdadera, el efecto de este
manejador es permanente para ese navegador.

`handleReject` tampoco recibe parámetros y construye el mismo objeto con el campo
de aceptación en falso. Lo entrega a la función de rechazo resuelta en la línea
81 y, además, activa el estado local de descarte en la línea 82. Esa segunda
parte es la que hace que la tarjeta desaparezca de inmediato, porque el estado
local es uno de los dos términos de la línea 35. El rechazo, en cambio, no
llega al almacenamiento local: la función del contexto solo escribe cuando el
campo de aceptación es verdadero, de manera que el efecto del rechazo dura lo que
dure el montaje actual.

Los dos manejadores están memorizados con `useCallback` y sus dependencias son
respectivamente la función de aceptación y la de rechazo, porque no leen ningún
otro valor del archivo. La tarjeta de consentimiento tiene además un tercer
camino de cierre, que es la equis de su cabecera, en la línea 98, y esa equis
invoca el mismo manejador de rechazo, de modo que cerrar la tarjeta equivale a
rechazar.

## 8.8 La tarjeta de consentimiento

La tarjeta de consentimiento se construye en las líneas 86 a 122. El bloque
empieza con una variable local que se declara nula en la línea 86 y que solo
recibe contenido cuando la línea 87 confirma que debe mostrarse, de manera que
la tarjeta existe como variable aunque no se dibuje.

Qué entrega es un elemento de tipo artículo con dos clases, la general de las
tarjetas y la específica de esta, que es la que le pone el filete lateral. Su
estructura tiene tres partes. La primera es la cabecera, con el bloque de la
aplicación a la izquierda: un círculo con el logotipo del proyecto y, a su lado,
el nombre de la aplicación. A la derecha está el grupo de acciones, que en esta
tarjeta contiene únicamente la equis de cierre. La segunda parte es el cuerpo,
que se declara con la variante de cuerpo con saludo para que el saludo animado
quede a la izquierda y el texto a su derecha. La tercera es la fila de botones,
con los dos botones de decisión.

El texto de la tarjeta es fijo y está escrito en el marcado, no llega por
propiedad. Hay un título, que es la cadena con la que Becky avisa que ha mandado
un mensaje, y un párrafo que explica para qué se usan las cookies y qué ocurre
al pulsar el botón de aceptación. Los dos botones de la fila están escritos en
las líneas 113 y 116, con la clase general y una variante cada uno: la variante
primaria para la aceptación y la variante de rechazo para el otro.

Quién dibuja esta tarjeta es el propio componente, en la línea 126, como primer
hijo del contenedor. Esa posición es la que determina su lugar en la pantalla,
porque la hoja de estilos invierte el orden de la pila, como se explica en el
apartado 8.11.

## 8.9 El marcado de un aviso y sus dos barras de acción

Los avisos de la lista se dibujan a partir de la línea 128, y cada uno es un
artículo con la clase general, sin la variante de cookies. La estructura repite
la de la tarjeta en sus dos primeras partes, con una diferencia: el grupo de
acciones de la cabecera contiene dos botones, el de los tres puntos y el de la
equis, y solo el segundo tiene comportamiento.

El cuerpo del aviso se declara con una variante que depende de un valor calculado
en la línea 129. Ese valor convierte en verdadero o falso la propiedad que
indica si el aviso lleva saludo animado, y de él dependen dos cosas: la clase del
cuerpo y la presencia misma de la imagen del saludo, que se dibuja en la línea
151 solo cuando el valor es verdadero. El texto del aviso se pinta en las
líneas 153 y 154, con su título en un párrafo y su mensaje en otro, y ninguna de
las dos cadenas se transforma.

Las acciones son la tercera parte y se resuelven en dos ramas. La primera, en las
líneas 158 a 173, se dibuja cuando el aviso trae una acción que no es un
arreglo, y produce una barra con un solo botón. La segunda, en las líneas 175 a
193, se dibuja cuando la acción es un arreglo, y produce una barra con un botón
por cada elemento. Las dos ramas repiten el mismo comportamiento de tres pasos:
llaman a la acción si existe, con la llamada opcional de la línea 164 y la 183;
después comprueban una propiedad de la acción para decidir si la tarjeta se
retira; y por último retiran la tarjeta llamando a `removeNotification` con el
identificador del aviso.

Esa comprobación de la línea 165 y la 184 es la que permite que una acción de
confirmación sobreviva al clic, porque basta declarar que no debe cerrarse la
tarjeta. En el proyecto entero ningún aviso declara esa propiedad, de manera que
todas las acciones cierran su tarjeta, y la rama que permite lo contrario está
escrita pero nunca se toma.

## 8.10 Los once montajes y lo que entrega cada uno

El componente se monta en once sitios repartidos en diez archivos, y ninguno de
ellos lo importa con otra forma que la que declara su nombre. La lista completa,
con su archivo y su línea, es la siguiente.

`Inicio.jsx` lo monta en la línea 63 con la referencia y nada más, dentro del
contenedor principal de la pantalla. `Registro.jsx` lo monta en la línea 264 con
la referencia y las tres propiedades del consentimiento.
`PreferenciasFormulario.jsx` lo monta en la línea 217 con las mismas cuatro
cosas. Del lado del acceso,
`InicioSesion.jsx` lo monta en la línea 170, dentro de una llamada a
`createPortal` con destino el cuerpo del documento, con la referencia y las
tres propiedades; `RecuperarContraseñaCorreo.jsx` lo monta en la línea 107 con la
referencia y también portalizado; y `ReescribirContraseña.jsx` lo monta en la
línea 180 con la referencia, sin portal y sin propiedades.

Las cuatro pantallas que quedan lo montan portalizado y con la referencia y nada
más: el detalle de video en la línea 2053, el perfil en la línea 888, el detalle
de conversación en la línea 578 y el módulo de creación en las líneas 382 y 747.
Ese último archivo es el único que lo monta dos veces, y lo hace porque tiene
dos flujos mutuamente excluyentes.

Las propiedades del consentimiento se entregan solo en tres de los once sitios, y
los tres archivos las toman del mismo contexto que el componente ya consulta por
su cuenta. Los ocho sitios restantes lo montan sin propiedades, entre ellos la
pantalla de inicio, que es la primera que ve alguien sin sesión, y los dos
formularios de contraseña. La portalización, que es el recurso que garantiza que
las tarjetas no queden atrapadas en el contexto de apilamiento de una capa
superpuesta, se aplica en siete de los once sitios y se omite en los otros
cuatro, que son precisamente los que no se dibujan dentro de una capa de esas.

## 8.11 Hoja de estilos del componente

Las reglas del componente están en tres bloques de la hoja de estilos de los
elementos pequeños, y ninguno de los tres está dentro de una consulta de medio,
salvo el segundo.

El primer bloque, en las líneas 45 a 136, es el que se aplica siempre. La regla
del contenedor fija el aviso a la esquina inferior derecha, a veinticuatro
píxeles de cada borde, con un ancho de cuatrocientos veinte píxeles, una
dirección de columna invertida y un nivel de apilamiento de novecientos noventa
y nueve. La inversión de la columna tiene una consecuencia que conviene entender:
el primer hijo del contenedor se dibuja al final, de manera que la tarjeta de
cookies, que es el primer hijo, aparece abajo, mientras que los avisos que se van
agregando suben por encima de ella.

La tarjeta tiene fondo del color de los iconos, esquinas de dieciséis píxeles,
espaciado interno, sombra, disposición en columna y una transición de
transformación y opacidad de tres décimas de segundo. Después vienen las reglas
de la cabecera, del bloque de la aplicación, del círculo del logotipo, del grupo
de acciones, de los dos botones de la cabecera, del cuerpo y de sus dos
variantes, de la imagen del saludo, que mide ciento ochenta y seis por ochenta y
seis píxeles, y del bloque de texto, con trece píxeles de tamaño y un
interlineado de uno y medio. La variante del cuerpo con saludo centra su contenido
y la variante sin saludo lo alinea al inicio.

El segundo bloque, en las líneas 207 a 232, está dentro de la consulta de
pantallas de hasta cuatrocientos ochenta píxeles, y es el que transforma la
pila. El contenedor pasa a estar fijo arriba, con ancho completo, sin invertir la
columna y con un relleno lateral; la tarjeta cambia sus esquinas para que solo
las inferiores sean redondeadas; y la imagen del saludo deja de mostrarse. Como
la inversión desaparece en esta consulta, la tarjeta de cookies pasa de abajo
arriba, que es donde la persona la encuentra sin tener que buscarla.

El tercer bloque está en las líneas 755 a 777. La primera regla le pone a la
tarjeta de cookies un filete lateral de cuatro píxeles. Las cuatro siguientes
definen la fila de los dos botones de decisión, el botón general y sus dos
variantes, con la primaria en el color del fondo terciario y la de rechazo en el
color de los elementos. Las cinco últimas defin la barra de acciones de los
avisos, el botón de acción, su variante al pasar el puntero, la variante de
barra múltiple y las dos variantes de color que el proyecto usa, la de peligro y
la de contorno.

## 8.12 La duplicación de reglas en la hoja del acceso

Las reglas del componente no están escritas en un solo lugar. Tres de ellas, las
que fijan el contenedor, la tarjeta y la imagen del saludo en pantalla pequeña,
están repetidas con los mismos valores en las líneas 390 a 414 de la hoja de
estilos del acceso, dentro de su consulta de pantallas de hasta cuatrocientos
ochenta píxeles.

La repetición no es visible, porque los valores son idénticos a los de las
líneas 207 a 232, pero sí es real: cualquiera de los archivos que importa esa
hoja recibe las tres reglas dos veces. Los cinco archivos que importan la hoja
del acceso son el formulario de acceso, el de registro, el de preferencias de
cultura y los dos formularios de contraseña, y los cinco montan este componente,
de manera que en esas pantallas el componente recibe reglas duplicadas de su
propio estilo.

Lo mismo ocurre con el bloque del globo de diálogo, que se documenta en el
capítulo VII y que también aparece en esa hoja. La causa común es que el
componente de acceso fue el primero que necesitó estas reglas y las copió dentro
de su hoja, y que después las reglas se trasladaron a la hoja de los elementos
pequeños sin borrar las copias.

## 8.13 Relación con los demás módulos del sistema

La unidad se relaciona con el resto del sistema por cuatro lados distintos, y
cada uno tiene su capítulo.

Por un lado se relaciona con el contexto de autenticación, cuyo papel en la
persistencia del consentimiento está descrito en el apartado 8.6 y cuyo
resto de responsabilidades no tiene capítulo propio. [PENDIENTE: documentar en
una pasada posterior el contexto de autenticación, que administra la sesión, las
credenciales y el consentimiento de cookies].

Por otro lado se relaciona con las pantallas que la montan, y el contrato con
ellas ya está descrito en el apartado 1.6 y en el 4.7, que son los dos puntos
donde el sitio documenta la referencia de notificaciones y el manejador
`avisar`. Las demás pantallas que la montan no tienen capítulo propio.

Por tercer lado se relaciona con el globo de diálogo del capítulo VII, porque
las dos piezas comparten el logotipo, la tipografía y la voz de la misma persona,
y también la hoja de estilos de los elementos pequeños, que es la que dibuja a
las dos. La diferencia de fondo es que el globo acompaña a un formulario y la
tarjeta acompaña a una acción. Las dos sí pueden aparecer a la vez, porque cinco
de las pantallas que montan el globo montan también este componente: son el
formulario de registro, el de preferencias de cultura, el de acceso, el de
solicitud de restablecimiento y el de reescritura de contraseña. En las dos
primeras, un globo ocupa el centro de la pantalla mientras las tarjetas se
apilan en la esquina inferior derecha, sin que una estorbe a la otra porque la
tarjeta no ocupa la pantalla.

Por último se relaciona con el panel de notificaciones de la barra lateral, que
es una pieza distinta y que el capítulo VI menciona como punto de integración
de la barra. Ese panel obtiene sus datos del servidor y no comparte estado con
esta unidad, de modo que una notificación del panel y una tarjeta emergente son
cosas distintas que conviven sin mezclarse.

## 8.14 Hallazgos, observaciones y asuntos pendientes

El ejercicio de documentar el archivo de avisos ha dejado once puntos que
conviene reportar al equipo sin modificar el código fuente.

El primero es el identificador que se descarta. La línea 50 genera un
identificador con la hora y la línea 51 lo coloca después de extender el objeto
recibido, de manera que cualquier identificador que el padre haya enviado se
sobrescribe. El detalle de video envía el identificador "video-eliminar" en su
línea 724 y después intenta retirar esa misma tarjeta en su línea 710, y como esa
tarjeta se guardó con el identificador de la hora, esa retirada no quita nada.
La llamada es inútil, aunque hoy no produce un defecto visible, porque el botón
que la dispara ya cerró la tarjeta antes: la línea 185 la retira con el
identificador que el propio componente generó. El problema es que la línea 710
es la única forma que tiene el detalle de video de asegurarse de que la
confirmación desaparezca en el camino feliz de la respuesta, y esa seguridad se
apoya en una llamada que nunca encuentra su tarjeta. [PENDIENTE: confirmar con el
equipo si el identificador que envía el padre debe respetarse o si la llamada de
la línea 710 debe retirarse por ser inútil].

El segundo es la colisión de identificadores. Como el identificador es la hora
en milisegundos, dos avisos agregados en el mismo milisegundo reciben el mismo
valor. En ese caso la lista tiene dos elementos con la misma clave, que es lo que
React utiliza para reconciliar, y la función de retirada los eliminaría a los dos
con una sola llamada.

El tercero es el botón de los tres puntos. La línea 141 declara un botón sin
ninguna acción asociada, y no hay en el proyecto ningún otro elemento con esa
clase. Es un control visible que la persona puede pulsar y que no produce ningún
efecto, lo que en una interfaz de avisos se lee como un botón que no funciona.

El cuarto es la propiedad de tipo que nadie lee. Los diez archivos que montan
el componente entregan un campo de tipo en todas sus llamadas, y el componente
nunca lo lee: el
elemento que se dibuja es siempre el mismo artículo con la misma clase, sin
ningún atributo que lo relacione con ese valor. La consecuencia es que todos los
avisos se ven igual, incluidos los que describen un error o un peligro, y que
cualquier regla de estilo que se quiera escribir después sobre esa distinción no
tendría dónde aplicarse.

El quinto es la propiedad de permanencia que nadie declara. La comprobación de
las líneas 165 y 184 está escrita para permitir que un aviso sobreviva al clic de
una de sus acciones, pero ninguna de las acciones del proyecto declara esa
propiedad, de manera que la rama que la respeta nunca se toma y las dos líneas
sobrescribe: es código muerto. La única acción de confirmación del sistema, la del
borrado de video, se cierra igual que el resto.

El sexto es la reserva por contenido de texto. La comparación de las líneas 42 y
43 depende de dos cosas que ninguna hoja de estilos ni ninguna constante
protege: la cadena exacta del título y la presencia de la palabra "cookies" en el
mensaje. Cualquier cambio en el texto de la tarjeta rompería la reserva, y
cualquier aviso nuevo que use ese título y mencione las cookies desaparecería
sin aviso. [PENDIENTE: confirmar con el equipo si conviene un identificador
explícito de tipo de aviso en lugar de comparar textos].

El séptimo es el conjunto de tres propiedades redundantes. Los tres archivos
que las entregan las toman del mismo contexto que el componente ya consulta, y
las entregan con el mismo valor, de manera que la resolución de las líneas 19 a
21 nunca llega a usar el camino del contexto en esos tres sitios. El mecanismo de
resolución sigue siendo necesario para los otros ocho montajes, pero en esos
tres la escritura es redundante.

El octavo es la duplicación de reglas en la hoja del acceso, descrita en el
apartado 8.12. Las tres reglas de pantalla pequeña existen en dos archivos y se
aplican dos veces en las cinco pantallas que importan la hoja del acceso.

El noveno es que los avisos no se retiran solos. Las líneas 53 y 54 del archivo
son un comentario y una llamada de espera con el plazo ya escrito de cinco
segundos, pero esa llamada está comentada, de manera que ningún aviso se borra
por sí solo: la lista solo pierde elementos cuando alguien pulsa la equis de la
tarjeta, cuando una acción decide cerrar su propia tarjeta o cuando el componente
se desmonta al cambiar de pantalla. Un aviso de error de una acción que la
persona no alcanzó a leer permanece en la esquina hasta que visita otra ruta.

El décimo es la transición sin efecto. La tarjeta declara una transición de
transformación y opacidad, pero ninguna de las dos propiedades cambia después de
que la tarjeta aparece, porque no hay ninguna clase que se agregue o se quite y
no hay ninguna animación declarada para ellas. La tarjeta entra y sale sin
movimiento, de manera que la transición solo se vería si en el futuro se le
agregara una clase de entrada.

El undécimo es que no hay región de anuncio. El contenedor es un elemento común
sin ningún papel ni atributo que indique que su contenido debe anunciarse, de
modo que una tarjeta que aparece después de una acción no se lee sola. La
consecuencia es más notable en los errores, que aparecen sin que la persona haya
pedido nada y compiten con el contenido que estaba leyendo.

[PENDIENTE: documentar en una pasada posterior las once pantallas que montan
este componente, porque de ellas tienen capítulo propio el detalle de
conversación, el detalle de video, la pantalla principal y la página
informativa, y las otras siete siguen sin documentar].

<!-- SALTO DE PÁGINA: el capítulo IX inicia en página nueva y su título va en
     una página sola (regla de formato 2). -->

# IX. La pantalla principal del sitio y su puerta de preferencias

## 9.1 Ubicación del módulo y papel dentro del sistema

El archivo documentado en este capítulo está en
`cliente/src/Componentes/Inicio/Inicio.jsx` y tiene sesenta y seis líneas. Es el
componente que el enrutador monta en la ruta `/`, de modo que es la unidad que
decide qué se ve en la pantalla principal del sitio. La particularidad de su
papel es que casi nada de lo que se ve en esa pantalla lo dibuja este archivo:
su función consiste en poner en su sitio las tres piezas que la componen, una
dentro de otra, y en decidir cuándo dos de ellas deben aparecer.

Las tres piezas son el listado de publicaciones de maquillaje, que ocupa la
mayor parte del alto; el formulario de preferencias de cultura, que solo aparece
para quien acaba de registrarse y todavía no ha elegido sus estilos; y la pila
de avisos emergentes que se acumulan en la esquina inferior derecha. El
componente no dibuja ninguna de las tres. La primera se la pide al módulo que
la produce, la segunda se la pide al módulo que la recoge y la tercera se la
pide al módulo de avisos, cuyo funcionamiento se describe en el capítulo VIII.

El lugar que ocupa en el árbol de la aplicación no es el de una página
sencilla. La ruta se declara en la línea 32 del archivo de rutas, dentro del
elemento de envoltura que el capítulo VI describe en el apartado 6.13, de manera
que este componente siempre queda dentro de la barra lateral y dentro del área
de contenido que esa envoltura reserva a su derecha. El archivo de rutas no
ofrece ninguna otra forma de montarlo, de manera que el margen que la barra
reserva y el fondo que la envoltura pinta son condiciones inseparables de esta
pantalla.

Tampoco es la única forma de llegar al mismo contenido. La ruta `/maquillajes`
no monta este componente: en la línea 41 del archivo de rutas se ve que esa
dirección la ocupa un archivo distinto, `RedirigirMaquillajes.jsx`, que se
limita a reenviar la navegación a la ruta inicial conservando los parámetros de
la consulta. Ese archivo no tiene capítulo propio en este documento, pero su
contrato es importante para entender por qué la pantalla principal es la única
dirección real del listado. [PENDIENTE: documentar en una pasada posterior el
archivo de reenvío, que es el único punto del sitio donde se traducen los
parámetros de cultura y subestilo que envía la enciclopedia].

## 9.2 Inventario de unidades documentadas

El archivo no declara constantes, ni funciones auxiliares, ni subcomponentes
propios, ni importa ninguna hoja de estilos. Todo lo que hace está dentro de una
sola función, `Inicio`, que se declara en la línea 7 con la línea 66 como cierre
y que se exporta únicamente con nombre. No existe una exportación por omisión,
a diferencia de lo que ocurre en el archivo de la ventana de alerta y en el de la
página informativa, y esa asimetría no tiene consecuencia práctica porque el
único consumidor del archivo lo importa con la forma con nombre.

La lista completa de unidades del archivo, con su ubicación exacta, es la
siguiente. La función `Inicio`, en las líneas 7 a 66, es la unidad central. La
referencia de avisos `notificationsRef`, en la línea 9, y el estado de cierre
`cerradoPreferencias`, en la línea 10, se documentan en los apartados 9.3 y 9.4.
El valor derivado `mostrarPreferencias`, en las líneas 21 a 24, se documenta en
el apartado 9.4. Los dos efectos que la función declara, en las líneas 12 a 17
y 26 a 40, se documentan en los apartados 9.5 y 9.6. El manejador
`completarPreferencias`, en las líneas 42 a 47, y el manejador en línea que la
propiedad de cierre del formulario recibe en la línea 58, se documentan en el
apartado 9.7.

Las cinco líneas de importación merecen una mención aparte. La línea 1 trae los
tres ganchos que el archivo usa, que son el efecto, el estado y la referencia;
la línea 2 trae el contexto de sesión; la línea 3 trae el módulo de avisos; la
línea 4 trae el formulario de preferencias; y la línea 5 trae el listado de
publicaciones. De esos tres últimos módulos, solo el de avisos tiene capítulo
propio en este documento, el VIII. El listado de publicaciones y el formulario
de preferencias todavía no están documentados y no se explican aquí: de ambos
solo se registra el contrato que este archivo establece, que es lo único que
corresponde a este capítulo. [PENDIENTE: decidir el orden en que se documentarán
el listado de publicaciones y el formulario de preferencias, que son los dos
módulos más grandes que quedan sin capítulo].

## 9.3 El contexto de sesión y la referencia de avisos

La línea 8 pide al contexto de sesión tres de sus valores y los desestructura
en el cuerpo del componente. Los tres son `isAuthenticated`, que es un valor de
verdad que dice si hay alguien conectado; `user`, que es el objeto con los datos
de esa persona; y `refreshUser`, que es la función que vuelve a pedir esos datos.
El contexto no está documentado en este documento, de modo que aquí solo se
registra qué se le pide y qué se hace con lo que devuelve, que es lo único que
interesa para entender este archivo.

Qué entrega el componente, en este punto del análisis, es la disponibilidad de
esos tres valores para el resto de su cuerpo: los dos efectos y la condición de
visibilidad los leen, y el manejador de cierre del formulario invoca al tercero.
A quién invoca es al mecanismo de contexto de la biblioteca de interfaz, que
devuelve el valor publicado por el proveedor del árbol; qué recibe es un objeto
con esos tres campos, y nada más.

La línea 9 declara la segunda unidad de estado del componente: la referencia
`notificationsRef`, que se inicializa con `null` y que sirve para alcanzar la
instancia del módulo de avisos una vez que existe en el árbol. La referencia no
guarda ningún dato del aviso ni lo modifica: es únicamente el puntero que
permite llamar al método de la instancia. El capítulo VIII explica ese método y
el contrato de la referencia; lo que este archivo hace con él se documenta en el
apartado 9.6. [PENDIENTE: documentar el proveedor de sesión, que decide qué
significa que el campo de preferencias ya esté guardado].

## 9.4 El estado de cierre y la condición de visibilidad

La línea 10 declara el estado `cerradoPreferencias`, un valor de verdad que
registra que la persona ya cerró el formulario de preferencias a mano durante
esta visita. El estado nace en `false` y solo hay dos caminos que lo cambian: el
manejador de la línea 58, que lo pone en `true` cuando se cierra el formulario,
y el efecto del apartado 9.5, que lo vuelve a poner en `false`. No hay ningún
otro manejador en el archivo que lo toque.

Las líneas 21 a 24 calculan el valor derivado `mostrarPreferencias`, que decide
si el formulario se monta. El cálculo es una conjunción de tres condiciones: que
haya sesión iniciada, que el campo `tienePreferencias` del objeto de usuario sea
exactamente `false` y que la persona no haya cerrado el formulario a mano. El
resultado no se guarda en ningún estado: se calcula en cada dibujado, de manera
que su valor siempre refleja los tres ingredientes del momento.

Qué hace el componente con ese valor es doble. Lo entrega al marcado, donde la
línea 56 lo usa como condición para montar o no montar el formulario, y lo
consume el módulo de preferencias, que no lo recibe como propiedad. Lo que
recibe el cálculo es ninguno: todo sale de los dos estados que ya se
describieron. El detalle que merece atención es la comparación estricta con
`false`, que no es lo mismo que comprobar que el campo no sea verdadero: mientras
la sesión se está cargando, el objeto de usuario es `null`, el acceso a su campo
devuelve `undefined` y la comparación es falsa, de modo que el formulario se
mantiene oculto hasta que el servidor responde. Ese comportamiento evita un
parpadeo, pero también significa que, si la respuesta del servidor dejara de
incluir ese campo, la puerta de preferencias no volvería a aparecer para nadie.
[PENDIENTE: confirmar con el equipo si el formulario de preferencias debe
aparecer también cuando el servidor no informa el campo, por ejemplo en una
visita de una cuenta creada antes de que el campo existiera].

## 9.5 El efecto que vuelve a considerar el formulario

El primer efecto del archivo, en las líneas 12 a 17, es el que pone a cero el
estado de cierre. Sus dependencias son dos: `isAuthenticated` y el campo
`tienePreferencias` del objeto de usuario. Lo que hace es programar, para el
siguiente turno de la cola de Promesas, la llamada que devuelve el estado de
cierre a `false`. No pide nada al servidor, no lee nada del almacenamiento y no
toca el marcado: su único efecto es que la puerta de preferencias vuelva a ser
considerada.

La forma en que programa el cambio merece una explicación, porque es una
decisión y no un descuido. La llamada no está escrita directamente en el cuerpo
del efecto sino dentro de `Promise.resolve().then(...)`, de modo que la
actualización del estado ocurre una vez que el dibujado actual ya terminó. La
razón que el propio archivo no documenta es que actualizar un estado de forma
sincrónica dentro de un efecto produce un segundo dibujado inmediato, y este
proyecto trabaja con una versión de la biblioteca de interfaz que avisa de esa
práctica. [PENDIENTE: confirmar con el equipo si conviene dejar el comentario
explícito que explique el rodeo, porque quien lea el efecto sin contexto puede
pensar que la Promesa vacía es un error].

Lo que este efecto produce contradice su propio comentario. Las líneas 13 a 15
afirman que el formulario se muestra una sola vez por sesión y que el cierre
manual lo descarta, pero como el efecto vuelve a poner el estado en `false`
cada vez que cambian sus dos dependencias, un cierre manual no descarta nada
mientras la visita siga viva: basta con que la persona cierre el formulario y
después vuelva a iniciar y cerrar sesión, o con que una actualización de sus
datos devuelva otra vez el campo en `false`, para que la puerta se vuelva a
abrir. El hallazgo correspondiente se registra en el apartado 9.10.

## 9.6 La bienvenida de una sola vez por sesión de navegador

El segundo efecto, en las líneas 26 a 40, es el que saluda a la persona cuando
entra con sesión iniciada. Sus dependencias son `isAuthenticated` y el objeto
`user` completo, de manera que vuelve a ejecutarse cuando cualquiera de los dos
cambia. La primera instrucción útil del cuerpo es una salida temprana: si no
hay sesión, el efecto termina ahí y no hace nada más.

Lo que decide a continuación es si el saludo ya se dio. La línea 28 declara el
nombre de la llave, que es `bienvenida_bunyk`, y la línea 29 lee de ella un
valor de verdad. Si la llave ya está puesta, el efecto termina sin saludar. Si
no, la línea 32 la escribe antes de hacer nada más, de manera que un segundo
montaje del componente en la misma pestaña no repite el saludo. La elección del
almacenamiento importa: se trata del almacenamiento de sesión del navegador, que
se conserva mientras la pestaña siga abierta y se descarta cuando se cierra,
a diferencia del almacenamiento local que usa el capítulo VIII para el
consentimiento de cookies.

Las líneas 33 a 39 construyen el aviso. La línea 33 calcula el nombre con el
que se saluda, y para eso toma primero el nombre de usuario y, si no hay, la
parte del correo que está antes de la arroba, y deja la cadena vacía si no hay
ninguno de los dos. La línea 34 llama al método de alta de la instancia de
avisos a través de la referencia, y las cuatro líneas siguientes describen el
aviso: el título, que es la fórmula que usa el capítulo VIII para las tarjetas
de Becky; el mensaje, que saluda, incluye el nombre cuando lo hay y sugiere
explorar el listado, la enciclopedia y la comunidad; el campo de tipo, que vale
`success`; y el indicador de imagen animada, que se activa.

Qué entrega el efecto es una tarjeta en la esquina de la pantalla y una entrada
en el almacenamiento de sesión. A quién invoca es a la instancia del módulo de
avisos, cuyo contrato se describe en los apartados 8.3 y 8.4 del capítulo VIII,
y al almacenamiento de sesión del navegador. Lo que recibe no lo recibe del
módulo de avisos, sino del contexto de sesión y del almacenamiento. El campo de
tipo que envía, como se registra en el cuarto hallazgo del apartado 8.14, no lo
lee nadie, porque el componente receptor no lo usa para elegir el aspecto de la
tarjeta.

## 9.7 El manejador `completarPreferencias` y la llamada al contexto

El manejador de las líneas 42 a 47 es el que se ejecuta cuando la persona
termina el formulario de preferencias. Lo primero que hace es poner el estado de
cierre en `true`, de manera que la puerta no vuelva a aparecer durante el resto
de la visita. Lo segundo es llamar a `refreshUser`, la función que el contexto
expone con ese nombre y que en realidad es la misma que pide los datos del
usuario al servidor cada vez que se la invoca. La idea es que la respuesta
traiga el campo de preferencias ya en `true`, y que entonces la condición del
apartado 9.4 deje de cumplirse por sí sola.

El manejador no espera la respuesta ni la inspecciona. No usa `await`, no
devuelve nada y no atrapa errores, de manera que el resto del dibujado no espera
al servidor. La consecuencia se describe en el apartado 9.10: la función que se
invoca vive en las líneas 10 a 23 del archivo de contexto y su bloque de
captura, en la línea 19, deja al usuario sin sesión cuando la petición falla, de
modo que un fallo de red en este instante puede cerrar la sesión de quien acaba
de guardar sus preferencias.

En el marcado, el mismo par de propiedades del formulario se completa con dos
manejadores distintos. La línea 58 entrega un manejador en línea que solo pone
el estado de cierre en `true`, y que es el camino que se toma cuando la persona
cierra el formulario sin completar. La línea 59 entrega el manejador completo,
que además refresca los datos. La diferencia entre los dos es la que decide si
la puerta puede volver a abrirse en el resto de la visita.

## 9.8 El marcado que devuelve el componente

Las líneas 49 a 65 son el cuerpo que la función devuelve. Empieza por un
fragmento, que es la forma que permite devolver varios hijos sin envolverlos en
un elemento, y contiene tres bloques. El primero, en las líneas 52 a 54, es un
elemento contenedor con la clase `maquillajes-fondo` que envuelve al listado de
publicaciones. Ese contenedor no existe por otra razón que la de dar un fondo y
una altura mínima a la pantalla completa, y su comportamiento se describe en el
apartado 9.9.

El segundo bloque, en las líneas 56 a 61, es la puerta de preferencias. Es una
expresión condicional que solo se dibuja cuando el valor derivado del apartado
9.4 es verdadero, y que entrega dos propiedades al módulo que la sirve: el
manejador de cierre y el manejador de finalización que ya se describieron. El
valor derivado no se pasa como propiedad, porque el módulo no lo necesita: la
decisión de dibujarlo ya está tomada antes de crearlo.

El tercer bloque, en la línea 63, es la instancia del módulo de avisos, a la que
se le entrega la referencia declarada en la línea 9. No se le entrega ninguna
propiedad de consentimiento de cookies, de manera que el capítulo VIII explica en
su apartado 8.10 que ese componente cae en su segunda fuente y lee el
consentimiento del contexto. Esa decisión tiene una consecuencia que se registra
como hallazgo, porque el formulario de preferencias dibuja su propia instancia
del módulo de avisos y le entrega el valor del consentimiento junto con los dos
manejadores de respuesta, como ya registra el apartado 8.10 del capítulo VIII.

Lo que entrega el componente, en conjunto, es el contenido principal de la ruta
inicial. Lo que recibe es nada: la función no declara propiedades, de modo que
el enrutador la monta sin entregarle ningún dato. A quién invoca es a tres
módulos: el listado de publicaciones, el formulario de preferencias y el de
avisos.

## 9.9 Hoja de estilos relacionada

El archivo no importa ninguna hoja de estilos. Es una decisión que conviene
dejar escrita, porque las dos únicas reglas que afectan a lo que este componente
dibuja están en archivos que él no carga: ninguna regla de este capítulo tiene su
origen en una hoja propia de la pantalla.

La regla que corresponde al contenedor de la línea 52 se declara en el archivo
`cliente/src/estilos/MaquillajesEstilos/maquillajes.css`, en las líneas 4 a 7,
con el nombre `.maquillajes-fondo`. Esa hoja la importa el módulo del listado de
publicaciones en su línea 12, no este archivo. La regla pinta el fondo con el
color general de la aplicación y fija una altura mínima igual al alto de la
ventana, con lo que el contenedor cubre toda la pantalla aunque el listado tenga
pocas publicaciones.

La segunda regla que le afecta no está en esa hoja sino en la de la envoltura de
la aplicación: el área de contenido que el capítulo VI describe en su apartado
6.13 se identifica con la clase `app-main` y ya pinta el mismo color de fondo en
las líneas 1 a 6 de `cliente/src/layout/AppLayout.css`. Es decir, el fondo que
el contenedor de este archivo pinta ya estaba pintado por su contenedor
inmediato, de manera que la regla solo aportaría algo si la pantalla se montara
fuera de la envoltura, cosa que el archivo de rutas no permite. El hallazgo
correspondiente queda registrado en el apartado 9.10, junto con el de la hoja que
este archivo no carga.

## 9.10 Hallazgos, observaciones y asuntos pendientes

El ejercicio de documentar la pantalla principal ha dejado diez puntos que
conviene reportar al equipo sin modificar el código fuente.

El primero es que hay dos instancias del módulo de avisos cuando la puerta de
preferencias está abierta. La línea 63 monta una instancia y la línea 57 monta
el formulario de preferencias, que en sus líneas 217 a 222 monta su propia
instancia del mismo módulo. Las dos están en pantalla al mismo tiempo, cada una
con su propio estado local de tarjetas y su propio estado de si la tarjeta de
cookies ya fue apartada. El apartado 8.10 ya deja escrito que las dos leen el
mismo valor del consentimiento, de modo que aceptar en una aparta la tarjeta en
las dos; pero antes de que eso ocurra, una
persona sin consentimiento previo ve dos tarjetas de cookies idénticas apiladas
en la misma esquina. [PENDIENTE: confirmar con el equipo si el formulario de
preferencias debe recibir la referencia de avisos de su anfitrión en lugar de
crear la suya, o si la pantalla principal debe dejar de montar su propia
instancia mientras la puerta esté abierta].

El segundo es que la clase que este archivo crea se pinta con una hoja de estilos
que este archivo no importa. La línea 52 declara el contenedor y la clase está
definida en las líneas 4 a 7 de la hoja del listado de publicaciones, que solo
ese módulo importa. Mientras los dos se monten juntos el resultado es correcto,
pero la dependencia es invisible: si el listado llegara a descargarse por
separado o a desmontarse, el contenedor se quedaría sin fondo y sin altura
mínima, y nadie lo notaría en el editor de código. [PENDIENTE: confirmar con el
equipo si conviene declarar el fondo en la hoja de la envoltura, que ya lo
pinta, o si conviene mover la regla a una hoja propia de esta pantalla].

El tercero es que el fondo se pinta dos veces. La regla del contenedor y la de
la clase `app-main` de la envoltura declaran el mismo color de fondo para el
mismo espacio visible. La duplicación no produce ningún defecto porque ambas
pintan lo mismo, pero hace que el color de fondo del sitio tenga dos fuentes y
que cambiarlo obligue a revisar los dos lugares. [PENDIENTE: confirmar con el
equipo si el contenedor de la línea 52 debe conservar alguna regla propia o si
puede reducirse a una estructura sin clase].

El cuarto es que el reinicio del estado de cierre contradice el comentario del
propio efecto. Las líneas 13 a 15 dicen que el cierre manual descarta la puerta,
pero el efecto las contradice: como vuelve a poner el estado en `false` cada vez
que cambian la sesión o el campo de preferencias, la puerta se reabre tras un
cierre manual en cuanto la persona vuelve a entrar y salir de su cuenta dentro
de la misma visita. [PENDIENTE: confirmar con el equipo si el cierre manual debe
sobrevivir a los cambios de sesión dentro de la misma visita].

El quinto es que la condición de visibilidad no distingue entre el campo
ausente y el campo en falso. La línea 23 compara con `false` de forma estricta,
lo que mantiene oculta la puerta mientras la sesión se carga, que es lo que se
quiere, pero también la ocultaría para siempre si el servidor dejara de enviar
ese campo. No hay ninguna marca de carga que permita diferenciar los dos casos.
[PENDIENTE: confirmar con el equipo si conviene pedir un valor por omisión
explícito para el campo de preferencias en la respuesta del servidor].

El sexto es que la llamada que refresca los datos no se espera ni se vigila. La
línea 46 llama a la función del contexto sin `await` y sin bloque de captura,
pero esa función tiene un bloque de captura propio que, cuando la petición
falla, deja al usuario sin sesión. Como el manejador se dispara en el momento en
que la persona acaba de guardar sus preferencias, un fallo de red en ese instante
puede cerrarle la sesión y perder de vista el formulario recién completado.
[PENDIENTE: confirmar con el equipo si conviene esperar la respuesta y, en caso
de fallo, avisar con una tarjeta en lugar de perder la sesión].

El séptimo es que el saludo se recuerda por pestaña y se registra antes de
existir. La línea 32 escribe la llave de la bandera en el almacenamiento de
sesión antes de que la tarjeta se cree, de manera que, si la instancia de avisos
todavía no estuviera montada cuando el efecto corre, la llamada opcional de la
línea 34 no haría nada y el saludo se perdería para el resto de la pestaña sin
reintentarse. Además, como el almacenamiento de sesión pertenece a la pestaña,
abrir una segunda pestaña con la misma cuenta vuelve a saludar, lo cual es
coherente con la intención declarada en el comentario pero no con la idea de
saludar una sola vez a cada persona. [PENDIENTE: confirmar con el equipo si la
memoria del saludo debería durar la sesión del navegador o la del servidor].

El octavo es que el saludo envía dos propiedades que nadie lee. El campo de tipo
con el valor `success` y el indicador de imagen animada se declaran en las líneas
37 y 38, y el componente receptor no consulta ninguno de los dos, como se
registra en el cuarto hallazgo del apartado 8.14 del capítulo VIII. La tarjeta
del saludo se ve exactamente igual que un error, de modo que quien la lea no
puede distinguir por su aspecto que el saludo es un anuncio de bienvenida.
[PENDIENTE: confirmar con el equipo si conviene que el componente de avisos use
esas dos propiedades para cambiar el aspecto de la tarjeta].

El noveno es que el archivo no tiene hoja de estilos propia. Cualquier ajuste
visual de esta pantalla obliga a editar la hoja del listado de publicaciones, lo
que invierte la dependencia natural entre los módulos y hace difícil saber qué
parte de esa hoja pertenece a cuál. Los tres archivos de los capítulos VI a VIII
sí declaran su relación con las hojas que usan: los tres importan la hoja
pequeña compartida y el capítulo VI registra esa decisión en su noveno
hallazgo. [PENDIENTE:
confirmar con el equipo si conviene crear una hoja propia para esta pantalla o
si la pantalla debe considerarse parte del módulo del listado].

El décimo es que no hay estado de carga para lo que la pantalla decide. La puerta
de preferencias y el saludo dependen de datos que llegan de la red, y mientras
llegan lo único que se dibuja es el listado. Como el propio listado tiene su
propio estado de carga, el efecto final es tolerable, pero la pantalla no puede
explicar por qué la puerta todavía no apareció. [PENDIENTE: confirmar con el
equipo si hace falta un indicador de carga propio mientras se resuelve la
sesión].

Por último, conviene dejar constancia de lo que **sí** quedó verificado. El
componente es el único punto que monta el listado de publicaciones como
contenido principal, de modo que cualquier cambio en la ruta inicial afecta a la
pantalla principal completa; el módulo del listado también se importa en la
línea 8 del archivo de perfil, pero solo para reutilizar la tarjeta de una
publicación. La condición de visibilidad es correcta para el
caso normal, en el que el servidor informa el campo de preferencias, y el
recorrido completo —saludo, apertura de la puerta, elección de estilos, refresco
y cierre— no deja ninguna llamada suelta ni ninguna propiedad sin destino. Lo
que resta por documentar de esta pantalla es el interior de los dos módulos que
monta, y ambos tienen ya un lugar natural en el orden de capítulos que sigue a
este.

<!-- SALTO DE PÁGINA: el capítulo X inicia en página nueva y su título va en
     una página sola (regla de formato 2). -->

# X. La página informativa del proyecto y su catálogo de culturas

## 10.1 Ubicación del archivo y papel dentro del sistema

El archivo documentado en este capítulo está en
`cliente/src/Componentes/Inicio/InfoInicio.jsx` y ocupa noventa y seis líneas. Es
el componente que el enrutador monta en la ruta `/informacion`, y su función es
la más estática de todo el cliente: no pide nada al servidor, no guarda estado y
no recibe datos de nadie. Su contenido es texto editorial del proyecto y una
retícula de ocho tarjetas que llevan a la enciclopedia de estilos.

La pantalla se monta dentro del elemento de envoltura que el capítulo VI
describe en el apartado 6.13, y el acceso que la abre es el sexto elemento de
la barra de navegación lateral, declarado en la línea 29 de `BarraLateral.jsx`
y detallado en el apartado 6.3. El estado activo de ese elemento lo deriva el
mismo archivo, como explica el apartado 6.5.

Lo que la página intenta resolver es un problema de orientación. Quien llega al
sitio puede registrarse, publicar y opinar, pero no tiene a la vista qué es el
proyecto ni qué culturas existen. Esta pantalla responde a esa pregunta con tres
bloques: un encabezado con el nombre y el lema, dos secciones que explican la
misión y el público, y la retícula con las ocho culturas que la enciclopedia
desarrolla después. La relación con el resto del sitio es de una sola
dirección: la enciclopedia puede devolver a la pantalla principal con el filtro
de una cultura aplicado, y esta pantalla solo navega hacia adelante.

Una aclaración de alcance es necesaria antes de seguir. Este archivo comparte
carpeta con el de la pantalla principal, pero no comparte nada con él: no hay
importaciones entre ambos, ni estado común, ni hoja de estilos común. La
carpeta agrupa exactamente las dos pantallas de entrada del sitio, y el
archivo de reenvío de la ruta antigua de publicaciones no está en ella, sino
en la carpeta del módulo de lista. [PENDIENTE: confirmar con el equipo si
conviene renombrar la carpeta, porque su nombre sugiere una sola pantalla de
entrada cuando contiene dos].

## 10.2 Inventario de unidades documentadas

El archivo declara tres unidades de nivel superior y ninguna más. La primera es
el diccionario `TAGLINES`, en las líneas 5 a 14, que se documenta en el
apartado 10.3. La segunda es la función auxiliar `iniciales`, en las líneas 16 a
23, que se documenta en el apartado 10.4. La tercera es el subcomponente
`Sello`, en las líneas 25 a 33, que se documenta en el apartado 10.5. La unidad
que da nombre al capítulo es la función `InfoInicio`, en las líneas 35 a 94, que
se documenta en los apartados 10.6 a 10.8.

El archivo no declara estados, ni efectos, ni manejadores, ni funciones
auxiliares de otro tipo, ni tipos. Su bloque de importaciones ocupa tres líneas y
se reduce a tres piezas: el enlace de navegación en la línea 1, el archivo de
datos de la enciclopedia en la línea 2 y la hoja de estilos del módulo en la
línea 3. La ausencia de ganchos de ciclo de vida es la prueba formal de que la
página es estática: no hay nada que se ejecute después de dibujarla.

El archivo se exporta dos veces. La línea 35 lo hace con nombre y la línea 96 lo
hace por omisión. El archivo de rutas lo importa con la forma con nombre, de
modo que la exportación por omisión no la usa nadie en el repositorio. El
apartado 10.10 recoge el hallazgo correspondiente, que es el mismo que ya se
documentó para otro archivo del cliente en el primer hallazgo del apartado 3.9.

## 10.3 El diccionario `TAGLINES`

El diccionario `TAGLINES` ocupa las líneas 5 a 14 y es el objeto de texto más
importante del archivo, porque es la única fuente de las frases que aparecen
bajo el nombre de cada cultura. Sus claves son enteros del uno al ocho y sus
valores son ocho frases breves, cada una con punto final. El orden de las claves
sigue el orden de las culturas en el archivo de datos: gótico, emo, punk, lolita,
visual kei, gyaru, principiante y la de tendencias de pantalla.

Lo que hace el diccionario no es calcular nada: es asociar un identificador con
una cadena. No recibe argumentos, no se llama, no devuelve valores y no tiene
ningún método. Su único consumidor es la línea 82, que lo indexa con el
identificador de la cultura que se está dibujando. La forma en que se usa es
una lectura directa de propiedad, sin función auxiliar ni valor por omisión, de
modo que una cultura sin frase devolvería `undefined` y el elemento de párrafo
se dibujaría vacío en lugar de desaparecer.

Dónde se busca esa frase tiene una consecuencia que vale la pena señalar. El
resto del contenido editorial de las culturas vive en el archivo de datos de
la enciclopedia, que es la fuente de verdad del sitio y que todavía no tiene
capítulo propio, mientras que estas ocho frases viven en el componente. La
consecuencia es que el texto de la portada y el texto de la enciclopedia
pueden quedar desalineados sin que ninguna verificación lo note. [PENDIENTE:
confirmar con el equipo si estas frases deben pasar al archivo de datos, que
ya es la fuente única de las culturas].

## 10.4 El auxiliar `iniciales`

La función `iniciales` ocupa las líneas 16 a 23 y es una cadena de cinco pasos
encadenados sobre el nombre de una cultura. Su firma declara un valor por
omisión, de manera que si se llama sin argumento entrega una cadena vacía en
lugar de fallar. A partir de ahí, el algoritmo normaliza el nombre: primero le
quita los espacios de los extremos, después lo parte por cualquier cantidad de
espacios seguidos, después descarta los fragmentos que quedaron vacíos, después
se queda con los dos primeros fragmentos y, por último, toma la primera letra de
cada uno de esos dos fragmentos, la pasa a mayúscula y las une sin separador.

La forma en que se declara es una función de flecha asignada a una constante,
con el cuerpo partido en varias líneas para que cada paso ocupe una. No recibe
más que el nombre, no devuelve un objeto, no lanza errores ante entradas raras
y no captura nada, porque todas las operaciones son de cadena y todas están
protegidas por el valor por omisión.

Quién la invoca es el subcomponente `Sello`, en la línea 31, y solo ahí. A qué
invoca no invoca nada: no usa el sistema, ni la red, ni el contexto de sesión.
Qué entrega es una cadena de hasta dos letras en mayúscula, que es lo que la
hoja de estilos del apartado 10.9 usa como contenido del sello.

El detalle que conviene dejar anotado es el recorte a dos fragmentos. De los
ocho nombres actuales, solo uno tiene dos palabras, de manera que el recorte
produce un sello de dos letras en esa cultura y una sola inicial en las otras
siete; pero un nombre de tres palabras perdería silenciosamente su tercera
inicial, y el sello no lo indicaría de ninguna manera. [PENDIENTE: confirmar
con el equipo si el recorte a dos iniciales es el comportamiento deseado].

## 10.5 El subcomponente `Sello`

El subcomponente `Sello` ocupa las líneas 25 a 33 y es el elemento visual que
identifica cada cultura en la retícula. Su firma recibe una sola propiedad,
`cultura`, y devuelve directamente el marcado, sin cuerpo de función con
instrucciones, porque no hay nada que calcular aparte de las iniciales.

El elemento que dibuja es un `span` con cuatro propiedades. La primera es la
clase `info-sello`, que la hoja de estilos del apartado 10.9 usa para darle
forma de cuadro redondeado. La segunda es un estilo en línea que declara la
variable `--wiki-color` con el color que trae la cultura en el archivo de datos,
de manera que cada sello recibe el color de su cultura sin necesidad de una clase
por cultura. La tercera es `aria-hidden="true"`, que oculta el contenido a los
lectores de pantalla porque el nombre de la cultura ya aparece escrito en el
encabezado de la tarjeta. La cuarta son las iniciales que produce el auxiliar del
apartado 10.4.

Lo que entrega es un adorno. Lo que recibe es el objeto de la cultura, del que
solo lee el nombre y el color; el campo de imagen que también existe en el
archivo de datos no se lee, como se registra en el apartado 10.10. A quién
invoca es al auxiliar `iniciales`, y solo a él. No se monta en ningún otro lugar
del repositorio, porque está declarado dentro de este archivo y no se exporta.

## 10.6 La función `InfoInicio` y el consumo del archivo de culturas

La función `InfoInicio` ocupa las líneas 35 a 94 y es la unidad que el enrutador
monta. No declara parámetros, de manera que el enrutador la monta sin
entregarle ningún dato. Lo único que hace antes de dibujar es la línea 36, donde
crea la constante `culturas` con el contenido del archivo de datos importado en
la línea 2. La asignación no transforma nada: el nombre y el valor son el mismo
objeto, de manera que la constante existe solo por comodidad de lectura.

La lista tiene hoy ocho entradas con identificadores del uno al ocho, y cada
entrada trae entre cuatro y dieciséis subestilos, según la cultura. La forma
en que la página los recorre es un `map` sobre ese arreglo en la línea 73, con
una clave por identificador para que la biblioteca de interfaz pueda reconocer
cada tarjeta cuando el orden cambie.

Lo que entrega la función es el árbol completo de la página. A quién invoca, en
sentido estricto, es al auxiliar `iniciales` y al enlace de navegación, y en un
sentido más amplio al archivo de datos, que es el único insumo externo que
consume. Lo que recibe del exterior es nada: ni propiedades, ni contexto de
sesión, ni parámetros de ruta, ni peticiones. Por eso la página se ve igual
antes y después de que el servidor responda, y por eso tampoco tiene estado de
carga ni de error que declarar.

## 10.7 El encabezado y las dos secciones de texto

Las líneas 39 a 68 dibujan los tres primeros bloques de la página. El primero es
un `div` raíz con la clase `info-page`, que existe para dar fondo y altura a la
pantalla, y dentro de él un contenedor con la clase `info-contenedor` que
centra el contenido y reparte los bloques verticalmente. El segundo bloque es un
encabezado semántico con tres piezas: una línea pequeña con el nombre del
proyecto en versalitas, un encabezado de primer nivel con el lema del sitio y un
párrafo de presentación.

El párrafo de presentación merece una nota, porque su texto no se deriva de los
datos. Está escrito a mano en las líneas 45 a 47 y nombra seis culturas: gótico,
emo, punk, lolita, visual kei y gyaru. El archivo de datos trae ocho. Las dos
que faltan en la redacción son la cultura de principiantes y la de tendencias de
pantalla, que son las dos últimas del archivo. La enumeración no es obligatoria,
pero sí es el único punto de la página donde el texto escrito a mano y el
archivo de datos deberían coincidir, y hoy no coinciden.

El tercer bloque son dos secciones de texto, cada una con un encabezado de segundo
nivel y un párrafo largo. La primera explica la misión y la segunda, el público
al que se dirige el sitio. Ambas declaran el atributo que las asocia a su
encabezado mediante un identificador, de manera que un lector de pantalla puede
anunciar la sección por su título. Los dos títulos llevan el filete corto y el
punto de color que la hoja de estilos del apartado 10.9 define, de modo que el
texto se lee visualmente dividido sin necesidad de cajas.

## 10.8 La retícula de culturas y el contrato con la enciclopedia

Debajo, una retícula contiene una tarjeta por cultura, y la tarjeta completa
es un enlace de navegación: eso significa que el área sensible y el anillo de
foco cubren el sello, el nombre, la frase y el conteo de subestilos, y que el
nombre accesible del enlace lo compone el texto visible de la tarjeta.

La dirección del enlace se construye en la línea 76 con el identificador de la
cultura, de manera que la retícula es la única fuente de esos enlaces y el
contrato con la enciclopedia se reduce a un formato: una ruta con el número de la
cultura. Ese contrato es el mismo que el que consume el botón de utilizar un
estilo de la enciclopedia, salvo que allí el parámetro viaja también con el
identificador del subestilo, dato que esta página no envía porque no necesita
filtrar por subestilo.

El contenido de la tarjeta tiene cuatro piezas. El sello del apartado 10.5 va
primero. Luego viene el nombre de la cultura en un encabezado de tercer nivel, de
modo que la jerarquía de títulos de la página queda completa y sin saltos. La
tercera es la frase del diccionario del apartado 10.3. La cuarta es el conteo de
subestilos, escrito en dos líneas: la primera extrae la longitud de la lista con
una lectura que sustituye por cero cuando la lista no existe, y la segunda
decide entre el singular y el plural comparando esa misma longitud con uno. La
protección contra la lista ausente hace que el archivo de datos pueda llegar sin
campo `subestilos` sin romper la página, aunque en ese caso la tarjeta se
dibujaría con un cero que no significa nada.

## 10.9 Hoja de estilos del módulo

El archivo importa su hoja en la línea 3, que es la primera forma de dejar
constancia de que la página tiene estilos propios y de que no comparte
ninguno con los demás módulos del cliente. La hoja vive en
`cliente/src/estilos/InicioEstilos/info-inicio.css` y ocupa ciento setenta
líneas, de las cuales la primera es un comentario que identifica la ruta a la
que pertenece la hoja.

Las líneas 4 a 7 fijan el fondo y la altura mínima del elemento raíz; las
líneas 9 a 16 centran el contenido con un ancho máximo de mil ciento ochenta
píxeles, un relleno de veintiocho por veinte por cuarenta y ocho píxeles y una
separación de treinta y dos píxeles entre bloques. El encabezado ocupa las
líneas 18 a 47: la línea 24 reduce el nombre del proyecto a trece píxeles con
separación amplia entre letras y color de acento fuerte; el lema de las líneas
33 a 39 baja a treinta y dos píxeles con peso seiscientos; y el párrafo de
presentación se limita a una medida de sesenta y dos caracteres por línea, que
es lo que evita que el texto se extienda de lado a lado en pantallas anchas.

Las secciones ocupan las líneas 50 a 84. Los dos selectores de las líneas 50 a 55
apilan sus hijos verticalmente. El título de segundo nivel de las líneas 57 a 65
se apoya en un filete de un píxel y, mediante el pseudoelemento de las líneas 67
a 76, le superpone un segmento de tres píxeles con el color de acento, que es el
mismo recurso que usan los títulos de la enciclopedia. El párrafo de sección se
limita a setenta caracteres por línea.

La retícula ocupa las líneas 87 a 151. El número de columnas es automático,
con un mínimo de ciento ochenta píxeles y separación de catorce píxeles, de
manera que la retícula se adapta sin que el marcado declare cuántas columnas
hay. La tarjeta usa el color de superficie del sistema, un borde de un píxel,
radio de dieciséis píxeles y una transición de ocho centésimas de segundo que
afecta al color del borde, al desplazamiento vertical y a la sombra. Las tres
propiedades sí cambian cuando la tarjeta recibe el puntero o el foco, de modo
que la transición no es decorativa. El anillo de foco se dibuja con tres
píxeles del color de acento fuerte y dos de separación, que es el mismo token
que el capítulo VI documenta en los contornos de foco de la barra lateral. El
sello de las líneas 118 a 130 es un cuadrado de cincuenta y dos píxeles con
radio de catorce, texto blanco y un degradado diagonal que va del color de la
cultura a un morado oscuro escrito a mano.

Las líneas 154 a 170 cierran la hoja con dos bloques de adaptación. El primero
reduce el relleno del contenedor y el mínimo de columna de la retícula en
pantallas estrechas. El segundo anula la transición y el desplazamiento cuando
la persona pidió menos movimiento en su sistema, con la misma intención que el
capítulo VIII documenta para las tarjetas de avisos.

## 10.10 Hallazgos, observaciones y asuntos pendientes

El ejercicio de documentar la página informativa dejó diez puntos que conviene
reportar al equipo sin modificar el código fuente.

El primero es que el archivo se exporta dos veces. La línea 35 declara la
exportación con nombre y la línea 96 la exportación por omisión, y solo la
primera se usa en el repositorio. El mismo patrón ya se documentó en el primer
hallazgo del apartado 3.9 para el archivo de la ventana de alerta, de manera que
lo que hay aquí no es una excepción sino una regla del cliente que podría
normalizarse de una sola vez. [PENDIENTE: confirmar con el equipo si el
proyecto quiere fijar una forma de exportación única para todo el cliente].

El segundo es que las frases de las culturas viven en el componente y no en el
archivo de datos. El diccionario de las líneas 5 a 14 contiene las ocho frases,
mientras que el resto del contenido editorial vive en el archivo que la
enciclopedia usa como fuente de verdad. La línea 82 lo indexa sin valor por
omisión, de manera que una cultura nueva añadida al archivo de datos sin frase
equivalente produciría un párrafo vacío en vez de un error visible. [PENDIENTE:
confirmar con el equipo si las frases deben migrar al archivo de datos o si
deben mantener una clave de reserva en el componente].

El tercero es que la retícula ignora la imagen que el archivo de datos sí
trae. Las ocho culturas tienen una dirección de imagen en el archivo de datos,
pero este componente nunca la lee y dibuja siempre el sello de iniciales. La
consecuencia no es un error, sino que la página informativa muestra una versión
del proyecto más pobre que la enciclopedia, que sí usa las fotografías.
[PENDIENTE: confirmar con el equipo si la portada debe mostrar las fotografías
reales].

El cuarto es que el texto de presentación nombra seis culturas de las ocho. Las
líneas 45 a 47 mencionan gótico, emo, punk, lolita, visual kei y gyaru, y dejan
fuera la cultura de principiantes y la de tendencias de pantalla, que son las dos
últimas del archivo de datos. Como la enumeración es el único punto de la página
donde la redacción manual debería coincidir con los datos, conviene decidir si se
corrige el texto o si la omisión es deliberada. [PENDIENTE: confirmar con el
equipo si la enumeración debe incluir las ocho culturas].

El quinto es que el color de la cultura entra en la página sin ajuste de
contraste. Las líneas 28 y 78 inyectan el color crudo en la variable de estilo,
mientras que la enciclopedia, en sus líneas 59, 245 y 427, acompaña esa misma
variable de un valor de tinta calculado con una función que mezcla el color con
un morado oscuro hasta que cumple el contraste mínimo. Aquí no hay equivalente,
de modo que un color de cultura claro produciría un sello con poco contraste
contra el blanco de sus iniciales. [PENDIENTE: confirmar con el equipo si la
página necesita el mismo ajuste o si las ocho culturas actuales ya cumplen el
contraste con sus colores].

El sexto es que dos colores de la hoja están escritos a mano. La línea 128
termina el degradado del sello con un morado oscuro y la línea 110 define la
sombra de la tarjeta con un morado translúcido. Ninguno de los dos es una
variable del sistema, y por eso no acompañan a un cambio de paleta: los dos
son oscuros, de modo que hoy el efecto no se ve ni en el modo claro ni en el
oscuro, pero cualquier ajuste futuro de los colores del sistema no los
alcanzará. El resto de la hoja, en cambio, sí usa variables para colores,
pesos y superficies.

El séptimo es que el plural está escrito dentro del marcado. Las líneas 84 y 85
resuelven la concordancia con una comparación dentro de una expresión, de manera
que la tarjeta mezcla texto con lógica de idioma. Es un detalle menor de estilo,
pero conviene resolverlo igual que en el resto del documento: con un auxiliar
que reciba el número y entregue el texto completo.

El octavo es que la constante de la línea 36 no hace nada. `culturas` recibe el
archivo de datos sin transformarlo, de manera que el recorrido de la línea 73
podría usar directamente el nombre importado. No es un defecto, pero es una
línea que sugiere una transformación que no existe y que puede confundir a
quien lea el archivo buscando un filtro o un orden que no están ahí.

El noveno es que el auxiliar `iniciales` recorta a dos palabras sin avisar. La
línea 21 se queda con los dos primeros fragmentos del nombre, de manera que un
nombre de tres palabras mostraría solo las dos primeras iniciales. Con los
ocho nombres actuales el recorte solo se nota en la única cultura cuyo nombre
tiene dos palabras, que se dibuja con dos iniciales y no con una, así que el
hallazgo queda como una decisión de diseño no declarada más que como un
defecto. [PENDIENTE: confirmar con el equipo cuántas iniciales debe mostrar el
sello].

El décimo es que la página no declara un punto de referencia de contenido. El
elemento raíz de la línea 39 es un `div` común, no una región de contenido, de
modo que la página se apoya en la región principal que la envoltura de la
aplicación aporta. Mientras la ruta se monte dentro de esa envoltura, como
ocurre hoy, existe un punto de referencia de contenido; si alguna vez se montara
fuera, la página quedaría sin él. No es un defecto actual, pero conviene que la
decisión quede escrita.

Por último, conviene dejar constancia de lo que **sí** quedó verificado. La
página no depende de la red, de modo que no puede quedar en un estado de carga ni
de error, y su contenido es idéntico para toda persona que la visite. La
jerarquía de títulos es correcta: un encabezado de primer nivel en la línea 43 y
tres de segundo nivel en las líneas 52, 61 y 71, con las tarjetas en tercer
nivel. Los dos títulos de sección se anuncian por su nombre gracias al atributo
que los asocia a su encabezado, y el sello se oculta a los lectores de pantalla
porque su contenido ya está escrito al lado. El conteo de subestilos no falla
aunque una cultura llegue sin lista, y el enlace de cada tarjeta cubre toda su
superficie con un anillo de foco visible. Lo que queda por documentar del sitio
sigue siendo el módulo de la enciclopedia, que es quien recibe los enlaces que
esta página construye.
