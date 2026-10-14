-- ============================================================
-- Esquema B-unick (MySQL/MariaDB)
-- Archivo idempotente: puede ejecutarse en cada arranque del
-- backend (vía servidor/DB/initDb.js) sin romper datos.
--   - CREATE TABLE IF NOT EXISTS
--   - INSERT IGNORE (el seed solo se aplica si la fila no existe)
--   - Claves/índices/FKs definidos inline, tablas ordenadas por
--     dependencia para que los FK se resuelvan correctamente.
--
-- SCHEMA_VERSION: sube este número cuando cambie el esquema O los
-- seeds para que initDb.js reestablezca la base de datos.
-- ============================================================
-- SCHEMA_VERSION = 13
-- ============================================================

SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- 1. Tablas raíz (sin dependencias)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `caracteristicas_fisicas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `forma_ojos` varchar(20) NOT NULL,
  `tipo_nariz` varchar(20) NOT NULL,
  `tipo_labios` varchar(20) NOT NULL,
  `tipo_rostro` varchar(20) NOT NULL,
  `color_piel` varchar(20) NOT NULL,
  `tipo_piel` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_forma_ojos` (`forma_ojos`),
  KEY `idx_tipo_nariz` (`tipo_nariz`),
  KEY `idx_tipo_labios` (`tipo_labios`),
  KEY `idx_tipo_rostro` (`tipo_rostro`),
  KEY `idx_color_piel` (`color_piel`),
  KEY `idx_tipo_piel` (`tipo_piel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `culturas_estilos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen_ref` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `razones_voto_contra` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `video` varchar(50) NOT NULL,
  `descripcion` varchar(150) NOT NULL,
  `es_alternativo` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_razon_video` (`video`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Tablas que dependen de la raíz
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `correo` varchar(150) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `nombre_usuario` varchar(50) NOT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  `caracteristicas_id` int(11) NOT NULL,
  `edad` tinyint(3) UNSIGNED NOT NULL,
  `correo_verificado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  KEY `fk_usr_caracteristicas` (`caracteristicas_id`),
  CONSTRAINT `fk_usr_caracteristicas` FOREIGN KEY (`caracteristicas_id`) REFERENCES `caracteristicas_fisicas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `subculturas_estilos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cultura_id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `imagen_ref` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `bibliografia` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sub_cultura` (`cultura_id`),
  CONSTRAINT `fk_sub_cultura` FOREIGN KEY (`cultura_id`) REFERENCES `culturas_estilos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `subcultura_recursos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subcultura_id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_recurso_subcultura` (`subcultura_id`),
  CONSTRAINT `fk_recurso_subcultura` FOREIGN KEY (`subcultura_id`) REFERENCES `subculturas_estilos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `conversaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `tema` varchar(40) NOT NULL,
  `subcultura_id` int(11) NOT NULL,
  `titulo` varchar(80) NOT NULL,
  `texto` varchar(500) NOT NULL,
  `cantidad_likes` int(11) NOT NULL DEFAULT 0,
  `cantidad_vistas` int(11) NOT NULL DEFAULT 0,
  `cantidad_denuncias` int(11) NOT NULL DEFAULT 0,
  `fecha_publicacion` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_conv_usuario` (`usuario_id`),
  KEY `idx_conv_tema` (`tema`),
  KEY `fk_conv_subcultura` (`subcultura_id`),
  CONSTRAINT `fk_conv_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_conv_subcultura` FOREIGN KEY (`subcultura_id`) REFERENCES `subculturas_estilos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `videos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `categoria_contenido` varchar(50) NOT NULL,
  `cultura_id` int(11) NOT NULL,
  `subcultura_id` int(11) NOT NULL,
  `url_video` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `votos_favor` int(11) NOT NULL DEFAULT 0,
  `votos_contra` int(11) NOT NULL DEFAULT 0,
  `porcentaje_semejanza` decimal(5,2) NOT NULL DEFAULT 0.00,
  `cantidad_likes` int(11) NOT NULL DEFAULT 0,
  `cantidad_guardados` int(11) NOT NULL DEFAULT 0,
  `cantidad_compartidos` int(11) NOT NULL DEFAULT 0,
  `cantidad_vistas` int(11) NOT NULL DEFAULT 0,
  `fecha_publicacion` datetime NOT NULL DEFAULT current_timestamp(),
  `rango_edad` varchar(12) NOT NULL DEFAULT '18-24',
  `proporcion` varchar(10) NOT NULL DEFAULT '4:5',
  `caracteristicasfisicas` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_video_usuario` (`usuario_id`),
  KEY `fk_video_cultura` (`cultura_id`),
  KEY `fk_video_sub` (`subcultura_id`),
  KEY `fk_video_caracteristicas` (`caracteristicasfisicas`),
  KEY `idx_video_categoria` (`categoria_contenido`),
  KEY `idx_video_semejanza` (`porcentaje_semejanza`),
  KEY `idx_video_fecha` (`fecha_publicacion`),
  KEY `idx_video_rango_edad` (`rango_edad`),
  CONSTRAINT `fk_video_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_video_cultura` FOREIGN KEY (`cultura_id`) REFERENCES `culturas_estilos` (`id`),
  CONSTRAINT `fk_video_sub` FOREIGN KEY (`subcultura_id`) REFERENCES `subculturas_estilos` (`id`),
  CONSTRAINT `fk_video_caracteristicas` FOREIGN KEY (`caracteristicasfisicas`) REFERENCES `caracteristicas_fisicas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `tipo` varchar(40) NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_expiracion` datetime NOT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `fk_token_usuario` (`usuario_id`),
  CONSTRAINT `fk_token_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. Tablas dependientes (jerarquía 2+)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `comentarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `video_id` int(11) DEFAULT NULL,
  `conversacion_id` int(11) DEFAULT NULL,
  `comentario_padre_id` int(11) DEFAULT NULL,
  `texto` varchar(250) NOT NULL,
  `cantidad_likes` int(11) NOT NULL DEFAULT 0,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_com_usuario` (`usuario_id`),
  KEY `fk_com_video` (`video_id`),
  KEY `fk_com_conv` (`conversacion_id`),
  KEY `fk_com_padre` (`comentario_padre_id`),
  CONSTRAINT `fk_com_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_com_video` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`),
  CONSTRAINT `fk_com_conv` FOREIGN KEY (`conversacion_id`) REFERENCES `conversaciones` (`id`),
  CONSTRAINT `fk_com_padre` FOREIGN KEY (`comentario_padre_id`) REFERENCES `comentarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `usuario_preferencias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `cultura_id` int(11) NOT NULL,
  `subcultura_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_pref_usuario` (`usuario_id`),
  KEY `fk_pref_cultura` (`cultura_id`),
  KEY `fk_pref_subestilo` (`subcultura_id`),
  CONSTRAINT `fk_pref_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_pref_cultura` FOREIGN KEY (`cultura_id`) REFERENCES `culturas_estilos` (`id`),
  CONSTRAINT `fk_pref_subestilo` FOREIGN KEY (`subcultura_id`) REFERENCES `subculturas_estilos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `seguidores` (
  `seguidor_id` int(11) NOT NULL,
  `seguido_id` int(11) NOT NULL,
  `fecha_inicio` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`seguidor_id`,`seguido_id`),
  KEY `fk_sig_seguido` (`seguido_id`),
  CONSTRAINT `fk_sig_seguidor` FOREIGN KEY (`seguidor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_sig_seguido` FOREIGN KEY (`seguido_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `likes_video` (
  `usuario_id` int(11) NOT NULL,
  `video_id` int(11) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`usuario_id`,`video_id`),
  KEY `fk_lv_video` (`video_id`),
  CONSTRAINT `fk_lv_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_lv_video` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `likes_comentario` (
  `usuario_id` int(11) NOT NULL,
  `comentario_id` int(11) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`usuario_id`,`comentario_id`),
  KEY `fk_lc_comentario` (`comentario_id`),
  CONSTRAINT `fk_lc_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_lc_comentario` FOREIGN KEY (`comentario_id`) REFERENCES `comentarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `likes_conversacion` (
  `usuario_id` int(11) NOT NULL,
  `conversacion_id` int(11) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`usuario_id`,`conversacion_id`),
  KEY `fk_lconv_conv` (`conversacion_id`),
  CONSTRAINT `fk_lconv_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_lconv_conv` FOREIGN KEY (`conversacion_id`) REFERENCES `conversaciones` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notificaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `mensaje` varchar(255) NOT NULL,
  `video_id` int(11) DEFAULT NULL,
  `conversacion_id` int(11) DEFAULT NULL,
  `usuario_actor_id` int(11) DEFAULT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_notif_usuario` (`usuario_id`),
  KEY `fk_notif_video` (`video_id`),
  KEY `fk_notif_conv` (`conversacion_id`),
  KEY `fk_notif_actor` (`usuario_actor_id`),
  CONSTRAINT `fk_notif_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_notif_video` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`),
  CONSTRAINT `fk_notif_conv` FOREIGN KEY (`conversacion_id`) REFERENCES `conversaciones` (`id`),
  CONSTRAINT `fk_notif_actor` FOREIGN KEY (`usuario_actor_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pasos_maquillaje` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `video_id` int(11) NOT NULL,
  `tipo_paso` varchar(50) NOT NULL,
  `contenido` text NOT NULL,
  `orden` tinyint(4) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `fk_paso_video` (`video_id`),
  CONSTRAINT `fk_paso_video` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `imagenes_video` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `video_id` int(11) NOT NULL,
  `url_imagen` varchar(255) NOT NULL,
  `orden` tinyint(4) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `fk_imgvid_video` (`video_id`),
  CONSTRAINT `fk_imgvid_video` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `etiquetas_video` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `video_id` int(11) NOT NULL,
  `etiqueta` varchar(30) NOT NULL,
  `orden` tinyint(4) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_etiqueta_video` (`video_id`, `etiqueta`),
  KEY `fk_etiqueta_video` (`video_id`),
  CONSTRAINT `fk_etiqueta_video` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `imagenes_conversacion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conversacion_id` int(11) NOT NULL,
  `url_imagen` varchar(255) NOT NULL,
  `orden` tinyint(4) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `fk_imgconv_conv` (`conversacion_id`),
  CONSTRAINT `fk_imgconv_conv` FOREIGN KEY (`conversacion_id`) REFERENCES `conversaciones` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `votos_video` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `video_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `tipo_voto` varchar(10) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_voto_video` (`video_id`),
  KEY `fk_voto_usuario` (`usuario_id`),
  CONSTRAINT `fk_voto_video` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`),
  CONSTRAINT `fk_voto_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `voto_razones` (
  `voto_id` int(11) NOT NULL,
  `razon_id` int(11) NOT NULL,
  `estilo_alternativo_id` int(11) NULL,
  PRIMARY KEY (`voto_id`,`razon_id`),
  KEY `fk_vr_razon` (`razon_id`),
  KEY `fk_vr_estilo` (`estilo_alternativo_id`),
  CONSTRAINT `fk_vr_voto` FOREIGN KEY (`voto_id`) REFERENCES `votos_video` (`id`),
  CONSTRAINT `fk_vr_razon` FOREIGN KEY (`razon_id`) REFERENCES `razones_voto_contra` (`id`),
  CONSTRAINT `fk_vr_estilo` FOREIGN KEY (`estilo_alternativo_id`) REFERENCES `subculturas_estilos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `videos_guardados` (
  `usuario_id` int(11) NOT NULL,
  `video_id` int(11) NOT NULL,
  `fecha_guardado` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`usuario_id`,`video_id`),
  KEY `fk_vg_video` (`video_id`),
  CONSTRAINT `fk_vg_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_vg_video` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `videos_vistos` (
  `usuario_id` int(11) NOT NULL,
  `video_id` int(11) NOT NULL,
  `fecha_visto` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`usuario_id`,`video_id`),
  KEY `fk_vv_video` (`video_id`),
  KEY `idx_vv_fecha` (`fecha_visto`),
  CONSTRAINT `fk_vv_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_vv_video` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `videos_compartidos` (
  `usuario_id` int(11) NOT NULL,
  `video_id` int(11) NOT NULL,
  `fecha_compartido` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`usuario_id`,`video_id`),
  KEY `fk_vc_video` (`video_id`),
  CONSTRAINT `fk_vc_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_vc_video` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `motivos_denuncia` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(120) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `denuncias_conversacion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conversacion_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_den_conv` (`conversacion_id`),
  KEY `fk_den_usuario` (`usuario_id`),
  CONSTRAINT `fk_den_conv` FOREIGN KEY (`conversacion_id`) REFERENCES `conversaciones` (`id`),
  CONSTRAINT `fk_den_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `denuncia_motivos` (
  `denuncia_id` int(11) NOT NULL,
  `motivo_id` int(11) NOT NULL,
  PRIMARY KEY (`denuncia_id`,`motivo_id`),
  KEY `fk_dm_motivo` (`motivo_id`),
  CONSTRAINT `fk_dm_denuncia` FOREIGN KEY (`denuncia_id`) REFERENCES `denuncias_conversacion` (`id`),
  CONSTRAINT `fk_dm_motivo` FOREIGN KEY (`motivo_id`) REFERENCES `motivos_denuncia` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Seed de datos (INSERT IGNORE: solo si la fila no existe)
-- ============================================================

-- Características físicas (seed de prueba) — valores canónicos del registro.
-- Nomenclatura alineada con las opciones de los formularios (Registro) para que
-- la simetría y los filtros de Maquillajes coincidan con perfiles reales.
INSERT IGNORE INTO `caracteristicas_fisicas` (`id`, `forma_ojos`, `tipo_nariz`, `tipo_labios`, `tipo_rostro`, `color_piel`, `tipo_piel`) VALUES
(1, 'almendrados', 'Griega', 'MuyGruesos', 'Ovalado', 'Oliva', 'Normal'),
(2, 'redondos', 'Chata', 'Finos', 'Cuadrado', 'Blanca', 'Grasa'),
(3, 'caidos', 'Romana', 'Caidos', 'Redondo', 'Blanco Palido', 'Seca'),
(4, 'asiaticos', 'De Gancho', 'Ovales', 'Diamante', 'Cafe', 'Mixta'),
(5, 'encapuchados', 'Plana', 'InferiorFino', 'Alargado', 'Medio Cafe', 'Normal'),
(6, 'almendrados_delgados', 'Corta', 'SuperiorFino', 'Corazon', 'Oliva', 'Grasa'),
(7, 'caidos_encapuchados', 'Alta', 'MuyGruesos', 'Rectangular', 'Blanca', 'Seca'),
(8, 'redondos_almendrados', 'Bulbosa', 'Pequenos', 'Triangular V', 'Oscura', 'Mixta'),
(9, 'redondos_asiaticos', 'Protuberante', 'Puntiagudos', 'Triangular A', 'Cafe', 'Normal'),
(10, 'encapuchados', 'Celestial', 'Asimetricos', 'Redondo', 'Oscura', 'Grasa');

-- Culturas / estilos (tomadas del DER)
INSERT IGNORE INTO `culturas_estilos` (`id`, `nombre`, `descripcion`, `imagen_ref`) VALUES
(1, 'Gótico', 'Estética oscura y dramática con base en la moda y música gótica.', NULL),
(2, 'Emo', 'Estilo ligado a la música emo, con énfasis en la expresión emocional.', NULL),
(3, 'Punk', 'Cultura de rebeldía y DIY, con estética anárquica y agresiva.', NULL),
(4, 'Lolita', 'Moda japonesa de inspiración victoriana, romántica y delicada.', NULL),
(5, 'Visual Kei', 'Movimiento japonés que fusiona rock, moda andrógina y maquillaje teatral.', NULL),
(6, 'Gyaru', 'Subcultura japonesa que exalta la moda glamurosa y el maquillaje marcado.', NULL),
(7, 'Principiante', 'Estilos básicos para quienes inician en el maquillaje de culturas alternativas.', NULL),
(8, 'TikTok', 'Looks virales y tendencias de maquillaje populares en la plataforma.', NULL);

-- Subculturas / subestilos
INSERT IGNORE INTO `subculturas_estilos` (`id`, `cultura_id`, `nombre`, `imagen_ref`, `descripcion`, `bibliografia`) VALUES
(1, 1, 'Gótico tradicional', NULL, 'El gótico de origen: redes de pesca rasgadas, cuero negro, botas pikes y broches plateados sobre cabello cardado a volúmenes colosales. El ''deathmask'' -piel muy pálida, ojos negros exagerados- es su maquillaje insignia.', NULL),
(2, 1, 'Gótico romántico', NULL, 'Una versión más suave del gótico: corsetería de alta ingeniería, terciopelo, encaje de Calais y una paleta que se abre al borgoña, verde bosque y púrpura real, con sombras ciruela o carmesí.', NULL),
(3, 1, 'Cyber Goth', NULL, 'Neón, PVC, látex y goggles industriales: el gótico se cruza con el trance, el gabber y el industrial en pigmentos fluorescentes que reaccionan a la luz UV sobre base negra o blanca.', NULL),
(4, 1, 'Gothic Victoriano', NULL, 'Elegancia de otra época: sombreros de copa, guantes de encaje, miriñaques y levitas de corte perfecto en una paleta estrictamente monocromática de negro y gris ceniza.', NULL),
(5, 1, 'Casual goth', NULL, 'El gótico de diario: sudaderas oversize con iconografía de bandas, leggings de cuero sintético y botas Dr. Martens, con parches y pines como sello DIY.', NULL),
(6, 1, 'Corp Goth', NULL, 'El gótico de oficina: trajes de sastre y camisas de cuello rígido con la identidad escondida en detalles sutiles, como botones con forma de cráneo o forros de seda con telarañas.', NULL),
(7, 1, 'Deathrock', NULL, 'Horror y decadencia callejera: mezclilla rasgada, cadenas, parches pintados a mano y crestas oscuras nacidas de bandas como Christian Death.', NULL),
(8, 1, 'Gothic Lolita', NULL, 'El cruce del gótico con la moda lolita japonesa: silueta de campana, encaje negro, cruces y rosas negras sobre una base de porcelana con pestañas muy marcadas.', NULL),
(9, 1, 'Vampire Goth', NULL, 'La aristocracia de la noche: seda, satén y terciopelo con capas largas, tez de porcelana casi translúcida, venas pintadas sutilmente y labios ''manchados'' de vino o sangre.', NULL),
(10, 1, 'Nu-Goth y Witchy Goth', NULL, 'El gótico moderno y minimalista: sombreros de ala ancha, lentes redondos, pentagramas y runas sobre cejas bloqueadas estilo drag y sombreados en tonos tierra o púrpura.', NULL),
(11, 2, 'Emo tradicional', NULL, 'La génesis del movimiento: camisetas de bandas locales, jeans rígidos y suéteres de punto en gris, azul marino y verde bosque. Sin maquillaje: la piel natural y las ojeras cuentan la historia.', NULL),
(12, 2, 'Scene', NULL, 'La explosión neón de MySpace: pitillo en colores vibrantes, cinturones de tachuelas fluorescentes y el ''racoon eye'' extremo sobre labios nude.', NULL),
(13, 2, 'Emo pop', NULL, 'El cenit comercial de los 2000: chalecos de sastre, corbatas delgadas y galones militares sobre rojo y negro, con delineado líquido impecable y sombras rojizas.', NULL),
(14, 2, 'Emo 2020 / E-Kids', NULL, 'El emo digital: camisas de rayas bajo gráficos oversize, cadenas y chokers en layering, con corazones dibujados, rubor intenso en la nariz y labios mordidos.', NULL),
(15, 2, 'Casual emo', NULL, 'El emo adulto: hoodies de alta gama y abrigos largos de lana negra, con un delineado sutil solo en la línea de agua.', NULL),
(16, 2, 'Screamo y Post-Hardcore', NULL, 'La catarsis extrema: ropa rota intencionalmente, camisetas de bandas con impresiones caseras y botas militares para resistir el mosh pit.', NULL),
(17, 2, 'Mall Goth y Cyber Emo', NULL, 'La estética de los centros comerciales de los 90 con toques futuristas: pantalones con correas, charol, vinilo, redes y botas de plataforma masiva.', NULL),
(18, 2, 'Math Rock y Midwestern Emo', NULL, 'La estética geek-chic del Medio Oeste: camisas de franela, anteojos de pasta gruesa y pantalones chino doblados en los tobillos, en tonos otoñales y tierra.', NULL),
(19, 3, 'Punk clásico', NULL, 'El punk de 1977: chaqueta ''Perfecto'' cubierta de tachuelas niqueladas, pantalones de tartán, botas Dr. Martens de hasta 20 agujeros y una cresta estilizada con jabón o laca.', NULL),
(20, 3, 'Glam punk', NULL, 'La decadencia brillante de la androginia: vinilo y spandex ajustados, boas de plumas y purpurina aplicada con vaselina sobre una base de piel muy pálida (''Glitter Gore'').', NULL),
(21, 3, 'Steampunk', NULL, 'La elegancia industrial de una utopía obsoleta: levitas victorianas, corsés de cuero, goggles de aviador y engranajes reales sobre una paleta de cobre, bronce y siena tostada.', NULL),
(22, 3, 'Hardcore punk', NULL, 'Minimalismo funcional: hoodies, camisetas de alto contraste, jeans rectos y zapatillas Vans o Converse, sin tachuelas ni maquillaje.', NULL),
(23, 3, 'Crust punk', NULL, 'La estética del colapso post-apocalíptico: ''crust pants'' con más parches que tela original, rastas naturales y un maquillaje de ''hollín de guerra'' con carbón o sombra negra mate.', NULL),
(24, 3, 'Pop punk', NULL, 'Punk amigable con la radio: Dickies 874, skinny jeans rotos y Vans Slip-On de damero, con ''ojo de mapache'' y flequillo lateral asimétrico.', NULL),
(25, 3, 'J-Punk', NULL, 'El punk japonés y cyberpunk: charol, látex y PVC transparente con herrajes de cromo, delineados geométricos y una piel de porcelana totalmente mate.', NULL),
(26, 3, 'Otros subestilos punk', NULL, 'Horror punk, anarco-punk y skate punk: del ''corpse paint'' y el Devilock de los Misfits al uniforme guerrillero de Crass y la ropa holgada del monopatín.', NULL),
(27, 4, 'Gothic Lolita', NULL, 'El lado oscuro del lolita: terciopelo, encaje químico y raso opaco en negro absoluto, azul noche, granate y púrpura, con motivos de cruces y catedrales.', NULL),
(28, 4, 'Classic Lolita', NULL, 'La versión madura y sofisticada: corte en A, botas victorianas de cordones y estampados botánicos realistas en tonos terrosos, borgoña y verde bosque.', NULL),
(29, 4, 'Sweet y Victorian Lolita', NULL, 'La explosión de lo kawaii: enaguas al máximo volumen (Over The Top), estampados de dulces y sombreros Bonnet gigantes, o la pureza del blanco y el marfil en su vertiente victoriana.', NULL),
(30, 4, 'Punk Lolita', NULL, 'Encaje y rebeldía: tartán, denim y cuero sintético con imperdibles, cadenas y cremalleras sobre la silueta de campana.', NULL),
(31, 4, 'Qi, Wa y Kei Lolita', NULL, 'Las interpretaciones culturales: el Wa-Lolita integra mangas y obis del kimono, el Qi-Lolita usa cuellos Mao y nudos del qipao, y el Ouji-kei viste bombachos y chisteras.', NULL),
(32, 4, 'Otros subestilos Lolita', NULL, 'Country, sailor, hime, steampunk, kuro y shiro: ramificaciones que juegan con temas y paletas específicas, de picnics campestres a coronas de princesa.', NULL),
(33, 5, 'Kote kei', NULL, 'El visual kei clásico: oscuro, teatral y recargado. Delineado marcado, cabello teñido y una puesta en escena de otro planeta.', NULL),
(34, 5, 'Angura kei', NULL, 'Visual kei underground con raíces japonesas: kimonos, pintura y una estética oscura de identidad local.', NULL),
(35, 5, 'Oshare kei', NULL, 'Visual kei colorido y ligero: estampados alegres, tonos pastel y una versión pop del rock japonés.', NULL),
(36, 5, 'Nagoya kei', NULL, 'Pesado, oscuro y musical: menos maquillaje y más sonido. La estética queda detrás de la música.', NULL),
(37, 6, 'Kogal', NULL, 'La colegiala gyaru: falda escolar acortada, blusa desabrochada y las icónicas loose socks sujetas con pegamento, sobre un bronceado dorado suave y cabello chapatsu.', NULL),
(38, 6, 'Agejo', NULL, 'La elegancia nocturna del cabaret: vestidos ajustados, animal print y ojos de gato agrandados con pestañas dobles o triples, coronados por el peinado suji-age.', NULL),
(39, 6, 'Amekaji', NULL, 'El casual americano: camisetas gráficas oversize, varsity jackets y chunky sneakers en colores primarios, con bronceado medio y coletas altas dobles (twintails).', NULL),
(40, 6, 'Amuro / Amuraa', NULL, 'La era dorada de Namie Amuro: minifaldas de corte A y botas por encima de la rodilla de la marca COMME CA DU MODE, cejas finamente arqueadas y cabello chapatsu extremadamente liso.', NULL),
(41, 6, 'Banba', NULL, 'La transición del bronceado con maquillaje blanco: sombras blancas o plateadas precisas en el párpado, sobre marcas de Shibuya 109 como Cecil McBee y Egoist.', NULL),
(42, 6, 'Cyber Gyaru', NULL, 'Futurismo, vinilo y luces neón: tops corsé metálicos, botas Demonia y goggles con LEDs, con delineados geométricos que se extienden hacia las sienes.', NULL),
(43, 6, 'Ganguro', NULL, 'Bronceado extremo, ''nose stripe'' de corrector blanco y antifaz de sombra blanca hasta las cejas sobre labios claros y pelo decolorado o naranja fuego.', NULL),
(44, 6, 'Goshikko gyaru', NULL, 'Gótico gyaru: vestidos de encaje negro, corsés y medias de red con smokey eyes en negro y ciruela, labios en vino oscuro o borgoña.', NULL),
(45, 6, 'Hime gyaru', NULL, 'La princesa del gyaru: vestidos de marcas como Jesus Diamante y Liz Lisa, tiaras y el peinado suji-age de princesa con volúmenes colosales en la coronilla.', NULL),
(46, 6, 'Himekaji', NULL, 'La princesa casual urbana: blusas de gasa floral, suéteres bordados y mocasines con plataforma suave, en tonos pastel de la marca Liz Lisa.', NULL),
(47, 6, 'Ishoku Hada', NULL, 'La tendencia digital de pieles fantasía: pintura corporal al agua en azul cian, rosa fucsia o verde alienígena, combinada con las técnicas Gyaru clásicas de corrector blanco y circle lenses.', NULL),
(48, 6, 'Manba', NULL, 'La evolución extrema del Ganguro: círculos blancos masivos alrededor de los ojos, sombras neón fluorescentes y stickers de caricaturas sobre las mejillas.', NULL),
(49, 6, 'Rokku gyaru', NULL, 'El rocker glam: camisetas de bandas, chaquetas de cuero tipo Perfecto y cinturones d.i.a. de hebillas gigantes, con smokey eyes en negro, gris y plateado.', NULL),
(50, 6, 'Tsuyome gyaru', NULL, 'La actitud fuerte: animal print, bodycon dresses y el cinturón insignia de la marca d.i.a., con bronceado oscuro uniforme y delineado de gato extremadamente largo.', NULL),
(51, 6, 'Yamanba', NULL, 'La cumbre tropical del bronceado: camisas hawaianas, pareos florales y sombras neón sobre fondo blanco, con melenas leoninas decoradas con flores de hibisco.', NULL),
(52, 6, 'Otros subestilos Gyaru', NULL, 'Gyaru-o, Kigurumin, B-Gal y Haady: la contraparte masculina, el disfraz lúdico de kigurumi, la fusión con el hip-hop y el pop retro de los ochenta.', NULL),
(53, 7, 'Alt básico', NULL, 'El armario cápsula alternativo: camisetas negras de corte recto, mom jeans y Dr. Martens de 8 agujeros, con delineado de gato discreto y bálsamos nude.', NULL),
(54, 7, 'Soft Goth', NULL, 'Primeros pasos en la oscuridad romántica: vestidos con detalles de encaje, gargantillas de terciopelo y sombras rojizas suaves difuminadas sobre el párpado móvil.', NULL),
(55, 7, 'Indie Sleaze', NULL, 'Nostalgia callejera: chaquetas de cuero oversize, medias de red rotas y abrigos de piel sintética, con un smokey eye borroso hecho con lápiz cremoso y melenas shag despeinadas.', NULL),
(56, 7, 'Beginner Grunge', NULL, 'El estilo desgastado de los 90: franelas atadas a la cintura, jeans rotos en las rodillas y botas de suela gruesa, con máscara de pestañas y bálsamo como único maquillaje.', NULL),
(57, 7, 'Soft Punk', NULL, 'La introducción a la rebelión: faldas de tablas en tartán, chaquetas moteras con pocos parches y un delineado líquido negro clásico de ala fina.', NULL),
(58, 7, 'Pastel Goth', NULL, 'La fusión dulce y oscura: gráficos de calaveras y murciélagos en rosa o violeta, botas de plataforma pastel y rubor rosado con sombras en lavanda o menta.', NULL),
(59, 7, 'Dark Academia', NULL, 'Elegancia escolar: pantalones de talle alto, suéteres de cuello de cisne y bolsos satchel de cuero marrón, con cejas bien peinadas y sombras en marrón o champaña.', NULL),
(60, 7, 'Vintage y Thrift', NULL, 'La iniciación sostenible: chaquetas de pana, vestidos florales retro y pecas falsas sobre piel luminosa, con flequillos curtain bangs de los setenta.', NULL),
(61, 7, 'Y2K Starter', NULL, 'El regreso futurista de los 2000: cargo pants de tiro bajo, baguette bags y gafas de cristales de colores, con sombras plateadas y gloss ultrabrillante.', NULL),
(62, 7, 'Cyber Casual', NULL, 'La iniciación al futurismo urbano: pantalones tácticos, cortavientos de nylon y chunky sneakers, con delineados geométricos en negro o blanco.', NULL),
(63, 7, 'Soft Coquette', NULL, 'La versión accesible de lazos y encajes: un lazo de satén rosa en el escote de un suéter básico, piel dewy y labios con lip oil rosa dulce.', NULL),
(64, 7, 'Otros de iniciación', NULL, 'Minimalist Alt, E-Girl Light y micro-trends de temporada como Cold Girl o Tomato Girl: transiciones rápidas para experimentar sin cambiar el armario.', NULL),
(65, 8, 'Grunge TikTok', NULL, 'La anti-moda de los 90 para cámara: franela oversize, botas Dr. Martens y un smokey eye difuminado con kohl que simula ''haber bailado toda la noche''.', NULL),
(66, 8, 'Dark Feminine', NULL, 'Seducción misteriosa: vestidos de terciopelo o encaje negro con los icónicos Siren Eyes -delineado alargado en ambos extremos del ojo- y esculpido frío en los pómulos.', NULL),
(67, 8, 'Latina Beauty', NULL, 'Glamour estructurado: aros dorados gigantes, piel horneada (baking), contorno cálido intenso y el clásico lip combo noventero con delineado marrón y gloss denso.', NULL),
(68, 8, 'Douyin Makeup', NULL, 'La estética C-Beauty: piel de porcelana translúcida, el aegyosal bajo el ojo realzado con iluminador y labios difuminados (blurry lips) con efecto de manzana caramelizada.', NULL),
(69, 8, 'Downtown Girl', NULL, 'Nostalgia del bajo Manhattan: abrigos de cuero vintage, tote bags y claw clips, con un delineado smudged aplicado con lápiz cremoso y rubor terroso relajado.', NULL),
(70, 8, 'Alt / Alternativo', NULL, 'Gótico digital: piercings, chokers de argollas y cejas bloqueadas para dibujar trazos ultra-delgados, con graphic liner y telarañas dibujadas con delineador líquido.', NULL),
(71, 8, 'Doll Makeup', NULL, 'El efecto muñeca de cristal: piel mate aterciopelada, rubor circular tipo ''doll blush'' y pestañas separadas individualmente arriba y abajo, con labios de ''boca de piñón''.', NULL),
(72, 8, 'Coquette', NULL, 'Hiper-femenilismo: corsés de satén, lazos de cinta en cabello y uñas, con piel dewy, iluminación aperlada en el arco de Cupido y labios con lip oil.', NULL),
(73, 8, 'E-girl', NULL, 'Cultura gamer: layering de camisetas gráficas y rayas horizontales, con rubor cruzando la nariz, corazones dibujados en los pómulos y delineado XL de alas anchas.', NULL),
(74, 8, 'Clean Look', NULL, 'Model off-duty: blazers oversize y aros dorados medianos sobre ''glass skin'', cejas laminadas y el infaltable slick bun o slick ponytail.', NULL),
(75, 8, 'Variados TikTok', NULL, 'Yarn & String, Clown-Core, Glass Skin, Optical Illusion, Uncanny Valley, Tape Hack y Filter to Reality: los trends de performance e ilusión óptica que nacieron en la pantalla vertical y convirtieron el rostro en un desafío a la percepción.', NULL);

-- Usuarios de prueba (seed). Todos con contraseña real bcrypt (10 rondas),
-- correo_verificado=1 y foto NULL (el backend sirve el icono B-Unick por
-- defecto vía resolverFotoPerfil). Contraseñas:
--   test_user_01..10 y kei_chan -> Prueba123!
--   meow                         -> betsyely1012 (cuenta real de la usuaria)
INSERT IGNORE INTO `usuarios` (`id`, `correo`, `contrasena_hash`, `nombre_usuario`, `foto_perfil`, `descripcion`, `caracteristicas_id`, `edad`, `correo_verificado`, `fecha_registro`) VALUES
(1, 'test.user01@dev.bunyk.com', '$2a$10$8CbtRGbS/5XFKI6Sit71D.i.rUV/RUd//tNm0e.lT4KgwWwfWk2h2', 'test_user_01', NULL, 'Usuario de PRUEBA generado para desarrollo. No es una cuenta real.', 1, 20, 1, '2026-08-16 23:06:03'),
(2, 'test.user02@dev.bunyk.com', '$2a$10$8CbtRGbS/5XFKI6Sit71D.i.rUV/RUd//tNm0e.lT4KgwWwfWk2h2', 'test_user_02', NULL, 'Usuario de PRUEBA generado para desarrollo. No es una cuenta real.', 2, 21, 1, '2026-08-16 23:06:03'),
(3, 'test.user03@dev.bunyk.com', '$2a$10$8CbtRGbS/5XFKI6Sit71D.i.rUV/RUd//tNm0e.lT4KgwWwfWk2h2', 'test_user_03', NULL, 'Usuario de PRUEBA generado para desarrollo. No es una cuenta real.', 3, 22, 1, '2026-08-16 23:06:03'),
(4, 'test.user04@dev.bunyk.com', '$2a$10$8CbtRGbS/5XFKI6Sit71D.i.rUV/RUd//tNm0e.lT4KgwWwfWk2h2', 'test_user_04', NULL, 'Usuario de PRUEBA generado para desarrollo. No es una cuenta real.', 4, 23, 1, '2026-08-16 23:06:03'),
(5, 'test.user05@dev.bunyk.com', '$2a$10$8CbtRGbS/5XFKI6Sit71D.i.rUV/RUd//tNm0e.lT4KgwWwfWk2h2', 'test_user_05', NULL, 'Usuario de PRUEBA generado para desarrollo. No es una cuenta real.', 5, 24, 1, '2026-08-16 23:06:03'),
(6, 'test.user06@dev.bunyk.com', '$2a$10$8CbtRGbS/5XFKI6Sit71D.i.rUV/RUd//tNm0e.lT4KgwWwfWk2h2', 'test_user_06', NULL, 'Usuario de PRUEBA generado para desarrollo. No es una cuenta real.', 6, 25, 1, '2026-08-16 23:06:03'),
(7, 'test.user07@dev.bunyk.com', '$2a$10$8CbtRGbS/5XFKI6Sit71D.i.rUV/RUd//tNm0e.lT4KgwWwfWk2h2', 'test_user_07', NULL, 'Usuario de PRUEBA generado para desarrollo. No es una cuenta real.', 7, 26, 1, '2026-08-16 23:06:03'),
(8, 'test.user08@dev.bunyk.com', '$2a$10$8CbtRGbS/5XFKI6Sit71D.i.rUV/RUd//tNm0e.lT4KgwWwfWk2h2', 'test_user_08', NULL, 'Usuario de PRUEBA generado para desarrollo. No es una cuenta real.', 8, 27, 1, '2026-08-16 23:06:03'),
(9, 'test.user09@dev.bunyk.com', '$2a$10$8CbtRGbS/5XFKI6Sit71D.i.rUV/RUd//tNm0e.lT4KgwWwfWk2h2', 'test_user_09', NULL, 'Usuario de PRUEBA generado para desarrollo. No es una cuenta real.', 9, 28, 1, '2026-08-16 23:06:03'),
(10, 'test.user10@dev.bunyk.com', '$2a$10$8CbtRGbS/5XFKI6Sit71D.i.rUV/RUd//tNm0e.lT4KgwWwfWk2h2', 'test_user_10', NULL, 'Usuario de PRUEBA generado para desarrollo. No es una cuenta real.', 10, 29, 1, '2026-08-16 23:06:03'),
(11, 'betsyely1012@gmail.com', '$2a$10$/jTts3ZivgvSIBKOAXydhOhSjjViOmDQlI5SbhVPUvb4iftL9Fsae', 'meow', NULL, 'Cuenta real de la usuaria: prueba de publicación y estadísticas.', 1, 18, 1, '2026-09-28 20:15:00'),
(12, 'kei.chan@dev.bunyk.com', '$2a$10$8CbtRGbS/5XFKI6Sit71D.i.rUV/RUd//tNm0e.lT4KgwWwfWk2h2', 'kei_chan', NULL, 'Usuario de PRUEBA generado para desarrollo. No es una cuenta real.', 2, 21, 1, '2026-08-17 09:30:00');

-- Videos de prueba (seed) — generado con /tmp/opencode/generar_seed_videos.js
-- 72 videos: 8 culturas, 6 categorias, 4 rangos de edad, 6 proporciones, % semejanza 92→41.
-- Votos (a favor / en contra) con total >1000 para que el % de semejanza sea visible (RQNFN31);
-- la columna porcentaje_semejanza es el espejo denormalizado que mantienen seeds y el módulo de votación.
INSERT IGNORE INTO `videos` (`id`, `usuario_id`, `categoria_contenido`, `cultura_id`, `subcultura_id`, `url_video`, `descripcion`, `votos_favor`, `votos_contra`, `porcentaje_semejanza`, `cantidad_likes`, `cantidad_guardados`, `cantidad_compartidos`, `cantidad_vistas`, `fecha_publicacion`, `caracteristicasfisicas`, `rango_edad`, `proporcion`) VALUES
(1, 1, 'Tutorial', 1, 1, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Tutorial en el estilo Gótico tradicional.', 929, 81, 92.00, 381, 53, 17, 911, DATE_SUB(NOW(), INTERVAL 9 HOUR), 1, '13-17', '1:1'),
(2, 2, 'Delineados', 1, 2, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Delineados en el estilo Gótico romántico.', 966, 84, 92.00, 712, 106, 34, 1822, DATE_SUB(NOW(), INTERVAL 18 HOUR), 2, '18-24', '4:5'),
(3, 3, 'Sombras', 1, 3, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Sombras en el estilo Cyber Goth.', 992, 98, 91.00, 1043, 159, 51, 2733, DATE_SUB(NOW(), INTERVAL 27 HOUR), 3, '25-30', '3:4'),
(4, 4, 'Lip Combo', 1, 4, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Lip Combo en el estilo Gothic Victoriano.', 1017, 113, 90.00, 1374, 212, 68, 3644, DATE_SUB(NOW(), INTERVAL 36 HOUR), 4, '31+', '2:3'),
(5, 5, 'Base', 1, 5, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Base en el estilo Casual goth.', 1053, 117, 90.00, 1705, 265, 85, 4555, DATE_SUB(NOW(), INTERVAL 45 HOUR), 5, '13-17', '5:4'),
(6, 6, 'Video Maquillajes', 1, 6, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Video Maquillajes en el estilo Corp Goth.', 1077, 133, 89.00, 2036, 318, 102, 5466, DATE_SUB(NOW(), INTERVAL 54 HOUR), 6, '18-24', '9:16'),
(7, 7, 'Tutorial', 1, 7, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Tutorial en el estilo Deathrock.', 889, 121, 88.00, 2367, 371, 119, 6377, DATE_SUB(NOW(), INTERVAL 63 HOUR), 7, '25-30', '1:1'),
(8, 8, 'Delineados', 1, 8, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Delineados en el estilo Gothic Lolita.', 914, 136, 87.00, 2698, 424, 136, 7288, DATE_SUB(NOW(), INTERVAL 72 HOUR), 8, '31+', '4:5'),
(9, 9, 'Sombras', 1, 9, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Sombras en el estilo Vampire Goth.', 948, 142, 87.00, 3029, 477, 153, 8199, DATE_SUB(NOW(), INTERVAL 81 HOUR), 9, '13-17', '3:4'),
(10, 10, 'Lip Combo', 1, 10, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Lip Combo en el estilo Nu-Goth y Witchy Goth.', 972, 158, 86.00, 3360, 530, 170, 9110, DATE_SUB(NOW(), INTERVAL 90 HOUR), 10, '18-24', '2:3'),
(11, 1, 'Base', 2, 11, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Base en el estilo Emo tradicional.', 995, 175, 85.00, 3691, 583, 187, 10021, DATE_SUB(NOW(), INTERVAL 99 HOUR), 1, '25-30', '5:4'),
(12, 2, 'Video Maquillajes', 2, 12, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Video Maquillajes en el estilo Scene.', 1029, 181, 85.00, 122, 636, 204, 10932, DATE_SUB(NOW(), INTERVAL 108 HOUR), 2, '31+', '9:16'),
(13, 3, 'Tutorial', 2, 13, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Tutorial en el estilo Emo pop.', 848, 162, 84.00, 453, 689, 221, 11843, DATE_SUB(NOW(), INTERVAL 117 HOUR), 3, '13-17', '1:1'),
(14, 4, 'Delineados', 2, 14, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Delineados en el estilo Emo 2020 / E-Kids.', 872, 178, 83.00, 784, 742, 238, 12754, DATE_SUB(NOW(), INTERVAL 126 HOUR), 4, '18-24', '4:5'),
(15, 5, 'Sombras', 2, 15, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Sombras en el estilo Casual emo.', 894, 196, 82.00, 1115, 795, 255, 13665, DATE_SUB(NOW(), INTERVAL 135 HOUR), 5, '25-30', '3:4'),
(16, 6, 'Lip Combo', 2, 16, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Lip Combo en el estilo Screamo y Post-Hardcore.', 927, 203, 82.00, 1446, 38, 272, 14576, DATE_SUB(NOW(), INTERVAL 144 HOUR), 6, '31+', '2:3'),
(17, 7, 'Base', 2, 17, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Base en el estilo Mall Goth y Cyber Emo.', 948, 222, 81.00, 1777, 91, 289, 15487, DATE_SUB(NOW(), INTERVAL 153 HOUR), 7, '13-17', '5:4'),
(18, 8, 'Video Maquillajes', 2, 18, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Video Maquillajes en el estilo Math Rock y Midwestern Emo.', 968, 242, 80.00, 2108, 144, 306, 16398, DATE_SUB(NOW(), INTERVAL 162 HOUR), 8, '18-24', '9:16'),
(19, 9, 'Tutorial', 3, 19, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Tutorial en el estilo Punk clásico.', 808, 202, 80.00, 2439, 197, 323, 17309, DATE_SUB(NOW(), INTERVAL 171 HOUR), 9, '25-30', '1:1'),
(20, 10, 'Delineados', 3, 20, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Delineados en el estilo Glam punk.', 830, 220, 79.00, 2770, 250, 0, 18220, DATE_SUB(NOW(), INTERVAL 180 HOUR), 10, '31+', '4:5'),
(21, 1, 'Sombras', 3, 21, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Sombras en el estilo Steampunk.', 850, 240, 78.00, 3101, 303, 17, 19131, DATE_SUB(NOW(), INTERVAL 189 HOUR), 1, '13-17', '3:4'),
(22, 2, 'Lip Combo', 3, 22, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Lip Combo en el estilo Hardcore punk.', 870, 260, 77.00, 3432, 356, 34, 20042, DATE_SUB(NOW(), INTERVAL 198 HOUR), 2, '18-24', '2:3'),
(23, 3, 'Base', 3, 23, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Base en el estilo Crust punk.', 901, 269, 77.00, 3763, 409, 51, 20953, DATE_SUB(NOW(), INTERVAL 207 HOUR), 3, '25-30', '5:4'),
(24, 4, 'Video Maquillajes', 3, 24, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Video Maquillajes en el estilo Pop punk.', 920, 290, 76.00, 194, 462, 68, 21864, DATE_SUB(NOW(), INTERVAL 216 HOUR), 4, '31+', '9:16'),
(25, 5, 'Tutorial', 3, 25, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Tutorial en el estilo J-Punk.', 758, 252, 75.00, 525, 515, 85, 22775, DATE_SUB(NOW(), INTERVAL 225 HOUR), 5, '13-17', '1:1'),
(26, 6, 'Delineados', 4, 27, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Delineados en el estilo Gothic Lolita.', 788, 262, 75.00, 856, 568, 102, 23686, DATE_SUB(NOW(), INTERVAL 234 HOUR), 6, '18-24', '4:5'),
(27, 7, 'Sombras', 4, 28, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Sombras en el estilo Classic Lolita.', 807, 283, 74.00, 1187, 621, 119, 24597, DATE_SUB(NOW(), INTERVAL 243 HOUR), 7, '25-30', '3:4'),
(28, 8, 'Lip Combo', 4, 29, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Lip Combo en el estilo Sweet y Victorian Lolita.', 825, 305, 73.00, 1518, 674, 136, 25508, DATE_SUB(NOW(), INTERVAL 252 HOUR), 8, '31+', '2:3'),
(29, 9, 'Base', 4, 30, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Base en el estilo Punk Lolita.', 842, 328, 72.00, 1849, 727, 153, 26419, DATE_SUB(NOW(), INTERVAL 261 HOUR), 9, '13-17', '5:4'),
(30, 10, 'Video Maquillajes', 4, 31, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Video Maquillajes en el estilo Qi, Wa y Kei Lolita.', 871, 339, 72.00, 2180, 780, 170, 27330, DATE_SUB(NOW(), INTERVAL 270 HOUR), 10, '18-24', '9:16'),
(31, 1, 'Tutorial', 4, 32, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Tutorial en el estilo Otros subestilos Lolita.', 717, 293, 71.00, 2511, 23, 187, 28241, DATE_SUB(NOW(), INTERVAL 279 HOUR), 1, '25-30', '1:1'),
(32, 2, 'Delineados', 5, 33, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Delineados en el estilo Kote kei.', 735, 315, 70.00, 2842, 76, 204, 29152, DATE_SUB(NOW(), INTERVAL 288 HOUR), 2, '31+', '4:5'),
(33, 3, 'Sombras', 5, 34, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Sombras en el estilo Angura kei.', 763, 327, 70.00, 3173, 129, 221, 30063, DATE_SUB(NOW(), INTERVAL 297 HOUR), 3, '13-17', '3:4'),
(34, 4, 'Lip Combo', 5, 35, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Lip Combo en el estilo Oshare kei.', 780, 350, 69.00, 3504, 182, 238, 30974, DATE_SUB(NOW(), INTERVAL 306 HOUR), 4, '18-24', '2:3'),
(35, 5, 'Base', 5, 36, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Base en el estilo Nagoya kei.', 796, 374, 68.00, 3835, 235, 255, 31885, DATE_SUB(NOW(), INTERVAL 315 HOUR), 5, '25-30', '5:4'),
(36, 6, 'Video Maquillajes', 6, 37, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Video Maquillajes en el estilo Kogal.', 811, 399, 67.00, 266, 288, 272, 32796, DATE_SUB(NOW(), INTERVAL 324 HOUR), 6, '31+', '9:16'),
(37, 7, 'Tutorial', 6, 38, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Tutorial en el estilo Agejo.', 677, 333, 67.00, 597, 341, 289, 33707, DATE_SUB(NOW(), INTERVAL 333 HOUR), 7, '13-17', '1:1'),
(38, 8, 'Delineados', 6, 39, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Delineados en el estilo Amekaji.', 693, 357, 66.00, 928, 394, 306, 34618, DATE_SUB(NOW(), INTERVAL 342 HOUR), 8, '18-24', '4:5'),
(39, 9, 'Sombras', 6, 40, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Sombras en el estilo Amuro / Amuraa.', 709, 381, 65.00, 1259, 447, 323, 35529, DATE_SUB(NOW(), INTERVAL 351 HOUR), 9, '25-30', '3:4'),
(40, 10, 'Lip Combo', 6, 41, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Lip Combo en el estilo Banba.', 723, 407, 64.00, 1590, 500, 0, 36440, DATE_SUB(NOW(), INTERVAL 360 HOUR), 10, '31+', '2:3'),
(41, 1, 'Base', 6, 42, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Base en el estilo Cyber Gyaru.', 749, 421, 64.00, 1921, 553, 17, 37351, DATE_SUB(NOW(), INTERVAL 369 HOUR), 1, '13-17', '5:4'),
(42, 2, 'Video Maquillajes', 6, 43, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Video Maquillajes en el estilo Ganguro.', 762, 448, 63.00, 2252, 606, 34, 38262, DATE_SUB(NOW(), INTERVAL 378 HOUR), 2, '18-24', '9:16'),
(43, 3, 'Tutorial', 6, 44, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Tutorial en el estilo Goshikko gyaru.', 626, 384, 62.00, 2583, 659, 51, 39173, DATE_SUB(NOW(), INTERVAL 387 HOUR), 3, '25-30', '1:1'),
(44, 4, 'Delineados', 6, 45, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Delineados en el estilo Hime gyaru.', 651, 399, 62.00, 2914, 712, 68, 40084, DATE_SUB(NOW(), INTERVAL 396 HOUR), 4, '31+', '4:5'),
(45, 5, 'Sombras', 6, 46, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Sombras en el estilo Himekaji.', 665, 425, 61.00, 3245, 765, 85, 40995, DATE_SUB(NOW(), INTERVAL 405 HOUR), 5, '13-17', '3:4'),
(46, 6, 'Lip Combo', 6, 47, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Lip Combo en el estilo Ishoku Hada.', 678, 452, 60.00, 3576, 8, 102, 41906, DATE_SUB(NOW(), INTERVAL 414 HOUR), 6, '18-24', '2:3'),
(47, 7, 'Base', 6, 48, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Base en el estilo Manba.', 690, 480, 59.00, 3907, 61, 119, 42817, DATE_SUB(NOW(), INTERVAL 423 HOUR), 7, '25-30', '5:4'),
(48, 8, 'Video Maquillajes', 6, 49, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Video Maquillajes en el estilo Rokku gyaru.', 714, 496, 59.00, 338, 114, 136, 43728, DATE_SUB(NOW(), INTERVAL 432 HOUR), 8, '31+', '9:16'),
(49, 9, 'Tutorial', 6, 50, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Tutorial en el estilo Tsuyome gyaru.', 586, 424, 58.00, 669, 167, 153, 44639, DATE_SUB(NOW(), INTERVAL 441 HOUR), 9, '13-17', '1:1'),
(50, 10, 'Delineados', 6, 51, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Delineados en el estilo Yamanba.', 599, 451, 57.00, 1000, 220, 170, 45550, DATE_SUB(NOW(), INTERVAL 450 HOUR), 10, '18-24', '4:5'),
(51, 1, 'Sombras', 7, 53, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Sombras en el estilo Alt básico.', 621, 469, 57.00, 1331, 273, 187, 46461, DATE_SUB(NOW(), INTERVAL 459 HOUR), 1, '25-30', '3:4'),
(52, 2, 'Lip Combo', 7, 54, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Lip Combo en el estilo Soft Goth.', 633, 497, 56.00, 1662, 326, 204, 47372, DATE_SUB(NOW(), INTERVAL 468 HOUR), 2, '31+', '2:3'),
(53, 3, 'Base', 7, 55, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Base en el estilo Indie Sleaze.', 644, 526, 55.00, 1993, 379, 221, 48283, DATE_SUB(NOW(), INTERVAL 477 HOUR), 3, '13-17', '5:4'),
(54, 4, 'Video Maquillajes', 7, 56, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Video Maquillajes en el estilo Beginner Grunge.', 653, 557, 54.00, 2324, 432, 238, 49194, DATE_SUB(NOW(), INTERVAL 486 HOUR), 4, '18-24', '9:16'),
(55, 5, 'Tutorial', 7, 57, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Tutorial en el estilo Soft Punk.', 545, 465, 54.00, 2655, 485, 255, 50105, DATE_SUB(NOW(), INTERVAL 495 HOUR), 5, '25-30', '1:1'),
(56, 6, 'Delineados', 7, 58, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Delineados en el estilo Pastel Goth.', 557, 493, 53.00, 2986, 538, 272, 51016, DATE_SUB(NOW(), INTERVAL 504 HOUR), 6, '31+', '4:5'),
(57, 7, 'Sombras', 7, 59, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Sombras en el estilo Dark Academia.', 567, 523, 52.00, 3317, 591, 289, 51927, DATE_SUB(NOW(), INTERVAL 513 HOUR), 7, '13-17', '3:4'),
(58, 8, 'Lip Combo', 7, 60, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Lip Combo en el estilo Vintage y Thrift.', 588, 542, 52.00, 3648, 644, 306, 52838, DATE_SUB(NOW(), INTERVAL 522 HOUR), 8, '18-24', '2:3'),
(59, 9, 'Base', 7, 61, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Base en el estilo Y2K Starter.', 597, 573, 51.00, 79, 697, 323, 53749, DATE_SUB(NOW(), INTERVAL 531 HOUR), 9, '25-30', '5:4'),
(60, 10, 'Video Maquillajes', 7, 62, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Video Maquillajes en el estilo Cyber Casual.', 605, 605, 50.00, 410, 750, 0, 54660, DATE_SUB(NOW(), INTERVAL 540 HOUR), 10, '31+', '9:16'),
(61, 1, 'Tutorial', 7, 63, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Tutorial en el estilo Soft Coquette.', 495, 515, 49.00, 741, 803, 17, 55571, DATE_SUB(NOW(), INTERVAL 549 HOUR), 1, '13-17', '1:1'),
(62, 2, 'Delineados', 7, 64, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Delineados en el estilo Otros de iniciación.', 515, 535, 49.00, 1072, 46, 34, 56482, DATE_SUB(NOW(), INTERVAL 558 HOUR), 2, '18-24', '4:5'),
(63, 3, 'Sombras', 8, 65, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Sombras en el estilo Grunge TikTok.', 523, 567, 48.00, 1403, 99, 51, 57393, DATE_SUB(NOW(), INTERVAL 567 HOUR), 3, '25-30', '3:4'),
(64, 4, 'Lip Combo', 8, 66, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Lip Combo en el estilo Dark Feminine.', 531, 599, 47.00, 1734, 152, 68, 58304, DATE_SUB(NOW(), INTERVAL 576 HOUR), 4, '31+', '2:3'),
(65, 5, 'Base', 8, 67, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Base en el estilo Latina Beauty.', 550, 620, 47.00, 2065, 205, 85, 59215, DATE_SUB(NOW(), INTERVAL 585 HOUR), 5, '13-17', '5:4'),
(66, 6, 'Video Maquillajes', 8, 68, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Video Maquillajes en el estilo Douyin Makeup.', 557, 653, 46.00, 2396, 258, 102, 60126, DATE_SUB(NOW(), INTERVAL 594 HOUR), 6, '18-24', '9:16'),
(67, 7, 'Tutorial', 8, 69, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Tutorial en el estilo Downtown Girl.', 455, 555, 45.00, 2727, 311, 119, 61037, DATE_SUB(NOW(), INTERVAL 603 HOUR), 7, '25-30', '1:1'),
(68, 8, 'Delineados', 8, 70, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Delineados en el estilo Alt / Alternativo.', 462, 588, 44.00, 3058, 364, 136, 61948, DATE_SUB(NOW(), INTERVAL 612 HOUR), 8, '31+', '4:5'),
(69, 9, 'Sombras', 8, 71, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Sombras en el estilo Doll Makeup.', 480, 610, 44.00, 3389, 417, 153, 62859, DATE_SUB(NOW(), INTERVAL 621 HOUR), 9, '13-17', '3:4'),
(70, 10, 'Lip Combo', 8, 72, 'https://res.cloudinary.com/demo/video/upload/dog.mp4', 'Video de maquillaje de Lip Combo en el estilo Coquette.', 486, 644, 43.00, 3720, 470, 170, 63770, DATE_SUB(NOW(), INTERVAL 630 HOUR), 10, '18-24', '2:3'),
(71, 1, 'Base', 8, 73, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Base en el estilo E-girl.', 491, 679, 42.00, 151, 523, 187, 64681, DATE_SUB(NOW(), INTERVAL 639 HOUR), 1, '25-30', '5:4'),
(72, 2, 'Video Maquillajes', 8, 74, 'https://res.cloudinary.com/demo/video/upload/wave.mp4', 'Video de maquillaje de Video Maquillajes en el estilo Clean Look.', 496, 714, 41.00, 482, 576, 204, 65592, DATE_SUB(NOW(), INTERVAL 648 HOUR), 2, '31+', '9:16'),
(73, 11, 'Video Maquillajes', 1, 74, 'https://res.cloudinary.com/demo/video/upload/cat.mp4', 'Video de maquillaje de Video Maquillajes en el estilo Clean Look, primera publicación de meow: ojos humo suave y labios nude.', 1, 1, 50.00, 3, 1, 1, 11, DATE_SUB(NOW(), INTERVAL 2 HOUR), 1, '18-24', '4:5');

-- Etiquetas de ejemplo para algunos videos del seed (editable vía PUT /videos/:id).
INSERT IGNORE INTO `etiquetas_video` (`video_id`, `etiqueta`, `orden`) VALUES
(1, 'labial oscuro', 1),
(1, 'piel porcelana', 2),
(1, 'dual eyeliner', 3),
(2, 'lápiz labial', 1),
(2, 'look victoriano', 2),
(7, 'deathrock', 1),
(7, 'makeup grunge', 2),
(11, 'mechas rojas', 1),
(11, 'sombra ahumada', 2),
(19, 'punk clásico', 1),
(19, 'facciones marcadas', 2),
(25, 'imperdibles', 1),
(33, 'angura kei', 1),
(37, 'agejo', 1),
(55, 'base clara', 1),
(55, 'rogamos suaves', 2),
(67, 'downtown girl', 1);

-- Notificaciones de prueba (test_user_01 es autenticado/verificado; actores verificados)
--
-- OJO: initDb.js re-ejecuta este .sql completo en cada arranque cuando la
-- version coincide, asi que un `INSERT IGNORE` a secas duplicaria estas tres
-- filas en cada reinicio (notificaciones.id es AUTO_INCREMENT y no se fija
-- aqui, luego IGNORE no encuentra conflicto). Por eso cada una se inserta
-- solo si todavia no existe esa combinacion usuario+tipo+actor.
INSERT INTO `notificaciones` (`usuario_id`, `tipo`, `mensaje`, `usuario_actor_id`, `leida`, `fecha_creacion`)
SELECT 1, 'nuevo_seguidor', 'test_user_05 te ha seguido', 5, 0, '2026-09-17 10:15:00'
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `notificaciones`
    WHERE `usuario_id` = 1 AND `tipo` = 'nuevo_seguidor' AND `usuario_actor_id` = 5
);
INSERT INTO `notificaciones` (`usuario_id`, `tipo`, `mensaje`, `usuario_actor_id`, `leida`, `fecha_creacion`)
SELECT 1, 'nuevo_seguidor', 'test_user_06 te ha seguido', 6, 1, '2026-09-16 20:30:00'
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `notificaciones`
    WHERE `usuario_id` = 1 AND `tipo` = 'nuevo_seguidor' AND `usuario_actor_id` = 6
);
-- Aviso de sistema: sin actor, el drawer lo pinta con el avatar de Becky.
-- Se deja `video_id` NULL a proposito: el trigger real (routes-videos.js,
-- RQFN71/RQFN72) lo escribe apuntando al video que bajo del 40%, y su guarda
-- anti-repeticion busca justamente una fila con `video_id` = ese video. Con
-- NULL esta fila de muestra no lo bloquea. Para verlo con un video real:
-- `node scripts/fixtures-semejanza-baja.js --notificar`.
INSERT INTO `notificaciones` (`usuario_id`, `tipo`, `mensaje`, `leida`, `fecha_creacion`)
SELECT 1, 'semejanza_baja', 'Encontramos un video con baja semejanza para tu perfil. ¿Te gustaría cambiar de categoría?', 0, '2026-09-18 09:00:00'
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `notificaciones` WHERE `usuario_id` = 1 AND `tipo` = 'semejanza_baja'
);

-- Catálogo de motivos de denuncia de conversaciones (RQFN126-141). Con id
-- fijo + INSERT IGNORE para no duplicarse al re-ejecutar el .sql.
INSERT IGNORE INTO `motivos_denuncia` (`id`, `descripcion`, `activo`) VALUES
(1, 'Contenido inapropiado para menores', 1),
(2, 'Acoso o bullying', 1),
(3, 'Discurso de odio', 1),
(4, 'Contenido violento o gráfico', 1),
(5, 'Spam o publicidad no deseada', 1),
(6, 'Información falsa o engañosa', 1),
(7, 'Suplantación de identidad', 1),
(8, 'Violencia de género o sexual', 1),
(9, 'Contenido autolesivo', 1),
(10, 'Otro motivo', 1);

-- Conversaciones de prueba (RQFN126-141). Autores del seed verificados;
-- subcultura real. Igual que arriba: INSERT IGNORE con id fijo es idempotente.
INSERT IGNORE INTO `conversaciones` (`id`, `usuario_id`, `tema`, `subcultura_id`, `titulo`, `texto`, `cantidad_likes`, `cantidad_vistas`, `cantidad_denuncias`, `fecha_publicacion`) VALUES
(1, 1, 'Tips', 1, '¿Cómo lograr la porcelana gótica sin verse plana?', 'Después de probar varias bases pálidas siento que el color queda apagado y sin dimensión. ¿Alguna técnica de contorno o iluminador que mantenga la palidez pero no deje la cara plana?', 12, 45, 0, DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(2, 2, 'Dudas', 3, '¿Las lentes de contacto de Cyber Goth dañan la vista?', 'Vi varios looks con circle lenses y me encanta la estética, pero me preocupa la salud ocular. ¿Alguien con experiencia usándolas todo el día?', 8, 31, 0, DATE_SUB(NOW(), INTERVAL 30 HOUR)),
(3, 5, 'Tutorial', 4, 'Delineado alado a prueba de todo (Goth Victoriano)', 'Paso a paso del wing con pestañas postizas: primer de párpado, gel liner mate y truco para que la esquina no se corra con el sudor.', 25, 89, 0, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 6, 'Opiniones', 11, '¿El grunge sigue siendo una subcultura o ya es moda?', 'Siento que hay línea muy delgada entre el DIY de los 90 y lo que hoy venden las tiendas rápidas. Quiero leer sus opiniones.', 19, 120, 0, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(5, 3, 'Eventos', 29, 'Meetup de Lolita en Guadalajara este sábado', 'Organizamos un salón de té con tea party para quien quiera estrenar sus piezas. Lleva tu camelia y tus mejores medias.', 33, 210, 0, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(6, 8, 'Show', 33, 'Mi primer look Visual Kei al fin completo', 'Comparto fotos del proceso: base, kabuki y el ojo andrógino. Críticas constructivas para mejorar el vestuario.',
 40, 305, 0, DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Imágenes de las conversaciones de prueba (galería real → miniatura en el
-- feed = primera imagen de la galería). Mismo patrón idempotente que las
-- notificaciones de arriba: initDb re-ejecuta este .sql íntegro en cada
-- arranque, así que un `INSERT IGNORE` a secas duplicaría estas filas
-- (imagenes_conversacion.id es AUTO_INCREMENT y no se fija aquí). Cada imagen
-- se inserta solo si no existe el par conversacion+orden.
INSERT INTO `imagenes_conversacion` (`conversacion_id`, `url_imagen`, `orden`)
SELECT 1, 'https://res.cloudinary.com/demo/image/upload/sample.jpg', 1
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `imagenes_conversacion`
    WHERE `conversacion_id` = 1 AND `orden` = 1
);
INSERT INTO `imagenes_conversacion` (`conversacion_id`, `url_imagen`, `orden`)
SELECT 1, 'https://res.cloudinary.com/demo/image/upload/woman.jpg', 2
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `imagenes_conversacion`
    WHERE `conversacion_id` = 1 AND `orden` = 2
);
INSERT INTO `imagenes_conversacion` (`conversacion_id`, `url_imagen`, `orden`)
SELECT 1, 'https://res.cloudinary.com/demo/image/upload/lady.jpg', 3
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `imagenes_conversacion`
    WHERE `conversacion_id` = 1 AND `orden` = 3
);
INSERT INTO `imagenes_conversacion` (`conversacion_id`, `url_imagen`, `orden`)
SELECT 2, 'https://res.cloudinary.com/demo/image/upload/woman.jpg', 1
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `imagenes_conversacion`
    WHERE `conversacion_id` = 2 AND `orden` = 1
);
INSERT INTO `imagenes_conversacion` (`conversacion_id`, `url_imagen`, `orden`)
SELECT 2, 'https://res.cloudinary.com/demo/image/upload/cat.jpg', 2
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `imagenes_conversacion`
    WHERE `conversacion_id` = 2 AND `orden` = 2
);
INSERT INTO `imagenes_conversacion` (`conversacion_id`, `url_imagen`, `orden`)
SELECT 2, 'https://res.cloudinary.com/demo/image/upload/sample.jpg', 3
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `imagenes_conversacion`
    WHERE `conversacion_id` = 2 AND `orden` = 3
);
INSERT INTO `imagenes_conversacion` (`conversacion_id`, `url_imagen`, `orden`)
SELECT 3, 'https://res.cloudinary.com/demo/image/upload/lady.jpg', 1
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `imagenes_conversacion`
    WHERE `conversacion_id` = 3 AND `orden` = 1
);
INSERT INTO `imagenes_conversacion` (`conversacion_id`, `url_imagen`, `orden`)
SELECT 3, 'https://res.cloudinary.com/demo/image/upload/woman.jpg', 2
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `imagenes_conversacion`
    WHERE `conversacion_id` = 3 AND `orden` = 2
);
INSERT INTO `imagenes_conversacion` (`conversacion_id`, `url_imagen`, `orden`)
SELECT 3, 'https://res.cloudinary.com/demo/image/upload/flower.jpg', 3
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `imagenes_conversacion`
    WHERE `conversacion_id` = 3 AND `orden` = 3
);
INSERT INTO `imagenes_conversacion` (`conversacion_id`, `url_imagen`, `orden`)
SELECT 4, 'https://res.cloudinary.com/demo/image/upload/bike.jpg', 1
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `imagenes_conversacion`
    WHERE `conversacion_id` = 4 AND `orden` = 1
);
INSERT INTO `imagenes_conversacion` (`conversacion_id`, `url_imagen`, `orden`)
SELECT 4, 'https://res.cloudinary.com/demo/image/upload/shirt.jpg', 2
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `imagenes_conversacion`
    WHERE `conversacion_id` = 4 AND `orden` = 2
);
INSERT INTO `imagenes_conversacion` (`conversacion_id`, `url_imagen`, `orden`)
SELECT 4, 'https://res.cloudinary.com/demo/image/upload/shoes.jpg', 3
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `imagenes_conversacion`
    WHERE `conversacion_id` = 4 AND `orden` = 3
);
INSERT INTO `imagenes_conversacion` (`conversacion_id`, `url_imagen`, `orden`)
SELECT 5, 'https://res.cloudinary.com/demo/image/upload/flower.jpg', 1
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `imagenes_conversacion`
    WHERE `conversacion_id` = 5 AND `orden` = 1
);
INSERT INTO `imagenes_conversacion` (`conversacion_id`, `url_imagen`, `orden`)
SELECT 5, 'https://res.cloudinary.com/demo/image/upload/lady.jpg', 2
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `imagenes_conversacion`
    WHERE `conversacion_id` = 5 AND `orden` = 2
);
INSERT INTO `imagenes_conversacion` (`conversacion_id`, `url_imagen`, `orden`)
SELECT 5, 'https://res.cloudinary.com/demo/image/upload/couple.jpg', 3
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `imagenes_conversacion`
    WHERE `conversacion_id` = 5 AND `orden` = 3
);
INSERT INTO `imagenes_conversacion` (`conversacion_id`, `url_imagen`, `orden`)
SELECT 6, 'https://res.cloudinary.com/demo/image/upload/sample.jpg', 3
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `imagenes_conversacion`
    WHERE `conversacion_id` = 6 AND `orden` = 3
);

-- ============================================================
-- Seed de interacciones entre usuarios (SCHEMA_VERSION = 13)
-- Hasta la versión 12, los contadores denormalizados de videos y
-- conversaciones (likes, vistas, guardados, votos) eran HISTÓRICO
-- acumulado sin detalle: las tablas de interacción estaban vacías,
-- así que la pestaña Vistas del Perfil, las Estadísticas del dueño
-- y los listados de notificaciones solo se veían tras correr los
-- fixtures. Con esta versión el seed siembra un histórico coherente
-- con esos contadores (historial agregado documentado) para que
-- las 28 tablas estén pobladas desde el primer arranque.
--
-- Toda fila usa id fijo + INSERT IGNORE (o PK compuesta) para que
-- initDb.js pueda re-ejecutar el archivo íntegro sin duplicar.
-- Video 1 queda SIN votos y SIN likes de la galería a propósito:
-- es el target de fixtures-semejanza-baja.js (siembra 1001 votos).
-- ============================================================

-- 1) Catálogo de motivos del voto en contra (RQFN100-120). La última de cada
--    grupo es la razón "Selección de estilo alternativo" (es_alternativo=1).
INSERT IGNORE INTO `razones_voto_contra` (`id`, `video`, `descripcion`, `es_alternativo`) VALUES
(1, 'maquillaje', 'El delineado no concuerda con el estilo', 0),
(2, 'maquillaje', 'Los colores empleados en el maquillaje no hacen referencia al estilo que propone', 0),
(3, 'maquillaje', 'Los accesorios/vestimenta no concuerdan con la estética', 0),
(4, 'maquillaje', 'Los simbolismos que se utilizan en el maquillaje no hacen referencia a la estética', 0),
(5, 'maquillaje', 'La música utilizada no hace referencia al estilo a representar', 0),
(6, 'maquillaje', 'El peinado no hace referencia a la estética propuesta', 0),
(7, 'maquillaje', 'Selección de estilo alternativo', 1),
(8, 'tutorial', 'Los simbolismos que se utilizan en el maquillaje no hacen referencia a la estética', 0),
(9, 'tutorial', 'La música utilizada no hace referencia al maquillaje', 0),
(10, 'tutorial', 'El delineado no concuerda con el estilo', 0),
(11, 'tutorial', 'Los colores empleados en el maquillaje no hacen referencia al estilo que propone', 0),
(12, 'tutorial', 'La forma de los ojos no concuerda con las etiquetas utilizadas', 0),
(13, 'tutorial', 'La forma de la nariz no concuerda con las etiquetas utilizadas', 0),
(14, 'tutorial', 'La forma del tipo de rostro no concuerda con las etiquetas utilizadas', 0),
(15, 'tutorial', 'El color de piel no concuerda con las etiquetas utilizadas', 0),
(16, 'tutorial', 'Selección de estilo alternativo', 1);

-- 2) Preferencias de culturas/subculturas (RQFN11-13): todas las cuentas del
--    seed las tienen guardadas para que el feed RQFN84 (boost por likes en
--    tus estilos) y el re-login no pidan el formulario de primera vez.
INSERT IGNORE INTO `usuario_preferencias` (`id`, `usuario_id`, `cultura_id`, `subcultura_id`) VALUES
(1, 1, 1, 1), (2, 2, 1, 2), (3, 3, 1, 3), (4, 4, 1, 4), (5, 5, 1, 5), (6, 6, 1, 6),
(7, 7, 1, 7), (8, 8, 1, 8), (9, 9, 1, 9), (10, 10, 1, 10), (11, 11, 1, 1), (12, 12, 5, 33);

-- 3) Seguidores (RQFN41-56): 24 relaciones, 2 por usuario, sin self-follow.
--    Las del user 1 (le siguen el 3, el 5 y el 11) hacen coherentes las
--    notificaciones 'nuevo_seguidor' del seed existente (actores 5 y 6) y la
--    de 'nuevo_contenido_seguido' del bloque de abajo (al u6 le llega el
--    video nuevo del u5 porque 6 sigue a 5).
INSERT IGNORE INTO `seguidores` (`seguidor_id`, `seguido_id`, `fecha_inicio`) VALUES
(1, 11, DATE_SUB(NOW(), INTERVAL 20 HOUR)), (1, 12, DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(2, 3, DATE_SUB(NOW(), INTERVAL 19 HOUR)), (2, 4, DATE_SUB(NOW(), INTERVAL 17 HOUR)),
(3, 5, DATE_SUB(NOW(), INTERVAL 16 HOUR)), (3, 1, DATE_SUB(NOW(), INTERVAL 15 HOUR)),
(4, 6, DATE_SUB(NOW(), INTERVAL 14 HOUR)), (4, 7, DATE_SUB(NOW(), INTERVAL 13 HOUR)),
(5, 1, DATE_SUB(NOW(), INTERVAL 12 HOUR)), (5, 8, DATE_SUB(NOW(), INTERVAL 11 HOUR)),
(6, 5, DATE_SUB(NOW(), INTERVAL 10 HOUR)), (6, 2, DATE_SUB(NOW(), INTERVAL 9 HOUR)),
(7, 10, DATE_SUB(NOW(), INTERVAL 8 HOUR)), (7, 3, DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(8, 4, DATE_SUB(NOW(), INTERVAL 6 HOUR)), (8, 6, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(9, 7, DATE_SUB(NOW(), INTERVAL 4 HOUR)), (9, 12, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(10, 8, DATE_SUB(NOW(), INTERVAL 2 HOUR)), (10, 5, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(11, 12, DATE_SUB(NOW(), INTERVAL 22 HOUR)), (11, 1, DATE_SUB(NOW(), INTERVAL 21 HOUR)),
(12, 2, DATE_SUB(NOW(), INTERVAL 20 HOUR)), (12, 9, DATE_SUB(NOW(), INTERVAL 19 HOUR));

-- 4) Galerías de videos (portada/miniatura = primera imagen, RQFN30). 6 videos
--    con 3 imágenes cada uno; el resto (incluido el video 1) usa el frame.
INSERT IGNORE INTO `imagenes_video` (`id`, `video_id`, `url_imagen`, `orden`) VALUES
(1, 2, 'https://res.cloudinary.com/demo/image/upload/woman.jpg', 1),
(2, 2, 'https://res.cloudinary.com/demo/image/upload/couple.jpg', 2),
(3, 2, 'https://res.cloudinary.com/demo/image/upload/sample.jpg', 3),
(4, 11, 'https://res.cloudinary.com/demo/image/upload/woman.jpg', 1),
(5, 11, 'https://res.cloudinary.com/demo/image/upload/couple.jpg', 2),
(6, 11, 'https://res.cloudinary.com/demo/image/upload/sample.jpg', 3),
(7, 19, 'https://res.cloudinary.com/demo/image/upload/woman.jpg', 1),
(8, 19, 'https://res.cloudinary.com/demo/image/upload/couple.jpg', 2),
(9, 19, 'https://res.cloudinary.com/demo/image/upload/sample.jpg', 3),
(10, 26, 'https://res.cloudinary.com/demo/image/upload/woman.jpg', 1),
(11, 26, 'https://res.cloudinary.com/demo/image/upload/couple.jpg', 2),
(12, 26, 'https://res.cloudinary.com/demo/image/upload/sample.jpg', 3),
(13, 65, 'https://res.cloudinary.com/demo/image/upload/woman.jpg', 1),
(14, 65, 'https://res.cloudinary.com/demo/image/upload/couple.jpg', 2),
(15, 65, 'https://res.cloudinary.com/demo/image/upload/sample.jpg', 3),
(16, 73, 'https://res.cloudinary.com/demo/image/upload/woman.jpg', 1),
(17, 73, 'https://res.cloudinary.com/demo/image/upload/couple.jpg', 2),
(18, 73, 'https://res.cloudinary.com/demo/image/upload/sample.jpg', 3);

-- 5) Pasos de tutorial (RQFN121-125): los 8 pasos en los 12 videos 'Tutorial'
--    del seed (96 filas) para que el acordeón de pasos no quede vacío.
INSERT IGNORE INTO `pasos_maquillaje` (`id`, `video_id`, `tipo_paso`, `contenido`, `orden`) VALUES
(1, 1, 'preparacion', 'Limpia, exfolia e hidrata el rostro. Aplica primer para fijar el maquillaje.', 1),
(2, 1, 'base', 'Difumina la base con brocha o esponja humeda empezando desde el centro del rostro.', 2),
(3, 1, 'contorno', 'Marca pomulos, mandibula y sienes con un tono dos tientos mas oscuro.', 3),
(4, 1, 'corrector', 'Corrige ojeras y detalles aplicando corrector en zonas de luz.', 4),
(5, 1, 'sombras', 'Difumina la sombra desde el parpado movil hacia la cuenca con transicion suave.', 5),
(6, 1, 'delineado', 'Traza el delineado con pulso firme, engrosando el extremo exterior.', 6),
(7, 1, 'cejas', 'Rellena las cejas a trazo corto siguiendo el sentido del vello.', 7),
(8, 1, 'lip_combo', 'Delinea los labios, aplica labial y sella o ilumina el arco de cupido.', 8),
(9, 7, 'preparacion', 'Limpia, exfolia e hidrata el rostro. Aplica primer para fijar el maquillaje.', 1),
(10, 7, 'base', 'Difumina la base con brocha o esponja humeda empezando desde el centro del rostro.', 2),
(11, 7, 'contorno', 'Marca pomulos, mandibula y sienes con un tono dos tientos mas oscuro.', 3),
(12, 7, 'corrector', 'Corrige ojeras y detalles aplicando corrector en zonas de luz.', 4),
(13, 7, 'sombras', 'Difumina la sombra desde el parpado movil hacia la cuenca con transicion suave.', 5),
(14, 7, 'delineado', 'Traza el delineado con pulso firme, engrosando el extremo exterior.', 6),
(15, 7, 'cejas', 'Rellena las cejas a trazo corto siguiendo el sentido del vello.', 7),
(16, 7, 'lip_combo', 'Delinea los labios, aplica labial y sella o ilumina el arco de cupido.', 8),
(17, 13, 'preparacion', 'Limpia, exfolia e hidrata el rostro. Aplica primer para fijar el maquillaje.', 1),
(18, 13, 'base', 'Difumina la base con brocha o esponja humeda empezando desde el centro del rostro.', 2),
(19, 13, 'contorno', 'Marca pomulos, mandibula y sienes con un tono dos tientos mas oscuro.', 3),
(20, 13, 'corrector', 'Corrige ojeras y detalles aplicando corrector en zonas de luz.', 4),
(21, 13, 'sombras', 'Difumina la sombra desde el parpado movil hacia la cuenca con transicion suave.', 5),
(22, 13, 'delineado', 'Traza el delineado con pulso firme, engrosando el extremo exterior.', 6),
(23, 13, 'cejas', 'Rellena las cejas a trazo corto siguiendo el sentido del vello.', 7),
(24, 13, 'lip_combo', 'Delinea los labios, aplica labial y sella o ilumina el arco de cupido.', 8),
(25, 19, 'preparacion', 'Limpia, exfolia e hidrata el rostro. Aplica primer para fijar el maquillaje.', 1),
(26, 19, 'base', 'Difumina la base con brocha o esponja humeda empezando desde el centro del rostro.', 2),
(27, 19, 'contorno', 'Marca pomulos, mandibula y sienes con un tono dos tientos mas oscuro.', 3),
(28, 19, 'corrector', 'Corrige ojeras y detalles aplicando corrector en zonas de luz.', 4),
(29, 19, 'sombras', 'Difumina la sombra desde el parpado movil hacia la cuenca con transicion suave.', 5),
(30, 19, 'delineado', 'Traza el delineado con pulso firme, engrosando el extremo exterior.', 6),
(31, 19, 'cejas', 'Rellena las cejas a trazo corto siguiendo el sentido del vello.', 7),
(32, 19, 'lip_combo', 'Delinea los labios, aplica labial y sella o ilumina el arco de cupido.', 8),
(33, 25, 'preparacion', 'Limpia, exfolia e hidrata el rostro. Aplica primer para fijar el maquillaje.', 1),
(34, 25, 'base', 'Difumina la base con brocha o esponja humeda empezando desde el centro del rostro.', 2),
(35, 25, 'contorno', 'Marca pomulos, mandibula y sienes con un tono dos tientos mas oscuro.', 3),
(36, 25, 'corrector', 'Corrige ojeras y detalles aplicando corrector en zonas de luz.', 4),
(37, 25, 'sombras', 'Difumina la sombra desde el parpado movil hacia la cuenca con transicion suave.', 5),
(38, 25, 'delineado', 'Traza el delineado con pulso firme, engrosando el extremo exterior.', 6),
(39, 25, 'cejas', 'Rellena las cejas a trazo corto siguiendo el sentido del vello.', 7),
(40, 25, 'lip_combo', 'Delinea los labios, aplica labial y sella o ilumina el arco de cupido.', 8),
(41, 31, 'preparacion', 'Limpia, exfolia e hidrata el rostro. Aplica primer para fijar el maquillaje.', 1),
(42, 31, 'base', 'Difumina la base con brocha o esponja humeda empezando desde el centro del rostro.', 2),
(43, 31, 'contorno', 'Marca pomulos, mandibula y sienes con un tono dos tientos mas oscuro.', 3),
(44, 31, 'corrector', 'Corrige ojeras y detalles aplicando corrector en zonas de luz.', 4),
(45, 31, 'sombras', 'Difumina la sombra desde el parpado movil hacia la cuenca con transicion suave.', 5),
(46, 31, 'delineado', 'Traza el delineado con pulso firme, engrosando el extremo exterior.', 6),
(47, 31, 'cejas', 'Rellena las cejas a trazo corto siguiendo el sentido del vello.', 7),
(48, 31, 'lip_combo', 'Delinea los labios, aplica labial y sella o ilumina el arco de cupido.', 8),
(49, 37, 'preparacion', 'Limpia, exfolia e hidrata el rostro. Aplica primer para fijar el maquillaje.', 1),
(50, 37, 'base', 'Difumina la base con brocha o esponja humeda empezando desde el centro del rostro.', 2),
(51, 37, 'contorno', 'Marca pomulos, mandibula y sienes con un tono dos tientos mas oscuro.', 3),
(52, 37, 'corrector', 'Corrige ojeras y detalles aplicando corrector en zonas de luz.', 4),
(53, 37, 'sombras', 'Difumina la sombra desde el parpado movil hacia la cuenca con transicion suave.', 5),
(54, 37, 'delineado', 'Traza el delineado con pulso firme, engrosando el extremo exterior.', 6),
(55, 37, 'cejas', 'Rellena las cejas a trazo corto siguiendo el sentido del vello.', 7),
(56, 37, 'lip_combo', 'Delinea los labios, aplica labial y sella o ilumina el arco de cupido.', 8),
(57, 43, 'preparacion', 'Limpia, exfolia e hidrata el rostro. Aplica primer para fijar el maquillaje.', 1),
(58, 43, 'base', 'Difumina la base con brocha o esponja humeda empezando desde el centro del rostro.', 2),
(59, 43, 'contorno', 'Marca pomulos, mandibula y sienes con un tono dos tientos mas oscuro.', 3),
(60, 43, 'corrector', 'Corrige ojeras y detalles aplicando corrector en zonas de luz.', 4),
(61, 43, 'sombras', 'Difumina la sombra desde el parpado movil hacia la cuenca con transicion suave.', 5),
(62, 43, 'delineado', 'Traza el delineado con pulso firme, engrosando el extremo exterior.', 6),
(63, 43, 'cejas', 'Rellena las cejas a trazo corto siguiendo el sentido del vello.', 7),
(64, 43, 'lip_combo', 'Delinea los labios, aplica labial y sella o ilumina el arco de cupido.', 8),
(65, 49, 'preparacion', 'Limpia, exfolia e hidrata el rostro. Aplica primer para fijar el maquillaje.', 1),
(66, 49, 'base', 'Difumina la base con brocha o esponja humeda empezando desde el centro del rostro.', 2),
(67, 49, 'contorno', 'Marca pomulos, mandibula y sienes con un tono dos tientos mas oscuro.', 3),
(68, 49, 'corrector', 'Corrige ojeras y detalles aplicando corrector en zonas de luz.', 4),
(69, 49, 'sombras', 'Difumina la sombra desde el parpado movil hacia la cuenca con transicion suave.', 5),
(70, 49, 'delineado', 'Traza el delineado con pulso firme, engrosando el extremo exterior.', 6),
(71, 49, 'cejas', 'Rellena las cejas a trazo corto siguiendo el sentido del vello.', 7),
(72, 49, 'lip_combo', 'Delinea los labios, aplica labial y sella o ilumina el arco de cupido.', 8),
(73, 55, 'preparacion', 'Limpia, exfolia e hidrata el rostro. Aplica primer para fijar el maquillaje.', 1),
(74, 55, 'base', 'Difumina la base con brocha o esponja humeda empezando desde el centro del rostro.', 2),
(75, 55, 'contorno', 'Marca pomulos, mandibula y sienes con un tono dos tientos mas oscuro.', 3),
(76, 55, 'corrector', 'Corrige ojeras y detalles aplicando corrector en zonas de luz.', 4),
(77, 55, 'sombras', 'Difumina la sombra desde el parpado movil hacia la cuenca con transicion suave.', 5),
(78, 55, 'delineado', 'Traza el delineado con pulso firme, engrosando el extremo exterior.', 6),
(79, 55, 'cejas', 'Rellena las cejas a trazo corto siguiendo el sentido del vello.', 7),
(80, 55, 'lip_combo', 'Delinea los labios, aplica labial y sella o ilumina el arco de cupido.', 8),
(81, 61, 'preparacion', 'Limpia, exfolia e hidrata el rostro. Aplica primer para fijar el maquillaje.', 1),
(82, 61, 'base', 'Difumina la base con brocha o esponja humeda empezando desde el centro del rostro.', 2),
(83, 61, 'contorno', 'Marca pomulos, mandibula y sienes con un tono dos tientos mas oscuro.', 3),
(84, 61, 'corrector', 'Corrige ojeras y detalles aplicando corrector en zonas de luz.', 4),
(85, 61, 'sombras', 'Difumina la sombra desde el parpado movil hacia la cuenca con transicion suave.', 5),
(86, 61, 'delineado', 'Traza el delineado con pulso firme, engrosando el extremo exterior.', 6),
(87, 61, 'cejas', 'Rellena las cejas a trazo corto siguiendo el sentido del vello.', 7),
(88, 61, 'lip_combo', 'Delinea los labios, aplica labial y sella o ilumina el arco de cupido.', 8),
(89, 67, 'preparacion', 'Limpia, exfolia e hidrata el rostro. Aplica primer para fijar el maquillaje.', 1),
(90, 67, 'base', 'Difumina la base con brocha o esponja humeda empezando desde el centro del rostro.', 2),
(91, 67, 'contorno', 'Marca pomulos, mandibula y sienes con un tono dos tientos mas oscuro.', 3),
(92, 67, 'corrector', 'Corrige ojeras y detalles aplicando corrector en zonas de luz.', 4),
(93, 67, 'sombras', 'Difumina la sombra desde el parpado movil hacia la cuenca con transicion suave.', 5),
(94, 67, 'delineado', 'Traza el delineado con pulso firme, engrosando el extremo exterior.', 6),
(95, 67, 'cejas', 'Rellena las cejas a trazo corto siguiendo el sentido del vello.', 7),
(96, 67, 'lip_combo', 'Delinea los labios, aplica labial y sella o ilumina el arco de cupido.', 8);

-- 6) Votos de semejanza (RQFN31/100): 30 votos (24 a favor, 6 en contra)
--    repartidos en veinte videos. El video 1 NO recibe votos: es el target
--    de fixtures-semejanza-baja.js (siembra 1001 votos para probar el aviso).
INSERT IGNORE INTO `votos_video` (`id`, `video_id`, `usuario_id`, `tipo_voto`, `fecha`) VALUES
(1, 4, 4, 'favor', DATE_SUB(NOW(), INTERVAL 26 HOUR)),
(2, 4, 5, 'favor', DATE_SUB(NOW(), INTERVAL 25 HOUR)),
(3, 4, 6, 'favor', DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(4, 5, 7, 'favor', DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(5, 5, 8, 'favor', DATE_SUB(NOW(), INTERVAL 22 HOUR)),
(6, 6, 9, 'favor', DATE_SUB(NOW(), INTERVAL 21 HOUR)),
(7, 7, 10, 'favor', DATE_SUB(NOW(), INTERVAL 20 HOUR)),
(8, 7, 11, 'favor', DATE_SUB(NOW(), INTERVAL 19 HOUR)),
(9, 8, 12, 'favor', DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(10, 9, 4, 'favor', DATE_SUB(NOW(), INTERVAL 17 HOUR)),
(11, 12, 5, 'favor', DATE_SUB(NOW(), INTERVAL 16 HOUR)),
(12, 12, 6, 'favor', DATE_SUB(NOW(), INTERVAL 15 HOUR)),
(13, 13, 7, 'favor', DATE_SUB(NOW(), INTERVAL 14 HOUR)),
(14, 14, 8, 'favor', DATE_SUB(NOW(), INTERVAL 13 HOUR)),
(15, 14, 9, 'favor', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(16, 15, 10, 'favor', DATE_SUB(NOW(), INTERVAL 11 HOUR)),
(17, 16, 11, 'favor', DATE_SUB(NOW(), INTERVAL 10 HOUR)),
(18, 17, 12, 'favor', DATE_SUB(NOW(), INTERVAL 9 HOUR)),
(19, 23, 4, 'favor', DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(20, 24, 5, 'favor', DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(21, 24, 6, 'favor', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(22, 34, 7, 'favor', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(23, 36, 8, 'favor', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(24, 73, 4, 'favor', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(25, 5, 9, 'contra', DATE_SUB(NOW(), INTERVAL 25 HOUR)),
(26, 9, 2, 'contra', DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(27, 11, 3, 'contra', DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(28, 16, 10, 'contra', DATE_SUB(NOW(), INTERVAL 22 HOUR)),
(29, 18, 11, 'contra', DATE_SUB(NOW(), INTERVAL 21 HOUR)),
(30, 73, 10, 'contra', DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- Razones de los votos en contra (una por voto, salvo dos con estilo alternativo).
INSERT IGNORE INTO `voto_razones` (`voto_id`, `razon_id`, `estilo_alternativo_id`) VALUES
(25, 1, NULL),
(26, 16, 33),
(27, 2, NULL),
(28, 8, NULL),
(29, 7, 60),
(30, 3, NULL);
-- 7) Likes de videos (RQFN84): 36 filas (3 por usuario) coherentes con la
--    columna denormalizada `cantidad_likes` de cada video (histórico agregado).
INSERT IGNORE INTO `likes_video` (`usuario_id`, `video_id`, `fecha`) VALUES
(1, 4, DATE_SUB(NOW(), INTERVAL 30 HOUR)), (1, 5, DATE_SUB(NOW(), INTERVAL 29 HOUR)), (1, 10, DATE_SUB(NOW(), INTERVAL 28 HOUR)),
(2, 4, DATE_SUB(NOW(), INTERVAL 27 HOUR)), (2, 5, DATE_SUB(NOW(), INTERVAL 26 HOUR)), (2, 8, DATE_SUB(NOW(), INTERVAL 25 HOUR)),
(3, 1, DATE_SUB(NOW(), INTERVAL 24 HOUR)), (3, 7, DATE_SUB(NOW(), INTERVAL 23 HOUR)), (3, 13, DATE_SUB(NOW(), INTERVAL 22 HOUR)),
(4, 6, DATE_SUB(NOW(), INTERVAL 21 HOUR)), (4, 9, DATE_SUB(NOW(), INTERVAL 20 HOUR)), (4, 14, DATE_SUB(NOW(), INTERVAL 19 HOUR)),
(5, 73, DATE_SUB(NOW(), INTERVAL 18 HOUR)), (5, 8, DATE_SUB(NOW(), INTERVAL 17 HOUR)), (5, 16, DATE_SUB(NOW(), INTERVAL 16 HOUR)),
(6, 7, DATE_SUB(NOW(), INTERVAL 15 HOUR)), (6, 12, DATE_SUB(NOW(), INTERVAL 14 HOUR)), (6, 15, DATE_SUB(NOW(), INTERVAL 13 HOUR)),
(7, 9, DATE_SUB(NOW(), INTERVAL 12 HOUR)), (7, 11, DATE_SUB(NOW(), INTERVAL 11 HOUR)), (7, 19, DATE_SUB(NOW(), INTERVAL 10 HOUR)),
(8, 6, DATE_SUB(NOW(), INTERVAL 9 HOUR)), (8, 17, DATE_SUB(NOW(), INTERVAL 8 HOUR)), (8, 73, DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(9, 12, DATE_SUB(NOW(), INTERVAL 6 HOUR)), (9, 19, DATE_SUB(NOW(), INTERVAL 5 HOUR)), (9, 21, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(10, 13, DATE_SUB(NOW(), INTERVAL 3 HOUR)), (10, 22, DATE_SUB(NOW(), INTERVAL 2 HOUR)), (10, 73, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(11, 5, DATE_SUB(NOW(), INTERVAL 2 HOUR)), (11, 11, DATE_SUB(NOW(), INTERVAL 3 HOUR)), (11, 24, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(12, 24, DATE_SUB(NOW(), INTERVAL 5 HOUR)), (12, 44, DATE_SUB(NOW(), INTERVAL 6 HOUR)), (12, 42, DATE_SUB(NOW(), INTERVAL 7 HOUR));

-- 8) Videos guardados (RQFN44): 3 por usuario (36 filas en 12 usuarios).
INSERT IGNORE INTO `videos_guardados` (`usuario_id`, `video_id`, `fecha_guardado`) VALUES
(1, 5, DATE_SUB(NOW(), INTERVAL 30 HOUR)), (1, 19, DATE_SUB(NOW(), INTERVAL 29 HOUR)), (1, 44, DATE_SUB(NOW(), INTERVAL 28 HOUR)),
(2, 6, DATE_SUB(NOW(), INTERVAL 27 HOUR)), (2, 21, DATE_SUB(NOW(), INTERVAL 26 HOUR)), (2, 60, DATE_SUB(NOW(), INTERVAL 25 HOUR)),
(3, 7, DATE_SUB(NOW(), INTERVAL 24 HOUR)), (3, 23, DATE_SUB(NOW(), INTERVAL 23 HOUR)), (3, 61, DATE_SUB(NOW(), INTERVAL 22 HOUR)),
(4, 8, DATE_SUB(NOW(), INTERVAL 21 HOUR)), (4, 25, DATE_SUB(NOW(), INTERVAL 20 HOUR)), (4, 63, DATE_SUB(NOW(), INTERVAL 19 HOUR)),
(5, 73, DATE_SUB(NOW(), INTERVAL 18 HOUR)), (5, 26, DATE_SUB(NOW(), INTERVAL 17 HOUR)), (5, 66, DATE_SUB(NOW(), INTERVAL 16 HOUR)),
(6, 11, DATE_SUB(NOW(), INTERVAL 15 HOUR)), (6, 28, DATE_SUB(NOW(), INTERVAL 14 HOUR)), (6, 68, DATE_SUB(NOW(), INTERVAL 13 HOUR)),
(7, 13, DATE_SUB(NOW(), INTERVAL 12 HOUR)), (7, 30, DATE_SUB(NOW(), INTERVAL 11 HOUR)), (7, 69, DATE_SUB(NOW(), INTERVAL 10 HOUR)),
(8, 15, DATE_SUB(NOW(), INTERVAL 9 HOUR)), (8, 33, DATE_SUB(NOW(), INTERVAL 8 HOUR)), (8, 71, DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(9, 17, DATE_SUB(NOW(), INTERVAL 6 HOUR)), (9, 35, DATE_SUB(NOW(), INTERVAL 5 HOUR)), (9, 72, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(10, 20, DATE_SUB(NOW(), INTERVAL 3 HOUR)), (10, 38, DATE_SUB(NOW(), INTERVAL 2 HOUR)), (10, 73, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(11, 5, DATE_SUB(NOW(), INTERVAL 2 HOUR)), (11, 11, DATE_SUB(NOW(), INTERVAL 3 HOUR)), (11, 70, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(12, 24, DATE_SUB(NOW(), INTERVAL 5 HOUR)), (12, 44, DATE_SUB(NOW(), INTERVAL 6 HOUR)), (12, 65, DATE_SUB(NOW(), INTERVAL 7 HOUR));

-- 9) Historial de videos vistos (RQFN69-72 / retención 14 días, RQFN100-120):
--    24 filas con fechas recientes para que la pestaña Vistas y la tendencia
--    diaria de Estadísticas no estén vacías al primer arranque.
INSERT IGNORE INTO `videos_vistos` (`usuario_id`, `video_id`, `fecha_visto`) VALUES
(1, 5, DATE_SUB(NOW(), INTERVAL 13 DAY)), (1, 19, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(2, 6, DATE_SUB(NOW(), INTERVAL 11 DAY)), (2, 21, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(3, 7, DATE_SUB(NOW(), INTERVAL 9 DAY)), (3, 61, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(4, 8, DATE_SUB(NOW(), INTERVAL 7 DAY)), (4, 25, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(5, 73, DATE_SUB(NOW(), INTERVAL 5 DAY)), (5, 26, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(6, 11, DATE_SUB(NOW(), INTERVAL 3 DAY)), (6, 28, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(7, 13, DATE_SUB(NOW(), INTERVAL 13 DAY)), (7, 30, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(8, 15, DATE_SUB(NOW(), INTERVAL 11 DAY)), (8, 33, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(9, 17, DATE_SUB(NOW(), INTERVAL 9 DAY)), (9, 35, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(10, 20, DATE_SUB(NOW(), INTERVAL 7 DAY)), (10, 38, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(11, 73, DATE_SUB(NOW(), INTERVAL 5 DAY)), (11, 11, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(12, 24, DATE_SUB(NOW(), INTERVAL 12 DAY)), (12, 44, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 10) Compartidos (RQFN118): 12 filas (1 por usuario).
INSERT IGNORE INTO `videos_compartidos` (`usuario_id`, `video_id`, `fecha_compartido`) VALUES
(1, 5, DATE_SUB(NOW(), INTERVAL 30 HOUR)), (2, 6, DATE_SUB(NOW(), INTERVAL 29 HOUR)),
(3, 7, DATE_SUB(NOW(), INTERVAL 28 HOUR)), (4, 8, DATE_SUB(NOW(), INTERVAL 27 HOUR)),
(5, 73, DATE_SUB(NOW(), INTERVAL 26 HOUR)), (6, 11, DATE_SUB(NOW(), INTERVAL 25 HOUR)),
(7, 13, DATE_SUB(NOW(), INTERVAL 24 HOUR)), (8, 15, DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(9, 17, DATE_SUB(NOW(), INTERVAL 22 HOUR)), (10, 20, DATE_SUB(NOW(), INTERVAL 21 HOUR)),
(11, 5, DATE_SUB(NOW(), INTERVAL 20 HOUR)), (12, 24, DATE_SUB(NOW(), INTERVAL 19 HOUR));

-- 11) Comentarios (RQFN46-49, RQFN126-141): 19 filas.
--     Raíces en videos (1, 2, 3, 5, 9, 36, 44, 57, 61, 73 y dos del 28/29) y
--     en conversaciones (7 y 9), con 5 respuestas (4→2, 9→7, 11→10, 12→10 y
--     14→13) para ejercitar el anidado del detalle. El comentario 19 (test_user_01
--     en el video 73) es la fuente real de la notificación 'nuevo_comentario'
--     para meow del bloque de notificaciones de abajo.
INSERT IGNORE INTO `comentarios` (`id`, `usuario_id`, `video_id`, `conversacion_id`, `comentario_padre_id`, `texto`, `cantidad_likes`, `fecha`) VALUES
(1, 4, 1, NULL, NULL, 'Buen tutorial, el delineado gótico me quedó genial.', 0, DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(2, 2, 2, NULL, NULL, 'Me encanta como queda el delineado, pero mi tono de piel es mas claro.', 2, DATE_SUB(NOW(), INTERVAL 40 HOUR)),
(3, 1, 2, NULL, NULL, '¿Podrias compartir la paleta de sombras que usas?', 0, DATE_SUB(NOW(), INTERVAL 38 HOUR)),
(4, 3, 2, NULL, 2, 'Gracias! Prueba con un tono dos tientos mas claro y veras la diferencia.', 1, DATE_SUB(NOW(), INTERVAL 36 HOUR)),
(5, 3, 3, NULL, NULL, 'El tercer video de la serie me pareció el más pulido.', 0, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(6, 2, 5, NULL, NULL, 'La base de este tuto le sienta muy bien a pieles claras.', 0, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(7, 12, NULL, 4, NULL, 'Totalmente de acuerdo, el grunge comercial perdió el DIY.', 0, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(8, 8, NULL, 4, NULL, 'Opino igual: la estética ya se vendió antes de la subcultura.', 0, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(9, 12, NULL, 4, 7, 'Y sin embargo sigue sirviendo para que más gente se acerque al original.', 1, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(10, 11, 73, NULL, NULL, 'No entiendo por que la gente dice que el gothic solo es negro: la base porcelana y el contorno hacen TODO.', 2, DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(11, 3, 73, NULL, 10, 'Exacto, y justo por eso lo ame.', 0, DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(12, 8, 73, NULL, 10, 'Ese es el punto, el maquillaje no es solo el color.', 0, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(13, 5, 9, NULL, NULL, 'El paso de la base quedo muy natural en el video 9.', 0, DATE_SUB(NOW(), INTERVAL 9 HOUR)),
(14, 2, 9, NULL, 13, 'Excelente guia para principiantes.', 0, DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(15, 4, 36, NULL, NULL, 'Me encanto el color, quizá demasiado brillante para mí.', 0, DATE_SUB(NOW(), INTERVAL 9 HOUR)),
(16, 9, 44, NULL, NULL, 'El video 44 es de mis favoritos del feed.', 0, DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(17, 10, 57, NULL, NULL, 'Las sombras de este tuto quedaron preciosas.', 0, DATE_SUB(NOW(), INTERVAL 10 HOUR)),
(18, 7, 61, NULL, NULL, 'Look suave y perfecto para empezar a experimentar.', 0, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(19, 1, 73, NULL, NULL, 'Justo por eso el gothic va más allá del negro: la piel porcelana lo eleva todo.', 0, DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- Likes a comentarios (8 filas).
INSERT IGNORE INTO `likes_comentario` (`usuario_id`, `comentario_id`, `fecha`) VALUES
(5, 10, DATE_SUB(NOW(), INTERVAL 6 HOUR)), (6, 10, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(2, 4, DATE_SUB(NOW(), INTERVAL 35 HOUR)), (3, 2, DATE_SUB(NOW(), INTERVAL 20 HOUR)),
(9, 16, DATE_SUB(NOW(), INTERVAL 6 HOUR)), (12, 9, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 18, DATE_SUB(NOW(), INTERVAL 5 HOUR)), (8, 15, DATE_SUB(NOW(), INTERVAL 8 HOUR));

-- 12) Likes a conversaciones (RQFN126-141): el contador `cantidad_likes` de la
--     tabla `conversaciones` (12/8/25/19/33/40) ya era histórico; estas filas
--     documentan una parte real de ese rating.
INSERT IGNORE INTO `likes_conversacion` (`usuario_id`, `conversacion_id`, `fecha`) VALUES
(2, 1, DATE_SUB(NOW(), INTERVAL 20 HOUR)), (3, 1, DATE_SUB(NOW(), INTERVAL 19 HOUR)),
(4, 2, DATE_SUB(NOW(), INTERVAL 17 HOUR)), (6, 3, DATE_SUB(NOW(), INTERVAL 30 HOUR)),
(12, 4, DATE_SUB(NOW(), INTERVAL 5 HOUR)), (11, 5, DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- 13) Tokens de prueba (RQFN19-34): uno expirado (el evento de limpieza lo
--     borra) y uno ya usado (patron de recuperación/tokens de sesión).
INSERT IGNORE INTO `tokens` (`id`, `usuario_id`, `token`, `tipo`, `fecha_creacion`, `fecha_expiracion`, `usado`) VALUES
(1, 1, '7f3b9c1e5a2d4f6b8a0c2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4', 'recuperacion_contrasena', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 0),
(2, 2, 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1', 'refresh', DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 1);

-- 14) Recursos de subculturas (RQFN73-78): enlaces reales de la Wiki para la
--     tabla de recursos que acompaña a cada subestilo.
INSERT IGNORE INTO `subcultura_recursos` (`id`, `subcultura_id`, `url`) VALUES
(1, 1, 'https://www.trufae.com/2021/05/03/pintura-gotica-espanola/'),
(2, 2, 'https://www.nose-as.com/2024/04/gothic-victoriano/'),
(3, 11, 'https://www.emuze.com/2023/07/emocore/'),
(4, 44, 'https://gyaru.online/2023/08/hime-gyaru-the-ultimate-guide/'),
(5, 60, 'https://www.halloweencostumes.com/goth-guide.html'),
(6, 61, 'https://res.cloudinary.com/demo/image/upload/sample.jpg');

-- 15) Denuncias de conversaciones (RQFN137-141): dos reportes reales (IDs
--     fijos) con sus motivos; la conv 4 y 6 quedan marcadas con 1 denuncia
--     (UPDATE denormalizado), lejos del umbral de auto-eliminación (20 vistas).
INSERT IGNORE INTO `denuncias_conversacion` (`id`, `conversacion_id`, `usuario_id`, `fecha`) VALUES
(1, 4, 11, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(2, 6, 2, DATE_SUB(NOW(), INTERVAL 4 HOUR));
INSERT IGNORE INTO `denuncia_motivos` (`denuncia_id`, `motivo_id`) VALUES
(1, 3),
(2, 10),
(2, 9);
UPDATE `conversaciones` SET `cantidad_denuncias` = 1 WHERE `id` IN (4, 6) AND `cantidad_denuncias` = 0;

-- 16) Notificaciones de tipos restantes (RQFN69-72): like a video, comentario
--     en video y contenido nuevo del seguido, además de las de seguimiento de
--     arriba. Mismo patrón idempotente (ver bloque notificaciones de arriba).
INSERT INTO `notificaciones` (`usuario_id`, `tipo`, `mensaje`, `video_id`, `usuario_actor_id`, `leida`, `fecha_creacion`)
SELECT 1, 'nuevo_like', 'test_user_03 le dio like a tu video', 1, 3, 0, DATE_SUB(NOW(), INTERVAL 24 HOUR)
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `notificaciones` WHERE `usuario_id` = 1 AND `tipo` = 'nuevo_like' AND `video_id` = 1
);
INSERT INTO `notificaciones` (`usuario_id`, `tipo`, `mensaje`, `video_id`, `usuario_actor_id`, `leida`, `fecha_creacion`)
SELECT 11, 'nuevo_comentario', 'test_user_01 comentó tu video', 73, 1, 0, DATE_SUB(NOW(), INTERVAL 8 HOUR)
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `notificaciones` WHERE `usuario_id` = 11 AND `tipo` = 'nuevo_comentario' AND `video_id` = 73
);
INSERT INTO `notificaciones` (`usuario_id`, `tipo`, `mensaje`, `video_id`, `usuario_actor_id`, `leida`, `fecha_creacion`)
SELECT 6, 'nuevo_contenido_seguido', 'test_user_05 publicó un video en un estilo que sigues', 5, 5, 0, DATE_SUB(NOW(), INTERVAL 45 HOUR)
FROM DUAL WHERE NOT EXISTS (
    SELECT 1 FROM `notificaciones` WHERE `usuario_id` = 6 AND `tipo` = 'nuevo_contenido_seguido' AND `video_id` = 5
);

-- ============================================================
-- Eventos programados (requieren privilegio EVENT; el usuario de
-- la app los crea con el esquema vía initDb.js. Si el usuario no
-- tiene el privilegio, crearlos manualmente con una cuenta admin).
-- ============================================================

-- 1) Eliminar usuarios no verificados (y sus tokens) mayores a 24h.
DROP EVENT IF EXISTS `evt_eliminar_usuarios_no_verificados`;
CREATE EVENT `evt_eliminar_usuarios_no_verificados`
ON SCHEDULE EVERY 24 HOUR
STARTS CURRENT_TIMESTAMP
ON COMPLETION PRESERVE
ENABLE
DO
  DELETE u, t
  FROM `usuarios` u
  LEFT JOIN `tokens` t ON t.usuario_id = u.id
  WHERE u.correo_verificado = 0
    AND u.fecha_registro <= (NOW() - INTERVAL 24 HOUR);

-- 2) Limpiar tokens expirados o ya usados.
DROP EVENT IF EXISTS `evt_limpiar_tokens_expirados`;
CREATE EVENT `evt_limpiar_tokens_expirados`
ON SCHEDULE EVERY 24 HOUR
STARTS CURRENT_TIMESTAMP
ON COMPLETION PRESERVE
ENABLE
DO
  DELETE FROM `tokens`
  WHERE `fecha_expiracion` < NOW() OR `usado` = 1;

-- 3) Limpiar el historial de videos vistos (retención de 30 días, RQNFN36:
--    al volver a ver un video tras la purga su vista vuelve a contar).
DROP EVENT IF EXISTS `evt_limpiar_videos_vistos`;
CREATE EVENT `evt_limpiar_videos_vistos`
ON SCHEDULE EVERY 24 HOUR
STARTS CURRENT_TIMESTAMP
ON COMPLETION PRESERVE
ENABLE
DO
  DELETE FROM `videos_vistos`
  WHERE `fecha_visto` <= (NOW() - INTERVAL 1 MONTH);

-- 4) Limpiar notificaciones viejas (retención de 3 meses, RQNFN27: el
--    contador de no leídas y el drawer solo conservan lo reciente).
DROP EVENT IF EXISTS `evt_limpiar_notificaciones_viejas`;
CREATE EVENT `evt_limpiar_notificaciones_viejas`
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
ON COMPLETION PRESERVE
ENABLE
DO
  DELETE FROM `notificaciones`
  WHERE `fecha_creacion` <= (NOW() - INTERVAL 3 MONTH);