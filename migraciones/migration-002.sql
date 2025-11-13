-- =====================================================
-- MIGRACIÓN 002: Agregar Tabla Consultorio
-- Fecha: 2025-11-11
-- Descripción: Crea la tabla consultorio y agrega la relación
--              con disponibilidad y cita_medica
-- =====================================================

DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time INTEGER;
BEGIN
    start_time := clock_timestamp();
    
    -- Verificar si ya se ejecutó
    IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = '002') THEN
        RAISE NOTICE 'Migración 002 ya fue ejecutada previamente';
        RETURN;
    END IF;

    -- =====================================================
    -- TABLA: consultorio
    -- =====================================================
    CREATE TABLE IF NOT EXISTS consultorio (
        id_consultorio SERIAL PRIMARY KEY,
        nombre_consultorio VARCHAR(100) NOT NULL UNIQUE,
        ubicacion_consultorio VARCHAR(200),
        capacidad_consultorio INTEGER,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Índices
    CREATE INDEX IF NOT EXISTS idx_consultorio_nombre ON consultorio(nombre_consultorio);

    -- Comentarios
    COMMENT ON TABLE consultorio IS 'Consultorios disponibles en la clínica';
    COMMENT ON COLUMN consultorio.nombre_consultorio IS 'Nombre único del consultorio';
    COMMENT ON COLUMN consultorio.capacidad_consultorio IS 'Capacidad de personas simultáneas';

    -- =====================================================
    -- MODIFICAR: disponibilidad (agregar id_consultorio)
    -- =====================================================
    
    -- Agregar columna si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'disponibilidad' AND column_name = 'id_consultorio'
    ) THEN
        ALTER TABLE disponibilidad ADD COLUMN id_consultorio INTEGER;
        RAISE NOTICE 'Columna id_consultorio agregada a disponibilidad';
    END IF;

    -- Agregar foreign key
    ALTER TABLE disponibilidad
        DROP CONSTRAINT IF EXISTS fk_disponibilidad_consultorio;
    
    ALTER TABLE disponibilidad
        ADD CONSTRAINT fk_disponibilidad_consultorio 
        FOREIGN KEY (id_consultorio) 
        REFERENCES consultorio(id_consultorio) 
        ON DELETE SET NULL;

    -- Agregar índice
    CREATE INDEX IF NOT EXISTS idx_disponibilidad_consultorio 
        ON disponibilidad(id_consultorio);

    -- Comentario
    COMMENT ON COLUMN disponibilidad.id_consultorio IS 'Consultorio asignado al médico en esta franja horaria';

    -- =====================================================
    -- MODIFICAR: cita_medica (agregar id_consultorio)
    -- =====================================================
    
    -- Agregar columna si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cita_medica' AND column_name = 'id_consultorio'
    ) THEN
        ALTER TABLE cita_medica ADD COLUMN id_consultorio INTEGER;
        RAISE NOTICE 'Columna id_consultorio agregada a cita_medica';
    END IF;

    -- Agregar foreign key
    ALTER TABLE cita_medica
        DROP CONSTRAINT IF EXISTS fk_cita_consultorio;
    
    ALTER TABLE cita_medica
        ADD CONSTRAINT fk_cita_consultorio 
        FOREIGN KEY (id_consultorio) 
        REFERENCES consultorio(id_consultorio) 
        ON DELETE SET NULL;

    -- Agregar índice
    CREATE INDEX IF NOT EXISTS idx_cita_consultorio 
        ON cita_medica(id_consultorio);

    -- Comentario
    COMMENT ON COLUMN cita_medica.id_consultorio IS 'Consultorio donde se realiza la cita';

    -- =====================================================
    -- INSERTAR DATOS INICIALES: Consultorios
    -- =====================================================
    INSERT INTO consultorio (nombre_consultorio, ubicacion_consultorio, capacidad_consultorio)
    VALUES 
        ('Consultorio 101', 'Piso 1, Ala A', 1),
        ('Consultorio 102', 'Piso 1, Ala A', 1),
        ('Consultorio 201', 'Piso 2, Ala B', 2),
        ('Consultorio 202', 'Piso 2, Ala B', 2),
        ('Consultorio 301', 'Piso 3, Ala C', 1),
        ('Sala de Urgencias', 'Piso 1, Urgencias', 3),
        ('Consultorio Pediatría', 'Piso 2, Ala A', 1),
        ('Consultorio Cardiología', 'Piso 3, Ala B', 1)
    ON CONFLICT (nombre_consultorio) DO NOTHING;

    RAISE NOTICE 'Consultorios iniciales insertados';

    -- =====================================================
    -- Registrar migración
    -- =====================================================
    end_time := clock_timestamp();
    execution_time := EXTRACT(MILLISECONDS FROM (end_time - start_time))::INTEGER;

    INSERT INTO schema_migrations (version, name, execution_time_ms, success)
    VALUES ('002', 'add_consultorio', execution_time, TRUE);

    RAISE NOTICE 'Migración 002 ejecutada exitosamente en % ms', execution_time;

EXCEPTION
    WHEN OTHERS THEN
        INSERT INTO schema_migrations (version, name, success, error_message)
        VALUES ('002', 'add_consultorio', FALSE, SQLERRM);
        
        RAISE EXCEPTION 'Error en migración 002: %', SQLERRM;
END $$;

-- =====================================================
-- FIN MIGRACIÓN 002
-- =====================================================