import type { FastifyRequest, FastifyReply } from "fastify";
import { PacienteServicio } from "../../core/aplicacion/casos-uso-paciente/PacienteServicio.js";
import { esquemaCrearPaciente } from "../esquemas/PacienteEsquemas.js";
import { validadorEsquemas } from "../esquemas/Validador.js";

enum Mensajes {
  "200_POST_OK" = "Paciente creado exitosamente",
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
}
