import type { IPacienteRepositorio } from "../../dominio/paciente/repositorio/IPacienteRepositorio.js";
import type {
    IPaciente,
    IPacienteActualizar,
} from "../../dominio/paciente/IPaciente.js";
import { ejecutarConsulta } from "../DBpostgres.js";

interface PacienteRow {
    id_paciente: number;
    nombre: string;
    correo: string;
    telefono: string;
}

export class PacienteRepositorioPostgres implements IPacienteRepositorio {
    async crearPaciente(datosPaciente: IPaciente): Promise<IPaciente> {
        const { idPaciente: _idPaciente, ...datosParaInsertar } = datosPaciente;

        const columnas = Object.keys(datosParaInsertar).map((key) =>
            this.mapearCampoAColumna(key)
        );
        const parametros: Array<string | number | null> =
            Object.values(datosParaInsertar);
        const placeholders = columnas.map((_, i) => `$${i + 1}`).join(", ");

        const query = `
          INSERT INTO Paciente (${columnas.join(", ")})
          VALUES (${placeholders})
          RETURNING id_paciente, nombre, correo, telefono;
        `;

        const respuesta = await ejecutarConsulta(query, parametros);
        return this.mapearFilaAPaciente(respuesta.rows[0]);
    }

    async obtenerPacientePorId(idPaciente: number): Promise<IPaciente | null> {
        const query =
            "SELECT id_paciente, nombre, correo, telefono FROM Paciente WHERE id_Paciente = $1";
        const result = await ejecutarConsulta(query, [idPaciente]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapearFilaAPaciente(result.rows[0]);
    }

    async listarPacientes(): Promise<IPaciente[]> {
        const query =
            "SELECT id_paciente, nombre, correo, telefono FROM paciente ORDER BY id_paciente ASC";
        const result = await ejecutarConsulta(query, []);
        const pacientes = result.rows.map((row) =>
            this.mapearFilaAPaciente(row)
        );
        return pacientes;
    }

    async actualizarPaciente(
        idPaciente: number,
        datosPaciente: IPacienteActualizar
    ): Promise<IPaciente> {
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
            RETURNING id_paciente, nombre, correo, telefono
        `;

        const result = await ejecutarConsulta(query, parametros);

        if (result.rows.length === 0) {
            throw new Error(`Paciente con ID ${idPaciente} no encontrado`);
        }

        return this.mapearFilaAPaciente(result.rows[0]);
    }

    async eliminarPaciente(idPaciente: number): Promise<boolean> {
        const query =
            "DELETE FROM Paciente WHERE id_Paciente = $1 RETURNING id_Paciente";
        const result = await ejecutarConsulta(query, [idPaciente]);
        return result.rows.length > 0;
    }

    async obtenerPorCorreo(correo: string): Promise<IPaciente | null> {
    const query = "SELECT * FROM paciente WHERE correo = $1";
    const result = await ejecutarConsulta(query, [correo]);
    
    if (result.rows.length === 0) return null;
    
    return this.mapearFilaAPaciente(result.rows[0]);
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
    private mapearFilaAPaciente(row: PacienteRow): IPaciente {
        return {
            idPaciente: row.id_paciente,
            nombrePaciente: row.nombre,
            correoPaciente: row.correo,
            telefonoPaciente: row.telefono,
        };
    }
}
