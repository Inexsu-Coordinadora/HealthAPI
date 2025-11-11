import type { IDisponibilidadRepositorio } from "../../dominio/disponibilidad/repositorio/IDisponibilidadRepositorio.js";
import type { IDisponibilidad } from "../../dominio/disponibilidad/IDisponibilidad.js";
import { ejecutarConsulta } from "../DBpostgres.js";

export class DisponibilidadRepositorioPostgres
    implements IDisponibilidadRepositorio
{
    async crearDisponibilidad(
        datosDisponibilidad: IDisponibilidad
    ): Promise<IDisponibilidad> {
        const { idDisponibilidad, ...datosParaInsertar } = datosDisponibilidad;

        const datosLimpios = Object.entries(datosParaInsertar)
            .filter(([_, value]) => value !== undefined)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        const columnas = Object.keys(datosLimpios).map((key) =>
            this.mapearCampoAColumna(key)
        );
        const parametros: Array<string | number | null> =
            Object.values(datosLimpios);
        const placeholders = columnas.map((_, i) => `$${i + 1}`).join(", ");

        const query = `
            INSERT INTO disponibilidad (${columnas.join(", ")})
            VALUES (${placeholders})
            RETURNING *
        `;

        const respuesta = await ejecutarConsulta(query, parametros);
        return this.mapearFilaADisponibilidad(respuesta.rows[0]);
    }

    // OBTENER DISPONIBILIDAD POR ID
    async obtenerDisponibilidadPorId(
        idDisponibilidad: number
    ): Promise<IDisponibilidad | null> {
        const query =
            "SELECT id_disponibilidad, id_medico, id_consultorio, dia_semana, hora_inicio, hora_fin FROM disponibilidad WHERE id_disponibilidad = $1";
        const result = await ejecutarConsulta(query, [idDisponibilidad]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapearFilaADisponibilidad(result.rows[0]);
    }

    // LISTAR TODAS LAS DISPONIBILIDADES
    async listarDisponibilidades(): Promise<IDisponibilidad[]> {
        const query =
            "SELECT id_disponibilidad, id_medico, id_consultorio, dia_semana, hora_inicio, hora_fin FROM disponibilidad ORDER BY id_disponibilidad ASC";
        const result = await ejecutarConsulta(query, []);
        return result.rows.map((row) => this.mapearFilaADisponibilidad(row));
    }

    // OBTENER DISPONIBILIDADES POR MÉDICO
    async obtenerDisponibilidadesPorMedico(
        idMedico: number
    ): Promise<IDisponibilidad[]> {
        const query =
            "SELECT id_disponibilidad, id_medico, id_consultorio, dia_semana, hora_inicio, hora_fin FROM disponibilidad WHERE id_medico = $1 ORDER BY dia_semana, hora_inicio";
        const result = await ejecutarConsulta(query, [idMedico]);
        return result.rows.map((row) => this.mapearFilaADisponibilidad(row));
    }

    // OBTENER DISPONIBILIDADES POR CONSULTORIO
    async obtenerDisponibilidadesPorConsultorio(
        idConsultorio: number
    ): Promise<IDisponibilidad[]> {
        const query =
            "SELECT id_disponibilidad, id_medico, id_consultorio, dia_semana, hora_inicio, hora_fin FROM disponibilidad WHERE id_consultorio = $1 ORDER BY dia_semana, hora_inicio";
        const result = await ejecutarConsulta(query, [idConsultorio]);
        return result.rows.map((row) => this.mapearFilaADisponibilidad(row));
    }

    // ACTUALIZAR DISPONIBILIDAD
    async actualizarDisponibilidad(
        idDisponibilidad: number,
        datosDisponibilidad: Partial<IDisponibilidad>
    ): Promise<IDisponibilidad> {
        const { idDisponibilidad: _, ...datosParaActualizar } =
            datosDisponibilidad as IDisponibilidad;

        if (Object.keys(datosParaActualizar).length === 0) {
            throw new Error("No hay campos para actualizar");
        }

        const columnas = Object.keys(datosParaActualizar)
            .filter(
                (key) =>
                    datosParaActualizar[
                        key as keyof typeof datosParaActualizar
                    ] !== undefined
            )
            .map((key) => this.mapearCampoAColumna(key));

        const parametros: Array<string | number | null> = Object.entries(
            datosParaActualizar
        )
            .filter(([_, value]) => value !== undefined)
            .map(([_, value]) => value);

        const setClause = columnas
            .map((col, i) => `${col} = $${i + 1}`)
            .join(", ");
        parametros.push(idDisponibilidad);

        const query = `
            UPDATE disponibilidad
            SET ${setClause}
            WHERE id_disponibilidad = $${parametros.length}
            RETURNING id_disponibilidad, id_medico, id_consultorio, dia_semana, hora_inicio, hora_fin
        `;

        const result = await ejecutarConsulta(query, parametros);

        if (result.rows.length === 0) {
            throw new Error("Disponibilidad no encontrada");
        }

        return this.mapearFilaADisponibilidad(result.rows[0]);
    }

    // ELIMINAR UNA DISPONIBILIDAD
    async eliminarDisponibilidad(idDisponibilidad: number): Promise<boolean> {
        const query =
            "DELETE FROM disponibilidad WHERE id_disponibilidad = $1 RETURNING id_disponibilidad";
        const result = await ejecutarConsulta(query, [idDisponibilidad]);
        return result.rows.length > 0;
    }

    async verificarDisponibilidadDuplicada(
        idMedico: number,
        idConsultorio: number | null,
        diaSemana: string,
        horaInicio: string,
        horaFin: string
    ): Promise<boolean> {
        let query: string;
        let parametros: Array<string | number | null>;

        if (idConsultorio === null) {
            query = `
                SELECT COUNT(*) as count
                FROM disponibilidad
                WHERE id_medico = $1
                AND dia_semana = $2
                AND hora_inicio = $3
                AND hora_fin = $4
                AND id_consultorio IS NULL
            `;
            parametros = [idMedico, diaSemana, horaInicio, horaFin];
        } else {
            query = `
                SELECT COUNT(*) as count
                FROM disponibilidad
                WHERE id_medico = $1
                AND id_consultorio = $2
                AND dia_semana = $3
                AND hora_inicio = $4
                AND hora_fin = $5
            `;
            parametros = [
                idMedico,
                idConsultorio,
                diaSemana,
                horaInicio,
                horaFin,
            ];
        }

        const result = await ejecutarConsulta(query, parametros);
        return parseInt(result.rows[0].count) > 0;
    }

    private mapearCampoAColumna(campo: string): string {
        const mapeo: Record<string, string> = {
            idDisponibilidad: "id_disponibilidad",
            idMedico: "id_medico",
            idConsultorio: "id_consultorio",
            diaSemana: "dia_semana",
            horaInicio: "hora_inicio",
            horaFin: "hora_fin",
        };
        return mapeo[campo] || campo.toLowerCase();
    }

    private mapearFilaADisponibilidad(row: any): IDisponibilidad {
        return {
            idDisponibilidad: row.id_disponibilidad,
            idMedico: row.id_medico,
            idConsultorio: row.id_consultorio ?? null,
            diaSemana: row.dia_semana,
            horaInicio: row.hora_inicio,
            horaFin: row.hora_fin,
        };
    }
}
