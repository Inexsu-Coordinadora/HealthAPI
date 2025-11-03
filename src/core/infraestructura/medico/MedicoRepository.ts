import type { IMedicoRepositorio } from '../../dominio/medico/repositorio/IMedicoRepositorio.js';
import type { IMedico } from '../../dominio/medico/IMedico.js';
import { ejecutarConsulta } from '../DBpostgres.js';

export class MedicoRepositorioPostgres implements IMedicoRepositorio {
  
  // CREAR UN NUEVO MÉDICO
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

  // METODO AXILIAR 
  private mapearCampoAColumna(campo: string): string {
    const mapeo: Record<string, string> = {
      idMedico: 'id_medico',
      nombreMedico: 'nombre',
      correoMedico: 'correo',
      especialidadMedico: 'especialidad',
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