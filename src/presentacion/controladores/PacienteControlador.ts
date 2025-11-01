import type { FastifyRequest, FastifyReply } from 'fastify';
import { PacienteServicio } from '../../core/aplicacion/casos-uso-paciente/PacienteServicio.js';
import { validarCrearPaciente, validarActualizarPaciente } from '../esquemas/PacienteEsquemas.js';

export class PacienteControlador {
  constructor(private readonly pacienteServicio: PacienteServicio) {}

  // POST /pacientes - Crear un nuevo paciente
  async crearPaciente(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Validar datos de entrada
      const validacion = validarCrearPaciente(request.body);

      if (!validacion.valido) {
        return reply.status(400).send({
          error: 'Datos inválidos',
          detalles: validacion.errores,
        });
      }

      const datos: any = request.body;
      const pacienteCreado = await this.pacienteServicio.crearPaciente({
        nombrePaciente: datos.nombrePaciente,
        correoPaciente: datos.correoPaciente,
        telefonoPaciente: datos.telefonoPaciente,
      });

      return reply.status(201).send({
        mensaje: 'Paciente creado exitosamente',
        data: pacienteCreado,
      });
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Error al crear el paciente',
        mensaje: error.message,
      });
    }
  }

  // GET /pacientes - Obtener todos los pacientes
  async listarPacientes(request: FastifyRequest, reply: FastifyReply) {
    try {
      const pacientes = await this.pacienteServicio.listarPacientes();

      return reply.status(200).send({
        mensaje: 'Lista de pacientes obtenida exitosamente',
        data: pacientes,
        total: pacientes.length,
      });
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Error al obtener la lista de pacientes',
        mensaje: error.message,
      });
    }
  }

  // GET /pacientes/:id - Obtener un paciente por ID
  async obtenerPacientePorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const idPaciente = parseInt(id, 10);

      if (isNaN(idPaciente)) {
        return reply.status(400).send({
          error: 'ID inválido',
          mensaje: 'El ID debe ser un número válido',
        });
      }

      const paciente = await this.pacienteServicio.obtenerPacientePorId(idPaciente);

      return reply.status(200).send({
        mensaje: 'Paciente obtenido exitosamente',
        data: paciente,
      });
    } catch (error: any) {
      if (error.message.includes('No se encontró')) {
        return reply.status(404).send({
          error: 'Paciente no encontrado',
          mensaje: error.message,
        });
      }

      return reply.status(500).send({
        error: 'Error al obtener el paciente',
        mensaje: error.message,
      });
    }
  }

  // PUT /pacientes/:id - Actualizar un paciente
  async actualizarPaciente(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const idPaciente = parseInt(id, 10);

      if (isNaN(idPaciente)) {
        return reply.status(400).send({
          error: 'ID inválido',
          mensaje: 'El ID debe ser un número válido',
        });
      }

      // Validar datos de entrada
      const validacion = validarActualizarPaciente(request.body);

      if (!validacion.valido) {
        return reply.status(400).send({
          error: 'Datos inválidos',
          detalles: validacion.errores,
        });
      }

      const datos: any = request.body;
      const pacienteActualizado = await this.pacienteServicio.actualizarPaciente(idPaciente, datos);

      return reply.status(200).send({
        mensaje: 'Paciente actualizado exitosamente',
        data: pacienteActualizado,
      });
    } catch (error: any) {
      if (error.message.includes('No se encontró')) {
        return reply.status(404).send({
          error: 'Paciente no encontrado',
          mensaje: error.message,
        });
      }

      return reply.status(500).send({
        error: 'Error al actualizar el paciente',
        mensaje: error.message,
      });
    }
  }

  // DELETE /pacientes/:id - Eliminar un paciente
  async eliminarPaciente(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const idPaciente = parseInt(id, 10);

      if (isNaN(idPaciente)) {
        return reply.status(400).send({
          error: 'ID inválido',
          mensaje: 'El ID debe ser un número válido',
        });
      }

      const eliminado = await this.pacienteServicio.eliminarPaciente(idPaciente);

      if (eliminado) {
        return reply.status(200).send({
          mensaje: 'Paciente eliminado exitosamente',
        });
      } else {
        return reply.status(404).send({
          error: 'Paciente no encontrado',
          mensaje: `No se encontró un paciente con el ID ${idPaciente}`,
        });
      }
    } catch (error: any) {
      if (error.message.includes('No se encontró')) {
        return reply.status(404).send({
          error: 'Paciente no encontrado',
          mensaje: error.message,
        });
      }

      return reply.status(500).send({
        error: 'Error al eliminar el paciente',
        mensaje: error.message,
      });
    }
  }
}