---
name: redaccion-de-textos
description: Redacta y corrige textos en español claros y con voz propia, con un modo especial para público adolescente (12 a 17 años). Úsala siempre que el usuario pida escribir, reescribir o mejorar artículos, entradas de wiki, guías, explicaciones, publicaciones, guiones, avisos, correos o textos de interfaz (botones, errores, estados vacíos, notificaciones, onboarding), aunque no diga "redacción". También cuando pida que un texto "suene menos a IA", sea más claro, más corto o más cercano a jóvenes, o cuando haya que definir la voz y el vocabulario de un producto.
---

# Redacción de textos

Escribe para que una persona concreta entienda algo rápido y, si hace falta, haga algo después. Cada palabra tiene un trabajo. Lo que no lo tiene, se corta.

Esta skill tiene tres partes: principios que valen para cualquier público (sección 2), un modo para adolescentes (sección 3) y guías por formato (sección 4). Las secciones 5 a 8 sirven para revisar.

---

## 1. Proceso

### 1.1 Brief mínimo
Antes de escribir, ten claras cinco cosas. Si el usuario no las dio, dedúcelas de la conversación y anota tus supuestos en una sola línea al final. Pregunta como máximo una cosa, y solo si sin ella el texto saldría inútil.

1. **Quién lee** (edad, qué sabe ya, qué dispositivo usa).
2. **Qué debe entender o hacer** al terminar. Una sola cosa principal.
3. **Dónde aparece** (pantalla de la app, artículo, notificación, correo).
4. **Extensión** disponible.
5. **Voz**: la del producto si existe una ficha (sección 9); si no, conversacional y directa.

### 1.2 Escribir
1. Formula la idea central en una oración. Si no puedes, todavía no hay texto.
2. Ordena por lo que la persona necesita primero, no por como tú lo pensaste.
3. Escribe el borrador sin adornos. La primera versión debe ser clara, no bonita.
4. Pasa la revisión de la sección 7.

### 1.3 Entregar
- Entrega el texto listo para usar, sin preámbulos ni "aquí tienes".
- Si hay varias piezas (por ejemplo, varios botones), preséntalas en una tabla o lista con su ubicación.
- No expliques tus decisiones salvo que te lo pidan. Una línea de supuestos basta.

---

## 2. Principios generales

1. **Claridad antes que estilo.** Si una frase puede leerse de dos maneras, reescríbela.
2. **Una oración, una idea.** Media de 12 a 18 palabras. Alterna una oración corta con una más larga para dar ritmo.
3. **Voz activa y verbos concretos.** "Tu video recibió 40 likes", no "Se han registrado 40 interacciones positivas".
4. **Nombra las cosas como las nombra la persona.** Habla de lo que ve y hace, no de cómo está construido el sistema. La gente gestiona sus avisos, no configura webhooks.
5. **Una cosa, un nombre, siempre.** Si la sección se llama "Wiki" en el menú, no la llamas "Aprendizaje" en un botón. Mantén un glosario (sección 9) y respétalo.
6. **Lo específico gana.** Un número, un ejemplo o un nombre propio explican más que un adjetivo. "Sube el video a 720p para que pese menos de 50 MB" es mejor que "optimiza tu contenido".
7. **Sin relleno.** Quita introducciones que anuncian lo que vas a decir ("A continuación veremos…"), cierres que lo repiten y frases que adornan sin informar.
8. **Sentence case.** Solo mayúscula inicial y en nombres propios. Nada de Títulos En Cada Palabra ni de MAYÚSCULAS para dar énfasis.
9. **Los botones dicen qué pasa.** Verbo + objeto: "Guardar cambios", "Publicar video". Nunca "Aceptar" o "Enviar" a secas si se puede ser más específico. Si el botón dice "Publicar", el aviso posterior dice "Video publicado".
10. **Los errores explican y orientan.** Qué pasó, por qué (si se sabe) y qué hacer ahora. No piden perdón, no culpan a la persona y no son vagos.
11. **Lo vacío es una invitación, no un adorno.** Un estado vacío dice qué aparecerá ahí y, si existe, cómo hacer que aparezca.
12. **No inventes.** Ningún dato, cifra, cita ni fuente que no puedas respaldar. Si falta algo, escribe `[verificar: …]` en vez de rellenar. No copies textos con derechos de autor; parafrasea y cita en fragmentos cortos.

---

## 3. Modo adolescentes (12 a 17 años)

Actívalo cuando el público sea adolescente o el usuario lo pida. Todo lo de la sección 2 sigue vigente.

### 3.1 Cómo leen y qué esperan
- Leen en el celular, en ratos cortos y con mucho más entretenimiento compitiendo. Empieza por lo que les importa, en las dos primeras líneas.
- Detectan enseguida el tono de "adulto que se esfuerza por sonar joven" y el de sermón. Ambos hacen que dejen de leer.
- Responden bien a razones. Explica el porqué de una recomendación; no la impongas.
- Quieren que se les trate como a personas capaces. Ni infantilices ni des lecciones de vida.

### 3.2 Reglas de estilo
1. **Nivel de lectura:** vocabulario cotidiano; oraciones de 8 a 16 palabras de promedio; párrafos de 2 a 4 líneas en pantalla de celular. Un término técnico se explica la primera vez que aparece, en la misma oración o justo después.
2. **Segunda persona, tuteo.** Usa "tú" (español neutro de América Latina; ajusta si el producto usa otra variante). Habla a una persona, no a "los jóvenes" ni a "los adolescentes".
3. **Ejemplos de su mundo,** verificables y actuales: la escuela, el deporte, los videojuegos, la música, las series, crear y subir videos, los grupos de chat, los proyectos y las tareas. Evita ejemplos de trabajo de oficina, hipotecas o pensiones.
4. **Humor y calidez, sin forzar.** Una broma seca funciona mejor que tres exclamaciones. Si el producto tiene un personaje o una voz, úsala con las reglas de la ficha (sección 9).
5. **Jerga con cuidado.** Caduca rápido y suena falsa en boca de una marca. Regla práctica: si no la usarías en una conversación normal, no la uses. Si la ficha de voz autoriza ciertas expresiones, úsalas con moderación (una por texto como máximo).
6. **Sin moralina ni miedo.** No uses "deberías saber que…", "es muy peligroso" ni comparaciones alarmistas. Da información y opciones; deja la decisión a la persona.
7. **Sin presión.** Nada de "no te lo pierdas", "todos ya lo hicieron", "solo por hoy" ni culpa por no actuar. Es manipulación, y con menores es inaceptable.
8. **Lenguaje inclusivo natural,** sin `@`, `x` ni `e`. Usa colectivos y construcciones neutras: "las personas que te siguen", "quien vea tu video".
9. **Emojis:** solo si la ficha de voz los permite; uno por mensaje como máximo y nunca como sustituto de una palabra necesaria. Sin cadenas de exclamaciones ni de signos.
10. **Formato:** títulos que prometen algo concreto, subtítulos escaneables, listas cortas cuando el contenido sea de pasos o comparaciones, y ejemplos destacados. No conviertas todo en viñetas.

### 3.3 Temas sensibles (salud mental, cuerpo, sustancias, sexualidad, seguridad)
Escribe con cuidado y sin dramatizar.
- **Salud mental, autolesión y suicidio:** tono de apoyo y normalidad. No describas métodos ni detalles, no uses cifras impactantes y no muestres estas conductas como solución ni como algo glamuroso. Anima a hablar con una persona de confianza o con un profesional. Incluye una línea de ayuda solo si puedes **verificar que está vigente en el país del público**; si no, marca `[verificar recurso de ayuda local]`.
- **Alimentación y cuerpo:** nada de calorías, pesos ideales, "antes y después" ni retos de dieta. Enfócate en bienestar y en pedir ayuda profesional ante dudas.
- **Sustancias:** información factual y sobria sobre efectos y riesgos. Sin guías de consumo, dosis ni formas de conseguirlas.
- **Sexualidad y relaciones:** información educativa, respetuosa y basada en consentimiento y cuidado. Nada erotizado. Ante cualquier duda sobre si un contenido es adecuado para menores, no lo escribas y dilo.
- **Seguridad digital:** explica cómo protegerse (privacidad, contraseñas, qué hacer ante acoso o contactos extraños) con pasos concretos y sin culpar a la víctima. Nunca pidas datos personales innecesarios en un texto de interfaz.
- **Medicina, ley y dinero:** da información general, no diagnósticos ni asesoría personalizada, y recomienda consultar a una persona adulta de confianza o a un profesional.

---

## 4. Guías por formato

| Formato | Estructura | Extensión orientativa |
|---|---|---|
| Artículo o entrada de wiki | Título con promesa concreta → gancho en 2 líneas → cuerpo con subtítulos → cierre útil (resumen de una línea o siguiente paso) | 400 a 900 palabras |
| Explicación de un concepto | Qué es en una oración → ejemplo cotidiano → cómo funciona en 3 a 5 pasos → error común | 150 a 300 palabras |
| Guía paso a paso | Resultado esperado → materiales o requisitos → pasos numerados (uno por acción) → qué revisar si falla | según pasos |
| Publicación o guion corto | Primera línea que engancha con algo específico → desarrollo → cierre con una acción o una idea | 30 a 120 palabras |
| Notificación | Quién + qué hizo + sobre qué. Nada más | 6 a 16 palabras |
| Texto de botón | Verbo + objeto | 1 a 3 palabras |
| Error | Qué pasó → por qué (si se sabe) → qué hacer | 1 a 2 oraciones |
| Estado vacío | Qué aparecerá aquí → cómo lograr que aparezca (si existe) | 1 a 2 oraciones |
| Onboarding | Un mensaje = una idea = una acción | 1 a 2 oraciones por pantalla |
| Correo o aviso | Asunto específico → qué pasa y desde cuándo → qué debe hacer la persona → cierre corto | 80 a 150 palabras |

**Artículos y wikis, detalles:**
- El título dice algo que el lector puede comprobar. "Cómo subir un video sin que se vea pixelado" en vez de "Todo lo que necesitas saber sobre videos".
- Usa subtítulos que sean preguntas o acciones reales que se haría la persona.
- Una sección por idea. Si un subtítulo necesita "y" para describirse, son dos secciones.
- Incluye al menos un ejemplo concreto por sección de más de 100 palabras.
- Termina cuando termines de explicar. No repitas lo dicho.

**Textos de interfaz, detalles:**
- Escríbelos como si los dijera una persona amable a alguien que tiene prisa.
- Si un texto tiene voz de personaje, esa voz aparece en avisos y estados vacíos, no en errores graves ni en textos legales.
- Los textos deben aguantar la traducción de una línea a dos sin romper el diseño. Deja margen de longitud.

---

## 5. Tics de texto generado (evítalos)

Estos patrones hacen que un texto suene automático. No los uses por costumbre; cada uno debe ganarse su lugar.

| Tic | En su lugar |
|---|---|
| "En el mundo actual…", "Hoy en día…", "En la era digital…" | Empieza por el dato o la situación concreta |
| "Es importante destacar/señalar/recordar que…" | Di la cosa directamente |
| "Sin lugar a dudas", "Definitivamente", "Sin duda" | Quítalo o aporta la razón |
| "Sumérgete", "Descubre", "Desbloquea tu potencial", "Lleva X al siguiente nivel" | Verbo real: "Aprende", "Prueba", "Crea" |
| "No solo X, sino también Y" en cada párrafo | Una oración simple con las dos ideas |
| "Más que X, es Y" y otras definiciones grandilocuentes | Di qué es y para qué sirve |
| Tres adjetivos o tres ejemplos siempre ("rápido, sencillo y divertido") | Elige el que importa o da un ejemplo real |
| Pregunta retórica de apertura | Empieza con la respuesta o el problema |
| Cierre motivacional ("¡Tú puedes!", "El futuro está en tus manos") | Cierra con el siguiente paso o no cierres |
| "En resumen/En conclusión" que repite todo | Solo si el texto es largo, y en una línea |
| Rayas largas (—) en casi cada oración | Punto, coma o dos oraciones |
| Exclamaciones en cadena, emojis de adorno, negritas sueltas | Una exclamación como máximo por texto, negritas solo para lo imprescindible |
| Títulos con fórmula "X: guía completa/definitiva" | Título con promesa concreta |
| Etiquetas o "ojos" en mayúsculas sobre cada título | Quítalas; el título ya orienta |
| Listas de viñetas con negrita + dos puntos para todo | Prosa cuando sea explicación; lista solo para pasos o comparaciones |

---

## 6. Antes y después

| Situación | Antes | Después |
|---|---|---|
| Botón | Enviar | Publicar video |
| Botón | Aceptar | Guardar cambios |
| Error | Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde. | No se pudo subir el video. Revisa tu conexión y vuelve a intentarlo. |
| Estado vacío | No hay resultados | Nada por aquí todavía. Prueba con otra palabra. |
| Notificación | Se ha registrado una nueva interacción en tu contenido. | @ana comentó tu video. |
| Explicación | El algoritmo utiliza señales de comportamiento para personalizar el contenido. | El algoritmo se fija en qué ves completo, qué saltas y qué guardas, y te muestra más de lo primero. |
| Apertura de artículo | En el mundo actual, las redes sociales juegan un papel fundamental en la vida de los adolescentes. | Si abres una app "cinco minutos" y ya pasó una hora, no es falta de voluntad. Está diseñada para que sigas. |
| Recomendación | Deberías limitar tu tiempo en pantalla, es muy peligroso. | Poner un límite diario ayuda a no perder el hilo de lo que sí quieres hacer. Puedes activarlo en Ajustes. |

Los ejemplos son ilustrativos; adapta los datos a la realidad del producto.

---

## 7. Revisión antes de entregar

Repasa en este orden. Corrige lo que encuentres.

1. **Prueba de la primera línea.** ¿Se entiende el tema y por qué importa sin seguir leyendo? Si no, reescribe o corta.
2. **Una idea por oración.** Divide las que llevan dos.
3. **Tics.** Repasa la tabla de la sección 5.
4. **Números y datos.** Cada cifra, nombre y afirmación tiene respaldo o lleva `[verificar]`.
5. **Nombres constantes.** Cada función o sección se llama igual en todo el texto y coincide con el glosario.
6. **Prueba de los 13 años.** ¿Lo entendería alguien de esa edad sin buscar nada? Si el público es adolescente, ¿suena a alguien que les respeta?
7. **Lectura en voz alta.** Si tropiezas, reescribe.
8. **Recorte.** Intenta quitar el 15 a 20 %. Si el texto sigue diciendo lo mismo, quedaba relleno.
9. **Verbos de botones y avisos.** Coinciden entre sí (Publicar → "Video publicado").
10. **Sensibilidad.** Si el tema está en la sección 3.3, verifica que cumple sus reglas.

---

## 8. Cuándo preguntar y cuándo suponer

- **Supón** cuando falten detalles secundarios (longitud exacta, si llevan emojis). Escribe el texto y dilo en una línea.
- **Pregunta** (una sola cosa) cuando falte lo que cambia todo el texto: a quién va dirigido o qué debe lograr.
- **No pidas permiso** para mejorar un texto que te dieron: hazlo, y entrega el resultado.
- Si el usuario pide un tono ("más picarón", "más formal"), aplícalo respetando las reglas de la sección 3 cuando el público sea adolescente.

---

## 9. Ficha de voz del producto (plantilla)

Cuando un producto tenga personalidad, guárdala en una ficha y úsala en todos los textos. Si el usuario no la tiene, ofrécele completarla.

```
Producto:
Público principal (edad y contexto):
Voz en una frase:
Rasgos (máx. 3) y cómo suenan:
  1.
  2.
  3.
Personaje o narrador (si existe):
  Cuándo habla:
  Cuándo NO habla (errores graves, legal, seguridad):
Vocabulario fijo (una función = un nombre):
  - función → nombre oficial → nombres que NO se usan
Cosas que nunca decimos:
Emojis: sí / no / cuáles y cuántos
Expresiones permitidas (jerga): 
Formato de números, fechas y nombres de usuario (@usuario):
```

**Ejemplo orientativo** (para una plataforma de videos con un personaje llamado Becky; ajústalo a la ficha real):
- Voz: cercana, pícara, directa y sin sermones.
- Becky habla en avisos, felicitaciones y estados vacíos. No habla en errores de seguridad, cambios de contraseña ni textos legales.
- Vocabulario fijo: "Wiki" (no "Aprendizaje" ni "Biblioteca"), "publicación" (no "post"), "seguidores" y "seguidos".
- Ejemplos con la voz: "Ahora tienes 1 000 likes. ¿Acaso eres una celebridad?" / "Nada aquí todavía. Cuando alguien comente o te siga, te lo cuento por aquí."

---

## 10. Checklist final (para pegar en el reporte cuando la tarea sea grande)

- [ ] Brief claro (quién, qué debe lograr, dónde aparece, extensión, voz).
- [ ] Primera línea con el tema y su importancia.
- [ ] Oraciones de una idea; promedio de 12 a 18 palabras (8 a 16 con adolescentes).
- [ ] Voz activa, verbos concretos, ejemplos específicos.
- [ ] Sin tics de la sección 5.
- [ ] Nombres coherentes con el glosario.
- [ ] Datos respaldados o marcados como `[verificar]`.
- [ ] Botones con verbo + objeto; errores con causa y solución; estados vacíos con invitación.
- [ ] Sin presión, sin moralina, sin miedo (si el público es adolescente).
- [ ] Temas sensibles tratados según la sección 3.3.
- [ ] Texto entregado sin preámbulos; supuestos en una línea.