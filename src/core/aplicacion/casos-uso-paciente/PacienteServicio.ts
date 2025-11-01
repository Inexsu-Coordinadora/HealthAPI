import type { IPacienteRepositorio } from '../../dominio/paciente/repositorio/IPacienteRepositorio.js';
import type { IPaciente } from '../../dominio/paciente/IPaciente.js';
import { Paciente } from '../../dominio/paciente/Paciente.js';

export class PacienteServicio {
  constructor(private readonly pacienteRepositorio: IPacienteRepositorio) {}

  // Crear un nuevo paciente
  async crearPaciente(datos: Omit<IPaciente, 'idPaciente'>): Promise<IPaciente> {
    // Validar que los campos obligatorios no estén vacíos
    if (!datos.nombrePaciente || datos.nombrePaciente.trim() === '') {
      throw new Error('El nombre del paciente es obligatorio');
    }

    if (!datos.correoPaciente || datos.correoPaciente.trim() === '') {
      throw new Error('El correo del paciente es obligatorio');
    }

    // Crear instancia de Paciente
    const nuevoPaciente = Paciente.crear(
    datos.nombrePaciente,
    datos.correoPaciente,
    datos.telefonoPaciente || ''
    );

    // Validar correo
    if (!nuevoPaciente.validarCorreo()) {
      throw new Error('El formato del correo electrónico es inválido');
    }

    // Guardar en el repositorio
    return await this.pacienteRepositorio.crearPaciente(nuevoPaciente);
  }

  // Obtener un paciente por ID
  async obtenerPacientePorId(id: number): Promise<IPaciente> {
    if (id <= 0) {
      throw new Error('El ID del paciente debe ser un número positivo');
    }

    const paciente = await this.pacienteRepositorio.obtenerPacientePorId(id);

    if (!paciente) {
      throw new Error(`No se encontró un paciente con el ID ${id}`);
    }

    return paciente;
  }

  // Obtener todos los pacientes
  async listarPacientes(): Promise<IPaciente[]> {
    return await this.pacienteRepositorio.listarPacientes();
  }

  // Actualizar un paciente
  async actualizarPaciente(
    id: number,
    datosActualizados: Partial<IPaciente>
  ): Promise<IPaciente> {
    if (id <= 0) {
      throw new Error('El ID del paciente debe ser un número positivo');
    }

    // Verificar que el paciente existe
    const pacienteExistente = await this.pacienteRepositorio.obtenerPacientePorId(id);
    if (!pacienteExistente) {
      throw new Error(`No se encontró un paciente con el ID ${id}`);
    }

    // Validar campos si están presentes
    if (datosActualizados.nombrePaciente !== undefined) {
      if (datosActualizados.nombrePaciente.trim() === '') {
        throw new Error('El nombre del paciente no puede estar vacío');
      }
    }

    if (datosActualizados.correoPaciente !== undefined) {
      if (datosActualizados.correoPaciente.trim() === '') {
        throw new Error('El correo del paciente no puede estar vacío');
      }
      // Validar formato de correo
      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexCorreo.test(datosActualizados.correoPaciente)) {
        throw new Error('El formato del correo electrónico es inválido');
      }
    }

    // Actualizar en el repositorio
    const pacienteActualizado = await this.pacienteRepositorio.actualizarPaciente(
      id,
      datosActualizados
    );

    if (!pacienteActualizado) {
      throw new Error('Error al actualizar el paciente');
    }

    return pacienteActualizado;
  } 

  // Eliminar un paciente
  async eliminarPaciente(id: number): Promise<boolean> {
    if (id <= 0) {
      throw new Error('El ID del paciente debe ser un número positivo');
    }

    // Verificar que el paciente existe antes de eliminar
    const pacienteExistente = await this.pacienteRepositorio.obtenerPacientePorId(id);
    if (!pacienteExistente) {
      throw new Error(`No se encontró un paciente con el ID ${id}`);
    }

    return await this.pacienteRepositorio.eliminarPaciente(id);
  }
}