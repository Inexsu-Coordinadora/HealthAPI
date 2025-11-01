import type { IPacienteRepositorio } from '../../dominio/paciente/repositorio/IPacienteRepositorio.js';
import type { IPaciente } from '../../dominio/paciente/IPaciente.js';
import { ejecutarConsulta } from '../DBpostgres.js';

export class PacienteRepositorioPostgres implements IPacienteRepositorio {

  // 1. Crear un nuevo paciente
  async crearPaciente(datosPaciente: IPaciente): Promise<IPaciente> {
    const { idPaciente, ...datosParaInsertar } = datosPaciente;

    const columnas = Object.keys(datosParaInsertar).map((key) => this.mapearCampoAColumna(key));
    const parametros: Array<string | number | null> = Object.values(datosParaInsertar);
    const placeholders = columnas.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO Paciente (${columnas.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const respuesta = await ejecutarConsulta(query, parametros);
    return this.mapearFilaAPaciente(respuesta.rows[0]);
  }

  // 2. Listar todos los paciente ← ASEGÚRATE DE TENER ESTE MÉTODO
  async listarPacientes(): Promise<IPaciente[]> {
    const query = 'SELECT * FROM Paciente ORDER BY id_Paciente ASC';
    const result = await ejecutarConsulta(query, []);
    return result.rows.map((row) => this.mapearFilaAPaciente(row));
  }

  // 3. Obtener un paciente por ID
  async obtenerPacientePorId(idPaciente: number): Promise<IPaciente | null> {
    const query = 'SELECT * FROM Paciente WHERE id_Paciente = $1';
    const result = await ejecutarConsulta(query, [idPaciente]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapearFilaAPaciente(result.rows[0]);
  }

  // 4. Actualizar un paciente
  async actualizarPaciente(
    idPaciente: number,
    datosPaciente: Partial<IPaciente>
  ): Promise<IPaciente> {
    const { idPaciente: _, ...datosParaActualizar } = datosPaciente as IPaciente;
    
    if (Object.keys(datosParaActualizar).length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    const columnas = Object.keys(datosParaActualizar).map((key) => this.mapearCampoAColumna(key));
    const parametros: Array<string | number | null> = Object.values(datosParaActualizar);
    const setClause = columnas.map((col, i) => `${col} = $${i + 1}`).join(', ');
    parametros.push(idPaciente);

    const query = `
      UPDATE Paciente
      SET ${setClause}
      WHERE id_Paciente = $${parametros.length}
      RETURNING *
    `;

    const result = await ejecutarConsulta(query, parametros);
    
    if (result.rows.length === 0) {
      throw new Error('Paciente no encontrado');
    }
    
    return this.mapearFilaAPaciente(result.rows[0]);
  }

  // 5. Eliminar un paciente
  async eliminarPaciente(idPaciente: number): Promise<boolean> {
    const query = 'DELETE FROM Paciente WHERE id_Paciente = $1 RETURNING id_Paciente';
    const result = await ejecutarConsulta(query, [idPaciente]);
    return result.rows.length > 0;
  }

  // Método auxiliar: Mapear nombres de campos TypeScript a columnas SQL
  private mapearCampoAColumna(campo: string): string {
    const mapeo: Record<string, string> = {
      idPaciente: 'id_Paciente',
      nombrePaciente: 'nombre',
      correoPaciente: 'correo',
      telefonoPaciente: 'telefono',
    };
    return mapeo[campo] || campo.toLowerCase();
  }

  // Método auxiliar: Mapear fila de BD a objeto IPaciente
  private mapearFilaAPaciente(row: any): IPaciente {
    return {
      idPaciente: row.id_Paciente,
      nombrePaciente: row.nombre,
      correoPaciente: row.correo,
      telefonoPaciente: row.telefono,
    };
  }
}
