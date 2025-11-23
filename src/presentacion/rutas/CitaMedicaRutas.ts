import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { CitaControlador } from "../controladores/CitaMedicaControlador.js";
import { CitaMedicaServicio } from "../../core/aplicacion/casos-uso-cita/CitaMedicaServicio.js";
import { CitaMedicaRepositorioPostgres } from "../../core/infraestructura/cita/CitaMedicaRepository.js";
import { DisponibilidadRepositorioPostgres } from "../../core/infraestructura/disponibilidad/DisponibilidadRepository.js";
import { PacienteRepositorioPostgres } from "../../core/infraestructura/paciente/PacienteRepository.js";

export async function citaRutas(fastify: FastifyInstance) {
    const citaRepositorio = new CitaMedicaRepositorioPostgres();
    const disponibilidadRepositorio = new DisponibilidadRepositorioPostgres();
    const pacienteRepositorio = new PacienteRepositorioPostgres();
    const citaServicio = new CitaMedicaServicio(
        citaRepositorio,
        disponibilidadRepositorio,
        pacienteRepositorio
    );
    const citaControlador = new CitaControlador(citaServicio);

    fastify.post(
        "/citas",
        {
            schema: {
                tags: ["Citas"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return citaControlador.crearCita(request, reply);
        }
    );

    fastify.get(
        "/citas/:id",
        {
            schema: {
                tags: ["Citas"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return citaControlador.obtenerCitaPorId(request, reply);
        }
    );

    fastify.get(
        "/citas",
        {
            schema: {
                tags: ["Citas"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return citaControlador.listarCitas(reply);
        }
    );

    fastify.put(
        "/citas/:id",
        {
            schema: {
                tags: ["Citas"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return citaControlador.actualizarCita(request, reply);
        }
    );

    fastify.delete(
        "/citas/:id",
        {
            schema: {
                tags: ["Citas"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return citaControlador.eliminarCita(request, reply);
        }
    );

    fastify.post(
        "/citas/agendar",
        {
            schema: {
                tags: ["Citas"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return citaControlador.crearCita(request, reply);
        }
    );
    fastify.get(
        "/pacientes/:idPaciente/citas",
        {
            schema: {
                tags: ["Citas"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return citaControlador.consultarCitasPorPaciente(request, reply);
        }
    );
}
