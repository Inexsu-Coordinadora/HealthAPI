-- =====================================================
-- SCRIPT MAESTRO: Ejecutar Todas las Migraciones
-- =====================================================
-- Este script ejecuta todas las migraciones en orden
-- Es SEGURO ejecutarlo múltiples veces (idempotente)
-- =====================================================

\echo '============================================='
\echo 'INICIANDO PROCESO DE MIGRACIONES'
\echo '============================================='
\echo ''

-- =====================================================
-- PASO 0: Crear tabla de control de migraciones
-- =====================================================
\echo 'Paso 0: Creando tabla de control de migraciones...'
\i 000_create_migrations_table.sql
\echo ''

-- =====================================================
-- PASO 1: Crear tablas base
-- =====================================================
\echo 'Paso 1: Creando tablas base (paciente, medico, disponibilidad, cita_medica)...'
\i 001_create_base_tables.sql
\echo ''

-- =====================================================
-- PASO 2: Agregar consultorio
-- =====================================================
\echo 'Paso 2: Agregando tabla consultorio y relaciones...'
\i 002_add_consultorio.sql
\echo ''

-- =====================================================
-- PASO 3: Agregar índices y constraints
-- =====================================================
\echo 'Paso 3: Agregando índices y constraints...'
\i 003_add_indexes_and_constraints.sql
\echo ''

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
\echo '============================================='
\echo 'VERIFICANDO MIGRACIONES EJECUTADAS'
\echo '============================================='
\echo ''

SELECT 
    version,
    name,
    executed_at,
    execution_time_ms || ' ms' as tiempo,
    CASE 
        WHEN success THEN '✅ EXITOSA'
        ELSE '❌ ERROR: ' || error_message
    END as estado
FROM schema_migrations
ORDER BY version;

\echo ''
\echo '============================================='
\echo 'VERIFICANDO ESTRUCTURA DE TABLAS'
\echo '============================================='
\echo ''

SELECT 
    table_name as tabla,
    (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name) as columnas
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

\echo ''
\echo '============================================='
\echo 'PROCESO DE MIGRACIONES COMPLETADO'
\echo '============================================='