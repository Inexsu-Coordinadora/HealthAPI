-- =====================================================
-- SCRIPT DE VERIFICACIÓN DE BASE DE DATOS
-- =====================================================
-- Ejecuta este script para verificar que todo esté correcto
-- =====================================================

\echo '============================================='
\echo 'REPORTE DE ESTADO DE BASE DE DATOS'
\echo '============================================='
\echo ''

-- =====================================================
-- 1. MIGRACIONES EJECUTADAS
-- =====================================================
\echo '1. MIGRACIONES EJECUTADAS:'
\echo '-------------------------------------------'

SELECT 
    version,
    name,
    TO_CHAR(executed_at, 'YYYY-MM-DD HH24:MI:SS') as ejecutada_en,
    execution_time_ms || ' ms' as tiempo,
    CASE 
        WHEN success THEN '✅ EXITOSA'
        ELSE '❌ ERROR: ' || COALESCE(error_message, 'Sin detalles')
    END as estado
FROM schema_migrations
ORDER BY version;

\echo ''

-- =====================================================
-- 2. TABLAS CREADAS
-- =====================================================
\echo '2. TABLAS EN LA BASE DE DATOS:'
\echo '-------------------------------------------'

SELECT 
    t.table_name as tabla,
    COUNT(c.column_name) as columnas,
    pg_size_pretty(pg_total_relation_size(t.table_name::regclass)) as tamaño,
    obj_description((t.table_schema||'.'||t.table_name)::regclass) as descripcion
FROM information_schema.tables t
LEFT JOIN information_schema.columns c 
    ON t.table_name = c.table_name AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name, t.table_schema
ORDER BY t.table_name;

\echo ''

-- =====================================================
-- 3. FOREIGN KEYS (RELACIONES)
-- =====================================================
\echo '3. FOREIGN KEYS (RELACIONES ENTRE TABLAS):'
\echo '-------------------------------------------'

SELECT
    tc.table_name as tabla_origen, 
    kcu.column_name as columna, 
    ccu.table_name AS tabla_destino,
    ccu.column_name AS columna_destino,
    tc.constraint_name as constraint
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

\echo ''

-- =====================================================
-- 4. ÍNDICES CREADOS
-- =====================================================
\echo '4. ÍNDICES CREADOS:'
\echo '-------------------------------------------'

SELECT
    tablename as tabla,
    indexname as indice,
    CASE 
        WHEN indexdef LIKE '%UNIQUE%' THEN '🔒 UNIQUE'
        ELSE '📊 NORMAL'
    END as tipo
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY tablename, indexname;

\echo ''

-- =====================================================
-- 5. CONSTRAINTS (CHECK, UNIQUE)
-- =====================================================
\echo '5. CONSTRAINTS CREADOS:'
\echo '-------------------------------------------'

SELECT
    tc.table_name as tabla,
    tc.constraint_name as constraint,
    tc.constraint_type as tipo,
    CASE 
        WHEN cc.check_clause IS NOT NULL THEN cc.check_clause
        ELSE kcu.column_name
    END as definicion
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_type IN ('CHECK', 'UNIQUE')
ORDER BY tc.table_name, tc.constraint_type;

\echo ''

-- =====================================================
-- 6. DATOS ACTUALES
-- =====================================================
\echo '6. CANTIDAD DE REGISTROS POR TABLA:'
\echo '-------------------------------------------'

SELECT 
    'paciente' as tabla,
    COUNT(*) as registros
FROM paciente
UNION ALL
SELECT 'medico', COUNT(*) FROM medico
UNION ALL
SELECT 'consultorio', COUNT(*) FROM consultorio
UNION ALL
SELECT 'disponibilidad', COUNT(*) FROM disponibilidad
UNION ALL
SELECT 'cita_medica', COUNT(*) FROM cita_medica
ORDER BY tabla;

\echo ''

-- =====================================================
-- 7. VERIFICAR INTEGRIDAD
-- =====================================================
\echo '7. VERIFICACIÓN DE INTEGRIDAD:'
\echo '-------------------------------------------'

-- Verificar citas huérfanas (sin paciente)
SELECT 
    'Citas sin paciente válido' as problema,
    COUNT(*) as cantidad
FROM cita_medica c
LEFT JOIN paciente p ON c.id_paciente = p.id_paciente
WHERE p.id_paciente IS NULL

UNION ALL

-- Verificar citas sin disponibilidad válida
SELECT 
    'Citas sin disponibilidad válida',
    COUNT(*)
FROM cita_medica c
LEFT JOIN disponibilidad d ON c.id_disponibilidad = d.id_disponibilidad
WHERE d.id_disponibilidad IS NULL

UNION ALL

-- Verificar disponibilidades sin médico válido
SELECT 
    'Disponibilidades sin médico válido',
    COUNT(*)
FROM disponibilidad d
LEFT JOIN medico m ON d.id_medico = m.id_medico
WHERE m.id_medico IS NULL;

\echo ''

-- =====================================================
-- 8. VERIFICAR COLUMNAS CRÍTICAS
-- =====================================================
\echo '8. VERIFICACIÓN DE COLUMNAS CRÍTICAS:'
\echo '-------------------------------------------'

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'disponibilidad' AND column_name = 'id_consultorio'
        ) THEN '✅ disponibilidad.id_consultorio existe'
        ELSE '❌ disponibilidad.id_consultorio NO existe'
    END as verificacion

UNION ALL

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'cita_medica' AND column_name = 'id_consultorio'
        ) THEN '✅ cita_medica.id_consultorio existe'
        ELSE '❌ cita_medica.id_consultorio NO existe'
    END

UNION ALL

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'cita_medica' AND column_name = 'hora_fin'
        ) THEN '✅ cita_medica.hora_fin existe'
        ELSE '❌ cita_medica.hora_fin NO existe'
    END;

\echo ''
\echo '============================================='
\echo 'FIN DEL REPORTE'
\echo '============================================='
\echo ''
\echo 'Si todos los checks están en ✅, tu BD está correcta'
\echo 'Si hay ❌, revisa las migraciones faltantes'