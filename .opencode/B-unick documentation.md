```
Documento de Especificación de Requerimientos
```
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)

```
Betsabe Elizabeth Zamora Esqueda
```
```
Asesor: MOLINA MARTINEZ CARLOS
```
## FEB – JUN 2026 VERSION 5


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
1. Introducción del Documento de Especificación de Requerimientos.
    El presente Documento de Especificación de Requerimientos (DER) tiene como finalidad
    definir de manera clara y detallada los requerimientos funcionales y no funcionales del sistema
    B-unick, así como las características, restricciones y necesidades que deberán considerarse
    durante su desarrollo. Este documento servirá como guía para el diseño, implementación,
    pruebas y mantenimiento del sistema, permitiendo que todos los involucrados en el proyecto
    compartan una misma visión sobre los objetivos y funcionalidades esperadas.
    Además, el DER establece los criterios que permitirán verificar que el sistema desarrollado
    cumple con las necesidades planteadas inicialmente, reduciendo ambigüedades y facilitando la
    comunicación entre desarrolladores, asesores y usuarios finales.

```
1.1 Descripción breve del producto
```
```
Nombre del proyecto: B-unick
Descripción:
B-unick es una plataforma web social orientada a la publicación, consulta y
aprendizaje de maquillajes inspirados en diferentes culturas urbanas, estilos
alternativos y tendencias estéticas. El sistema permite a los usuarios registrarse,
crear perfiles personalizados, publicar videos relacionados con maquillajes,
compartir tutoriales, participar en conversaciones comunitarias y acceder a
contenido filtrado según sus características físicas y preferencias culturales.
La plataforma busca proporcionar una experiencia personalizada mediante el
análisis de características físicas del usuario, tales como forma de ojos, rostro,
labios, nariz y tono de piel, permitiendo recomendar contenido más adecuado
para cada persona. Asimismo, incorpora una sección informativa tipo wiki donde
los usuarios pueden conocer el origen, características, variaciones y recursos
relacionados con diversas culturas y estilos como Gótico, Emo, Punk, Lolita,
Visual Kei, Gyaru, entre otros.
Adicionalmente, B-unick integra mecanismos de interacción social como
comentarios, respuestas, seguidores, notificaciones, likes, denuncias y votaciones
de semejanza para fomentar la participación de la comunidad y mantener la
calidad del contenido compartido dentro de la plataforma.
```
```
1.2 Definiciones, siglas, y abreviaciones.
```
- API (Application Programming Interface). Conjunto de funciones y
    procedimientos que permiten la comunicación entre diferentes aplicaciones o
    servicios.
- Backend. Parte del sistema encargada de procesar la lógica de negocio, acceder a
    la base de datos y responder a las solicitudes realizadas por los usuarios.
- Bcrypt. Biblioteca utilizada para cifrar contraseñas de manera segura antes de
    almacenarlas en la base de datos.
- CDN (Content Delivery Network). Red de distribución de contenido utilizada
    para mejorar la velocidad de carga de archivos multimedia.
- Cloudinary. Servicio externo utilizado para el almacenamiento, optimización y
    distribución de imágenes y videos dentro de B-unick.


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
- CSS (Cascading Style Sheets). Lenguaje utilizado para definir la presentación
    visual de las páginas web.
- Frontend. Parte visual del sistema con la que interactúan directamente los
    usuarios.
- HTML (HyperText Markup Language). Lenguaje de marcado utilizado para
    estructurar el contenido de las páginas web.
- HTTP (HyperText Transfer Protocol). Protocolo utilizado para la transferencia de
    información entre cliente y servidor.
- HTTPS (HyperText Transfer Protocol Secure)Versión segura de HTTP que cifra
    la comunicación entre cliente y servidor.
- JavaScript. Lenguaje de programación utilizado para desarrollar la lógica tanto
    del frontend como del backend del sistema.
- JSON (JavaScript Object Notation). Formato ligero para el intercambio de datos
    entre aplicaciones.
- JWT (JSON Web Token). Estándar utilizado para la autenticación y autorización
    de usuarios mediante tokens digitales.
- MySQL. Sistema gestor de bases de datos relacional utilizado para almacenar la
    información de B-unick.
- Node.js. Entorno de ejecución para JavaScript utilizado en el desarrollo del
    backend del sistema.
- React. Biblioteca de JavaScript utilizada para desarrollar la interfaz de usuario
    del sistema.
- REST. Estilo arquitectónico utilizado para el desarrollo de servicios web
    mediante solicitudes HTTP.
- RQFN. Requerimiento Funcional.
- RQNFN. Requerimiento No Funcional.
- Sightengine. API externa utilizada para la moderación automática de imágenes y
    videos mediante análisis de contenido.
- SQL (Structured Query Language). Lenguaje utilizado para consultar y
    administrar bases de datos relacionales.
- Usuario.Persona registrada dentro de la plataforma B-unick que puede interactuar
    con las funcionalidades del sistema.
- Video Maquillaje. Publicación audiovisual donde se muestra el resultado final de
    un maquillaje inspirado en un estilo o cultura específica.
- Video Tutorial. Publicación audiovisual enfocada en enseñar paso a paso la
    realización de un maquillaje.
- Wiki. Apartado informativo del sistema que contiene información sobre culturas
    urbanas, estilos y subestilos disponibles dentro de la plataforma.

1.3 Referencias.

- Formato para propuestas: B-unick
- Cloudinary. (2025). Cloudinary Documentation. Recuperado de
    https://cloudinary.com/documentation
- Fielding, R. T. (2000). Architectural styles and the design of network-based
    software architectures (Doctoral dissertation, University of California, Irvine).


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
- Mozilla Foundation. (2025). MDN Web Docs. Recuperado de
    https://developer.mozilla.org
- Node.js Foundation. (2025). Node.js Documentation. Recuperado de
    https://nodejs.org/docs
- OpenJS Foundation. (2025). Express.js Documentation. Recuperado de
    https://expressjs.com
- OWASP Foundation. (2025). OWASP Top Ten Web Application Security Risks.
    Recuperado de https://owasp.org
- React Team. (2025). React Documentation. Recuperado de https://react.dev
- Sightengine. (2025). Sightengine API Documentation. Recuperado de
    https://sightengine.com/docs
- Oracle Corporation. (2025). MySQL 8.0 Reference Manual. Recuperado de
    https://dev.mysql.com/doc
- IETF. (2015). RFC 7519: JSON Web Token (JWT). Recuperado de
    https://datatracker.ietf.org/doc/html/rfc
- W3C. (2025). HTML Living Standard. Recuperado de
    https://html.spec.whatwg.org
- W3C. (2025). CSS Specifications. Recuperado de https://www.w3.org/Style/CSS
- Render Services Inc. (2025). Render Documentation. Recuperado de
    https://render.com/docs
- Railway Corporation. (2025). Railway Documentation. Recuperado de
    https://docs.railway.app
- ECMA International. (2024). ECMAScript Language Specification. Recuperado
    de https://tc39.es/ecma262/
2. Descripción global del producto.

```
B-unick es una plataforma web social enfocada en la difusión, aprendizaje y discusión de
maquillajes inspirados en culturas urbanas, estilos alternativos y tendencias estéticas. El
sistema combina características propias de una red social con herramientas educativas y
de recomendación personalizada, permitiendo a los usuarios publicar videos, compartir
experiencias, interactuar mediante comentarios y conversaciones, así como consultar
información detallada sobre distintas culturas y subculturas.
La plataforma busca resolver la dificultad que enfrentan muchas personas al intentar
encontrar tutoriales de maquillaje adecuados para sus características físicas específicas.
Para ello, durante el registro se recopilan características como forma de ojos, rostro,
labios, nariz, tipo y tono de piel, permitiendo al sistema mostrar contenido más relevante
para cada usuario.
El sistema estará compuesto por diversos módulos interconectados que abarcan la gestión
de usuarios, autenticación, publicación de contenido multimedia, sistema de comentarios,
votaciones, preferencias personalizadas, notificaciones, almacenamiento multimedia y
moderación automática de contenido.
Entre las principales funcionalidades se encuentran:
```
- Registro e inicio de sesión mediante correo electrónico.
- Verificación de cuentas por correo electrónico.
- Recuperación de contraseña.
- Gestión de perfiles de usuario.


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
- Publicación de videos de maquillaje y tutoriales.
- Publicación de conversaciones y debates.
- Sistema de comentarios y respuestas.
- Sistema de seguidores.
- Sistema de notificaciones.
- Wiki informativa sobre culturas y subculturas.
- Sistema de recomendaciones basado en características físicas.
- Almacenamiento de videos vistos y guardados.
- Sistema de votación de semejanza para clasificar el contenido.
- Moderación automática de imágenes y videos mediante APIs externas.
El producto final será una aplicación web accesible desde Chrome, diseñada para
funcionar tanto en computadoras como en dispositivos móviles, utilizando una
arquitectura cliente-servidor basada en tecnologías web modernas.

```
2.1 Perspectiva del producto.
```
```
B-unick no surge como un sistema completamente aislado, sino que toma
inspiración de distintas plataformas existentes que combinan contenido
multimedia, interacción social y comunidades especializadas.
```
```
TikTok
TikTok es una red social centrada en la publicación y visualización de videos
cortos. Su principal fortaleza es el algoritmo de recomendación personalizado
basado en los intereses y comportamientos de los usuarios.
B-unick comparte con TikTok la posibilidad de publicar videos, interactuar
mediante comentarios, dar likes y recibir recomendaciones de contenido. Sin
embargo, B-unick se diferencia al enfocarse exclusivamente en maquillajes
relacionados con culturas urbanas y al utilizar características físicas del usuario
para personalizar las recomendaciones.
```
```
Reddit
Reddit es una plataforma orientada a la creación de comunidades y discusiones
organizadas por temas específicos.
B-unick incorpora elementos similares mediante su apartado de conversaciones,
donde los usuarios pueden publicar debates, responder comentarios e intercambiar
información sobre estilos y culturas. No obstante, B-unick integra adicionalmente
contenido multimedia especializado y una wiki educativa.
```
```
Característica TikTok Reddit B-unick
```
Publicación de videos Sí Limitado Sí
Sistema de
comentarios Sí^ Sí^ Sí^
Conversaciones tipo
foro No^ Sí^ Sí^
Información
educativa

```
No Parcial Sí
```

```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
Personalización por
características físicas No^ No^ Sí^
Seguidores Sí No Sí

Sistema de votos Parcial Sí Sí
Enfoque en
maquillaje

```
No No Sí
```
Wiki de culturas
urbanas No^ No^ Sí^

```
Diagrama de bloques
```

```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
```
Interacción entre componentes
```
```
Frontend (React)
Es la interfaz gráfica con la que interactúa el usuario. Gestiona formularios,
visualización de videos, navegación y comunicación con el servidor.
```
```
Backend (Node.js + Express)
Procesa las solicitudes enviadas por el frontend, aplica validaciones, gestiona la
autenticación mediante JWT y realiza operaciones sobre la base de datos.
```
```
Base de Datos (MySQL)
Almacena toda la información persistente del sistema:
```
- Usuarios
- Videos
- Comentarios
- Conversaciones
- Likes
- Seguidores
- Notificaciones
- Preferencias
- Características físicas

```
Cloudinary
Servicio encargado del almacenamiento y distribución de imágenes y videos
publicados por los usuarios.
```
```
Sightengine
Servicio externo utilizado para validar automáticamente el contenido multimedia
antes de permitir su publicación, ayudando a evitar contenido inapropiado dentro
de la plataforma.
```
```
JWT
Mecanismo utilizado para autenticar usuarios sin necesidad de almacenar sesiones
activas en la base de datos, permitiendo identificar usuarios autenticados mediante
tokens seguros.
De esta manera, B-unick se concibe como una plataforma modular, escalable y
orientada a la personalización del contenido, integrando tecnologías modernas de
desarrollo web y servicios externos especializados para garantizar una experiencia
segura e interactiva para los usuarios.
```
2.2 Funciones del producto.
Inicio de sesión

- RQFN1: El sistema debe mostrar un mensaje al usuario informando sobre el uso de
    cookies en el sitio adjuntando el siguiente gif al mensaje
- RQFN2: El sistema debe solicitar al usuario que acepte el uso de cookies en caso de que
    sea necesario


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
- RQFN3: Si el sistema encuentra un inicio de sesión activo en las cookies, se redirecciona
    al usuario a la página principal
- RQFN4: El usuario debe ingresar sus datos de inicio de sesión (Correo electrónico y
    contraseña)
- RQFN5: El sistema debe ocultar el texto dentro del campo de contraseña
- RQFN6: El sistema debe mostrar una opción para mostrar el texto dentro del campo de
    contraseña
- RQFN7: El sistema debe mostrar un mensaje al usuario en caso que la contraseña
    ingresada no sea correcta o que el usuario no se encuentre registrado. El mensaje debe ser
    de color rojo y debe salir en la parte superior de la página
- RQFN8: El sistema debe mostrar una opción de ir a registro
- RQFN9: El sistema debe mostrar una opción para dirigirse a la página de olvido de
    contraseña
- RQFN10: Al finalizar el inicio de sesión, el sistema debe redirigir a la Página Principal
- RQFN11: En caso de que el usuario acceda por primera vez, el sistema debe mostrar un
    formulario para que el usuario elija las culturas/estilos que prefiere ver en el sitio
- RQFN12: El formulario de preferencias debe de mostrar todas las culturas/estilos y cada
    uno desplegar un listado de subculturas/subestilos
- RQFN13: El usuario solo debe seleccionar de 1 - 3 culturas/estilos y una
    subcultura/subestilo de los culturas/estilos seleccionados
Registro
- RQFN14: El usuario debe ingresar sus datos para registro(Correo electrónico, contraseña,
nombre de usuario)
- RQFN15: El sistema debe ocultar el texto dentro del campo de contraseña
- RQFN16: El sistema debe mostrar una opción para mostrar el texto dentro del campo de
contraseña
- RQFN17: El formulario de Características Físicas debe contar con los siguientes campos:
o Forma de ojos del usuario
▪ Opción 1: Redondos
▪ Opción 2: Redondos Almendrados
▪ Opción 3: Almendrados
▪ Opción 4: Caídos
▪ Opción 5: Caídos encapuchados
▪ Opción 6: Encapuchados
▪ Opción 7: Asiáticos
▪ Opción 8: Asiáticos redondos
o Tipo de Naríz del usuario
▪ Opción 1: Romana
▪ Opción 2: Chata
▪ Opción 3: Griega
▪ Opción 4: Aguileña
▪ Opción 5: Con mucha carne
▪ Opción 6: Protuberante
▪ Opción 7: Plana
▪ Opción 8: De gancho
▪ Opción 9: Angosta
▪ Opción 10: Corta
▪ Opción 11: Alta
▪ Opción 12: Celestial


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
```
o Tipo de labios del usuario
▪ Opción 1: Llenos
▪ Opción 2: Gruesos
▪ Opción 3: Superior grueso
▪ Opción 4: Redondo
▪ Opción 5: Inferior grueso
▪ Opción 6: Fino
▪ Opción 7: En arco
▪ Opción 8: En corazón
▪ Opción 9: Hacia abajo
o Tipo de rostro
▪ Opción 1: Redondo
▪ Opción 2: Ovalado
▪ Opción 3: Diamante
▪ Opción 4: Cuadrado
▪ Opción 5: Triangular V
▪ Opción 6: Triangular A
▪ Opción 7: Rectangular
▪ Opción 8: Alargado
▪ Opción 9: Corazón
o Color de piel
▪ Opción 1: Muy pálida
▪ Opción 1: Pálida intermedia
▪ Opción 1: Intermedia/Oliva
▪ Opción 1: Oliva Oscura/Morena Clara
▪ Opción 1: Morena
▪ Opción 1: Oscura
o Campo para tipo de piel
▪ Opción 1: Normal
▪ Opción 2: Seca
▪ Opción 3: Grasa
```
# ▪ Opción 4: Mixta

```
o Edad
```
- RQFN18: El sistema debe mostrar una imagen de referencia por cada característica física
    (la edad no requiere imagen)
- RQFN19: El sistema debe mostrar un botón para continuar con la verificación del correo
    electrónico
- RQFN20: El sistema debe enviar un correo de verificación al correo del usuario
- RQFN21: El sistema debe mostrar un mensaje al usuario sobre el envío de la verificación
    a su correo
- RQFN22: El correo de verificación debe contar con la información del correo y nombre
    de usuario que se desea registrar y si confirma el registro de una cuenta con esa
    información o en caso contrario ignorar el correo.
- RQFN23: El correo de verificación debe contar con un botón de redirección a una página
    con la información del usuario para su registro.
- RQFN24: La página del registro debe mostrar el mensaje de confirmación del registro y
    una opción para redirigirse a la página de inicio de sesión
- Olvido de contraseña


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
- RQFN25: El sistema debe mostrar un campo para el ingreso de un correo por el cual
    enviar la solicitud de restablecimiento de contraseña.
- RQFN26: El sistema debe mostrar un mensaje de correo enviado en caso de que el correo
    se encuentre registrado en la base de datos. De lo contrario, debe mostrar el mensaje de
    error de que el correo indicado por el usuario no se encuentra registrado en el sitio.
- RQFN27: El sistema debe mostrar una opción de reenviar el correo de recuperación al
    minuto de haber enviado el primer correo
- RQFN28: El usuario debe presionar el enlace de redirección al sitio de recuperación de su
    contraseña enviado a su correo
- RQFN29: El correo enviado debe contar con la información del correo y nombre de
    usuario al que desea cambiar la contraseña. En caso de que o en caso contrario ignorar el
    correo
- RQFN30: El usuario debe ignorar el correo en caso de que él no haya sido quien pidió la
    solicitud.
- RQFN31: El usuario debe ignorar el correo en caso de que él no haya sido quien pidió la
    solicitud
- RQFN32: En la página de recuperación de contraseña, el sistema debe mostrar dos
    campos:
       o Contraseña nueva
       o Confirmación de nueva contraseña
- RQFN33: El sistema debe mostrar el correo y nombre de usuario al cual se le está
    cambiando la contraseña
- RQFN34: El sistema debe redirigir al inicio de sesión una vez cambiada la contraseña
- Barra de navegación
- RQFN35: El sistema debe mostrar la barra de navegación en todas las páginas del sitio
    (excepto al abrir algún video)
- RQFN36: La barra de navegación debe contar con diferentes enlaces que redirigen a los
    siguientes sitios:
       o Botón para desplegar Notificaciones
       o Botón de redirección a Página de maquillajes
       o Botón de redirección a Crear
       o Botón de redirección a Comunidad
       o Botón de redirección a Perfil
- RQFN37: En caso de que no exista un inicio de sesión activo, mostrar en la barra de
    navegación los siguientes enlaces:
       o Botón de redirección a Inicio de sesión
       o Botón de redirección a registro
- RQFN38: Y los siguientes deben enviar a Inicio de sesión en caso de no existir un inicio
    de sesión activo
       o Botón de redirección a Perfil
       o Botón de redirección a Crear
       o Botón para desplegar Notificaciones
       o RQFN39: La barra de navegación debe mostrar, además:
       o Logo de la página
       o Nombre y slogan de la página (“B-unik: ¿qué tan única puedes ser?”)
       o Wiki
- RQFN40: El sistema debe mostrar:
    o Encabezado
    o Descripción del sitio, misión y público al que va dirigido


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
o Apartados
o Gótico
o Emo
o Punk
o Lolita
o Visual Kei
o Gyaru
o Principiante
o TikTok
o Otros
Perfil

- RQFN41: El sistema debe mostrar un menú para las siguientes opciones:
    o Configuración de la cuenta
    o Videos vistos
- RQFN42: El apartado de videos vistos debe mostrar la cantidad de videos vistos por el
    usuario y un álbum de los videos e imagenes vistas
- RQFN43: El usuario al presionar en cualquiera de los elementos debe acceder al video
    visto. Al realizar esta acción, el video se posicionará hasta el tope de la lista
- RQFN44: El apartado de configuración debe permitir al usuario modificar la siguiente
    información referente al usuario:
       o Nombre de usuario
       o Contraseña
       o Foto de perfil
       o Descripción
- RQFN45: El usuario debe ingresar su contraseña actual para poder realizar el cambio de
    contraseña
- RQFN46: El usuario debe ingresar dos veces su nueva contraseña para la confirmación
    de esta
- RQFN47: El usuario debe seleccionar una foto de su galería para reemplazar la foto de
    perfil
- RQFN48: El usuario es el único que tiene acceso a esta información sobre su cuenta
- RQFN49: El sistema debe mostrar:
    o el nombre, la foto de perfil, cantidad de likes, cantidad de publicaciones y la
       descripción
    o cantidad de usuarios que siguen al usuario
- RQFN50: El sistema debe mostrar un botón para seguir al perfil visible únicamente para
    usuarios que no siguen la cuenta.
- RQFN51: En caso de no contar con una foto de perfil, el sistema mostrará una imagen
    genérica en su lugar
- RQFN52: En caso de no contar con likes o publicaciones creadas, estos valores serán 0
    por definición
- RQFN53: En caso de no contar con seguidores, el valor a mostrar será 0
- RQFN54: El usuario al presionar la cantidad de seguidores, el sistema debe desplegar un
    listado de usuarios que siguen al usuario, mostrando la foto y nombre de perfil de los
    mismos
- RQFN55: En caso de no contar con usuarios que el usuario sigue, el sistema debe mostrar
    el mensaje de “Nada aqui”
- RQFN56: El sistema debe mostrar la cantidad de usuarios que el usuario sigue. En caso
    de no contar con usuarios siguiendo, el valor a mostrar será 0


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
- RQFN57: El usuario al presionar la cantidad de usuarios siguiendo, el sistema debe
    desplegar un listado de usuarios que el usuario sigue, mostrando la foto y nombre de
    perfil de los mismos.
- RQFN58: En caso de no contar con usuarios seguidores, el sistema debe mostrar el
    mensaje de “Nada aqui”
- RQFN59: El sistema debe mostrar un apartado con las publicaciones del usuario
- RQFN60: En caso de no contar con publicaciones, el sistema debe mostrar un mensaje
    referente a la falta de este en su lugar.
- RQFN62: Dentro del contenido del usuario, el sistema debe mostrar el apartado de
    maquillajes guardados
- RQFN63: El sistema debe de mostrar una miniatura por cada video guardado
- RQFN64: En caso de no contar con maquillajes guardados, el sistema debe mostrar un
    mensaje referente a la falta de este en su lugar.
- RQFN65: El apartado de maquillajes guardados solo puede ser visible al usuario al que le
    pertenece la cuenta
- RQFN66: El sistema debe mostrar un apartado de Conversaciones creadas
- RQFN67: El sistema solo debe mostrar los primeros 200 caracteres de la conversación, la
    cantidad de respuestas que generó y la cantidad de likes que recibió
- RQFN68: Al presionar el resumen de la conversación, el sistema debe redirigir a la
    página de la conversación
Notificaciones
- RQFN69: Al presionar el ícono de notificaciones, el sistema debe desplegar un listado
con las notificaciones del usuario
- RQFN70: En caso de no contar con notificaciones, el sistema debe mostrar el mensaje
“Nada aquí”
- RQFN71: El sistema debe mostrar una notificación en el apartado cuando:
o Un usuario que el usuario sigue ha subido contenido nuevo
o Un usuario ha dado like al contenido del usuario
o Un video del usuario muestra un porcentaje de semejanza menor al mínimo
requerido (40%)
o Un usuario ha dado like a un comentario del usuario
o Un usuario ha comentado un video o un comentario del usuario
o Otro usuario empezó a seguir al usuario
- RQFN72: El sistema debe contar con un botón de dentro de la notificación referente al
porcentaje de semejanza menor al mínimo:
o Cambiar categoría: Redirección al enlace del video
o Wiki
Wiki
- RQFN73: El sistema debe mostrar una página por cada cultura/estilo del sistema. Estilos
y sus subestilos a mostrar:
o Gótico
▪ Gótico Trad/Tradicional
▪ Romántico
▪ Cyber
▪ Victorian
▪ Casual
▪ Corp Goth
▪ Otros
o Emo


Documento de Especificación de Requerimientos.
**Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)**

```
▪ Scene
▪ Trad Emo
▪ Emo 2020
▪ Otros
o Punk
▪ Clásico
▪ Glam
▪ Steam
▪ Hardcore
▪ Crust
▪ Pop
▪ J-Punk
▪ Otros
o Lolita
▪ Gótico
▪ Clásica
▪ Victoriana
▪ Punk
▪ Kei
▪ Otros
o Visual Kei
▪ Angura Kei
▪ Kote Kei
▪ Oshare Kei
▪ Eroguro Kei
▪ Nagoya Kei
▪ Soft Kei
▪ Otros
o Gyaru
▪ Kogal
▪ Agejo
▪ Amekaji
▪ Amuro
▪ Banba
▪ Cyber
▪ Ganguro
▪ Goshikko
▪ Hime
▪ Himekaji
▪ Ishoku Hada
▪ Manba
▪ Rokku
▪ Tsuyome
▪ Yamanba
▪ Otros
o Principiante
o TikTok make ups
▪ Grunge
▪ Dark Femenine
```

```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
```
▪ Latina
▪ Douyin
▪ Down Town
▪ Alt/Alternativo
▪ Doll
▪ Coquette
▪ E-girl
▪ Clean Look
▪ Variados
▪ Otros
```
- RQFN74: El sistema debe mostrar un encabezado por página con el nombre de la
    cultura/estilo y una imagen referencial
- RQFN75: El sistema debe mostrar una descripción del estilo/cultura
- RQFN76: El sistema debe mostrar los subestilos/variaciones del estilo/cultura
- RQFN77: Por cada subestilo/variaciones, el sistema debe mostrar la siguiente
    información:
       o Nombre
       o Imagen
       o Texto para la descripción, origen y características o diferencias que tiene con el
          estilo original
       o Botón “Utilizar”
       o Enlaces de recursos
       o Bibliografía
- RQFN78: El botón “Utilizar” debe hacer redirección a la Página de Maquillajes
    aplicando los siguientes filtros:
       o Subestilo seleccionado
       o Características físicas del usuario
       o Página de maquillajes
- RQFN79: El sistema debe mostrar los siguientes elementos por cada miniatura del video:
    o Imagen del video
    o Creador
    o Cantidad de likes
    o Porcentaje de semejanza
- RQFN80: El sistema debe redirigir a la página del video una vez habiendo dado click a la
    miniatura de este
- RQFN81: En caso de que el sitio no cuente con videos en su base de datos, el sistema
    debe mostrar un mensaje de bienvenida.
- RQFN82: La página debe mostrar inicialmente 30 videos y mostrar 30 videos más
    cuando el mismo detecte que el usuario está en la penúltima fila
- RQFN83: En caso de no contar con sesión, la página debe tomar como referencia los
    siguientes valores para mostrar los videos de manera jerárquica:
- El porcentaje de semejanza de mayor a menor.
- La cantidad de likes de mayor a menor
- RQFN84: En caso de contar con sesión, la página debe tomar como referencia los
    siguientes valores para mostrar los videos de manera jerárquica:
       o Preferencias del usuario. Son las 3 culturas y los 3 estilos a los que el usuario les
          ha dado más likes.
       o Características físicas del usuario


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
- RQFN85: En caso de que todos los filtros aplicados coincidan con los filtros de
    características físicas del usuario registrados en el sistema, el sistema debe mostrar una
    marca de que estos se encuentran activados (“filtros personalizados filtros de
    características físicas del usuario activos”)
- RQFN86: El sistema debe de desactivar la marca de “filtros de características físicas del
    usuario activos” en cuanto el usuario deseleccione cualquiera de los filtros que formen
    parte de los filtros de características físicas del usuario
- RQFN87: Al realizar una búsqueda, el sistema ya no tomará en cuenta las características
    físicas del usuario
- RQFN88: La página de maquillajes debe contar con una barra superior para abrir
    cualquiera de los siguientes apartados:
       o Todos los videos
       o Tutorial de Maquillajes
       o Delineados
       o Sombras
       o Lip Combo
       o Base
       o Video Maquillajes
       o Botón para desactivar/activar filtrado por características físicas del usuario
- RQFN89: Al abrir cualquiera de los apartados, en caso de no contar con el filtrado de
    características físicas del usuario, el sistema debe mostrar los videos jerárquicamente
    utilizando de referencia el porcentaje de semejanza de cada uno
- Apartado Tutorial Maquillajes
- RQFN90: Si el video no cuenta con imágenes subidas, lo que se mostrará será el video
    sin audio como presentación de este
- RQFN91: El sistema debe contar con las siguientes opciones de filtrado:
    o Edad
    o Forma de la boca
    o Forma de la nariz
    o Forma de los labios
    o Forma de los ojos
    o Color de piel
- RQFN92: El sistema debe contar con las siguientes opciones de ordenamiento
- más relevantes (con más likes y comentarios)
    o Porcentaje semejanza
    o Fecha de publicación
    o Cultura/Estilo
    o Subestilo/Variaciones
- RQFN93: El sistema debe contar con las siguientes opciones de filtrado:
    o Edad
    o Tipo de piel
    o Forma de ojos (si la página no cuenta con filtrado por características del usuario)
    o Ordenar por:
    o porcentaje de semejanza
    o más relevantes (con más likes y comentarios)
    o fecha de publicación
    o Cultura/Estilo
    o Subestilo/Variaciones
    o Apartado de sombras


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
- RQFN94: Si el video no cuenta con imágenes subidas, lo que se mostrará será el video
    sin audio como presentación de este
- RQFN95: El sistema debe contar con las siguientes opciones de filtrado:
    o Edad
    o Tipo de piel
    o Forma de ojos
    o Ordenar por:
    o porcentaje de semejanza
    o más relevantes (con más likes y comentarios)
    o fecha de publicación
    o Cultura/Estilo
    o Subestilo/Variaciones
- Apartado Lip Combo
- RQFN96: Si el video no cuenta con imágenes subidas, lo que se mostrará será el video
    sin audio como presentación del mismo
- RQFN97: El sistema debe contar con las siguientes opciones de filtrado:
    o Edad
    o Forma de la boca (si la página no cuenta con filtrado por características del
       usuario)
    o Ordenar por:
    o más relevantes (con más likes y comentarios)
    o fecha de publicación
    o porcentaje semejanza
    o Cultura/Estilo
    o Subestilo/Variaciones
- Apartado Video del maquillaje
- RQFN98: Si el video no cuenta con imágenes subidas, lo que se mostrará será el video
    sin audio como presentación del mismo
- RQFN99: El sistema debe contar con las siguientes opciones de filtrado:
    o Edad
    o Forma de la boca
    o Forma de la nariz
    o Forma de los labios
    o Forma de los ojos
    o Forma de la cara
    o Color de piel
    o Ordenar por:
    o más relevantes (con más likes y comentarios)
    o fecha de publicación
    o porcentaje semejanza
    o Cultura/Estilo
    o Subestilo/Variaciones
Maquillaje
- RQFN100: El sistema debe mostrar los siguientes elementos de la página del video:
o Video
o Opción para modificación del video
o Botón para abrir comentarios
o Botón para abrir la galería de imágenes
o Información del maquillaje


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
- RQFN101: El video debe tener la función de pausar, reproducir, adelantar y atrasar.
- RQFN102: El botón de modificación de vídeo debe permitir modificar la siguiente
    información:
       o Descripción
       o Categoría
       o Subcategoría
       o Etiquetas
       o Eliminar video
- RQFN103: El valor de medida del tiempo en las gráficas depende del siguiente rango de
    tiempo que lleva en la plataforma:
       o 1 día - 1 semana: 7 días
       o 1 semana - 1 mes: 28 días
       o 1 mes - 24 meses: 12 meses
       o 2 años - 5 años: 5 años
       o 5 años - X años: X años
- RQFN104: El sistema debe mostrar el apartado de comentarios al presionar el botón
    Comentarios que despliega:
       o Comentarios
       o Apartado para publicar un comentario
- RQFN105: El Comentario debe mostrar el texto del comentario y el nombre del usuario
    quien lo publicó
- RQFN106: El apartado para publicar un comentario debe mostrar:
    o Caja de texto para escribir el comentario
    o Botón para publicar comentarios
- RQFN107: Al presionar el botón de Galería de imágenes, el sistema debe mostrar las
    imágenes que el usuario adjuntó al video
- RQFN108: En caso de que el video maquillaje no cuente con imágenes, el sistema debe
    mostrar el mensaje “Nada aquí”
- RQFN109: El sistema debe mostrar una opción para acceder a los comentarios donde se
    desplegará la siguiente información:
       o Comentarios de usuarios
       o Cuadro de texto para escribir y botón para publicar los comentarios
- RQFN110: El sistema debe darle la opción al usuario de responder a comentarios de otros
    usuarios
- RQFN111: El sistema debe mostrar un botón para acceder a la galería de imágenes que el
    creador haya adjuntado.
- RQFN112: En caso de no contar con imágenes adjuntas en la galería, el sistema debe
    mostrar un mensaje de la ausencia de estas.
- RQFN113: El sistema debe mostrar una opción para desplegar:
    o Valor del porcentaje de semejanza
    o Descripción del maquillaje
    o Pasos del maquillaje
    o Estilo y subestilo
    o Cantidad de votos a favor y votos en contra
    o Cantidad de veces guardadas
    o Cantidad de veces compartidas
- RQFN114: El usuario puede guardar la publicación en su perfil.
- RQFN115: El sistema debe mostrar si el video ya se encuentra guardado en su perfil


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
- RQFN116: El usuario puede votar en contra en caso de que el video no cumpla
    seleccionando alguno de los siguientes casos:
       o En caso de que el video sea un maquillaje:
       o El delineado no concuerda con el estilo
       o Los colores empleados en el maquillaje no hacen referencia al estilo que propone
       o Los accesorios/vestimenta no concuerdan con la estética
       o Los simbolismos que se utilizan en el maquillaje no hacen referencia a la estética
       o La música utilizada no hace referencia al estilo a representar
       o El peinado no hace referencia a la estética propuesta
       o Selección de estilo alternativo. El usuario selecciona está casilla que muestra una
          lista desplegable de otros estilos para que el usuario seleccione en caso de que el
          maquillaje sea similar a otro estilo del sitio.
       o En caso de ser tutorial de maquillaje:
       o Los simbolismos que se utilizan en el maquillaje no hacen referencia a la estética
       o La música utilizada no hace referencia al maquillaje
       o El delineado no concuerda con el estilo
       o Los colores empleados en el maquillaje no hacen referencia al estilo que propone
       o La forma de los ojos no concuerda con las etiquetas utilizadas (esto únicamente
          en caso de que el usuario haya agregado etiquetas referentes a esta característica
          corporal)
       o La forma de la nariz no concuerda con las etiquetas utilizadas (esto únicamente
          en caso de que el usuario haya agregado etiquetas referentes a esta característica
          corporal)
       o La forma del tipo de rostro no concuerda con las etiquetas utilizadas (esto
          únicamente en caso de que el usuario haya agregado etiquetas referentes a esta
          característica corporal)
       o El color de piel no concuerda con las etiquetas utilizadas (esto únicamente en
          caso de que el usuario haya agregado etiquetas referentes a esta característica
          corporal)
       o Selección de estilo alternativo. El usuario selecciona está casilla que muestra una
          lista desplegable de otros estilos para que el usuario seleccione en caso de que el
          maquillaje sea similar a otro estilo del sitio.
- RQFN117: El usuario puede votar a favor cuando considere que la publicación sí cumple
    con las características del estilo/cultura
- RQFN118: En caso de que el video no cuente con una descripción, el sistema debe
    mostrar un mensaje de “Nada Aquí” en el apartado respectivo
- RQFN119: El sistema debe dividir el apartado de Pasos en los siguientes puntos:
    o Preparación de la piel
    o Base de maquillaje
    o Contornos/Iluminación
    o Corrector
    o Sombras y Pestañas
    o Delineado
    o Cejas
    o Lip Combo
- RQFN120: En caso de no contar con pasos, el sistema debe mostrar un mensaje de “El
    creador no ha adjuntado pasos escritos en este tutorial”
- Crear maquillaje
- RQFN121: El usuario debe llenar los siguientes campos para la publicación de su video:


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
```
o Si el video es un video tutorial o un video maquillaje
o Categoría de Estilo/Cultura
o Subestilo
o Adjuntar un video
```
- RQFN122: El usuario tiene la opción de agregar pasos o detalles dentro del apartado de
    “Pasos”. (solo disponible para los video tutoriales)
- RQFN123: El usuario debe seleccionar las características físicas que corresponden al
    video
       o Forma de ojos
       o Tipo de nariz
       o Tipo de labios
       o Tipo de rostro
       o Color de piel
- RQFN124: El usuario tiene la opción de subir un máximo de 5 imágenes
- RQFN125: El sistema deberá mostrar un mensaje de error en caso de que alguno de los
    porcentajes de las categorías que proporcionó la API Image Moderation de Sightengine
    sean mayores al 15%
Conversaciones
- RQFN126: El sistema debe de mostrar diferentes opciones de filtrado para la página de
conversaciones:
o Tema
▪ Maquillajes
▪ Delineados
▪ Sombras
▪ Lip Combos
▪ Temas variados/Debates
o Subculturas/Estilos
▪ Gótico
▪ Emo
▪ Punk
▪ Lolita
▪ Visual Kei
▪ Gyaru
▪ Tik Tok make ups
▪ Otro
- RQFN127: El sistema debe mostrar las 30 conversaciones más recientes en cada apartado
y cuando llegue a la penúltima fila debe cargar otras 30
- RQFN128: El sistema debe mostrar una miniatura por cada conversación donde se
muestren los siguientes elementos:
o Creador de la conversación
o Título de la conversación
o Texto (máx. 300 caracteres para la visualización)
o Cantidad de comentarios
o Cantidad Likes
- RQFN129: Al presionar en la miniatura, el sistema debe redirigir al usuario a la página de
la conversación
Página para crear una conversación
- RQFN130: El sistema debe de mostrar una opción de “Crear Conversación”


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
- RQFN131: En caso de que no exista una sesión, el sistema redirigirá automáticamente a
    la Página de Inicio de sesión
- RQFN132: El usuario debe incluir la siguiente información dentro de la publicación de su
    conversación
       o Tema
          ▪ Maquillajes
          ▪ Delineados
          ▪ Sombras
          ▪ Lip Combos
          ▪ Temas variados/Debates
       o Subculturas/Estilos
          ▪ Gótico
          ▪ Emo
          ▪ Punk
          ▪ Lolita
          ▪ Visual Kei
          ▪ Gyaru
          ▪ Tik Tok make ups
          ▪ Otro
       o Título de su conversación
       o Texto de la conversación
       o Imágenes de la conversación (OPCIONAL)
- RQFN133: El sistema debe de mostrar un mensaje de error en caso de que alguna de las
    imágenes cuente con más del 15% en alguna de las categorías que proporciona la API
- Página de conversación
- RQFN134: El sistema debe de mostrar los siguientes elementos al abrir la conversación:
- Creador de la conversación
    o Título de la conversación
    o Texto
    o Imágenes
    o Cantidad de Likes
- RQFN135: El usuario puede dar like a la conversación
- RQFN136: El sistema debe mostrar un formulario para denunciar con los siguientes
    elementos:
       o Razón/Motivo:
       o Contenido sexual inapropiado
       o Violencia o amenazas
       o Acoso o bullying
       o Discurso de odio
       o Información falsa
       o Datos personales (privacidad)
       o Spam o estafas
       o Suplantación de identidad
       o Actividades ilegales
       o La conversación no cumple con la categoría mencionada
       o OTRO (especificar motivo)
- RQFN137: El sistema debe eliminar cualquier conversación la cual haya sido denunciada
    por más del 45% de las vistas después de las primeras 20 vistas y enviar una notificación
    al usuario.


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
- RQFN138: El sistema debe enviar una notificación al usuario en caso de que su video
    haya superado el 45% de denuncias informando que su video ha sido eliminado del sitio.
- RQFN139: El sistema debe mostrar un apartado de comentarios
- RQFN140: El usuario puede publicar un comentario
- RQFN141: El sistema debe permitir al usuario comentar comentarios.

```
2.2.1 Interfaces del sistema.
```
- Inicio de sesión. Siendo lo primero que se llega a ver al querer realizar funciones
    importantes dentro del sitio (subir videos, publicar conversaciones, publicar
    comentarios, dar like a videos, etc.), es la página por la cual el usuario ingresa sus
    datos para acceder de nuevo al sitio y pueda realizar las acciones previamente
    mencionadas.
- Registro. Es la página por la cual el usuario se da de alta dentro del sitio para poder
    llevar una experiencia más personalizada y realizar funciones importantes dentro del
    sitio (subir videos, publicar conversaciones, publicar comentarios, dar like a videos,
    etc.).
- Olvido de contraseña. Es común que algunos usuarios olviden su contraseña al querer
    iniciar sesión. Por ende, el sitio cuenta con un apartado por el cual el sitio realizará el
    envío de un mensaje a la dirección de correo ingresada cuando se realizó el registro
    del usuario por el cual se realizará el procedimiento para la solicitud de cambio de
    contraseña.
- Barra de navegación. Parte esencial de cada una de las páginas del sitio, es una
    herramienta para acceder rápidamente a varias páginas dentro del sitio. Entre algunas
    de las opciones a las que se puede acceder con facilidad por medio de la barra de
    navegación son: notificaciones, página de maquillajes, crear publicación, página de
    conversaciones y acceso directo al perfil del usuario.
- Wiki. Esta es la página principal dentro del sitio, donde se presenta la descripción,
    misión y público al que va dirigido B-unick. Además, es la página que cuenta con los
    enlaces a redirección a las páginas informativas de cada cultura y estilo.
- Perfil. Es la página que contiene toda la información del usuario (nombre de usuario,
    foto de perfil, descripción, foto de perfil) y al mismo tiempo es donde puede hacer
    modificaciones a la misma, incluyendo la contraseña. Además, en esta página puede
    visualizar los videos que ha publicado, guardado, visto y las conversaciones que ha
    iniciado
- Notificaciones. En este apartado el usuario puede visualizar cualquier notificación
    en casos tales como: una cuenta que el usuario sigue ha subido contenido nuevo,
    alguien le ha dado like al contenido del usuario, un video del usuario no ha alcanzado
    el porcentaje de semejanza esperado, un usuario ha comentado un video o un
    comentario del usuario.
- Página de cultura y estilo. Cada cultura y estilo cuenta con una página individual
    donde se muestra la siguiente información: descripción, origen, características,
    variaciones y enlaces para algunos recursos digitales que existen. Además, cada
    cultura y estilo cuenta con un enlace de redirección a la página de maquillajes
    aplicando filtros con las características físicas del usuario.


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
- Página de maquillajes. Apartado en el cual se muestran los videos del sitio divididos
    por tipos de tutoriales (delineados, sombras, lip combo). La página se puede ordenar
    y filtrar por medio del porcentaje de semejanza, culturas y estilos, subculturas y
    subestilos y por las características físicas del usuario.
- Maquillaje. Es donde se muestra el video, información de este (descripción, pasos,
    categorías), apartado para ver y publicar comentarios, modificar el video
    (descripción, categoría, subcategoría, etiquetas y eliminación del video), ver
    estadísticas y poder dar like y/o votar en el porcentaje de semejanza.
- Crear maquillaje. En este apartado, los usuarios podrán crear sus propias
    publicaciones y seleccionar todos los elementos que conforman a su video (tutorial o
    video maquillaje, categoría del estilo/cultura, subestilo, descripción, video)
- Conversaciones. Este es el corazón del intercambio de información entre usuarios. En
    este apartado, los usuarios serán capaces de escribir y comentar conversaciones
    donde se intercambien debates, cuestiones e información relevantes sobre las culturas
    y los estilos.
- Página para crear una conversación. Esta página sirve para que los usuarios
    publiquen sus conversaciones seleccionando el tema del que van a hablar, imágenes
    adjuntas y, sobre todo, el texto y corazón de su conversación
- Página de conversación. En este apartado los usuarios pueden ver los comentarios, el
    texto completo, las imágenes y la opción de publicar él mismo sus propios
    comentarios de una conversación.


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
2.2.2 Interfaces con el usuario.

```
Fig1. Inicio de sesión.
```
Fig 2. Campo para ingreso de correo electrónico para recuperación de contraseña.

```
Fig 3. Campo para ingreso de nueva contraseña.
```

```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
```
Fig 4. Mensaje de confirmación de cambio de contraseña.
```
```
Fig 5. Página de registro de usuario.
```
Fig 5. Mensaje para confirmar que el usuario desea continuar con el formulario de características
físicas para completar su registro.

```
Fig 6. Selección del campo de Forma de ojos
```

Documento de Especificación de Requerimientos.
**Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)**

```
Fig 7. Selección del campo de Forma de Nariz
```
```
Fig 6. Selección del campo de Forma de Rostro
```
```
Fig 6. Selección del campo de Color de piel
```
```
Fig 6. Selección del campo de Forma de labios
```

Documento de Especificación de Requerimientos.
**Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)**

```
Fig 6. Selección del campo de Tipo de Piel
```
```
Fig 6. Selección del campo de Fecha de Nacimiento
```
```
Fig 7. Mensaje de envio para confirmar el correo
```
```
Fig 8. Mensaje de confirmación del registro
```

```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
Fig 9. Barra de navegación (En caso de contar con un inicio de sesión activo o no)

```
Fig 10. Encabezado del apartado Wiki
```
```
Fig 11. Apartados de la Wiki
```
```
Fig 12. Apartado para la cultura
```

Documento de Especificación de Requerimientos.
**Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)**

```
Fig 13. Descripción y origen de la cultura
```
```
Fig 14. Características de la cultura
```
```
Fig 15. Variaciones de la cultura, orígenes y características de las mismas
```
```
Fig 16. Características de la variación
```

Documento de Especificación de Requerimientos.
**Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)**

```
Fig 17. Variación X de la cultura
```
```
Fig 16. Recursos y Bibliografía de la Cultura
```
```
Fig 17. Perfil de Usuario desde el punto de vista de otro
```

Documento de Especificación de Requerimientos.
**Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)**

```
Fig 18. Perfil del Usuario, apartado de publicaciones del usuario
```
```
Fig 19. Perfil de usuario, apartado de guardados
```
```
Fig 20. Perfil del usuario, apartado de videos vistos
```
```
Fig 21. Perfil del usuario, apartado de conversaciones creadas
```

Documento de Especificación de Requerimientos.
**Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)**

```
Fig 22. Configuración del perfil del usuario, nombre de usuario y contraseña
```
```
Fig 23. Configuración del perfil del usuario, contraseña y descripción
```
```
Fig 24. Apartado de notificaciones
```

Documento de Especificación de Requerimientos.
**Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)**

```
Fig 25. Apartado de notificaciones vacias
```
```
Fig 26. Apartado de inicio, Todas las categorías
```
```
Fig 27. Apartado de inicio, todas las categorías, filtros
```
```
Fig 28. Apartado de inicio, maquillaje completo, filtros
```

Documento de Especificación de Requerimientos.
**Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)**

```
Fig 29. Apartado de inicio, delineados, filtros
```
```
Fig 30. Apartado de inicio, sombras, filtros
```
```
Fig 31. Apartado de inicio, lip combo, filtros
```

```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
```
Fig 32. Apartado de inicio, base, filtros
```
```
Fig 33. Apartado de inicio, Video Maquillaje, filtros
```
Fig 3 4. Reproducción del video, apartado de configuración (descripción y categoría)

```
Fig 35. Reproducción del video, apartado de configuración (etiquetas)
```

```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
```
Fig 36. Mensaje de error en caso de descripción vacía
```
Fig 37. Reproducción del video, mensaje de confirmación para eliminar el video

```
Fig 38. Formulario de votación para voto de semejanza en caso de ser negativo
```

Documento de Especificación de Requerimientos.
**Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)**

```
Fig 39. Reproducción del video, apartado de descripción del tutorial
```
```
Fig 40. Reproducción del video, galería de imágenes
```
```
Fig 41. Reproducción del video, comentarios
```
```
Fig 42. Selección para crear un Tutorial o Video
```

```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
```
Fig 43. Página para crear Tutorial, tipo de tutorial, categoría, descripción y etiquetas
```
```
Fig 44. Crear tutorial, características físicas y pasos
```
Fig 45. Crear tutorial, mensaje de error al subir el video debido a que este mismo contiene
elementos inapropiados


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
```
Fig 4 6. Crear tutorial, mensaje de error al subir el formato incorrecto
```
Fig 4 7. Crear tutorial, mensaje de error por intentar subir una cantidad de elementos mayor a la
permitida

```
Fig 4 8. Crear tutorial, características físicas y pasos activar o desactivar
```

```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
```
Fig 49. Crear video
```
```
Fig 50. Crear tutorial, tipo de publicación, categoría, descripción, etiquetas
```
Fig 51. Crear tutorial, mensaje de error al subir el video debido a que este mismo contiene
elementos inapropiados


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
```
Fig 52. Crear video, mensaje de error al subir el video debido a que este mismo contiene
elementos inapropiados
```
Fig 53. Crear tutorial, mensaje de error por intentar subir una cantidad de elementos mayor a la
permitida

```
Fig 54. Crear video, características físicas del video
```

Documento de Especificación de Requerimientos.
**Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)**

```
Fig 55. Crear video, desactivar características físicas
```
```
Fig 56. Página de conversaciones
```
```
Fig 57. Conversaciones, filtros de conversaciones
```

```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
```
Fig 58. Conversaciones, ninguno de los filtros coincide
```
```
Fig 59. Crear conversaciones, título, texto, tema y cultura
```
```
Fig 60. Crear conversaciones, agregar imágenes
```
Fig 6 1. Crear conversaciones, mensaje de error debido a que alguna de las imágenes contiene
elementos inapropiados


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
```
Fig 62. Conversaciones, contenido de la conversación
```
```
Fig 63. Crear conversaciones, comentarios de la conversación
```
```
2.3 Interfaces de comunicaciones
```
El sistema B-unick funcionará como una plataforma web, por lo que sus interfaces de comunicación
estarán basadas en tecnologías estándar de internet. En cuanto a los protocolos de red, se utilizará
el protocolo HTTP/HTTPS, siendo HTTPS el principal para garantizar la seguridad de la
información transmitida entre el cliente (navegador del usuario) y el servidor.

Para la comunicación entre cliente y servidor, se emplearán solicitudes RESTful mediante métodos
como GET, POST, PUT y DELETE, permitiendo la gestión de datos como usuarios, publicaciones,
comentarios y contenido multimedia. Estas solicitudes podrán manejar formatos de intercambio de
datos como JSON, debido a su ligereza y facilidad de integración con aplicaciones web modernas.

En cuanto a la comunicación entre dispositivos y servicios internos, el sistema podrá apoyarse en
APIs (Interfaces de Programación de Aplicaciones), las cuales permitirán la integración con
servicios externos como almacenamiento de contenido multimedia, autenticación o servicios de
video. Además, se podrán utilizar tecnologías como WebSockets para funciones en tiempo real,
como la interacción en el apartado de comunidad o notificaciones.

Respecto a la compatibilidad, el sistema será accesible desde navegadores web modernos en
distintos dispositivos, como computadoras, tabletas y teléfonos móviles, asegurando una
experiencia uniforme mediante diseño responsivo. Entre los navegadores compatibles se


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
contemplan Google Chrome, Mozilla Firefox y Microsoft Edge en sus versiones más recientes,
garantizando el correcto funcionamiento de las interfaces, reproducción de contenido multimedia
y navegación dentro de la plataforma.

```
2.3 Características del usuario.
```
Los usuarios intencionales del sistema B-unick corresponden principalmente a personas interesadas
en culturas urbanas, estilos alternativos y tendencias estéticas difundidas en redes sociales.

En cuanto al nivel educativo, se espera que los usuarios cuenten con al menos educación básica o
media superior, ya que deberán comprender información descriptiva, histórica y conceptual sobre
distintas culturas urbanas. Sin embargo, el sistema estará diseñado con un lenguaje accesible para
permitir su uso por una audiencia amplia.

Respecto a la experiencia tecnológica, los usuarios tendrán un nivel básico a intermedio en el uso
de plataformas digitales, especialmente redes sociales. Se espera que estén familiarizados con
acciones como registrarse, iniciar sesión, publicar contenido, comentar y navegar entre secciones.
Asimismo, para poder registrarse y utilizar las funciones personalizadas de la plataforma, el usuario
deberá contar con una dirección de correo electrónico válida y de acceso personal.

En términos de especialización técnica, no se requiere conocimiento técnico avanzado para utilizar
la plataforma. No obstante, algunos usuarios pueden tener mayor experiencia en áreas como
maquillaje, moda alternativa o participación en comunidades digitales, lo cual enriquecerá la
interacción dentro del apartado de comunidad.

Finalmente, los usuarios pueden variar en edad, pero se estima que el público principal estará
conformado por adolescentes y adultos jóvenes (13-30 años), quienes suelen interactuar con mayor
frecuencia en plataformas digitales y mostrar interés por tendencias culturales emergentes.

2. 4 Restricciones. (delimitaciones)

El desarrollo e implementación de la plataforma B-unick estará sujeto a diversas restricciones que
limitan y definen tanto su diseño como su funcionamiento. Estas restricciones permiten establecer
un marco claro para el desarrollo del sistema y asegurar su viabilidad.

En primer lugar, existen condiciones de implementación relacionadas con el entorno web en el que
operará el sistema. Al tratarse de una aplicación accesible desde navegadores, el sistema deberá
cumplir con estándares web actuales (HTML5, CSS3 y JavaScript), así como garantizar
compatibilidad con distintos navegadores y dispositivos. Asimismo, deberá considerar


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
lineamientos de uso de contenido, especialmente por tratar temas culturales, evitando la difusión
de información incorrecta u ofensiva.

Respecto a las interfaces con otras aplicaciones, B-unick se integra con servicios externos mediante
APIs, como la API Image/Video Moderation de Sightengine para la validación y moderación
automática de contenido multimedia. Asimismo, el sistema utilizará la API de almacenamiento
multimedia de Cloudinary para el alojamiento, optimización y gestión de imágenes y videos, así
como sus servicios de reproducción y distribución de video mediante CDN para garantizar una
carga rápida y una correcta visualización del contenido multimedia dentro de la plataforma.

Además, el sistema empleará servicios de autenticación mediante JSON Web Token (JWT) para la
gestión de sesiones de usuario y utilizará bcrypt para el cifrado y almacenamiento seguro de
contraseñas. Estas integraciones estarán limitadas por la disponibilidad, restricciones y políticas de
dichos servicios externos.

En cuanto a los requisitos de lenguaje, la plataforma estará dirigida principalmente a usuarios
hispanohablantes, por lo que el idioma principal será el español.


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
3. Los requisitos específicos.

a) Tecnologías a utilizar

En una primera etapa, se realizará el diseño de la interfaz utilizando HTML, CSS y React,
desarrollando componentes individuales como formularios de registro, inicio de sesión,
visualización de contenido y secciones informativas.

Posteriormente, se implementará la lógica del sistema mediante Node.js, estableciendo la
comunicación entre el frontend y el backend, así como la gestión de usuarios, publicaciones,
comentarios y contenido multimedia. En esta etapa también se integrará el sistema de
autenticación basado en JSON Web Token (JWT) para proteger rutas, validar usuarios y controlar
el acceso a las funcionalidades del sistema, así como bcrypt para el almacenamiento seguro de
contraseñas.

En fases intermedias, se integrarán las APIs externas, particularmente las de moderación de
contenido de Sightengine, incorporándolas en los procesos de carga de imágenes y videos para
validar automáticamente el contenido antes de su publicación. Asimismo, se utilizarán los
servicios multimedia de Cloudinary para el almacenamiento, optimización, transformación y
distribución de imágenes y videos dentro de la plataforma.

De manera paralela, se realizarán pruebas funcionales en cada componente desarrollado,
verificando que cumpla con los requerimientos establecidos. Estas pruebas permitirán detectar
errores de manera temprana y asegurar la calidad del sistema.

Finalmente, se llevará a cabo la implementación del sistema utilizando una arquitectura cloud. El
frontend y backend serán desplegados conjuntamente mediante Render, mientras que la base de
datos será administrada mediante Railway utilizando MySQL. Durante esta etapa se realizarán
pruebas de funcionamiento en un entorno real, optimizando el rendimiento, seguridad y
escalabilidad del sistema.

Este enfoque modular permite desarrollar el sistema de forma organizada, facilitando futuras
mejoras, mantenimiento y escalabilidad del proyecto.

3. 1 Requerimientos No Funcionales.
- RQNFN1: El sistema debe validar que los campos de correo y contraseña no se
    encuentren vacíos
- RQNFN2: El sistema debe validar que:
    o Existe un registro del correo electrónico indicado en la base de datos
    o La contraseña ingresada sea idéntica a la almacenada en la base de datos
    Al realizar estas validaciones, el sistema debe redirigir a la página Principal
- RQNFN3: El sistema debe guardar un token que contenga el correo y la hora de
    vencimiento del token del usuario encriptadas con jwt en cookies para las siguientes
    páginas del sitio
- RQNFN4: El sistema debe almacenar las preferencias del usuario.


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
Registro

- RQNFN5: El sistema debe validar que los campos de correo y contraseña no
    RQNFN6: se encuentren vacíos
- RQNFN7: El sistema debe validar que la contraseña cuente con una extensión de 8
    caracteres, cuente con al menos un número y un carácter.
- RQNFN8: El sistema debe validar que el correo no se encuentre registrado en la base
    de datos. En caso contrario, mostrar un mensaje de error
- RQNFN9: El sistema debe validar que el nombre de usuario no se encuentre ya
    registrado en la base de datos. En caso contrario, mostrar un mensaje de error
- RQNFN10: El sistema debe validar que uno de los campos por categoría se encuentre
    seleccionados, que la edad no salga del rango entre 5 y 100 años
- RQNFN11: El sistema debe validar que todos los campos se encuentren completos
- RQNFN12: El enlace debe de caducar a las 24 horas de haber sido enviado
Olvido de contraseña
- RQNFN13: El sistema debe validar que el correo existe en la base de datos
- RQNFN14: El correo enviado debe contener un enlace de redirección al sitio de
    recuperación.
- RQNFN15: El enlace debe de caducar a las 24 horas de haber sido enviado
- RQNFN16: El sistema debe validar que ambos campos sean iguales. En caso
    contrario, el sistema debe mostrar un mensaje de error y vaciar los campos
- RQNFN17: El sistema debe validar que la contraseña cuente con una extensión de 8
    caracteres, cuente con al menos un número y un caracter.
- Barra de navegación
- RQNFN18: El sistema debe validar que el token se encuentre en las cookies para
    validar que existe un inicio de sesión activo
- RQNFN19: El sistema no requiere validación de inicio de sesión para mostrar este
    sitio
Perfil
- RQNFN20: Por cada vez que se visualice un vídeo este se posicionará de nuevo en el
    tope de la lista, no se volverá a agregar el elemento a la lista de videos vistos
- RQNFN21: Al presionar el botón de seguir, el sistema debe almacenar la cuenta en el
    apartado de siguiendo
- RQNFN22: El sistema precargar la información del usuario y mostrarla a excepción
    de la contraseña
- RQNFN23: El sistema debe validar que la contraseña actual coincida con la
    registrada en la base de datos
- RQNFN24: El sistema debe confirmar que el contenido de ambos campos sea
    idéntico. De lo contrario, notificar al usuario
- RQNFN25: El sistema debe validar que el usuario haya seleccionado una imagen. En
    caso contrario no activar el botón de continuar.
- RQNFN26: El sistema debe validar que la descripción no sea mayor a 200 caracteres
Notificaciones
- RQNFN27: El sistema debe eliminar las notificaciones después de 3 meses de su
    envío
- RQNFN28: El sistema debe mostrar un mensaje de recomendación al usuario para
    modificar la categoría del video del usuario para cambiar la misma.
Wiki
- RQNFN29: El sistema debe considerar la siguiente jerarquía de filtros para mostrar:
    o Coincidencia de todos los filtros


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
```
o Color de piel
o Forma de ojos
o Forma de rostro
o Forma de labios
o Forma de nariz
o Página de maquillajes
```
- RQNFN30: El sistema debe de consultar si existen imágenes guardadas del
    maquillaje. En caso de contar, mostrar la primera como miniatura.
- RQNFN31: El sistema debe calcular el porcentaje total de Porcentaje de semejanza
- Utilizando la cantidad de votos a favor y en contra. Se utiliza la siguiente fórmula:
    Opiniones a favor (OF)
    Opiniones en contra (OC)

# (OF/(OF+OC)) *100

- RQNFN32: El sistema debe almacenar los videos a los que el usuario les dio me
    gusta.
- RQNFN33: El sistema debe de volver a obtener los 3 estilos y los 3 subestilos a los
    que el usuario más les ha dado like después de que haya dado like a una publicación.
- RQNFN34: El sistema debe consultar la base de datos para confirmar que los filtros
    aplicados son idénticos a los filtros de características físicas del usuario.
- RQNFN35: El sistema debe mantener la opción de filtrado por características
    siempre activada si se encuentra un inicio de sesión activo.
Maquillaje
- RQNFN36: El sistema debe almacenar los videos vistos por el usuario, eliminando
    los almacenados una vez haya pasado un mes desde que lo vio.
- RQNFN37: El sistema debe de consultar si existen imágenes guardadas del
    maquillaje. En caso de contar, mostrar la primera como miniatura.
- RQNFN38: Si el video cuenta con una descripción, el sistema debe validar que la
    misma no se encuentre vacía una vez hechos los cambios
- RQNFN39: Al cambiar de categoría y/o subcategoria, el sistema debe borrar la
    cantidad de votos en favor y en contra del video
- RQNFN40: En caso de que un usuario no haya votado en ninguna casilla dentro del
    formulario, el sistema debe crear una categoría en el “Apartado de Listado de
    elementos en contra y porcentajes” para mostrar el porcentaje correspondiente.
- RQNFN41: En Grafica de vistas, el sistema debe realizar el siguiente calculo para la
    muestra de información:
       V(t) = r * t
Significado:
V(t) = número de vistas en el tiempo
r = tasa de vistas (vistas por unidad de tiempo, ej: por día)
t = tiempo desde la publicación
- RQNFN42: En Grafica de likes, el sistema debe realizar el siguiente calculo para la
    muestra de información:
       L(t) = k * t
Significado:
L(t) = número de likes en el tiempo
k = tasa de likes (likes por unidad de tiempo)
t = tiempo desde la publicación


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
- RQNFN43: En el “Listado de ‘Elementos en contra’ y porcentajes”, el sistema debe
    realizar el siguiente calculo para los porcentajes de cada uno de los elementos:
       R = Votos en contraTotal*100/VotosAEsaCasilla
- RQNFN44: El sistema debe obtener el tiempo que el video lleva en el sistema
- RQNFN45: El sistema debe validar que los comentarios que vayan a ser publicados
    no sobrepasen el rango entre 1 - 250 caracteres.
- RQNFN46: El sistema debe almacenar si el comentario es a un video o a un
    comentario
- RQNFN47: El sistema debe de validar que existan imágenes subidas.
- RQNFN48: El sistema debe aumentar el número de guardado por uno cada que el
    video sea guardado
- RQNFN49: El sistema debe validar que mínimo uno se encuentre seleccionado para
    validar el voto en contra del usuario
- RQNFN50: El sistema debe aumentar el contador de los votos a favor y en contra.
- RQNFN51: El sistema debe recalcular el porcentaje de semejanza cada que un
    usuario vote.
- RQNFN52: Los apartados de pasos del maquillaje son opcionales
Crear maquillaje
- RQNFN53: El sistema debe validar que solo un estilo y un subestilo hayan sido
    seleccionados.
- RQNFN54: El sistema debe validar que el video es del formato mp4
- RQNFN55: El sistema debe validar que todos los campos se encuentren
    seleccionados y que haya un solo video adjunto
- RQNFN56: El sistema debe validar que el video sea igual o menor a 50MB
- RQNFN57: El sistema debe de permitir únicamente la selección de mínimo 1
    etiqueta por característica física y máximo 3. El color de piel tiene la excepción de
    solo poder seleccionar 1.
- RQNFN58: El sistema debe validar que las imágenes sean mayores a los 100KB y
    menor a los 10MB.
- RQNFN59: El sistema debe utilizar la API Image Moderation de Sight Engine para la
    validación del video
- RQNFN60: La API Image Moderation de Sightengine debe de obtener los
    porcentajes de elementos ilícitos encontrados en el video/imagen y cuando este
    supere más del 15% de las siguientes categorías:
       o Desnudez
       o Violencia
       o Ofensivo
       o Arma
       o Gore
       o Droga
       o Alcohol
       o Autolesión
       o Conversaciones
- RQNFN61: El sistema debe de monitorear el evento de scroll y calcular la posición
    actual con respecto a la altura total de la página para saber cuándo el usuario llegue a
    la penúltima fila
- Página para crear una conversación
- RQNFN62: El sistema debe de validar que todos los campos se encuentren llenos a
    excepción de las imágenes


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
- RQNFN63: El sistema debe de validar que el campo de título cuente con mínimo 5
    caracteres y máximo de 80.
- RQNFN64: El sistema debe de validar que el campo de texto cuente con un mínimo
    de 15 caracteres y un máximo de 500
- RQNFN65: El sistema debe de utilizar la API Image Moderation de Sightengine para
    validar la imagen
- RQNFN66: La API Image Moderation de Sightengine debe de obtener los
    porcentajes de elementos ilícitos encontrados en las imágenes y cuando este supere
    más del 15% de las siguientes categorías:
       o Desnudez
       o Violencia
       o Ofensivo
       o Arma
       o Gore
       o Droga
       o Alcohol
       o Autolesión
       o Página de conversación
- RQNFN67: El sistema recalcula la cantidad de likes cada que un usuario da like a la
    conversación
- RQNFN68: El sistema debe validar que al menos una opción se encuentre
    seleccionada y máximo 3
- RQNFN69: El sistema debe calcular el porcentaje de vistas que denunciaron:
- R = (CantidadDenuncias*100) /Vistas
- RQNFN70: El sistema debe validar que el comentario sea mayor a 1 caracter y
    menor a 200
- RQNFN71: El sistema debe validar que el comentario del comentario sea mayor a 1
    caracter y menor a 200


```
Documento de Especificación de Requerimientos.
Sitio web social para la publicación de videos sobre maquillajes de diferentes estilos y de
diversas culturas urbanas (B-unick)
```
Apéndices.


