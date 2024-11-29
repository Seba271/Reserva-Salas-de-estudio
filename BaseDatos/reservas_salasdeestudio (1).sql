-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-11-2024 a las 16:34:56
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `reservas_salasdeestudio`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administradores`
--

CREATE TABLE `administradores` (
  `id_admin` int(11) NOT NULL,
  `nombre_admin` varchar(100) DEFAULT NULL,
  `correo_admin` varchar(100) DEFAULT NULL,
  `clave_admin` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `administradores`
--

INSERT INTO `administradores` (`id_admin`, `nombre_admin`, `correo_admin`, `clave_admin`) VALUES
(1, 'a', 'a', 'a'),
(2, 'seba', 'teodoro', 'toxa');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bloqueos`
--

CREATE TABLE `bloqueos` (
  `id_bloqueo` int(11) NOT NULL,
  `rut` varchar(12) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `motivo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carreras`
--

CREATE TABLE `carreras` (
  `id_carrera` int(11) NOT NULL,
  `nombre_carrera` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `carreras`
--

INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`) VALUES
(1, 'Arquitectura'),
(2, 'Pedagogía en Educación Diferencial'),
(3, 'Pedagogía en Educación Física'),
(4, 'Enfermería'),
(5, 'Nutrición y Dietética'),
(6, 'Terapia Ocupacional'),
(7, 'Kinesiología (NUEVA)'),
(8, 'Obstetricia y Puericultura (NUEVA)'),
(9, 'Ingeniería Comercial'),
(10, 'Ingeniería Civil Industrial'),
(11, 'Ingeniería Civil en Computación e Informática'),
(12, 'Ingeniería Civil en Minas (NUEVA)'),
(13, 'Licenciatura en Astronomía (NUEVA)'),
(14, 'Administración Pública'),
(15, 'Derecho'),
(16, 'Psicología'),
(17, 'Sociología'),
(18, 'Trabajo Social'),
(19, 'Otros xD');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes`
--

CREATE TABLE `reportes` (
  `id_reporte` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `id_carrera` int(11) NOT NULL,
  `total_reservas` int(11) NOT NULL,
  `porcentaje_reservas` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id_reserva` int(11) NOT NULL,
  `id_sala` int(11) NOT NULL,
  `fecha_reserva` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `tipo_reserva` enum('normal','completa') DEFAULT 'normal',
  `estado_reserva` enum('activa','cancelada','expirada') DEFAULT 'activa',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `rut_usuario` varchar(12) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `salas`
--

CREATE TABLE `salas` (
  `id_sala` int(11) NOT NULL,
  `numero_sala` int(11) NOT NULL,
  `edificio` enum('A','B') DEFAULT NULL,
  `estado` enum('disponible','ocupada','por_disponerse','excedido','deshabilitada') DEFAULT 'disponible',
  `capacidad` int(11) DEFAULT 8
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `salas`
--

INSERT INTO `salas` (`id_sala`, `numero_sala`, `edificio`, `estado`, `capacidad`) VALUES
(1, 1, 'A', 'disponible', 8),
(2, 2, 'A', 'disponible', 8),
(3, 3, 'A', 'disponible', 8),
(4, 4, 'A', 'disponible', 8),
(5, 5, 'A', 'disponible', 8),
(6, 6, 'A', 'disponible', 8),
(7, 7, 'B', 'disponible', 8),
(8, 8, 'B', 'disponible', 8),
(9, 9, 'B', 'disponible', 8),
(10, 10, 'B', 'disponible', 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `rut` varchar(12) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `tipo_usuario` enum('estudiante','profesor') NOT NULL,
  `carrera_id` int(11) DEFAULT NULL,
  `bloqueado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD PRIMARY KEY (`id_admin`);

--
-- Indices de la tabla `bloqueos`
--
ALTER TABLE `bloqueos`
  ADD PRIMARY KEY (`id_bloqueo`),
  ADD KEY `fk_usuario_bloqueo` (`rut`);

--
-- Indices de la tabla `carreras`
--
ALTER TABLE `carreras`
  ADD PRIMARY KEY (`id_carrera`);

--
-- Indices de la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD PRIMARY KEY (`id_reporte`),
  ADD KEY `fk_carrera` (`id_carrera`);

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id_reserva`),
  ADD KEY `fk_sala` (`id_sala`),
  ADD KEY `fk_usuario_rut` (`rut_usuario`);

--
-- Indices de la tabla `salas`
--
ALTER TABLE `salas`
  ADD PRIMARY KEY (`id_sala`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `rut` (`rut`),
  ADD KEY `fk_carrera_usuario` (`carrera_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administradores`
--
ALTER TABLE `administradores`
  MODIFY `id_admin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `bloqueos`
--
ALTER TABLE `bloqueos`
  MODIFY `id_bloqueo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `carreras`
--
ALTER TABLE `carreras`
  MODIFY `id_carrera` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `id_reporte` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `salas`
--
ALTER TABLE `salas`
  MODIFY `id_sala` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `bloqueos`
--
ALTER TABLE `bloqueos`
  ADD CONSTRAINT `fk_usuario_bloqueo` FOREIGN KEY (`rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD CONSTRAINT `fk_carrera` FOREIGN KEY (`id_carrera`) REFERENCES `carreras` (`id_carrera`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD CONSTRAINT `fk_sala` FOREIGN KEY (`id_sala`) REFERENCES `salas` (`id_sala`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_usuario_rut` FOREIGN KEY (`rut_usuario`) REFERENCES `usuarios` (`rut`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_carrera_usuario` FOREIGN KEY (`carrera_id`) REFERENCES `carreras` (`id_carrera`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
