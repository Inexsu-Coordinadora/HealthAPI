-- =====================================================
-- HEALTHAPI - ESQUEMA DE BASE DE DATOS
-- =====================================================
-- Base de datos para sistema de gestión de citas médicas
-- Incluye: Pacientes, Médicos, Consultorios, Disponibilidad y Citas

-- =====================================================
-- TABLA: paciente
-- =====================================================
CREATE TABLE IF NOT EXISTS paciente (
    id_paciente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    direccion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para paciente
CREATE INDEX idx_paciente_correo ON paciente(correo);
CREATE INDEX idx_paciente_nombre ON paciente(nombre);

-- =====================================================
-- TABLA: medico
-- =====================================================
CREATE TABLE IF NOT EXISTS medico (
    id_medico SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para medico
CREATE INDEX idx_medico_correo ON medico(correo);
CREATE INDEX idx_medico_especialidad ON medico(especialidad);

-- =====================================================
-- TABLA: consultorio
-- =====================================================
CREATE TABLE IF NOT EXISTS consultorio (
    id_consultorio SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(200),
    capacidad INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultorio
CREATE INDEX idx_consultorio_nombre ON consultorio(nombre);

-- =====================================================
-- TABLA: disponibilidad
-- =====================================================
-- Representa los horarios disponibles de cada médico
-- Un médico puede tener múltiples disponibilidades en diferentes días/horarios
CREATE TABLE IF NOT EXISTS disponibilidad (
    id_disponibilidad SERIAL PRIMARY KEY,
    id_medico INTEGER NOT NULL REFERENCES medico(id_medico) ON DELETE CASCADE,
    id_consultorio INTEGER REFERENCES consultorio(id_consultorio) ON DELETE SET NULL,
    dia_semana VARCHAR(20) NOT NULL CHECK (dia_semana IN ('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')),
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_hora_valida CHECK (hora_fin > hora_inicio)
);

-- Índices para disponibilidad
CREATE INDEX idx_disponibilidad_medico ON disponibilidad(id_medico);
CREATE INDEX idx_disponibilidad_consultorio ON disponibilidad(id_consultorio);
CREATE INDEX idx_disponibilidad_dia ON disponibilidad(dia_semana);

-- =====================================================
-- TABLA: cita_medica
-- =====================================================
-- Representa las citas agendadas
-- Relación: Paciente -> Cita -> Disponibilidad -> (Médico + Consultorio)
CREATE TABLE IF NOT EXISTS cita_medica (
    id_cita SERIAL PRIMARY KEY,
    id_paciente INTEGER NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
    id_disponibilidad INTEGER NOT NULL REFERENCES disponibilidad(id_disponibilidad) ON DELETE CASCADE,
    fecha TIMESTAMP NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'programada' CHECK (estado IN ('programada', 'cancelada', 'realizada')),
    motivo TEXT,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para cita_medica
CREATE INDEX idx_cita_paciente ON cita_medica(id_paciente);
CREATE INDEX idx_cita_disponibilidad ON cita_medica(id_disponibilidad);
CREATE INDEX idx_cita_fecha ON cita_medica(fecha);
CREATE INDEX idx_cita_estado ON cita_medica(estado);

-- =====================================================
-- RELACIONES Y NOTAS
-- =====================================================
-- 
-- FLUJO DE DATOS:
-- 1. Un MÉDICO tiene múltiples DISPONIBILIDADES (horarios)
-- 2. Cada DISPONIBILIDAD puede estar asignada a un CONSULTORIO (opcional)
-- 3. Un PACIENTE agenda una CITA seleccionando una DISPONIBILIDAD
-- 4. La CITA obtiene automáticamente el MÉDICO y CONSULTORIO de la DISPONIBILIDAD
--
-- VENTAJAS DE ESTE DISEÑO:
-- - No duplicación de datos (médico y consultorio solo en disponibilidad)
-- - Validación de traslapes simplificada (verificar disponibilidad ocupada)
-- - Flexibilidad: Un médico puede trabajar en múltiples consultorios
-- - Escalable: Fácil añadir nuevos horarios sin modificar otras tablas
--
-- VALIDACIONES PRINCIPALES:
-- 1. Una disponibilidad solo puede tener UNA cita por fecha/hora
-- 2. Un paciente no puede tener citas superpuestas
-- 3. Las fechas de citas deben coincidir con el día de semana de la disponibilidad
-- 4. La hora de la cita debe estar dentro del rango (hora_inicio - hora_fin)

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================

-- Insertar pacientes de ejemplo
INSERT INTO paciente (nombre, correo, telefono, fecha_nacimiento) VALUES
('Juan Pérez', 'juan.perez@email.com', '555-0101', '1990-05-15'),
('María García', 'maria.garcia@email.com', '555-0102', '1985-08-22'),
('Carlos López', 'carlos.lopez@email.com', '555-0103', '1992-03-10');

-- Insertar médicos de ejemplo
INSERT INTO medico (nombre, especialidad, correo, telefono) VALUES
('Dr. Ana Rodríguez', 'Cardiología', 'ana.rodriguez@hospital.com', '555-0201'),
('Dr. Luis Martínez', 'Pediatría', 'luis.martinez@hospital.com', '555-0202'),
('Dra. Carmen Sánchez', 'Dermatología', 'carmen.sanchez@hospital.com', '555-0203');

-- Insertar consultorios de ejemplo
INSERT INTO consultorio (nombre, ubicacion, capacidad) VALUES
('Consultorio A', 'Piso 1, Ala Norte', 1),
('Consultorio B', 'Piso 2, Ala Sur', 1),
('Consultorio C', 'Piso 1, Ala Este', 2);

-- Insertar disponibilidades de ejemplo
INSERT INTO disponibilidad (id_medico, id_consultorio, dia_semana, hora_inicio, hora_fin) VALUES
(1, 1, 'lunes', '09:00:00', '13:00:00'),
(1, 1, 'miércoles', '14:00:00', '18:00:00'),
(2, 2, 'martes', '08:00:00', '12:00:00'),
(2, 2, 'jueves', '15:00:00', '19:00:00'),
(3, 3, 'lunes', '10:00:00', '14:00:00');

-- =====================================================
-- QUERIES ÚTILES
-- =====================================================

-- Ver citas con detalles completos
-- SELECT 
--     c.id_cita,
--     p.nombre AS paciente,
--     m.nombre AS medico,
--     m.especialidad,
--     co.nombre AS consultorio,
--     c.fecha,
--     c.estado,
--     c.motivo
-- FROM cita_medica c
-- INNER JOIN paciente p ON c.id_paciente = p.id_paciente
-- INNER JOIN disponibilidad d ON c.id_disponibilidad = d.id_disponibilidad
-- INNER JOIN medico m ON d.id_medico = m.id_medico
-- LEFT JOIN consultorio co ON d.id_consultorio = co.id_consultorio
-- ORDER BY c.fecha DESC;

-- Ver disponibilidades con médico y consultorio
-- SELECT 
--     d.id_disponibilidad,
--     m.nombre AS medico,
--     m.especialidad,
--     co.nombre AS consultorio,
--     d.dia_semana,
--     d.hora_inicio,
--     d.hora_fin
-- FROM disponibilidad d
-- INNER JOIN medico m ON d.id_medico = m.id_medico
-- LEFT JOIN consultorio co ON d.id_consultorio = co.id_consultorio
-- ORDER BY d.dia_semana, d.hora_inicio;
