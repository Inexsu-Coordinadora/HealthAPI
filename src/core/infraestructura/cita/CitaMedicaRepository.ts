import type { ICitaMedicaRepositorio } from "../../dominio/citaMedica/repositorio/ICitaMedicaRepositorio.js";
import type { ICitaMedica } from "../../dominio/citaMedica/ICitaMedica.js";
import { ejecutarConsulta } from "../DBpostgres.js";
import type { ICitaMedicaConDetalles } from "../../dominio/citaMedica/ICitaMedicaConDetalles.js";

interface CitaMedicaRow {
    id_cita: number;
    id_paciente: number;
    id_disponibilidad: number;
    fecha: Date | string;
    estado: string;
    motivo: string | null;
    observaciones: string;
}

interface CitaMedicaRow {
    id_cita: number;
    id_paciente: number;
    id_disponibilidad: number;
    fecha: Date | string;
    estado: string;
    motivo: string | null;
    observaciones: string;
}

export class CitaMedicaRepositorioPostgres implements ICitaMedicaRepositorio {
    // 1. Crear una nueva cita médica
    async crear(datosCita: Omit<ICitaMedica, "idCita">): Promise<ICitaMedica> {
        // Asegurar que idCita no se incluya aunque venga en el objeto
        const { idCita: _idCita, ...datosParaInsertar } =
            datosCita as ICitaMedica;

        const columnas = Object.keys(datosParaInsertar).map((key) =>
            this.mapearCampoAColumna(key)
        );
        const parametros: Array<string | number | Date | null> =
            Object.values(datosParaInsertar);
        const placeholders = columnas.map((_, i) => `$${i + 1}`).join(", ");

        const query = `
      INSERT INTO cita_medica (${columnas.join(", ")})
      VALUES (${placeholders})
      RETURNING id_cita, id_paciente, id_disponibilidad, fecha, estado, motivo, observaciones
    `;

        const respuesta = await ejecutarConsulta(query, parametros);
        return this.mapearFilaACitaMedica(respuesta.rows[0]);
    }

    // 2. Obtener una cita médica por ID
    async obtenerCitaPorId(idCita: number): Promise<ICitaMedica | null> {
        const query =
            "SELECT id_cita, id_paciente, id_disponibilidad, fecha, estado, motivo, observaciones FROM cita_medica WHERE id_cita = $1";
        const result = await ejecutarConsulta(query, [idCita]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapearFilaACitaMedica(result.rows[0]);
    }

    // 3. Listar todas las citas médicas
    async listarCitas(): Promise<ICitaMedica[]> {
        const query =
            "SELECT id_cita, id_paciente, id_disponibilidad, fecha, estado, motivo, observaciones FROM cita_medica ORDER BY fecha DESC";
        const result = await ejecutarConsulta(query, []);
        return result.rows.map((row) => this.mapearFilaACitaMedica(row));
    }

    // 4. Actualizar una cita médica
    async actualizarCita(
        idCita: number,
        datosCita: Partial<Omit<ICitaMedica, "idCita">>
    ): Promise<ICitaMedica | null> {
        if (Object.keys(datosCita).length === 0) {
            throw new Error("No hay campos para actualizar");
        }

        const columnas = Object.keys(datosCita).map((key) =>
            this.mapearCampoAColumna(key)
        );
        const parametros: Array<string | number | Date | null> =
            Object.values(datosCita);
        const setClause = columnas
            .map((col, i) => `${col} = $${i + 1}`)
            .join(", ");
        parametros.push(idCita);

        const query = `
      UPDATE cita_medica
      SET ${setClause}
      WHERE id_cita = $${parametros.length}
      RETURNING id_cita, id_paciente, id_disponibilidad, fecha, estado, motivo, observaciones
    `;

        const result = await ejecutarConsulta(query, parametros);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapearFilaACitaMedica(result.rows[0]);
    }

    // 5. Eliminar una cita médica
    async eliminarCita(idCita: number): Promise<boolean> {
        const query =
            "DELETE FROM cita_medica WHERE id_cita = $1 RETURNING id_cita";
        const result = await ejecutarConsulta(query, [idCita]);
        return result.rows.length > 0;
    }

    // 6. Obtener citas por paciente
    async obtenerPorPaciente(idPaciente: number): Promise<ICitaMedica[]> {
        const query =
            "SELECT id_cita, id_paciente, id_disponibilidad, fecha, estado, motivo, observaciones FROM cita_medica WHERE id_paciente = $1 ORDER BY fecha DESC";
        const result = await ejecutarConsulta(query, [idPaciente]);
        return result.rows.map((row) => this.mapearFilaACitaMedica(row));
    }

    // 7. Obtener citas por médico
    async obtenerPorMedico(idMedico: number): Promise<ICitaMedica[]> {
        const query = `
      SELECT cm.id_cita, cm.id_paciente, cm.id_disponibilidad, cm.fecha, cm.estado, cm.motivo, cm.observaciones
      FROM cita_medica cm
      INNER JOIN disponibilidad d ON cm.id_disponibilidad = d.id_disponibilidad
      WHERE d.id_medico = $1
      ORDER BY cm.fecha DESC
    `;
        const result = await ejecutarConsulta(query, [idMedico]);
        return result.rows.map((row) => this.mapearFilaACitaMedica(row));
    }

    // 8. Obtener citas por estado
    async obtenerPorEstado(estado: string): Promise<ICitaMedica[]> {
        const query =
            "SELECT id_cita, id_paciente, id_disponibilidad, fecha, estado, motivo, observaciones FROM cita_medica WHERE estado = $1 ORDER BY fecha DESC";
        const result = await ejecutarConsulta(query, [estado]);
        return result.rows.map((row) => this.mapearFilaACitaMedica(row));
    }

    // 9. Verificar si un paciente existe
    async verificarPacienteExiste(idPaciente: number): Promise<boolean> {
        const query = "SELECT 1 FROM paciente WHERE id_paciente = $1";
        const result = await ejecutarConsulta(query, [idPaciente]);
        return result.rows.length > 0;
    }

    // 10. Verificar si un médico existe
    async verificarMedicoExiste(idMedico: number): Promise<boolean> {
        const query = "SELECT 1 FROM medico WHERE id_medico = $1";
        const result = await ejecutarConsulta(query, [idMedico]);
        return result.rows.length > 0;
    }

    // 11. Verificar si un consultorio existe
    async verificarConsultorioExiste(idConsultorio: number): Promise<boolean> {
        const query = "SELECT 1 FROM consultorio WHERE id_consultorio = $1";
        const result = await ejecutarConsulta(query, [idConsultorio]);
        return result.rows.length > 0;
    }

    // 12. Verificar si una disponibilidad existe
    async verificarDisponibilidadExiste(idDisponibilidad: number): Promise<boolean> {
        const query = "SELECT 1 FROM disponibilidad WHERE id_disponibilidad = $1";
        const result = await ejecutarConsulta(query, [idDisponibilidad]);
        return result.rows.length > 0;
    }

    // 13. Verificar traslape de citas para un paciente
    async verificarTraslapePaciente(
        idPaciente: number,
        horaInicio: string,
        horaFin: string,
        fecha?: Date,
        excluirCitaId?: number
    ): Promise<ICitaMedica | null> {
        let query = `
            SELECT cm.id_cita, cm.id_paciente, cm.id_disponibilidad, cm.fecha, cm.estado, cm.motivo, cm.observaciones FROM cita_medica cm
            INNER JOIN disponibilidad d ON cm.id_disponibilidad = d.id_disponibilidad
            WHERE cm.id_paciente = $1
            AND cm.estado != 'cancelada'
            AND (d.hora_fin > $2 AND d.hora_inicio < $3)
        `;
       const params: (number | string | Date)[] = [idPaciente, horaInicio, horaFin];

        if (fecha) {
            query += ` AND DATE(cm.fecha) = DATE($${params.length + 1})`;
            params.push(fecha);
        }

        if (excluirCitaId) {
            query += ` AND cm.id_cita != $${params.length + 1}`;
            params.push(excluirCitaId);
        }

        const result = await ejecutarConsulta(query, params);
        return result.rows.length > 0 ? this.mapearFilaACitaMedica(result.rows[0]) : null;
    }

    // 14. Verificar traslape de citas para un médico
    async verificarTraslapeMedico(
        idMedico: number,
        horaInicio: string,
        horaFin: string,
        fecha?: Date,
        excluirCitaId?: number
    ): Promise<ICitaMedica | null> {
        let query = `
            SELECT cm.id_cita, cm.id_paciente, cm.id_disponibilidad, cm.fecha, cm.estado, cm.motivo, cm.observaciones FROM cita_medica cm
            INNER JOIN disponibilidad d ON cm.id_disponibilidad = d.id_disponibilidad
            WHERE d.id_medico = $1
            AND cm.estado != 'cancelada'
            AND (d.hora_fin > $2 AND d.hora_inicio < $3)
        `;
      const params: (number | string | Date)[] = [idMedico, horaInicio, horaFin];
        if (fecha) {
            query += ` AND DATE(cm.fecha) = DATE($${params.length + 1})`;
            params.push(fecha);
        }

        if (excluirCitaId) {
            query += ` AND cm.id_cita != $${params.length + 1}`;
            params.push(excluirCitaId);
        }

        const result = await ejecutarConsulta(query, params);
        return result.rows.length > 0 ? this.mapearFilaACitaMedica(result.rows[0]) : null;
    }

    // 15. Verificar traslape de citas para un consultorio
    async verificarTraslapeConsultorio(
        idConsultorio: number,
        horaInicio: string,
        horaFin: string,
        fecha?: Date,
        excluirCitaId?: number
    ): Promise<ICitaMedica | null> {
        let query = `
            SELECT cm.id_cita, cm.id_paciente, cm.id_disponibilidad, cm.fecha, cm.estado, cm.motivo, cm.observaciones FROM cita_medica cm
            INNER JOIN disponibilidad d ON cm.id_disponibilidad = d.id_disponibilidad
            WHERE cm.id_consultorio = $1
            AND cm.estado != 'cancelada'
            AND (d.hora_fin > $2 AND d.hora_inicio < $3)
        `;
        const params: (number | string | Date)[] = [idConsultorio, horaInicio, horaFin];

        if (fecha) {
            query += ` AND DATE(cm.fecha) = DATE($${params.length + 1})`;
            params.push(fecha);
        }

        if (excluirCitaId) {
            query += ` AND cm.id_cita != $${params.length + 1}`;
            params.push(excluirCitaId);
        }

        const result = await ejecutarConsulta(query, params);
        return result.rows.length > 0 ? this.mapearFilaACitaMedica(result.rows[0]) : null;
    }
    async verificarCitasSuperpuestasMedico(idDisponibilidad: number, fecha: Date): Promise<boolean> {
        const query = `
            SELECT COUNT(*) as count
            FROM cita_medica cm
            INNER JOIN disponibilidad d1 ON cm.id_disponibilidad = d1.id_disponibilidad
            INNER JOIN disponibilidad d2 ON d1.id_medico = d2.id_medico
            WHERE d2.id_disponibilidad = $1
            AND cm.fecha BETWEEN $2::timestamp - interval '1 hour' 
                            AND $2::timestamp + interval '1 hour'
            AND cm.estado != 'cancelada'
        `;
    
        const result = await ejecutarConsulta(query, [idDisponibilidad, fecha]);
        return parseInt(result.rows[0].count) > 0;
    }


    async verificarCitasSuperpuestasConsultorio(idDisponibilidad: number, fecha: Date): Promise<boolean> {
        const query = `
            SELECT COUNT(*) as count
            FROM cita_medica cm
            INNER JOIN disponibilidad d1 ON cm.id_disponibilidad = d1.id_disponibilidad
            INNER JOIN disponibilidad d2 ON d1.id_consultorio = d2.id_consultorio
            WHERE d2.id_disponibilidad = $1
            AND d2.id_consultorio IS NOT NULL
            AND cm.fecha BETWEEN $2::timestamp - interval '1 hour' 
                            AND $2::timestamp + interval '1 hour'
            AND cm.estado != 'cancelada'
        `;
    
        const result = await ejecutarConsulta(query, [idDisponibilidad, fecha]);
        return parseInt(result.rows[0].count) > 0;
    }
    // Método auxiliar: Mapear nombres de campos TypeScript a columnas SQL
    private mapearCampoAColumna(campo: string): string {
        const mapeo: Record<string, string> = {
            idCita: "id_cita",
            idPaciente: "id_paciente",
            idDisponibilidad: "id_disponibilidad",
            idConsultorio: "id_consultorio",
            fecha: "fecha",
            estado: "estado",
            motivo: "motivo",
            observaciones: "observaciones",
        };
        return mapeo[campo] || campo.toLowerCase();
    }

    async verificarCitasSuperpuestasPaciente(idPaciente: number, fecha: Date): Promise<boolean> {
        const query = `
            SELECT COUNT(*) as count
            FROM cita_medica
            WHERE id_paciente = $1
            AND fecha BETWEEN $2::timestamp - interval '1 hour' 
                        AND $2::timestamp + interval '1 hour'
            AND estado != 'cancelada'
        `;
        
        const result = await ejecutarConsulta(query, [idPaciente, fecha]);
        return parseInt(result.rows[0].count) > 0;
    }

    // Método auxiliar: Mapear fila de BD a objeto ICitaMedica
    private mapearFilaACitaMedica(row: CitaMedicaRow): ICitaMedica {
        return {
            idCita: row.id_cita,
            idPaciente: row.id_paciente,
            idDisponibilidad: row.id_disponibilidad,
            fecha: new Date(row.fecha),
            estado: row.estado,
            motivo: row.motivo,
            observaciones: row.observaciones,
        };
    }

    async obtenerCitasConDetallesPorPaciente(idPaciente: number): Promise<ICitaMedicaConDetalles[]> {
    const query = `
        SELECT 
            cm.id_cita,
            cm.fecha,
            cm.estado,
            cm.motivo,
            cm.observaciones,
            p.id_paciente,
            p.nombre as nombre_paciente,
            p.correo as correo_paciente,
            m.id_medico,
            m.nombre as nombre_medico,
            m.especialidad as especialidad_medico
        FROM cita_medica cm
        INNER JOIN paciente p ON cm.id_paciente = p.id_paciente
        INNER JOIN disponibilidad d ON cm.id_disponibilidad = d.id_disponibilidad
        INNER JOIN medico m ON d.id_medico = m.id_medico
        WHERE cm.id_paciente = $1
        ORDER BY cm.fecha DESC
    `;

    const result = await ejecutarConsulta(query, [idPaciente]);
    
    return result.rows.map((row) => ({
        idCita: row.id_cita,
        fecha: new Date(row.fecha),
        estado: row.estado,
        motivo: row.motivo,
        observaciones: row.observaciones,
        paciente: {
            idPaciente: row.id_paciente,
            nombrePaciente: row.nombre_paciente,
            correoPaciente: row.correo_paciente,
        },
        medico: {
            idMedico: row.id_medico,
            nombreMedico: row.nombre_medico,
            especialidadMedico: row.especialidad_medico,
        },
    }));
}
}
