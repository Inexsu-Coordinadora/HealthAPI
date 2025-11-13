# 🔧 SOLUCIÓN DE PROBLEMAS

## Problema 1: Todos los tests fallan con error de conexión

**Síntoma**: `Error: connect ECONNREFUSED 127.0.0.1:3000`

**Solución**:
```bash
# Asegúrate que el servidor esté corriendo
cd /path/to/HealthAPI
pnpm run dev

# Verifica que escuche en puerto 3000
# Deberías ver: "Server running at http://localhost:3000"
```

---

## Problema 2: Los pasos 1-5 devuelven 404 Not Found

**Síntoma**: `404 - Resource not found`

**Solución**:
```bash
# Verifica que las rutas estén registradas en app.ts
# Debe tener:
# await app.register(pacienteRutas, { prefix: "/api" });
# await app.register(medicoRutas, { prefix: "/api" });
# await app.register(consultorioRutas, { prefix: "/api" });
# await app.register(disponibilidadRutas, { prefix: "/api" });

# Si no están, agrega estas líneas en app.ts
```

---

## Problema 3: Los pasos 6 y 8 (citas válidas) están siendo rechazados

**Síntoma**: Status 400 "Traslape detectado" cuando no debería serlo

**Causa posible**: 
- Los IDs de disponibilidad están incorrectos
- Las horas de disponibilidad son las mismas

**Solución**:
```
1. Verifica que existan 2 disponibilidades distintas:
   - Disponibilidad 1: 09:00-10:00
   - Disponibilidad 2: 14:00-15:00

2. En paso 6, usa idDisponibilidad: 1
   En paso 8, usa idDisponibilidad: 2

3. Si los IDs no coinciden, ajusta los números
   en todos los pasos 6-14
```

---

## Problema 4: El paso 7 (traslape médico) no está fallando

**Síntoma**: Status 201 cuando debería ser 400

**Causa posible**:
- El código aún no tiene la validación correcta
- La consulta SQL no está comparando horas

**Solución**:
```
Verifica que CitaMedicaRepository.ts tenga:

async verificarTraslapeMedico(
    idMedico: number,           // NO idDisponibilidad
    horaInicio: string,         // STRING, no Date
    horaFin: string,            // STRING, no Date
    excluirCitaId?: number
): Promise<ICitaMedica | null> {
    let query = `
        SELECT cm.* FROM cita_medica cm
        INNER JOIN disponibilidad d 
            ON cm.id_disponibilidad = d.id_disponibilidad
        WHERE d.id_medico = $1
        AND cm.estado != 'cancelada'
        AND DATE(cm.fecha) = CURRENT_DATE
        AND (d.hora_fin > $2 AND d.hora_inicio < $3)
    `;
```

---

## Problema 5: Los pasos 9 y 10 (traslapes) no están fallando

**Síntoma**: Se crean citas cuando debería haber traslape

**Causa posible**:
- Las consultas no están haciendo INNER JOIN
- No están comparando intervalos de tiempo

**Solución**:
```
Verifica que TODAS las validaciones usen:

1. INNER JOIN disponibilidad:
   INNER JOIN disponibilidad d 
   ON cm.id_disponibilidad = d.id_disponibilidad

2. Comparación de intervalos:
   (d.hora_fin > $2 AND d.hora_inicio < $3)

3. Parámetros como STRINGS:
   const params: any[] = [idMedico, horaInicio, horaFin];
```

---

## Problema 6: Los pasos 11 y 12 no están fallando (ID inexistentes)

**Síntoma**: Citas creadas con paciente/médico que no existen

**Causa posible**:
- Falta validación de existencia
- Las consultas SELECT no se ejecutan

**Solución**:
```
Verifica verificarPacienteExiste() y verificarMedicoExiste():

async verificarPacienteExiste(idPaciente: number): Promise<boolean> {
    const query = "SELECT 1 FROM paciente WHERE id_paciente = $1";
    const result = await ejecutarConsulta(query, [idPaciente]);
    return result.rows.length > 0;
}
```

---

## Problema 7: Errores de compilación TypeScript

**Síntoma**: Errores al ejecutar `pnpm run dev`

**Causa posible**:
- Tipos incorrectos en los parámetros
- Métodos no implementados

**Solución**:
```bash
# Verifica los tipos:
pnpm run build

# Debería completarse sin errores
# Si hay errores, revisa:
# - CitaMedicaRepository.ts (firmas de métodos)
# - ICitaMedicaRepositorio.ts (interface)
# - CitaMedicaServicio.ts (parámetros de llamada)
```

---

## Problema 8: Base de datos vacía o sin datos de prueba

**Síntoma**: Los pasos 6-14 fallan porque no hay datos

**Solución**:
```bash
# Asegúrate de ejecutar los pasos 1-5 PRIMERO
# Esto crea:
# - Paciente (ID = 1)
# - Médico (ID = 1)  
# - Consultorio (ID = 1)
# - Disponibilidad 1 (ID = 1)
# - Disponibilidad 2 (ID = 2)

# Si los IDs son diferentes, ajusta los valores en los pasos 6-14
```

---

## Problema 9: Errores de validación en CREATE

**Síntoma**: `400 - Datos inválidos` en pasos 1-5

**Solución**:
```
Verifica que los campos requeridos existan:

PACIENTE:
- nombre: string
- apellido: string
- cédula: string
- email: string
- teléfono: string

MÉDICO:
- nombre: string
- apellido: string
- cédula: string
- especialidad: string
- email: string
- teléfono: string

CONSULTORIO:
- nombre: string
- ubicación: string
- capacidad: number
- teléfono: string

DISPONIBILIDAD:
- idMedico: number
- idConsultorio: number (o null)
- diaSemana: string ("lunes", "martes", etc.)
- horaInicio: string ("HH:MM")
- horaFin: string ("HH:MM")
```

---

## Problema 10: Las citas se crean pero sin validación de traslape

**Síntoma**: Todos los tests pasan pero se crean citas duplicadas

**Causa posible**:
- El servicio no está llamando a las validaciones
- Las validaciones no lanzan excepciones

**Solución**:
```
Verifica que agendarCitaConValidacion() en CitaMedicaServicio.ts:

1. Llame a verificarTraslapePaciente()
2. Llame a verificarTraslapeMedico()
3. Llame a verificarTraslapeConsultorio()
4. Lance excepciones si hay traslape:

if (traslapeMedico) {
    throw new Error(`Solicitud de hora con traslape...`);
}
```

---

## Checklist de Debugging

```
[ ] Servidor corriendo en puerto 3000
[ ] Base de datos conectada
[ ] Rutas registradas en app.ts
[ ] Pasos 1-5 crean datos (status 201)
[ ] IDs son secuenciales (1, 2, 3...)
[ ] CitaMedicaRepository tiene las 3 validaciones
[ ] Validaciones usan INNER JOIN
[ ] Validaciones comparan horas
[ ] Validaciones lanzan excepciones
[ ] Pasos 6 y 8 pasan (201)
[ ] Pasos 7, 9, 10 fallan (400)
[ ] Pasos 11 y 12 fallan (400)
```

---

## Logs Útiles

### Ver logs del servidor
```bash
# El servidor muestra logs en consola:
pnpm run dev

# Busca mensajes como:
# "[1] Verificando existencia del Paciente ID: 1"
# "[5] Validando traslape para Paciente ID: 1"
# "[6] Validando traslape para Médico ID: 1"
```

### Ver respuesta en Bruno
```
En Bruno, abre la pestaña "Response":
- Headers: Status y código HTTP
- Body: Mensaje de error o datos creados
- Tests: Resultados de las validaciones
```

---

## Contacto de Soporte

Si ninguna solución funciona:
1. Verifica los logs completos en consola del servidor
2. Revisa que todos los archivos fueron modificados correctamente
3. Reinicia: `pnpm run dev` (Ctrl+C primero)
4. Limpia cache: `rm -rf node_modules/.vite`
5. Reinstala: `pnpm install`

