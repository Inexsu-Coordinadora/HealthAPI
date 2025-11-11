import type { IConsultorioRepositorio } from "../../dominio/consultorio/repositorio/IConsultorioRepositorio.js";
import type { IConsultorio } from "../../dominio/consultorio/IConsultorio.js";
import { ejecutarConsulta } from "../DBpostgres.js";

export class ConsultorioRepositorioPostgres implements IConsultorioRepositorio {
    async crearConsultorio(
        datosConsultorio: IConsultorio
    ): Promise<IConsultorio> {
        const { idConsultorio: _idConsultorio, ...datosParaInsertar } =
            datosConsultorio;

        const columnas = Object.keys(datosParaInsertar).map((key) =>
            this.mapearCampoAColumna(key)
        );
        const parametros: Array<string | number | null> =
            Object.values(datosParaInsertar);
        const placeholders = columnas.map((_, i) => `$${i + 1}`).join(", ");

        const query = `
            INSERT INTO consultorio (${columnas.join(", ")})
            VALUES (${placeholders})
            RETURNING *
        `;

        const respuesta = await ejecutarConsulta(query, parametros);
        return this.mapearFilaAConsultorio(respuesta.rows[0]);
    }

    async obtenerConsultorioPorId(
        idConsultorio: number
    ): Promise<IConsultorio | null> {
        const query =
            "SELECT id_consultorio, nombre, ubicacion, capacidad FROM consultorio WHERE id_consultorio = $1";
        const result = await ejecutarConsulta(query, [idConsultorio]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapearFilaAConsultorio(result.rows[0]);
    }

    async listarConsultorios(): Promise<IConsultorio[]> {
        const query =
            "SELECT id_consultorio, nombre, ubicacion, capacidad FROM consultorio ORDER BY id_consultorio ASC";
        const result = await ejecutarConsulta(query, []);
        return result.rows.map((row) => this.mapearFilaAConsultorio(row));
    }

    async actualizarConsultorio(
        idConsultorio: number,
        datosConsultorio: Partial<IConsultorio>
    ): Promise<IConsultorio> {
        const { idConsultorio: _, ...datosParaActualizar } =
            datosConsultorio as IConsultorio;

        if (Object.keys(datosParaActualizar).length === 0) {
            throw new Error("No hay campos para actualizar");
        }

        const columnas = Object.keys(datosParaActualizar).map((key) =>
            this.mapearCampoAColumna(key)
        );
        const parametros: Array<string | number | null> =
            Object.values(datosParaActualizar);
        const setClause = columnas
            .map((col, i) => `${col} = $${i + 1}`)
            .join(", ");
        parametros.push(idConsultorio);

        const query = `
            UPDATE consultorio
            SET ${setClause}
            WHERE id_consultorio = $${parametros.length}
            RETURNING id_consultorio, nombre, ubicacion, capacidad
        `;

        const result = await ejecutarConsulta(query, parametros);

        if (result.rows.length === 0) {
            throw new Error("Consultorio no encontrado");
        }

        return this.mapearFilaAConsultorio(result.rows[0]);
    }

    async eliminarConsultorio(idConsultorio: number): Promise<boolean> {
        const query =
            "DELETE FROM consultorio WHERE id_consultorio = $1 RETURNING id_consultorio";
        const result = await ejecutarConsulta(query, [idConsultorio]);
        return result.rows.length > 0;
    }

    private mapearCampoAColumna(campo: string): string {
        const mapeo: Record<string, string> = {
            idConsultorio: "id_consultorio",
            nombreConsultorio: "nombre_consultorio",
            ubicacionConsultorio: "ubicacion_consultorio",
            capacidadConsultorio: "capacidad_consultorio",
        };
        return mapeo[campo] || campo.toLowerCase();
    }

    private mapearFilaAConsultorio(row: any): IConsultorio {
        return {
            idConsultorio: row.id_consultorio,
            nombreConsultorio: row.nombre_consultorio,
            ubicacionConsultorio: row.ubicacion_consultorio,
            capacidadConsultorio: row.capacidad_consultorio,
        };
    }
}
