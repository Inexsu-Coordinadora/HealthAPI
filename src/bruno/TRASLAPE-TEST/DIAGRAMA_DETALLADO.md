# 📊 DIAGRAMA DE TRASLAPES

## Escenario Visual

### Timeline de Citas - LUNES 2025-11-17

```
HORA        PACIENTE 1    MÉDICO 1    CONSULTORIO 1
---------   -----------   --------    ---------------

09:00       [CITA 1]      [CITA 1]    [CITA 1]
09:30       OCUPADO       OCUPADO     OCUPADO
10:00       LIBRE         LIBRE       LIBRE

10:01       LIBRE         LIBRE       LIBRE
...
13:59       LIBRE         LIBRE       LIBRE

14:00       [CITA 2]      [CITA 2]    [CITA 2]
14:30       OCUPADO       OCUPADO     OCUPADO
15:00       LIBRE         LIBRE       LIBRE
```

---

## Pruebas Paso a Paso

### 1️⃣ CREAR DATOS (Pasos 1-5)
```
✓ Paciente ID=1 creado
✓ Médico ID=1 creado
✓ Consultorio ID=1 creado
✓ Disponibilidad ID=1 (09:00-10:00) creada
✓ Disponibilidad ID=2 (14:00-15:00) creada
```

### 2️⃣ CITA 1: 09:00-10:00 (Paso 6)
```
SOLICITUD:
  - Paciente: 1
  - Médico: 1
  - Consultorio: 1
  - Hora: 09:00
  - Disponibilidad: 1 (09:00-10:00)

VALIDACIÓN:
  ✓ Paciente existe
  ✓ Médico existe
  ✓ Consultorio existe
  ✓ Sin traslape en paciente
  ✓ Sin traslape en médico
  ✓ Sin traslape en consultorio

RESULTADO: ✅ CITA CREADA ID=1
```

### 3️⃣ INTENTO: 09:30 (Paso 7)
```
SOLICITUD:
  - Paciente: 1
  - Médico: 1
  - Consultorio: 1
  - Hora: 09:30
  - Disponibilidad: 1 (09:00-10:00)

VALIDACIÓN - TRASLAPE DETECTADO:
  Cita existente: 09:00-10:00
  Nueva solicitud: 09:30-10:00
  
  Comparación: (10:00 > 09:30) AND (09:00 < 10:00)
  = TRUE AND TRUE = TRASLAPE ❌

RESULTADO: ❌ RECHAZADO - "Solicitud de hora con traslape para el Médico"
```

### 4️⃣ CITA 2: 14:00-15:00 (Paso 8)
```
SOLICITUD:
  - Paciente: 1
  - Médico: 1
  - Consultorio: 1
  - Hora: 14:00
  - Disponibilidad: 2 (14:00-15:00)

VALIDACIÓN:
  ✓ Sin traslape (diferente horario: 14:00 ≠ 09:00)
  ✓ Paciente disponible en 14:00
  ✓ Médico disponible en 14:00
  ✓ Consultorio disponible en 14:00

RESULTADO: ✅ CITA CREADA ID=2
```

### 5️⃣ INTENTO: 09:15 (Paso 9)
```
SOLICITUD:
  - Paciente: 1 (YA TIENE CITA 09:00-10:00)
  - Médico: 1
  - Hora: 09:15
  - Disponibilidad: 1

VALIDACIÓN - TRASLAPE PACIENTE:
  Cita existente del paciente: 09:00-10:00
  Nueva solicitud: 09:15-10:00
  
  Comparación: (10:00 > 09:15) AND (09:00 < 10:00)
  = TRUE AND TRUE = TRASLAPE ❌

RESULTADO: ❌ RECHAZADO - "Solicitud de hora con traslape para el Paciente"
```

### 6️⃣ INTENTO: 09:45 (Paso 10)
```
SOLICITUD:
  - Consultorio: 1 (YA TIENE CITA 09:00-10:00)
  - Hora: 09:45
  - Disponibilidad: 1

VALIDACIÓN - TRASLAPE CONSULTORIO:
  Cita existente del consultorio: 09:00-10:00
  Nueva solicitud: 09:45-10:00
  
  Comparación: (10:00 > 09:45) AND (09:00 < 10:00)
  = TRUE AND TRUE = TRASLAPE ❌

RESULTADO: ❌ RECHAZADO - "Solicitud de hora con traslape para el Consultorio"
```

### 7️⃣ INTENTO: Paciente inexistente (Paso 11)
```
VALIDACIÓN:
  SELECT 1 FROM paciente WHERE id_paciente = 9999
  → NO ENCONTRADO

RESULTADO: ❌ RECHAZADO - "Paciente inexistente"
```

### 8️⃣ INTENTO: Médico inexistente (Paso 12)
```
VALIDACIÓN:
  SELECT 1 FROM medico WHERE id_medico = 9999
  → NO ENCONTRADO

RESULTADO: ❌ RECHAZADO - "Médico inexistente"
```

---

## 🔬 Validación SQL Detallada

### Consulta: verificarTraslapeMedico()
```sql
SELECT cm.* FROM cita_medica cm
INNER JOIN disponibilidad d ON cm.id_disponibilidad = d.id_disponibilidad
WHERE d.id_medico = $1                    -- ID del médico
AND cm.estado != 'cancelada'
AND DATE(cm.fecha) = CURRENT_DATE         -- Mismo día
AND (d.hora_fin > $2 AND d.hora_inicio < $3)  -- Traslape de horas
```

### Ejemplo de Overlap Check:
```
Cita 1 (Existente):     [09:00 -------- 10:00]
Cita 2 (Nueva):                    [09:30 -------- 10:30]

¿Hay traslape?
  hora_fin_1 > hora_inicio_2  →  10:00 > 09:30 = TRUE
  hora_inicio_1 < hora_fin_2  →  09:00 < 10:30 = TRUE
  
  RESULTADO: TRUE AND TRUE = ✓ TRASLAPE DETECTADO
```

---

## Matriz de Combinaciones

```
╔═══════╦═════════╦═══════════╦══════════════════╗
║ Paso  ║ Hora    ║ Estado    ║ Razón            ║
╠═══════╬═════════╬═══════════╬══════════════════╣
║ 6     ║ 09:00   ║ ✅ PASS   ║ Primera cita     ║
║ 7     ║ 09:30   ║ ❌ FAIL   ║ Traslape Médico  ║
║ 8     ║ 14:00   ║ ✅ PASS   ║ Horario diferente║
║ 9     ║ 09:15   ║ ❌ FAIL   ║ Traslape Paciente║
║ 10    ║ 09:45   ║ ❌ FAIL   ║ Traslape Consult ║
║ 11    ║ 16:00   ║ ❌ FAIL   ║ Paciente no existe
║ 12    ║ 16:00   ║ ❌ FAIL   ║ Médico no existe ║
╚═══════╩═════════╩═══════════╩══════════════════╝
```

---

## 🎯 Validaciones Implementadas

✅ **Traslape Paciente**
- No puede tener dos citas en el mismo horario del mismo día
- Consulta: `WHERE id_paciente = $1 AND (hora_fin > $2 AND hora_inicio < $3)`

✅ **Traslape Médico**
- No puede tener dos citas en el mismo horario del mismo día
- Consulta: `WHERE id_medico = $1 AND (hora_fin > $2 AND hora_inicio < $3)`

✅ **Traslape Consultorio**
- No puede tener dos citas simultáneas en el mismo horario
- Consulta: `WHERE id_consultorio = $1 AND (hora_fin > $2 AND hora_inicio < $3)`

✅ **Validación de Existencia**
- Paciente debe existir
- Médico debe existir
- Disponibilidad debe existir
- Consultorio debe existir (si se especifica)

✅ **Estados**
- Solo valida citas no canceladas
- Ignora citas canceladas en la búsqueda de traslapes

---

## 📝 Notas de Ejecución

1. **Ejecuta en orden**: Los pasos 1-5 deben ejecutarse primero para crear los datos
2. **IDs autoincrementales**: Los IDs se incrementan automáticamente
3. **Fecha fija**: Usa 2025-11-17 (lunes) en todos los pasos
4. **Horarios exactos**: Las disponibilidades determinan los horarios válidos
5. **Estado inicial**: Todas las citas se crean con estado "programada"

