import type { ICitaMedicaRepositorio } from '../../dominio/citaMedica/repositorio/ICitaMedicaRepositorio.js';
import type { ICitaMedica } from '../../dominio/citaMedica/ICitaMedica.js';
import { ejecutarConsulta } from '../DBpostgres.js';

export class CitaMedicaRepositorioPostgres implements ICitaMedicaRepositorio {
  
  // 1. Crear una nueva cita médica
  async crear(datosCita: Omit<ICitaMedica, 'idCita'>): Promise<ICitaMedica> {
    const columnas = Object.keys(datosCita).map((key) => this.mapearCampoAColumna(key));
    const parametros: Array<string | number | Date | null> = Object.values(datosCita);
    const placeholders = columnas.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO cita_medica (${columnas.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const respuesta = await ejecutarConsulta(query,parametros);
    return this.mapearFilaACitaMedica(respuesta.rows[0]);
  }

  // 2. Obtener una cita médica por ID
  async obtenerCitaPorId(idCita: number): Promise<ICitaMedica | null> {
    const query = 'SELECT * FROM cita_medica WHERE id_cita = $1';
    const result = await ejecutarConsulta(query, [idCita]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapearFilaACitaMedica(result.rows[0]);
  }

  // 3. Listar todas las citas médicas
  async listarCitas(): Promise<ICitaMedica[]> {
    const query = 'SELECT * FROM cita_medica ORDER BY fecha DESC';
    const result = await ejecutarConsulta(query, []);
    return result.rows.map((row) => this.mapearFilaACitaMedica(row));
  }

  // 4. Actualizar una cita médica
  async actualizarCita(
    idCita: number,
    datosCita: Partial<Omit<ICitaMedica, 'idCita'>>
  ): Promise<ICitaMedica | null> {
    if (Object.keys(datosCita).length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    const columnas = Object.keys(datosCita).map((key) => this.mapearCampoAColumna(key));
    const parametros: Array<string | number | Date | null> = Object.values(datosCita);
    const setClause = columnas.map((col, i) => `${col} = $${i + 1}`).join(', ');
    parametros.push(idCita);

    const query = `
      UPDATE cita_medica
      SET ${setClause}
      WHERE id_cita = $${parametros.length}
      RETURNING *
    `;

    const result = await ejecutarConsulta(query, parametros);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapearFilaACitaMedica(result.rows[0]);
  }

  // 5. Eliminar una cita médica
  async eliminarCita(idCita: number): Promise<boolean> {
    const query = 'DELETE FROM cita_medica WHERE id_cita = $1 RETURNING id_cita';
    const result = await ejecutarConsulta(query, [idCita]);
    return result.rows.length > 0;
  }

  // 6. Obtener citas por paciente
  async obtenerPorPaciente(idPaciente: number): Promise<ICitaMedica[]> {
    const query = 'SELECT * FROM cita_medica WHERE id_paciente = $1 ORDER BY fecha DESC';
    const result = await ejecutarConsulta(query, [idPaciente]);
    return result.rows.map((row) => this.mapearFilaACitaMedica(row));
  }

  // 7. Obtener citas por médico
  async obtenerPorMedico(idMedico: number): Promise<ICitaMedica[]> {
    const query = `
      SELECT cm.* 
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
    const query = 'SELECT * FROM cita_medica WHERE estado = $1 ORDER BY fecha DESC';
    const result = await ejecutarConsulta(query, [estado]);
    return result.rows.map((row) => this.mapearFilaACitaMedica(row));
  }

  // Método auxiliar: Mapear nombres de campos TypeScript a columnas SQL
  private mapearCampoAColumna(campo: string): string {
    const mapeo: Record<string, string> = {
      idCita: 'id_cita',
      idPaciente: 'id_paciente',
      idDisponibilidad: 'id_disponibilidad',
      fecha: 'fecha',
      estado: 'estado',
      motivo: 'motivo',
      observaciones: 'observaciones',
    };
    return mapeo[campo] || campo.toLowerCase();
  }

  // Método auxiliar: Mapear fila de BD a objeto ICitaMedica
  private mapearFilaACitaMedica(row: any): ICitaMedica {
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
}