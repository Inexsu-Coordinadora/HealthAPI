-- =====================================================
-- MIGRACIÓN 003: Índices y Constraints para Performance
-- Fecha: 2025-11-11
-- Descripción: Agrega índices compuestos y constraints para
--              optimizar validaciones de traslapes y unicidad
-- =====================================================

DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time INTEGER;
BEGIN
    start_time := clock_timestamp();
    
    -- Verificar si ya se ejecutó
    IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = '003') THEN
        RAISE NOTICE 'Migración 003 ya fue ejecutada previamente';
        RETURN;
    END IF;

    -- =====================================================
    -- ÍNDICES COMPUESTOS PARA VALIDAR TRASLAPES
    -- =====================================================
    
    -- Índice para validar traslapes de médico (por disponibilidad)
    CREATE INDEX IF NOT EXISTS idx_cita_disponibilidad_fecha 
        ON cita_medica(id_disponibilidad, fecha);
    
    -- Índice para validar traslapes de consultorio
    CREATE INDEX IF NOT EXISTS idx_cita_consultorio_fecha 
        ON cita_medica(id_consultorio, fecha);
    
    -- Índice para validar traslapes de paciente
    CREATE INDEX IF NOT EXISTS idx_cita_paciente_fecha 
        ON cita_medica(id_paciente, fecha);
    
    -- Índice compuesto para búsquedas complejas
    CREATE INDEX IF NOT EXISTS idx_cita_completo 
        ON cita_medica(fecha, id_consultorio, id_disponibilidad)
        WHERE estado != 'cancelada';

    RAISE NOTICE 'Índices compuestos creados';

    -- =====================================================
    -- CONSTRAINT: Unicidad en disponibilidad
    -- =====================================================
    
    -- No permitir duplicados médico-consultorio-día-franja
    -- Permite NULL en id_consultorio
    CREATE UNIQUE INDEX IF NOT EXISTS uk_disponibilidad_unica_idx
        ON disponibilidad (id_medico, id_consultorio, dia_semana, hora_inicio, hora_fin)
        WHERE id_consultorio IS NOT NULL;

    COMMENT ON INDEX uk_disponibilidad_unica_idx IS 
        'Evita duplicar asignaciones médico-consultorio-horario';

    RAISE NOTICE 'Constraint de unicidad en disponibilidad creado';

    -- =====================================================
    -- AGREGAR COLUMNA: hora_fin en cita_medica
    -- =====================================================
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cita_medica' AND column_name = 'hora_fin'
    ) THEN
        ALTER TABLE cita_medica ADD COLUMN hora_fin TIME WITHOUT TIME ZONE;
        RAISE NOTICE 'Columna hora_fin agregada a cita_medica';
    END IF;

    COMMENT ON COLUMN cita_medica.hora_fin IS 
        'Hora de finalización de la cita (calculada automáticamente si no se provee)';

    -- =====================================================
    -- CHECK CONSTRAINTS
    -- =====================================================
    
    -- Validar que el estado sea válido
    ALTER TABLE cita_medica
        DROP CONSTRAINT IF EXISTS chk_estado_valido;
    
    ALTER TABLE cita_medica
        ADD CONSTRAINT chk_estado_valido 
        CHECK (estado IN ('programada', 'completada', 'cancelada', 'en_curso'));

    -- Validar que dia_semana sea válido
    ALTER TABLE disponibilidad
        DROP CONSTRAINT IF EXISTS chk_dia_semana_valido;
    
    ALTER TABLE disponibilidad
        ADD CONSTRAINT chk_dia_semana_valido 
        CHECK (LOWER(dia_semana) IN ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'));

    -- Validar que hora_fin > hora_inicio
    ALTER TABLE disponibilidad
        DROP CONSTRAINT IF EXISTS chk_horas_validas;
    
    ALTER TABLE disponibilidad
        ADD CONSTRAINT chk_horas_validas 
        CHECK (hora_fin > hora_inicio);

    RAISE NOTICE 'Check constraints creados';

    -- =====================================================
    -- ÍNDICES ADICIONALES PARA BÚSQUEDAS
    -- =====================================================
    
    -- Índice para búsquedas por rango de fechas
    CREATE INDEX IF NOT EXISTS idx_cita_fecha_rango 
        ON cita_medica(fecha)
        WHERE estado IN ('programada', 'en_curso');
    
    -- Índice para citas futuras
    CREATE INDEX IF NOT EXISTS idx_cita_futuras 
        ON cita_medica(fecha)
        WHERE fecha >= CURRENT_TIMESTAMP AND estado = 'programada';

    RAISE NOTICE 'Índices adicionales creados';

    -- =====================================================
    -- Registrar migración
    -- =====================================================
    end_time := clock_timestamp();
    execution_time := EXTRACT(MILLISECONDS FROM (end_time - start_time))::INTEGER;

    INSERT INTO schema_migrations (version, name, execution_time_ms, success)
    VALUES ('003', 'add_indexes_and_constraints', execution_time, TRUE);

    RAISE NOTICE 'Migración 003 ejecutada exitosamente en % ms', execution_time;

EXCEPTION
    WHEN OTHERS THEN
        INSERT INTO schema_migrations (version, name, success, error_message)
        VALUES ('003', 'add_indexes_and_constraints', FALSE, SQLERRM);
        
        RAISE EXCEPTION 'Error en migración 003: %', SQLERRM;
END $$;

-- =====================================================
-- FIN MIGRACIÓN 003
-- =====================================================