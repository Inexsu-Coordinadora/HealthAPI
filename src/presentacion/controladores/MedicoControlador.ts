import type { FastifyRequest, FastifyReply } from 'fastify';
import { MedicoServicio } from '../../core/aplicacion/casos-uso-medico/MedicoServicio.js';
import { validarCrearMedico, validarActualizarMedico } from '../esquemas/MedicoEsquemas.js';

export class MedicoControlador {
  constructor(private readonly medicoServicio: MedicoServicio) {}

  // POST /medicos - Crear un nuevo médico
  async crearMedico(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Validar datos de entrada
      const validacion = validarCrearMedico(request.body);
      
      if (!validacion.valido) {
        return reply.status(400).send({
          error: 'Datos inválidos',
          detalles: validacion.errores,
        });
      }

      const datos: any = request.body;
      const medicoCreado = await this.medicoServicio.crearMedico({
        nombreMedico: datos.nombreMedico,
        correoMedico: datos.correoMedico,
        especialidadMedico: datos.especialidadMedico,
      });

      return reply.status(201).send({
        mensaje: 'Médico creado exitosamente',
        data: medicoCreado,
      });
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Error al crear el médico',
        mensaje: error.message,
      });
    }
  }

  // GET /medicos - Obtener todos los médicos
  async listarMedicos(request: FastifyRequest, reply: FastifyReply) {
    try {
      const medicos = await this.medicoServicio.listarMedicos();

      return reply.status(200).send({
        mensaje: 'Lista de médicos obtenida exitosamente',
        data: medicos,
        total: medicos.length,
      });
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Error al obtener la lista de médicos',
        mensaje: error.message,
      });
    }
  }

  // GET /medicos/:id - Obtener un médico por ID
  async obtenerMedicoPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const idMedico = parseInt(id, 10);

      if (isNaN(idMedico)) {
        return reply.status(400).send({
          error: 'ID inválido',
          mensaje: 'El ID debe ser un número válido',
        });
      }

      const medico = await this.medicoServicio.obtenerMedicoPorId(idMedico);

      return reply.status(200).send({
        mensaje: 'Médico obtenido exitosamente',
        data: medico,
      });
    } catch (error: any) {
      if (error.message.includes('No se encontró')) {
        return reply.status(404).send({
          error: 'Médico no encontrado',
          mensaje: error.message,
        });
      }

      return reply.status(500).send({
        error: 'Error al obtener el médico',
        mensaje: error.message,
      });
    }
  }

  // PUT /medicos/:id - Actualizar un médico
  async actualizarMedico(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const idMedico = parseInt(id, 10);

      if (isNaN(idMedico)) {
        return reply.status(400).send({
          error: 'ID inválido',
          mensaje: 'El ID debe ser un número válido',
        });
      }

      // Validar datos de entrada
      const validacion = validarActualizarMedico(request.body);
      
      if (!validacion.valido) {
        return reply.status(400).send({
          error: 'Datos inválidos',
          detalles: validacion.errores,
        });
      }

      const datos: any = request.body;
      const medicoActualizado = await this.medicoServicio.actualizarMedico(idMedico, datos);

      return reply.status(200).send({
        mensaje: 'Médico actualizado exitosamente',
        data: medicoActualizado,
      });
    } catch (error: any) {
      if (error.message.includes('No se encontró')) {
        return reply.status(404).send({
          error: 'Médico no encontrado',
          mensaje: error.message,
        });
      }

      return reply.status(500).send({
        error: 'Error al actualizar el médico',
        mensaje: error.message,
      });
    }
  }

  // DELETE /medicos/:id - Eliminar un médico
  async eliminarMedico(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const idMedico = parseInt(id, 10);

      if (isNaN(idMedico)) {
        return reply.status(400).send({
          error: 'ID inválido',
          mensaje: 'El ID debe ser un número válido',
        });
      }

      const eliminado = await this.medicoServicio.eliminarMedico(idMedico);

      if (eliminado) {
        return reply.status(200).send({
          mensaje: 'Médico eliminado exitosamente',
        });
      } else {
        return reply.status(404).send({
          error: 'Médico no encontrado',
          mensaje: `No se encontró un médico con el ID ${idMedico}`,
        });
      }
    } catch (error: any) {
      if (error.message.includes('No se encontró')) {
        return reply.status(404).send({
          error: 'Médico no encontrado',
          mensaje: error.message,
        });
      }

      return reply.status(500).send({
        error: 'Error al eliminar el médico',
        mensaje: error.message,
      });
    }
  }
}