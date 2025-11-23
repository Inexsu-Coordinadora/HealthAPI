# Base de Datos - HealthAPI

## 📋 Descripción

Este directorio contiene el esquema de base de datos para el sistema de gestión de citas médicas HealthAPI.

## 🗄️ Estructura de Tablas

### Entidades Principales

1. **paciente** - Información de pacientes
2. **medico** - Información de médicos
3. **consultorio** - Espacios físicos para consultas
4. **disponibilidad** - Horarios disponibles de cada médico
5. **cita_medica** - Citas agendadas

## 🔗 Relaciones

```
┌─────────┐
│ Paciente│
└────┬────┘
     │
     │ id_paciente
     │
     ▼
┌──────────────┐      ┌──────────────┐
│  Cita Médica │─────▶│Disponibilidad│
└──────────────┘      └──────┬───────┘
   id_disponibilidad         │
                             │ id_medico, id_consultorio
                             │
                    ┌────────┴─────────┐
                    ▼                  ▼
              ┌─────────┐        ┌────────────┐
              │  Médico │        │Consultorio │
              └─────────┘        └────────────┘
```

## 🎯 Diseño Clave

### ¿Por qué Cita NO tiene id_medico ni id_consultorio directamente?

**Ventajas de usar `id_disponibilidad` como único vínculo:**

1. **Sin duplicación de datos** - Médico y consultorio solo están en `disponibilidad`
2. **Validación simple** - Una disponibilidad = un slot único de tiempo
3. **Traslapes fáciles de detectar** - Solo verificar si la disponibilidad está ocupada
4. **Flexibilidad** - Un médico puede trabajar en múltiples consultorios sin duplicar lógica

### Flujo de Creación de Cita

```typescript
// El usuario selecciona:
idPaciente: 1
idDisponibilidad: 5  // Esta disponibilidad YA tiene médico + consultorio + horario
fecha: "2025-11-25T10:00:00"

// La cita obtiene automáticamente:
// - Médico (desde disponibilidad.id_medico)
// - Consultorio (desde disponibilidad.id_consultorio)
// - Horario válido (desde disponibilidad.hora_inicio/hora_fin)
```

## 📊 Instalación

### 1. Crear la base de datos

```bash
psql -U postgres
CREATE DATABASE healthapi;
\c healthapi
```

### 2. Ejecutar el esquema

```bash
psql -U postgres -d healthapi -f database/schema.sql
```

### 3. Verificar las tablas

```sql
\dt  -- Listar todas las tablas
```

## 🔍 Queries Útiles

### Ver citas con toda la información

```sql
SELECT 
    c.id_cita,
    p.nombre AS paciente,
    m.nombre AS medico,
    m.especialidad,
    co.nombre AS consultorio,
    c.fecha,
    c.estado,
    c.motivo
FROM cita_medica c
INNER JOIN paciente p ON c.id_paciente = p.id_paciente
INNER JOIN disponibilidad d ON c.id_disponibilidad = d.id_disponibilidad
INNER JOIN medico m ON d.id_medico = m.id_medico
LEFT JOIN consultorio co ON d.id_consultorio = co.id_consultorio
ORDER BY c.fecha DESC;
```

### Ver disponibilidades con médico y consultorio

```sql
SELECT 
    d.id_disponibilidad,
    m.nombre AS medico,
    m.especialidad,
    co.nombre AS consultorio,
    d.dia_semana,
    d.hora_inicio,
    d.hora_fin
FROM disponibilidad d
INNER JOIN medico m ON d.id_medico = m.id_medico
LEFT JOIN consultorio co ON d.id_consultorio = co.id_consultorio
ORDER BY d.dia_semana, d.hora_inicio;
```

### Verificar traslapes de disponibilidad

```sql
SELECT 
    d.id_disponibilidad,
    COUNT(c.id_cita) as total_citas,
    STRING_AGG(c.fecha::text, ', ') as fechas
FROM disponibilidad d
LEFT JOIN cita_medica c ON d.id_disponibilidad = c.id_disponibilidad
WHERE c.estado != 'cancelada'
GROUP BY d.id_disponibilidad
HAVING COUNT(c.id_cita) > 1;
```

## 🛡️ Validaciones Implementadas

### A Nivel de Base de Datos

1. ✅ `estado` solo puede ser: 'programada', 'cancelada', 'realizada'
2. ✅ `dia_semana` solo puede ser días válidos
3. ✅ `hora_fin` > `hora_inicio` (CHECK constraint)
4. ✅ Claves foráneas con `ON DELETE CASCADE` para integridad referencial

### A Nivel de Aplicación (en CitaMedicaServicio)

1. ✅ Paciente debe existir
2. ✅ Disponibilidad debe existir
3. ✅ Disponibilidad no debe estar ocupada en esa fecha
4. ✅ Paciente no debe tener citas superpuestas
5. ✅ Fecha de cita debe coincidir con día de semana de disponibilidad
6. ✅ Hora de cita debe estar dentro del rango de disponibilidad

## 📦 Mapeo con Código TypeScript

| Tabla SQL          | Interface TypeScript      | Repositorio                        |
|--------------------|---------------------------|------------------------------------|
| `paciente`         | `IPaciente`               | `PacienteRepositorioPostgres`      |
| `medico`           | `IMedico`                 | `MedicoRepositorioPostgres`        |
| `consultorio`      | `IConsultorio`            | `ConsultorioRepositorioPostgres`   |
| `disponibilidad`   | `IDisponibilidad`         | `DisponibilidadRepositorioPostgres`|
| `cita_medica`      | `ICitaMedica`             | `CitaMedicaRepositorioPostgres`    |

## 🔧 Mantenimiento

### Backup de la base de datos

```bash
pg_dump -U postgres healthapi > backup_$(date +%Y%m%d).sql
```

### Restaurar desde backup

```bash
psql -U postgres -d healthapi < backup_20251123.sql
```

### Limpiar datos de prueba

```sql
TRUNCATE TABLE cita_medica, disponibilidad, consultorio, medico, paciente RESTART IDENTITY CASCADE;
```

## 📝 Notas

- Las columnas `created_at` y `updated_at` se actualizan automáticamente
- Los índices están optimizados para las consultas más frecuentes
- El diseño normalizado evita redundancia y facilita el mantenimiento
- La relación mediante `disponibilidad` simplifica la lógica de traslapes
