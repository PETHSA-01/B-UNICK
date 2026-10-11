# Descripción detallada: apartado de Video (RQFN100-120)

## 1. Concepto general

Es una vista de cine: dos paneles fijos de ancho completo de pantalla. A la izquierda, el video ocupa todo el alto y domina la composición (es la publicación, el elemento que debe verse primero). A la derecha, un panel angosto y sobrio concentra toda la información y las acciones, sin competir visualmente con el video. No hay tarjetas con sombra ni bordes gruesos: la separación entre secciones se resuelve con líneas finas de 1px y espacio en blanco, siguiendo el mismo criterio minimalista que ya usan Perfil y la Wiki.

Los wireframes usan negro puro y rosa saturado como placeholders de "aquí va color". En la versión real de B-unick esos dos roles se cubren así:

| Rol en el wireframe | Token real del proyecto |
|---|---|
| Fondo negro del video | `#2f2638` (la tinta oscura que ya usa la Wiki en sus sellos), no negro puro |
| Rosa/magenta de botones y acentos | `--color-acento-fuerte` (#6B4E8C) como color de acción principal |
| Rosa claro de íconos secundarios | `--color-acento` (#f4b8d4) / `--color-acento2` (#e89abf) |
| Panel blanco de información | `--color-fondo` (#f5f0f8) de base, con tarjetas y popovers en blanco puro |
| Texto de relleno gris | `--color-p` (#493553) para texto principal, `--color-texto-suave` (#5E4380) para lo secundario |
| Bordes de popovers | `--color-fondo3` (#c9b8de), 1.5px |
| Ícono de eliminar | `#b3425f`, el mismo tono "peligro" que ya usan `.perfil-gear-item--peligro` y `.perfil-btn--danger` |

## 2. Estructura general

```
┌───┬──────────────────────┬─────────────────────────────┐
│ ✕ │                      │  avatar  Usuario   [Seguir]  │
│   │                      │  Descripción…                │
│ ⚙ │       VIDEO           │  #etiqueta #etiqueta (…)     │
│ 💬│                      │  Gótico ▾   Romántico ▾       │
│ 📄│                      │  ⭐xx  ✓xx%  🔖xx  ↗xx        │
│ 🖼️│                      │ ──────────────────────────── │
│   │                      │  (comentarios / pasos / …)   │
└───┴──────────────────────┴─────────────────────────────┘
```

- El panel izquierdo del video tiene, en su esquina superior, un botón circular de cerrar (✕) que regresa a Maquillajes.
- Sobre el borde del video, verticalmente centrados, van los íconos flotantes que cambian lo que se muestra en el panel derecho.
- El panel derecho es una sola columna con `padding` generoso, sin recuadros: cabecera, estadísticas, una línea divisoria, y debajo el contenido de la pestaña activa.

## 3. Panel de video (izquierda)

- Fondo `#2f2638`. El video real se reproduce a pantalla completa dentro de este panel; mientras carga se muestra ese mismo tono con un leve degradado hacia `--color-fondo3` al 10%, igual que los marcadores de imagen de Maquillajes, para que no se sienta un placeholder genérico sino parte de la misma familia visual.
- El botón de cerrar es un círculo de 36px, fondo blanco, ícono `--color-h1`, con foco visible en `--color-acento-fuerte`.
- Controles de reproducción (play/pausa, avance) van sobre el video con la misma lógica: fondo translúcido oscuro, ícono blanco, trazo 1.5, sin bordes duros.

### Íconos flotantes de navegación interna

Son 3 o 4 círculos de 44px, apilados verticalmente sobre el borde entre video y panel, con fondo `rgba(255,255,255,0.14)` y desenfoque, ícono blanco de trazo 1.5. Al pasar el cursor o estar activo, el fondo pasa a `--color-acento-fuerte` sólido:

1. **💬 Comentarios** — vista por defecto del panel derecho.
2. **📄 Descripción y pasos** — solo visible en tutoriales.
3. **🖼️ Galería** — miniaturas de las imágenes adjuntas.
4. **⚙️ Configuración** — solo visible si el usuario es el autor del video.

## 4. Cabecera del panel de información

- **Avatar** (36px, mismo componente circular que usa `BarraLateral`/`Perfil`, con foto real o iniciales de respaldo) + **nombre de usuario** en `--color-h1`, 15px, peso 500.
- **Botón "Seguir"**: pastilla `--color-acento-fuerte` con texto blanco (mismo componente `perfil-btn--primary`/`--outline` que ya alterna a "Siguiendo" cuando corresponde); no se repite el rosa puro del wireframe.
- **Descripción**: párrafo en `--color-p`, 14px/1.5, recortado con "leer más" si excede unas líneas (no un bloque infinito como en el wireframe).
- **Etiquetas**: fila de chips pequeños `#etiqueta`, fondo `--color-fondo2`, texto `--color-texto-suave`, terminando en un chip "(…)" si hay más de las que caben en una línea — mismo patrón que ya usan los chips de Maquillajes.
- **Cultura/Estilo y Subcultura/Subestilo**: dos selects de solo lectura para quien ve el video (chip con flecha, igual al componente `chip-menu` de Maquillajes); si el usuario es el autor, estos mismos campos se vuelven editables dentro de "Configuración" y no aquí, para no duplicar la interacción.

## 5. Fila de estadísticas

Cuatro indicadores en línea, separados por espacio uniforme, cada uno como ícono + número, sin fondo ni borde (igual de discretos que los `pin-likes` de Maquillajes):

| Ícono | Dato | Color del ícono |
|---|---|---|
| Estrella | Likes | `--color-acento-fuerte` |
| Check | % de semejanza | `--color-acento-fuerte`, número con `font-variant-numeric: tabular-nums` |
| Marcador/bookmark | Veces guardado | `--color-texto-suave` |
| Compartir | Veces compartido | `--color-texto-suave` |

Debajo, una línea de 1px en `--color-fondo3` separa la cabecera del contenido de la pestaña activa.

## 6. Voto de semejanza

En la esquina superior derecha del panel, la etiqueta "Voto de semejanza" (13px, `--color-texto-suave`) junto a dos botones circulares de 36px:

- **A favor**: círculo relleno `--color-acento-fuerte`, ícono de check blanco.
- **En contra**: círculo con borde de 1.5px en `#b3425f`, ícono de X en ese mismo tono (estilo "outline", igual que `.perfil-btn--outline`, para que no compita en peso visual con el botón "a favor").

Al pasar el cursor por cualquiera de los dos aparece un globo de ayuda pequeño (fondo `--color-fondo`, texto `--color-p`, 12px) explicando qué hace el botón — no un tooltip negro genérico.

### Popover de "voto en contra"

Al pulsar la X se abre un panel flotante bajo los botones, mismo componente que el `menu-panel` de los filtros de Maquillajes: fondo blanco, borde 1.5px `--color-fondo3`, esquinas de 16px, sombra suave `--color-sombra`.

Contiene una lista de radios (`accent-color: var(--color-acento-fuerte)`), y el conjunto de motivos cambia según el tipo de contenido:

- **Si es un video de maquillaje** (7 motivos): delineado, colores, accesorios/vestimenta, simbolismos, música, peinado, otro.
- **Si es un tutorial** (9 motivos): simbolismos, música, delineado, colores, forma de ojos, forma de nariz, forma de rostro, color de piel, otro.

Debajo, un select "Elige un estilo alternativo si crees que el contenido corresponde a otro" (por defecto "Ninguno") y un botón "Enviar" en `--color-acento-fuerte`. Se cierra con la misma X o al enviar.

## 7. Configuración (solo autor)

Al pulsar el ícono de engranaje, el contenido del panel cambia a:

- Un ícono de bote de basura arriba a la derecha de la sección, en `#b3425f`, que abre la confirmación de eliminar (ver sección 9).
- **"Cambiar descripción"**: textarea con borde 1.5px `--color-fondo3`, y un contador `200/200` en 12px `--color-texto-suave` alineado a la derecha, igual al patrón ya usado en el modal de editar perfil.
- **"Cambiar categoría"**: dos selects (Cultura/Estilo, Subcultura/Subestilo) en línea, mismo componente `chip-menu` que el resto del sitio.
- Un botón "Guardar cambios" en `--color-acento-fuerte`, pastilla, alineado a la derecha.

### Editar etiquetas

Vista hermana dentro de Configuración: un campo de texto + botón "Añadir" (gris cuando está vacío, `--color-acento-fuerte` cuando hay texto), contador `17/20`, y debajo la cuadrícula de chips existentes. Cada chip, al pasar el cursor, muestra un pequeño texto "Click para borrar" (tooltip de 12px, fondo `--color-fondo3`) en vez del gris genérico del wireframe. Termina con el mismo botón "Guardar cambios".

## 8. Vista de comentarios (pestaña por defecto)

Lista simple, sin tarjetas: cada comentario es una fila con avatar (32px), nombre en `--color-h1` peso 500, texto en `--color-p`, y debajo, en una línea secundaria, "Responder" (enlace en `--color-acento-fuerte`) junto a la fecha relativa en `--color-texto-suave`. Las respuestas anidadas se indentan una vez, sin líneas verticales de conexión, para no sobrecargar. Arriba de la lista va el campo para publicar un comentario nuevo: un input de una línea con borde `--color-fondo3` y un botón "Publicar" que solo se activa con texto.

## 9. Notificaciones (confirmar eliminar / errores)

Aquí es donde más se aleja del wireframe: **no se usa un modal centrado propio**. Tanto la confirmación de "¿Eliminar este video?" como el aviso "No puedes dejar tu video sin descripción" se muestran con el mismo componente `Notificaciones.jsx` que ya usa el resto del sitio, en su posición habitual (esquina inferior derecha en escritorio, franja superior en móvil), con la misma anatomía: cabecera con logo + "B-unick" y botón ✕, cuerpo con el título "Becky te ha mandado un mensaje" y el texto del aviso.

- **Aviso de error** (descripción vacía): notificación simple, sin botones de acción extra más allá del ✕ para cerrarla — la persona corrige el campo y reintenta.
- **Confirmación de eliminar**: como esta acción es destructiva y de dos caminos, la tarjeta de notificación agrega una fila de dos botones al pie, reutilizando el mismo patrón que ya existe para el consentimiento de cookies (`cookie-consent-buttons`): un botón "Sí, eliminar" en `--color-acento-fuerte` (o en `#b3425f` por tratarse de una acción irreversible) y uno "Cancelar" en estilo outline. Al confirmar, la notificación se retira sola; no aparece ninguna ventana oscura de fondo ni overlay adicional.

## 10. Vista de galería

Cuadrícula de miniaturas (2 o 3 columnas según ancho disponible), esquinas de 12px, sin marco — mismo criterio que las tarjetas de la Wiki (`wiki-card-media`). Si no hay imágenes, se reemplaza por el estado vacío estándar del sitio: ícono circular 64px en `--color-fondo2`/`--color-acento-fuerte`, título y texto explicando que el autor no adjuntó imágenes.

## 11. Vista de descripción y pasos (solo tutoriales)

Reutiliza la tipografía editorial que ya usa la Wiki: un `h2` "Descripción general" (20px, peso 500, `--color-h1`) seguido de un párrafo en `--color-p`. Debajo, los 8 pasos del tutorial (Preparación de la piel, Base, Contorno/Iluminación, Corrector, Sombras/Pestañas, Delineado, Cejas, Lip Combo) se listan como subtítulos de 15px/500 con su texto debajo, exactamente con la estructura `.wiki-apartado`/`.wiki-sub-lista` ya definida — nada de números decorativos tipo "01/02/03" salvo que el contenido realmente sea una secuencia de pasos, que en este caso sí lo es, así que un kicker numérico discreto (`--color-acento-fuerte`, 12px) antes de cada paso es apropiado.

## 12. Accesibilidad y detalles finales

- Todos los íconos mantienen trazo 1.5, sin relleno, como en el resto del sitio.
- Foco visible de 3px en `--color-acento-fuerte` en botones, chips y radios.
- Ningún texto del panel supera peso 500, siguiendo la regla ya aplicada en Perfil y Notificaciones.
- `prefers-reduced-motion` anula cualquier transición de apertura de popovers o cambio de pestaña.
- En móvil, el video pasa a ocupar la parte superior de la pantalla y el panel de información se desplaza debajo en vez de al lado, conservando el mismo orden de secciones.


# Versión móvil del apartado de Video (formato TikTok)

## 1. Concepto

En móvil el video deja de compartir pantalla con el panel de información. Ocupa **toda la pantalla, de borde a borde**, y todo lo demás (acciones, datos del autor, comentarios, pasos, galería, configuración) flota encima o se abre como una **hoja inferior** (bottom sheet) que sube desde abajo y cubre solo una parte del video.

La lógica es la misma que en escritorio, con las mismas secciones y los mismos íconos. Solo cambia dónde se colocan.

**Colores** (los mismos tokens del proyecto):
- Fondo del video: `#2f2638`, en vez de negro puro.
- Acción principal: `--color-acento-fuerte` (#6B4E8C).
- Peligro: `#b3425f`.
- Hojas y popovers: blanco con borde `--color-fondo3`.
- Texto de la hoja: `--color-h1`, `--color-p` y `--color-texto-suave`.

## 2. Estructura de la pantalla

```
┌─────────────────────────┐
│ ✕                    ⋯  │  ← barra superior sobre el video
│                         │
│                         │
│                     ⭐  │
│                     xx  │
│                     ✓   │
│      V I D E O      xx% │
│                     🔖  │
│                     xx  │
│                     ↗   │
│                     xx  │
│                     💬  │
│ (av) Usuario [Seguir]   │
│ Descripción breve… más  │
│ #etiqueta #etiqueta (…) │
│ Gótico · Romántico      │
│ ▬▬▬▬▬▬▬▬▬▬░░░░░░░░░░░░ │  ← barra de progreso
└─────────────────────────┘
```

No hay barra lateral de navegación en esta vista. Igual que en el escritorio, la navegación principal se oculta cuando se abre un video (RQFN35). En su lugar, el botón ✕ devuelve a Maquillajes.

## 3. Capa superior (barra sobre el video)

- **Cerrar (✕):** arriba a la izquierda, círculo de 36px, fondo blanco, ícono `--color-h1`.
- **Menú de tres puntos (⋯):** arriba a la derecha, círculo de 36px con fondo `rgba(47,38,56,0.55)` e ícono blanco. Abre una hoja pequeña con las opciones secundarias.
  - **Para cualquier persona:** ver descripción y pasos (si es tutorial), ver galería y "Voto de semejanza".
  - **Solo para el autor:** Configuración, con "Editar descripción", "Cambiar categoría", "Editar etiquetas" y "Eliminar video". Esta última va en `#b3425f`.
- Ambos botones respetan `env(safe-area-inset-top)`, para no quedar bajo la muesca del teléfono.

## 4. Columna de acciones (derecha)

Es la firma del formato TikTok. Cinco acciones apiladas verticalmente sobre el borde derecho del video, centradas a la altura del pulgar. Cada una es un ícono blanco de 28px (trazo 1.5), con el número debajo en 12px, blanco con sombra de texto para que se lea sobre cualquier imagen.

| Orden | Ícono | Dato | Al pulsar |
|---|---|---|---|
| 1 | Estrella | Likes | Da like. El ícono se rellena con `--color-acento` |
| 2 | Check | % de semejanza | Abre la hoja de "Voto de semejanza" |
| 3 | Marcador | Veces guardado | Guarda el video en el perfil (RQFN114). Si ya está guardado, el marcador aparece relleno (RQFN115) |
| 4 | Compartir | Veces compartido | Abre el menú de compartir del sistema |
| 5 | Burbuja | Comentarios | Abre la hoja de comentarios |

Abajo de la columna, un **avatar circular** de 44px con anillo blanco y un pequeño "+" en `--color-acento-fuerte` para seguir a la persona sin salir del video. Si ya la sigues, el "+" se convierte en un check.

## 5. Información del autor (parte inferior izquierda)

Texto blanco sobre un degradado inferior `linear-gradient(0deg, rgba(47,38,56,0.75), transparent)` que garantiza el contraste sin usar una tarjeta:

- **Usuario:** 15px, peso 500. Junto a él, el botón "Seguir" como píldora pequeña en `--color-acento-fuerte` (pasa a "Siguiendo", outline blanco, cuando ya la sigues).
- **Descripción:** máximo 2 líneas, 14px, con "más" al final. Al pulsar "más" se abre la hoja de descripción.
- **Etiquetas:** una línea de chips `#etiqueta` de 12px con fondo blanco al 16%, que termina en "(…)" cuando no caben todas.
- **Cultura/Estilo · Subcultura/Subestilo:** una línea de 12.5px, por ejemplo "Gótico · Romántico". Es solo texto informativo.
- Todo el bloque deja al menos 72px libres a la derecha para no chocar con la columna de acciones.

## 6. Barra de progreso

Línea de 3px pegada al borde inferior de la pantalla, con el fondo en blanco al 24% y el avance en `--color-acento`. Al tocarla o arrastrarla crece a 8px y permite adelantar o atrasar (RQFN101). Respeta `env(safe-area-inset-bottom)`.

## 7. Gestos sobre el video

- **Un toque:** pausa o reanuda. Aparece un ícono de play de 64px al centro, con fondo `rgba(47,38,56,0.55)`, que se desvanece a los 600ms.
- **Doble toque:** da like, con un corazón o estrella que aparece y se disuelve. Se omite con `prefers-reduced-motion`.
- **Deslizar hacia arriba o abajo:** en TikTok cambia de video. En B-unick este gesto **no cambia de video**, porque Maquillajes es un muro de exploración y no un feed continuo. Deslizar hacia abajo desde la parte superior cierra el video y vuelve al muro.
- **Deslizar a los lados:** no hace nada, para evitar cierres accidentales.

## 8. Hojas inferiores (bottom sheets)

Todas comparten el mismo componente. Suben desde abajo, con esquinas superiores de 24px, fondo `--color-fondo`, borde superior de 1px en `--color-fondo3` y una **manija** de 40×4px centrada en `--color-fondo3`. Detrás aparece una capa de `rgba(47,38,56,0.4)`. Se cierran arrastrándolas hacia abajo, tocando la capa o con el botón ✕. Esto sustituye al panel derecho del escritorio.

- **Altura:** de 50% de la pantalla como base. Se puede arrastrar hasta 90% en comentarios, pasos y configuración.
- **Título:** 16px, peso 500, `--color-h1`, con línea de 1px debajo.
- **Contenido:** desplazable por dentro, con `overscroll-behavior: contain`.

### 8.1 Comentarios
- Título "Comentarios" con el conteo.
- Lista de filas: avatar de 32px, nombre en `--color-h1` peso 500, texto en `--color-p`, y debajo "Responder" en `--color-acento-fuerte` junto a la fecha en `--color-texto-suave`.
- Las respuestas se indentan una vez, sin líneas de conexión.
- Abajo, fija, una caja de texto con botón "Publicar" que se activa solo con texto. Se sube junto con el teclado.

### 8.2 Voto de semejanza
- Título "Voto de semejanza" y una línea explicativa: "Valora si el video cumple con el estilo o cultura que propone".
- Dos botones grandes en fila: **A favor** (relleno `--color-acento-fuerte`, check blanco) y **En contra** (outline `#b3425f`, X del mismo tono).
- Al elegir "En contra", el contenido de la hoja se sustituye por la lista de motivos con radios (`accent-color: var(--color-acento-fuerte)`). Los motivos cambian según el tipo:
  - **Video de maquillaje:** delineado, colores, accesorios/vestimenta, simbolismos, música, peinado y otro.
  - **Tutorial:** simbolismos, música, delineado, colores, forma de ojos, nariz, rostro, color de piel y otro.
- Debajo, un select "Estilo alternativo" con "Ninguno" por defecto y un botón "Enviar" de ancho completo.
- En un teléfono no existe el hover, así que la ayuda que en escritorio aparece como globo pasa a ser esta línea explicativa siempre visible.

### 8.3 Descripción y pasos (solo tutoriales)
- "Descripción general" como `h2` (20px, peso 500, `--color-h1`) y su párrafo.
- Los 8 pasos como apartados (`.wiki-apartado`): Preparación de la piel, Base de maquillaje, Contornos e iluminación, Corrector, Sombras y pestañas, Delineado, Cejas y Lip combo.
- Cada paso lleva un número discreto de 12px en `--color-acento-fuerte`, porque aquí sí es una secuencia.
- Si el autor no los adjuntó: "El creador no ha adjuntado pasos escritos en este tutorial" (RQFN120).

### 8.4 Galería
- Cuadrícula de 2 columnas, esquinas de 12px y sin marco.
- Al tocar una miniatura se abre a pantalla completa, con ✕ arriba y deslizamiento lateral entre imágenes.
- Si no hay imágenes, muestra el estado vacío estándar: círculo de 64px en `--color-fondo2`, ícono en `--color-acento-fuerte` y el texto "Nada aquí" (RQFN108).

### 8.5 Configuración (solo autor)
- Título "Configuración" y, en su esquina, el bote de basura en `#b3425f`.
- **Cambiar descripción:** textarea con borde de 1.5px en `--color-fondo3` y contador `200/200`.
- **Cambiar categoría:** dos selects apilados (uno debajo del otro, no en línea, por el ancho).
- **Editar etiquetas:** campo con botón "Añadir" (gris sin texto, `--color-acento-fuerte` con texto), contador `17/20` y chips. En táctil no hay hover, así que cada chip lleva una **x pequeña** visible para borrarlo, en lugar del tooltip "Click para borrar".
- **Guardar cambios:** botón de ancho completo, fijo al pie de la hoja.

## 9. Notificaciones

Igual que en escritorio, no se crea un modal propio. Se usa el componente `Notificaciones.jsx` con su comportamiento móvil habitual: **una franja pegada arriba de la pantalla**, con esquinas inferiores redondeadas de 16px, logo con "B-unick", botón ✕, título "Becky te ha mandado un mensaje" y el mensaje.

- **Descripción vacía:** aviso simple.
- **Confirmar eliminación:** la tarjeta añade la fila de dos botones al pie, con el patrón `cookie-consent-buttons`: "Sí, eliminar" (en `#b3425f`) y "Cancelar" (outline). Cuando la hoja de configuración está abierta, la notificación queda por encima de la hoja.

## 10. Adaptaciones que solo existen en móvil

- **Zona segura:** todos los elementos fijos usan `env(safe-area-inset-*)`. La columna de acciones y el bloque de texto se elevan sobre la barra de gestos del teléfono.
- **Zonas táctiles:** cada botón mide al menos 44×44px.
- **Reproducción automática:** el video empieza silenciado. Un ícono de altavoz tachado aparece abajo a la izquierda y se quita con un toque.
- **Sin hover:** cualquier información que en escritorio dependa de pasar el cursor pasa a estar visible o a un toque. Así ocurre con el botón "Guardar" de las tarjetas, el tooltip de las etiquetas y la ayuda del voto.
- **Orientación horizontal:** si el video es horizontal, se centra sobre el fondo `#2f2638`, con los mismos controles superpuestos.

## 11. Accesibilidad y movimiento

- Trazo de 1.5 en todos los íconos y pesos de texto de 500 como máximo, igual que el resto del sitio.
- Foco visible de 3px en `--color-acento-fuerte` (blanco cuando el elemento está sobre el video).
- Las hojas usan `role="dialog"`, `aria-modal="true"` y devuelven el foco al botón que las abrió, con el mismo patrón del panel de notificaciones.
- Cada acción de la columna lleva su etiqueta y su estado, por ejemplo "Guardar, guardado" o "Dar like, 1.2 mil".
- Con `prefers-reduced-motion` se elimina la animación de subida de las hojas, el corazón del doble toque y el desvanecido del ícono de pausa.

## 12. Puntos por decidir

- **Cambiar de video con el dedo:** TikTok lo hace, pero aquí lo descarté. Si prefieres un flujo continuo, habría que definir qué lista recorre.
- **Sonido:** conviene decidir si el video empieza siempre silenciado o si se recuerda la última preferencia.
- **Navegación:** al ocultar la barra inferior, la única salida es ✕ o deslizar hacia abajo. Puedo dejarla siempre visible si lo ves necesario.