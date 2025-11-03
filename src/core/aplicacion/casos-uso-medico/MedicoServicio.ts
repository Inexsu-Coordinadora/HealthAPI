import type { IMedicoRepositorio } from '../../dominio/medico/repositorio/IMedicoRepositorio.js';
import type { IMedico } from '../../dominio/medico/IMedico.js';
import { Medico } from '../../dominio/medico/Medico.js';

export class MedicoServicio {
  constructor(private readonly medicoRepositorio: IMedicoRepositorio) {}

  // CREACIÓN DE UN NUEVO MÉDICO

  async crearMedico(datos: Omit<IMedico, 'idMedico'>): Promise<IMedico> {
  
    if (!datos.nombreMedico || datos.nombreMedico.trim() === '') {
      throw new Error('El nombre del médico es obligatorio');
    }

    if (!datos.correoMedico || datos.correoMedico.trim() === '') {
      throw new Error('El correo del médico es obligatorio');
    }

    if (!datos.especialidadMedico || datos.especialidadMedico.trim() === '') {
      throw new Error('La especialidad del médico es obligatoria');
    }

    // INSTANCIAR MÉDICO
    const nuevoMedico = Medico.crear(
      datos.nombreMedico,
      datos.correoMedico,
      datos.especialidadMedico
    );

    // VALIDACIÓN DEL FORMATO DEL CORREO
    if (!nuevoMedico.validarCorreo()) {
      throw new Error('El formato del correo electrónico es inválido');
    }

    // GUARDAR EN EL REPOSITORIO
    return await this.medicoRepositorio.crearMedico(nuevoMedico);
  }