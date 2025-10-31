import type { IMedicoRepositorio } from '../../dominio/medico/repositorio/IMedicoRepositorio.js';
import type { IMedico } from '../../dominio/medico/IMedico.js';
import { Medico } from '../../dominio/medico/Medico.js';

export class MedicoServicio {
  constructor(private readonly medicoRepositorio: IMedicoRepositorio) {}

  // Crear un nuevo médico
  async crearMedico(datos: Omit<IMedico, 'idMedico'>): Promise<IMedico> {
    // Validar que los campos obligatorios no estén vacíos
    if (!datos.nombreMedico || datos.nombreMedico.trim() === '') {
      throw new Error('El nombre del médico es obligatorio');
    }

    if (!datos.correoMedico || datos.correoMedico.trim() === '') {
      throw new Error('El correo del médico es obligatorio');
    }

    if (!datos.especialidadMedico || datos.especialidadMedico.trim() === '') {
      throw new Error('La especialidad del médico es obligatoria');
    }

    // Crear instancia de Medico
    const nuevoMedico = Medico.crear(
      datos.nombreMedico,
      datos.correoMedico,
      datos.especialidadMedico
    );

    // Validar correo
    if (!nuevoMedico.validarCorreo()) {
      throw new Error('El formato del correo electrónico es inválido');
    }

    // Guardar en el repositorio
    return await this.medicoRepositorio.crearMedico(nuevoMedico);
  }

  // Obtener un médico por ID
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

  // Obtener todos los médicos
  async listarMedicos(): Promise<IMedico[]> {
    return await this.medicoRepositorio.listarMedicos();
  }

  // Actualizar un médico
  async actualizarMedico(
    id: number,
    datosActualizados: Partial<IMedico>
  ): Promise<IMedico> {
    if (id <= 0) {
      throw new Error('El ID del médico debe ser un número positivo');
    }

    // Verificar que el médico existe
    const medicoExistente = await this.medicoRepositorio.obtenerMedicoPorId(id);
    if (!medicoExistente) {
      throw new Error(`No se encontró un médico con el ID ${id}`);
    }

    // Validar campos si están presentes
    if (datosActualizados.nombreMedico !== undefined) {
      if (datosActualizados.nombreMedico.trim() === '') {
        throw new Error('El nombre del médico no puede estar vacío');
      }
    }

    if (datosActualizados.correoMedico !== undefined) {
      if (datosActualizados.correoMedico.trim() === '') {
        throw new Error('El correo del médico no puede estar vacío');
      }
      // Validar formato de correo
      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexCorreo.test(datosActualizados.correoMedico)) {
        throw new Error('El formato del correo electrónico es inválido');
      }
    }

    if (datosActualizados.especialidadMedico !== undefined) {
      if (datosActualizados.especialidadMedico.trim() === '') {
        throw new Error('La especialidad del médico no puede estar vacía');
      }
    }

    // Actualizar en el repositorio
    const medicoActualizado = await this.medicoRepositorio.actualizarMedico(
      id,
      datosActualizados
    );

    if (!medicoActualizado) {
      throw new Error('Error al actualizar el médico');
    }

    return medicoActualizado;
  }

  // Eliminar un médico
  async eliminarMedico(id: number): Promise<boolean> {
    if (id <= 0) {
      throw new Error('El ID del médico debe ser un número positivo');
    }

    // Verificar que el médico existe antes de eliminar
    const medicoExistente = await this.medicoRepositorio.obtenerMedicoPorId(id);
    if (!medicoExistente) {
      throw new Error(`No se encontró un médico con el ID ${id}`);
    }

    return await this.medicoRepositorio.eliminarMedico(id);
  }
}