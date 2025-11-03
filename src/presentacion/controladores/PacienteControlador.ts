import type { FastifyRequest, FastifyReply } from "fastify";
import { PacienteServicio } from "../../core/aplicacion/casos-uso-paciente/PacienteServicio.js";
import {
  esquemaCrearPaciente,
  esquemaPacientePorId,
  esquemaActualizarPaciente,
} from "../esquemas/PacienteEsquemas.js";
import { validadorEsquemas } from "../esquemas/Validador.js";

enum Mensajes {
  "200_POST_OK" = "Paciente creado exitosamente",
  "200_GET_OK" = "Paciente obtenido exitosamente",
  "200_GET_ALL_OK" = "Lista de pacientes obtenida exitosamente",
  "200_PUT_OK" = "Paciente actualizado exitosamente",
  "200_DELETE_OK" = "Paciente eliminado exitosamente",
  "404_NOT_FOUND" = "No se encontró un paciente con el ID",
}

export class PacienteControlador {
  constructor(private readonly pacienteServicio: PacienteServicio) {}

  // POST /pacientes - Crear un nuevo paciente
  async crearPaciente(request: FastifyRequest, reply: FastifyReply) {
    const paciente = validadorEsquemas(
      esquemaCrearPaciente,
      request.body,
      reply,
    );

    const pacienteCreado = await this.pacienteServicio.crearPaciente(paciente);

    return reply.status(201).send({
      mensaje: Mensajes["200_POST_OK"],
      data: pacienteCreado,
    });
  }

  // GET /pacientes/:id - Obtener un paciente por ID
  async obtenerPacientePorId(request: FastifyRequest, reply: FastifyReply) {
    const { id: idPaciente } = validadorEsquemas(
      esquemaPacientePorId,
      request.params,
      reply,
    );

    const paciente =
      await this.pacienteServicio.obtenerPacientePorId(idPaciente);

    const statusCode = paciente ? 200 : 404;
    const mensaje = paciente
      ? Mensajes["200_GET_OK"]
      : `${Mensajes["404_NOT_FOUND"]} ${idPaciente}`;
    return reply.status(statusCode).send({
      mensaje,
      data: paciente,
    });
  }

  // GET /pacientes - Obtener todos los pacientes
  async listarPacientes(request: FastifyRequest, reply: FastifyReply) {
    const pacientes = await this.pacienteServicio.listarPacientes();

    return reply.status(200).send({
      mensaje: Mensajes["200_GET_ALL_OK"],
      data: pacientes,
      total: pacientes.length,
    });
  }

  // PUT /pacientes/:id - Actualizar un paciente
  async actualizarPaciente(request: FastifyRequest, reply: FastifyReply) {
    const { id: idPaciente } = validadorEsquemas(
      esquemaPacientePorId,
      request.params,
      reply,
    );
    const datos = validadorEsquemas(
      esquemaActualizarPaciente,
      request.body,
      reply,
    );

    const pacienteActualizado = await this.pacienteServicio.actualizarPaciente(
      idPaciente,
      datos,
    );

    const statusCode = pacienteActualizado ? 200 : 404;
    const mensaje = pacienteActualizado
      ? Mensajes["200_PUT_OK"]
      : `${Mensajes["404_NOT_FOUND"]} ${idPaciente}`;
    return reply.status(statusCode).send({
      mensaje,
      data: pacienteActualizado,
    });
  }

  // DELETE /pacientes/:id - Eliminar un paciente
  async eliminarPaciente(request: FastifyRequest, reply: FastifyReply) {
    const { id: idPaciente } = validadorEsquemas(
      esquemaPacientePorId,
      request.params,
      reply,
    );

    const eliminado = await this.pacienteServicio.eliminarPaciente(idPaciente);

    const statusCode = eliminado ? 200 : 404;
    const mensaje = eliminado
      ? Mensajes["200_DELETE_OK"]
      : `${Mensajes["404_NOT_FOUND"]} ${idPaciente}`;
    return reply.status(statusCode).send({ mensaje });
  }
}
