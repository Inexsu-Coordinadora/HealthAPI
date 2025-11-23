import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PacienteControlador } from "../controladores/PacienteControlador.js";
import { PacienteServicio } from "../../core/aplicacion/casos-uso-paciente/PacienteServicio.js";
import { PacienteRepositorioPostgres } from "../../core/infraestructura/paciente/PacienteRepository.js";

export async function pacienteRutas(fastify: FastifyInstance) {
    const pacienteRepositorio = new PacienteRepositorioPostgres();
    const pacienteServicio = new PacienteServicio(pacienteRepositorio);
    const pacienteControlador = new PacienteControlador(pacienteServicio);

    fastify.post(
        "/pacientes",
        {
            schema: {
                tags: ["Pacientes"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return pacienteControlador.crearPaciente(request, reply);
        }
    );

    fastify.get(
        "/pacientes/:id",
        {
            schema: {
                tags: ["Pacientes"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return pacienteControlador.obtenerPacientePorId(request, reply);
        }
    );

    fastify.get(
        "/pacientes",
        {
            schema: {
                tags: ["Pacientes"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return pacienteControlador.listarPacientes(reply);
        }
    );

    fastify.put(
        "/pacientes/:id",
        {
            schema: {
                tags: ["Pacientes"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return pacienteControlador.actualizarPaciente(request, reply);
        }
    );

    fastify.delete(
        "/pacientes/:id",
        {
            schema: {
                tags: ["Pacientes"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return pacienteControlador.eliminarPaciente(request, reply);
        }
    );
}
