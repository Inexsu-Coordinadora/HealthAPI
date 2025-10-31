import type { IMedicoRepositorio } from '../../dominio/medico/repositorio/IMedicoRepositorio.js';
import type { IMedico } from '../../dominio/medico/IMedico.js';
import { ejecutarConsulta } from '../DBpostgres.js';

export class MedicoRepositorioPostgres implements IMedicoRepositorio {
  
  // 1. Crear un nuevo médico
  async crearMedico(datosMedico: IMedico): Promise<IMedico> {
    const { idMedico, ...datosParaInsertar } = datosMedico;
    
    const columnas = Object.keys(datosParaInsertar).map((key) => this.mapearCampoAColumna(key));
    const parametros: Array<string | number> = Object.values(datosParaInsertar);
    const placeholders = columnas.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO medico (${columnas.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const respuesta = await ejecutarConsulta(query, parametros);
    return this.mapearFilaAMedico(respuesta.rows[0]);
  }

  // 2. Listar todos los médicos ← ASEGÚRATE DE TENER ESTE MÉTODO
  async listarMedicos(): Promise<IMedico[]> {
    const query = 'SELECT * FROM medico ORDER BY id_medico ASC';
    const result = await ejecutarConsulta(query, []);
    return result.rows.map((row) => this.mapearFilaAMedico(row));
  }

  // 3. Obtener un médico por ID
  async obtenerMedicoPorId(idMedico: number): Promise<IMedico | null> {
    const query = 'SELECT * FROM medico WHERE id_medico = $1';
    const result = await ejecutarConsulta(query, [idMedico]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapearFilaAMedico(result.rows[0]);
  }

  // 4. Actualizar un médico
  async actualizarMedico(
    idMedico: number,
    datosMedico: Partial<IMedico>
  ): Promise<IMedico> {
    const { idMedico: _, ...datosParaActualizar } = datosMedico as IMedico;
    
    if (Object.keys(datosParaActualizar).length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    const columnas = Object.keys(datosParaActualizar).map((key) => this.mapearCampoAColumna(key));
    const parametros: Array<string | number> = Object.values(datosParaActualizar);
    const setClause = columnas.map((col, i) => `${col} = $${i + 1}`).join(', ');
    parametros.push(idMedico);

    const query = `
      UPDATE medico
      SET ${setClause}
      WHERE id_medico = $${parametros.length}
      RETURNING *
    `;

    const result = await ejecutarConsulta(query, parametros);
    
    if (result.rows.length === 0) {
      throw new Error('Médico no encontrado');
    }
    
    return this.mapearFilaAMedico(result.rows[0]);
  }

  // 5. Eliminar un médico
  async eliminarMedico(idMedico: number): Promise<boolean> {
    const query = 'DELETE FROM medico WHERE id_medico = $1 RETURNING id_medico';
    const result = await ejecutarConsulta(query, [idMedico]);
    return result.rows.length > 0;
  }

  // Método auxiliar: Mapear nombres de campos TypeScript a columnas SQL
  private mapearCampoAColumna(campo: string): string {
    const mapeo: Record<string, string> = {
      idMedico: 'id_medico',
      nombreMedico: 'nombre',
      correoMedico: 'correo',
      especialidadMedico: 'especialidad',
    };
    return mapeo[campo] || campo.toLowerCase();
  }

  // Método auxiliar: Mapear fila de BD a objeto IMedico
  private mapearFilaAMedico(row: any): IMedico {
    return {
      idMedico: row.id_medico,
      nombreMedico: row.nombre,
      correoMedico: row.correo,
      especialidadMedico: row.especialidad,
    };
  }
}
