import type { IMedicoRepositorio } from "../../dominio/medico/repositorio/IMedicoRepositorio.js";
import type { IMedico } from "../../dominio/medico/IMedico.js";
import { ejecutarConsulta } from "../DBpostgres.js";

export class MedicoRepositorioPostgres implements IMedicoRepositorio {
    // CREAR UN NUEVO MÉDICO
    async crearMedico(datosMedico: IMedico): Promise<IMedico> {
        const { idMedico, ...datosParaInsertar } = datosMedico;

        const columnas = Object.keys(datosParaInsertar).map((key) => this.mapearCampoAColumna(key));
        const parametros: Array<string | number> = Object.values(datosParaInsertar);
        const placeholders = columnas.map((_, i) => `$${i + 1}`).join(", ");

        const query = `
      INSERT INTO medico (${columnas.join(", ")})
      VALUES (${placeholders})
      RETURNING *
    `;

        const respuesta = await ejecutarConsulta(query, parametros);
        return this.mapearFilaAMedico(respuesta.rows[0]);
    }

    // LISTAR TODOS LOS MÉDICOS
    async listarMedicos(): Promise<IMedico[]> {
        const query = "SELECT * FROM medico ORDER BY id_medico ASC";
        const result = await ejecutarConsulta(query, []);
        return result.rows.map((row) => this.mapearFilaAMedico(row));
    }

    // OBTENER UN MEDICO POR ID
    async obtenerMedicoPorId(idMedico: number): Promise<IMedico | null> {
        const query = "SELECT * FROM medico WHERE id_medico = $1";
        const result = await ejecutarConsulta(query, [idMedico]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapearFilaAMedico(result.rows[0]);
    }

    // ACTUALIZAR UN MÉDICO
    async actualizarMedico(idMedico: number, datosMedico: Partial<IMedico>): Promise<IMedico> {
        const { idMedico: _, ...datosParaActualizar } = datosMedico as IMedico;

        if (Object.keys(datosParaActualizar).length === 0) {
            throw new Error("No hay campos para actualizar");
        }

        const columnas = Object.keys(datosParaActualizar).map((key) => this.mapearCampoAColumna(key));
        const parametros: Array<string | number> = Object.values(datosParaActualizar);
        const setClause = columnas.map((col, i) => `${col} = $${i + 1}`).join(", ");
        parametros.push(idMedico);

        const query = `
      UPDATE medico
      SET ${setClause}
      WHERE id_medico = $${parametros.length}
      RETURNING *
    `;

        const result = await ejecutarConsulta(query, parametros);

        if (result.rows.length === 0) {
            throw new Error("Médico no encontrado");
        }

        return this.mapearFilaAMedico(result.rows[0]);
    }

    // ELIMINAR UN MÉDICO
    async eliminarMedico(idMedico: number): Promise<boolean> {
        const query = "DELETE FROM medico WHERE id_medico = $1 RETURNING id_medico";
        const result = await ejecutarConsulta(query, [idMedico]);
        return result.rows.length > 0;
    }

    async obtenerPorCorreo(correo: string): Promise<IMedico | null> {
        const query = "SELECT * FROM medico WHERE correo = $1";
        const result = await ejecutarConsulta(query, [correo]);
    
    if (result.rows.length === 0) return null;
    
    return this.mapearFilaAMedico(result.rows[0]);
    }

    // METODO AXILIAR
    private mapearCampoAColumna(campo: string): string {
        const mapeo: Record<string, string> = {
            idMedico: "id_medico",
            nombreMedico: "nombre",
            correoMedico: "correo",
            especialidadMedico: "especialidad",
        };
        return mapeo[campo] || campo.toLowerCase();
    }

    // METODO AUXILIAR
    private mapearFilaAMedico(row: any): IMedico {
        return {
            idMedico: row.id_medico,
            nombreMedico: row.nombre,
            correoMedico: row.correo,
            especialidadMedico: row.especialidad,
        };
    }
}