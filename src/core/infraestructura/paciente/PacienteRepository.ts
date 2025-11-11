import type { IPacienteRepositorio } from "../../dominio/paciente/repositorio/IPacienteRepositorio.js";
import type {
    IPaciente,
    IPacienteActualizar,
} from "../../dominio/paciente/IPaciente.js";
import { ejecutarConsulta } from "../DBpostgres.js";

export class PacienteRepositorioPostgres implements IPacienteRepositorio {
    async crearPaciente(datosPaciente: IPaciente): Promise<IPaciente> {
        try {
            const columnas = Object.keys(datosPaciente).map((key) =>
                this.mapearCampoAColumna(key)
            );
            const parametros: Array<string | number | null> =
                Object.values(datosPaciente);
            const placeholders = columnas.map((_, i) => `$${i + 1}`).join(", ");

            const query = `
              INSERT INTO Paciente (${columnas.join(", ")})
              VALUES (${placeholders})
              RETURNING *;
            `;

            const respuesta = await ejecutarConsulta(query, parametros);
            return this.mapearFilaAPaciente(respuesta.rows[0]);
        } catch (error: any) {
            throw {
                error: "Error al crear el paciente",
                mensaje: error.message,
            };
        }
    }

    async obtenerPacientePorId(idPaciente: number): Promise<IPaciente | null> {
        try {
            const query =
                "SELECT id_paciente, nombre, correo, telefono FROM Paciente WHERE id_Paciente = $1";
            const result = await ejecutarConsulta(query, [idPaciente]);

            if (result.rows.length === 0) {return null;}

            return this.mapearFilaAPaciente(result.rows[0]);
        } catch (e) {
            const error = e as Error;
            throw {
                error: "Error al obtener el paciente",
                mensaje: error.message,
            };
        }
    }

    async listarPacientes(): Promise<IPaciente[]> {
        try {
            const query =
                "SELECT id_paciente, nombre, correo, telefono FROM paciente ORDER BY id_paciente ASC";
            const result = await ejecutarConsulta(query, []);
            const pacientes = result.rows.map((row) =>
                this.mapearFilaAPaciente(row)
            );
            return pacientes;
        } catch (error: any) {
            throw {
                error: "Error al obtener la lista de pacientes",
                mensaje: error.message,
            };
        }
    }

    async actualizarPaciente(
        idPaciente: number,
        datosPaciente: IPacienteActualizar
    ): Promise<IPaciente> {
        try {
            const columnas = Object.keys(datosPaciente).map((key) =>
                this.mapearCampoAColumna(key)
            );
            const parametros: Array<string | number | null> =
                Object.values(datosPaciente);
            const setClause = columnas
                .map((col, i) => `${col} = $${i + 1}`)
                .join(", ");
            parametros.push(idPaciente);

            const query = `
                UPDATE Paciente
                SET ${setClause}
                WHERE id_Paciente = $${parametros.length}
                RETURNING *
            `;

            const result = await ejecutarConsulta(query, parametros);

            if (result.rows.length === 0) {
                throw new Error(`Paciente con ID ${idPaciente} no encontrado`);
            }

            return this.mapearFilaAPaciente(result.rows[0]);
        } catch (e) {
            const error = e as Error;
            throw {
                error: "Error al actualizar el paciente",
                mensaje: error.message,
            };
        }
    }

    async eliminarPaciente(idPaciente: number): Promise<boolean> {
        try {
            const query =
                "DELETE FROM Paciente WHERE id_Paciente = $1 RETURNING id_Paciente";
            const result = await ejecutarConsulta(query, [idPaciente]);
            return result.rows.length > 0;
        } catch (error: any) {
            throw {
                error: "Error al eliminar el paciente",
                mensaje: error.message,
            };
        }
    }

    // Método auxiliar: Mapear nombres de campos TypeScript a columnas SQL
    private mapearCampoAColumna(campo: string): string {
        const mapeo: Record<string, string> = {
            idPaciente: "id_paciente",
            nombrePaciente: "nombre",
            correoPaciente: "correo",
            telefonoPaciente: "telefono",
        };
        return mapeo[campo] || campo.toLowerCase();
    }

    // Método auxiliar: Mapear fila de BD a objeto IPaciente
    private mapearFilaAPaciente(row: any): IPaciente {
        return {
            idPaciente: row.id_paciente,
            nombrePaciente: row.nombre,
            correoPaciente: row.correo,
            telefonoPaciente: row.telefono,
        };
    }
}
