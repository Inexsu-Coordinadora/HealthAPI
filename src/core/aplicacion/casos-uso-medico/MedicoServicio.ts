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

  // OBTENER MEDICO POR ID
  async obtenerMedicoPorId(id: number): Promise<IMedico> {
    if (id <= 0) {
      throw new Error('El ID del médico debe ser un número positivo');
    }

    const medico = await this.medicoRepositorio.obtenerMedicoPorId(id);

    if (!medico) {
      throw new Error(`No se encontró un médico con el ID ${id}`);
    }

    return medico;
  }

  // OBTENER TODOS LOS MEDICOS EN UNA LISTA
  async listarMedicos(): Promise<IMedico[]> {
    return await this.medicoRepositorio.listarMedicos();
  }