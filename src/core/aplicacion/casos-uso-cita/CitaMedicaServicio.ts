import type { ICitaMedica } from "../../dominio/citaMedica/ICitaMedica.js";
import  { CitaMedica } from "../../dominio/citaMedica/CitaMedica.js";
import type { ICitaMedicaRepositorio } from "../../dominio/citaMedica/repositorio/ICitaMedicaRepositorio.js";

export class CitaMedicaServicio {
  constructor(private citaMedicaRepositorio: ICitaMedicaRepositorio) {}

  async CrearCitaMedica(
    idCita: number,
    idPaciente: number,
    idDisponibilidad: number,
    fecha: Date,
    estado: string,
    motivo: string | null,
    observaciones: string 
  ): Promise<ICitaMedica> {

    if (!CitaMedica.validarEstado(estado)) {
      throw new Error('Estado de cita inválido');
    }

    const nuevaCita = CitaMedica.crear(
      idPaciente,
      idDisponibilidad,
      fecha,
      estado,
      motivo,
      observaciones
    );

    return await this.citaMedicaRepositorio.crear(nuevaCita);
  }
   async obtenerCitaMedicaPorId(id: number): Promise<ICitaMedica> {
    if (id <= 0) {
      throw new Error('El ID de la cita médica debe ser un número positivo');
    }

    const cita = await this.citaMedicaRepositorio.obtenerCitaPorId(id);

    if (!cita) {
      throw new Error(`No se encontró una cita médica con el ID ${id}`);
    }

    return cita;
  }


  async listarCitas(): Promise<ICitaMedica[]> {
    return await this.citaMedicaRepositorio.listarCitas();
  }


  async actualizarCita(
    id: number,
    datosActualizados: Partial<ICitaMedica>
  ): Promise<ICitaMedica> {
    if (id <= 0) {
      throw new Error('El ID de la cita médica debe ser un número positivo');
    }

    const citaExistente = await this.citaMedicaRepositorio.obtenerCitaPorId(id);
    if (!citaExistente) {
      throw new Error(`No se encontró una cita médica con el ID ${id}`);
    }

    
    if (datosActualizados.idDisponibilidad !== undefined) {
      if (datosActualizados.idDisponibilidad <= 0) {
        throw new Error('El ID de disponibilidad debe ser un número positivo');
      }
    }

    if (datosActualizados.fecha !== undefined) {
      if (!datosActualizados.fecha) {
        throw new Error('La fecha no puede estar vacía');
      }
    }

    if (datosActualizados.estado !== undefined) {
      if (datosActualizados.estado.trim() === '') {
        throw new Error('El estado no puede estar vacío');
      }
      const citaTemp = new CitaMedica({ 
        idCita: id, 
        ...citaExistente, 
        ...datosActualizados 
      });
      if (!citaTemp.validarEstado(datosActualizados.estado)) {
        throw new Error('El estado de la cita es inválido');
      }
    }

    const citaActualizada = await this.citaMedicaRepositorio.actualizarCita(
      id,
      datosActualizados
    );

    if (!citaActualizada) {
      throw new Error('Error al actualizar la cita médica');
    }

    return citaActualizada;
  }

  async eliminarCitaMedica(id: number): Promise<boolean> {
    if (id <= 0) {
      throw new Error('El ID de la cita médica debe ser un número positivo');
    }

    const citaExistente = await this.citaMedicaRepositorio.obtenerCitaPorId(id);
    if (!citaExistente) {
      throw new Error(`No se encontró una cita médica con el ID ${id}`);
    }

    return await this.citaMedicaRepositorio.eliminarCita(id);
  }
}