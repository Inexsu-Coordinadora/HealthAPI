-- =====================================================
-- MIGRACIÓN 001: Creación de Tablas Base
-- Fecha: 2025-11-11
-- Descripción: Crea las tablas iniciales de paciente, medico, 
--              disponibilidad y cita_medica
-- =====================================================

-- Registrar inicio de migración
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time INTEGER;
BEGIN
    start_time := clock_timestamp();
    
    -- Verificar si ya se ejecutó
    IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = '001') THEN
        RAISE NOTICE 'Migración 001 ya fue ejecutada previamente';
        RETURN;
    END IF;

    -- =====================================================
    -- TABLA: paciente
    -- =====================================================
    CREATE TABLE IF NOT EXISTS paciente (
        id_paciente SERIAL PRIMARY KEY,
        nombre CHARACTER VARYING(100) NOT NULL,
        correo CHARACTER VARYING(100) NOT NULL,
        telefono CHARACTER VARYING(20),
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Índices
    CREATE INDEX IF NOT EXISTS idx_paciente_correo ON paciente(correo);
    CREATE INDEX IF NOT EXISTS idx_paciente_nombre ON paciente(nombre);

    -- Comentarios
    COMMENT ON TABLE paciente IS 'Pacientes registrados en el sistema';
    COMMENT ON COLUMN paciente.id_paciente IS 'Identificador único del paciente';

    -- =====================================================
    -- TABLA: medico
    -- =====================================================
    CREATE TABLE IF NOT EXISTS medico (
        id_medico SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        correo CHARACTER VARYING(255) NOT NULL,
        especialidad TEXT NOT NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Índices
    CREATE INDEX IF NOT EXISTS idx_medico_especialidad ON medico(especialidad);
    CREATE INDEX IF NOT EXISTS idx_medico_nombre ON medico(nombre);

    -- Comentarios
    COMMENT ON TABLE medico IS 'Médicos registrados en el sistema';
    COMMENT ON COLUMN medico.especialidad IS 'Especialidad médica del profesional';

    -- =====================================================
    -- TABLA: disponibilidad
    -- =====================================================
    CREATE TABLE IF NOT EXISTS disponibilidad (
        id_disponibilidad SERIAL PRIMARY KEY,
        id_medico INTEGER NOT NULL,
        dia_semana CHARACTER VARYING(10) NOT NULL,
        hora_inicio TIME WITHOUT TIME ZONE NOT NULL,
        hora_fin TIME WITHOUT TIME ZONE NOT NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Foreign Keys
    ALTER TABLE disponibilidad
        DROP CONSTRAINT IF EXISTS fk_disponibilidad_medico;
    
    ALTER TABLE disponibilidad
        ADD CONSTRAINT fk_disponibilidad_medico 
        FOREIGN KEY (id_medico) 
        REFERENCES medico(id_medico) 
        ON DELETE CASCADE;

    -- Índices
    CREATE INDEX IF NOT EXISTS idx_disponibilidad_medico ON disponibilidad(id_medico);
    CREATE INDEX IF NOT EXISTS idx_disponibilidad_dia ON disponibilidad(dia_semana);

    -- Comentarios
    COMMENT ON TABLE disponibilidad IS 'Horarios de disponibilidad de los médicos';
    COMMENT ON COLUMN disponibilidad.dia_semana IS 'Día de la semana (lunes, martes, etc.)';

    -- =====================================================
    -- TABLA: cita_medica
    -- =====================================================
    CREATE TABLE IF NOT EXISTS cita_medica (
        id_cita SERIAL PRIMARY KEY,
        id_paciente INTEGER NOT NULL,
        id_disponibilidad INTEGER NOT NULL,
        fecha TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        estado CHARACTER VARYING(50) NOT NULL DEFAULT 'programada',
        motivo CHARACTER VARYING(500),
        observaciones TEXT,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Foreign Keys
    ALTER TABLE cita_medica
        DROP CONSTRAINT IF EXISTS fk_cita_paciente;
    
    ALTER TABLE cita_medica
        ADD CONSTRAINT fk_cita_paciente 
        FOREIGN KEY (id_paciente) 
        REFERENCES paciente(id_paciente) 
        ON DELETE CASCADE;

    ALTER TABLE cita_medica
        DROP CONSTRAINT IF EXISTS fk_cita_disponibilidad;
    
    ALTER TABLE cita_medica
        ADD CONSTRAINT fk_cita_disponibilidad 
        FOREIGN KEY (id_disponibilidad) 
        REFERENCES disponibilidad(id_disponibilidad) 
        ON DELETE RESTRICT;

    -- Índices
    CREATE INDEX IF NOT EXISTS idx_cita_paciente ON cita_medica(id_paciente);
    CREATE INDEX IF NOT EXISTS idx_cita_disponibilidad ON cita_medica(id_disponibilidad);
    CREATE INDEX IF NOT EXISTS idx_cita_fecha ON cita_medica(fecha);
    CREATE INDEX IF NOT EXISTS idx_cita_estado ON cita_medica(estado);

    -- Comentarios
    COMMENT ON TABLE cita_medica IS 'Citas médicas programadas';
    COMMENT ON COLUMN cita_medica.estado IS 'Estado de la cita: programada, completada, cancelada';

    -- =====================================================
    -- Calcular tiempo de ejecución y registrar migración
    -- =====================================================
    end_time := clock_timestamp();
    execution_time := EXTRACT(MILLISECONDS FROM (end_time - start_time))::INTEGER;

    INSERT INTO schema_migrations (version, name, execution_time_ms, success)
    VALUES ('001', 'create_base_tables', execution_time, TRUE);

    RAISE NOTICE 'Migración 001 ejecutada exitosamente en % ms', execution_time;

EXCEPTION
    WHEN OTHERS THEN
        -- Registrar error
        INSERT INTO schema_migrations (version, name, success, error_message)
        VALUES ('001', 'create_base_tables', FALSE, SQLERRM);
        
        RAISE EXCEPTION 'Error en migración 001: %', SQLERRM;
END $$;

-- =====================================================
-- FIN MIGRACIÓN 001
-- =====================================================