import type {FastifyRequest, FastifyReply} from 'fastify';
import { CitaMedicaServicio } from '../../core/aplicacion/casos-uso-cita/CitaMedicaServicio.js';
import { validarActualizarCita,validarCrearCita } from '../esquemas/CitaMedicaEsquemas.js';
import type { ICitaMedica } from '../../core/dominio/citaMedica/ICitaMedica.js';

export class CitaControlador {
  constructor(private readonly citaServicio: CitaMedicaServicio) {}

  // POST /citas - Crear nueva cita
  async crearCita(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validacion = validarCrearCita(request.body);
      if (!validacion.valido) {
        return reply.status(400).send({
          error: 'Datos inválidos',
          detalles: validacion.errores,
        });
      }

      const datos = request.body as ICitaMedica;
      const citaCreada = await this.citaServicio.crearCitaMedica({
        idPaciente: datos.idPaciente,
        idDisponibilidad: datos.idDisponibilidad,
        fecha: datos.fecha,
        estado: datos.estado,
        motivo: datos.motivo,
        observaciones: datos.observaciones,
      });

      return reply.status(201).send({
        mensaje: 'Cita médica creada exitosamente',
        data: citaCreada,
      });
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Error al crear la cita médica',
        mensaje: error.message,
      });
    }
  }

  // GET /citas - Listar todas las citas
  async listarCitas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const citas = await this.citaServicio.listarCitas();

      return reply.status(200).send({
        mensaje: 'Lista de citas obtenida exitosamente',
        data: citas,
        total: citas.length,
      });
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Error al obtener la lista de citas',
        mensaje: error.message,
      });
    }
  }

  // GET /citas/:id - Obtener cita por ID
  async obtenerCitaPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const idCita = parseInt(id, 10);

      if (isNaN(idCita)) {
        return reply.status(400).send({
          error: 'ID inválido',
          mensaje: 'El ID debe ser un número válido',
        });
      }

      const cita = await this.citaServicio.obtenerCitaMedicaPorId(idCita);

      return reply.status(200).send({
        mensaje: 'Cita médica obtenida exitosamente',
        data: cita,
      });
    } catch (error: any) {
      if (error.message.includes('No se encontró')) {
        return reply.status(404).send({
          error: 'Cita no encontrada',
          mensaje: error.message,
        });
      }

      return reply.status(500).send({
        error: 'Error al obtener la cita médica',
        mensaje: error.message,
      });
    }
  }

  // PUT /citas/:id - Actualizar una cita
  async actualizarCita(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const idCita = parseInt(id, 10);

      if (isNaN(idCita)) {
        return reply.status(400).send({
          error: 'ID inválido',
          mensaje: 'El ID debe ser un número válido',
        });
      }

      const validacion = validarActualizarCita(request.body);
      if (!validacion.valido) {
        return reply.status(400).send({
          error: 'Datos inválidos',
          detalles: validacion.errores,
        });
      }

      const datos = request.body as Partial<ICitaMedica>;
      const citaActualizada = await this.citaServicio.actualizarCita(idCita, datos);

      return reply.status(200).send({
        mensaje: 'Cita médica actualizada exitosamente',
        data: citaActualizada,
      });
    } catch (error: any) {
      if (error.message.includes('No se encontró')) {
        return reply.status(404).send({
          error: 'Cita no encontrada',
          mensaje: error.message,
        });
      }

      return reply.status(500).send({
        error: 'Error al actualizar la cita médica',
        mensaje: error.message,
      });
    }
  }

  // DELETE /citas/:id - Eliminar una cita
  async eliminarCita(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const idCita = parseInt(id, 10);

      if (isNaN(idCita)) {
        return reply.status(400).send({
          error: 'ID inválido',
          mensaje: 'El ID debe ser un número válido',
        });
      }

      const eliminado = await this.citaServicio.eliminarCitaMedica(idCita);

      if (eliminado) {
        return reply.status(200).send({
          mensaje: 'Cita médica eliminada exitosamente',
        });
      } else {
        return reply.status(404).send({
          error: 'Cita no encontrada',
          mensaje: `No se encontró una cita con el ID ${idCita}`,
        });
      }
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Error al eliminar la cita médica',
        mensaje: error.message,
      });
    }
  }
}
