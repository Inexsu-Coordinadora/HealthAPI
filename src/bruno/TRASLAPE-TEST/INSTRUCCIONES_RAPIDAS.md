# 🚀 INSTRUCCIONES RÁPIDAS

## Ejecutar pruebas de traslape

### Paso 1: Abre Bruno
```
Carpeta: /src/bruno/TRASLAPE-TEST
```

### Paso 2: Ejecuta en este orden
```
1. 1-SETUP-PACIENTE
2. 2-SETUP-MEDICO
3. 3-SETUP-CONSULTORIO
4. 4-SETUP-DISPONIBILIDAD-MANANA
5. 5-SETUP-DISPONIBILIDAD-TARDE
6. 6-CITA-VALIDA-MANANA ✅
7. 7-CITA-TRASLAPE-MEDICO ❌
8. 8-CITA-VALIDA-TARDE ✅
9. 9-CITA-TRASLAPE-PACIENTE ❌
10. 10-CITA-TRASLAPE-CONSULTORIO ❌
11. 11-PACIENTE-INEXISTENTE ❌
12. 12-MEDICO-INEXISTENTE ❌
```

### Paso 3: Verifica resultados
- ✅ Pasos 6, 8 deben retornar **201/200** (citas creadas)
- ❌ Pasos 7, 9, 10, 11, 12 deben retornar **400** (error)

## Resultados esperados

| Paso | Esperado | Resultado |
|------|----------|-----------|
| 6 | 201 ✅ | |
| 7 | 400 ❌ | |
| 8 | 201 ✅ | |
| 9 | 400 ❌ | |
| 10 | 400 ❌ | |
| 11 | 400 ❌ | |
| 12 | 400 ❌ | |

## Si algo falla

1. Verifica que el servidor esté corriendo: `pnpm run dev`
2. Verifica los IDs en la base de datos
3. Lee DIAGRAMA_DETALLADO.md para entender qué valida cada paso
4. Revisa los logs de consola del servidor
