# 📋 PRUEBAS DE TRASLAPE - GUÍA DE USO

## 🎯 Objetivo
Validar que el sistema correctamente detecta y rechaza citas que se traslapan en:
- **Paciente**: El paciente no puede tener dos citas superpuestas
- **Médico**: El médico no puede tener otra cita que se traslape en el mismo horario
- **Consultorio**: El consultorio no puede tener dos citas simultáneas

---

## 📅 Escenarios de Prueba

### ✅ SETUP (Pasos 1-5): Crear datos de prueba
1. **1-SETUP-PACIENTE**: Crea un paciente de prueba
2. **2-SETUP-MEDICO**: Crea un médico de prueba
3. **3-SETUP-CONSULTORIO**: Crea un consultorio de prueba
4. **4-SETUP-DISPONIBILIDAD-MANANA**: Disponibilidad 09:00-10:00 (Lunes)
5. **5-SETUP-DISPONIBILIDAD-TARDE**: Disponibilidad 14:00-15:00 (Lunes)

### ✅ CITAS VÁLIDAS
6. **6-CITA-VALIDA-MANANA**: Crear cita a las 09:00 ✓ DEBE FUNCIONAR
8. **8-CITA-VALIDA-TARDE**: Crear cita a las 14:00 ✓ DEBE FUNCIONAR

### ❌ TRASLAPES (Deben ser rechazados)
7. **7-CITA-TRASLAPE-MEDICO**: Intenta crear cita 09:30 (médico ocupado 09:00-10:00) ✗ DEBE FALLAR
9. **9-CITA-TRASLAPE-PACIENTE**: Intenta crear cita 09:15 (paciente ocupado) ✗ DEBE FALLAR
10. **10-CITA-TRASLAPE-CONSULTORIO**: Intenta crear cita 09:45 (consultorio ocupado) ✗ DEBE FALLAR

### ❌ DATOS INEXISTENTES (Deben ser rechazados)
11. **11-PACIENTE-INEXISTENTE**: Intenta crear cita con paciente ID 9999 ✗ DEBE FALLAR
12. **12-MEDICO-INEXISTENTE**: Intenta crear cita con médico ID 9999 ✗ DEBE FALLAR

---

## 🚀 CÓMO EJECUTAR

### Opción 1: Ejecutar en orden (recomendado)
```bash
# En Bruno, ejecuta los tests en secuencia (1 → 12)
# Los IDs autoincrementales garantizan que:
# - Paciente creado en paso 1 = ID 1
# - Médico creado en paso 2 = ID 1
# - Consultorio creado en paso 3 = ID 1
# - Disponibilidad 1 en paso 4 = ID 1
# - Disponibilidad 2 en paso 5 = ID 2
```

### Opción 2: Ejecutar grupo por grupo
1. Ejecuta pasos 1-5 (SETUP)
2. Ejecuta paso 6 (debe pasar ✓)
3. Ejecuta paso 7 (debe fallar ✗)
4. Ejecuta paso 8 (debe pasar ✓)
5. Ejecuta pasos 9-12 (deben fallar ✗)

---

## 📊 RESULTADOS ESPERADOS

| Paso | Descripción | Status Esperado | Razón |
|------|-------------|-----------------|-------|
| 1-5 | Setup | 201/200 | Creación de datos |
| 6 | Cita válida 09:00 | 201/200 | ✓ Sin conflicto |
| 7 | Traslape médico | 400 | ✗ Médico ocupado |
| 8 | Cita válida 14:00 | 201/200 | ✓ Sin conflicto |
| 9 | Traslape paciente | 400 | ✗ Paciente ocupado |
| 10 | Traslape consultorio | 400 | ✗ Consultorio ocupado |
| 11 | Paciente no existe | 400/404 | ✗ Paciente no encontrado |
| 12 | Médico no existe | 400/404 | ✗ Médico no encontrado |

---

## 🔍 QUÉ SE VALIDA

### Validación de Traslapes
```sql
-- Las consultas SQL comparan intervalos de tiempo:
AND (d.hora_fin > $2 AND d.hora_inicio < $3)

-- Ejemplo:
- Cita existente: 09:00-10:00
- Nueva solicitud: 09:30-10:30
- 10:00 > 09:30 ✓ AND 09:00 < 10:30 ✓ = TRASLAPE DETECTADO
```

### Validación de Existencia
- ✓ Paciente debe existir
- ✓ Médico debe existir
- ✓ Consultorio debe existir (si se especifica)
- ✓ Disponibilidad debe existir

---

## 💡 NOTAS IMPORTANTES

1. **IDs de entidades**: Los IDs son autoincrementales. Ajusta según tu BD:
   - Si creaste datos previos, los IDs pueden ser diferentes
   - Actualiza los pasos 6-12 con los IDs correctos

2. **Fechas**: Todos usan `2025-11-17` (lunes). Cambia si es necesario.

3. **Horarios**: 
   - Disponibilidad 1: 09:00-10:00
   - Disponibilidad 2: 14:00-15:00
   - Las pruebas buscan traslapes dentro de estos rangos

4. **Consultorio opcional**: Si no quieres validar consultorio, pasa `null`

---

## ✅ FLUJO DE PRUEBA IDEAL

```
SETUP (1-5)
    ↓
Cita 09:00 (6) ✓ DEBE PASAR
    ↓
Cita 09:30 (7) ✗ DEBE FALLAR (traslape médico)
    ↓
Cita 14:00 (8) ✓ DEBE PASAR
    ↓
Cita 09:15 (9) ✗ DEBE FALLAR (traslape paciente)
    ↓
Cita 09:45 (10) ✗ DEBE FALLAR (traslape consultorio)
    ↓
Cita con Paciente 9999 (11) ✗ DEBE FALLAR
    ↓
Cita con Médico 9999 (12) ✗ DEBE FALLAR
```

Si los resultados coinciden, ¡el sistema de traslapes funciona correctamente! 🎉
