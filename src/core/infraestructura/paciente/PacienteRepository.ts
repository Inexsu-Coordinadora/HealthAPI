import type { IPacienteRepositorio } from "../../dominio/paciente/repo/IPacienteRepo.js";
import type { IPaciente } from "../../dominio/paciente/IPaciente.js";
import { ejecutarConsulta } from "../DBpostgres.js";

export class PacienteRepositorioPostgres implements IPacienteRepositorio {
  async crearPaciente(datosPaciente: IPaciente): Promise<IPaciente> {
    try {
      const columnas = Object.keys(datosPaciente).map((key) =>
        this.mapearCampoAColumna(key),
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
