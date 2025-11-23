import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { DisponibilidadControlador } from "../controladores/DisponibilidadControlador.js";
import { DisponibilidadServicio } from "../../core/aplicacion/casos-uso-disponibilidad/DisponibilidadServicio.js";
import { DisponibilidadRepositorioPostgres } from "../../core/infraestructura/disponibilidad/DisponibilidadRepository.js";

export async function disponibilidadRutas(fastify: FastifyInstance) {
    const disponibilidadRepositorio = new DisponibilidadRepositorioPostgres();
    const disponibilidadServicio = new DisponibilidadServicio(
        disponibilidadRepositorio
    );
    const disponibilidadControlador = new DisponibilidadControlador(
        disponibilidadServicio
    );

    fastify.post(
        "/disponibilidades",
        {
            schema: {
                tags: ["Disponibilidad"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return disponibilidadControlador.crearDisponibilidad(
                request,
                reply
            );
        }
    );

    fastify.get(
        "/disponibilidades/:id",
        {
            schema: {
                tags: ["Disponibilidad"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return disponibilidadControlador.obtenerDisponibilidadPorId(
                request,
                reply
            );
        }
    );

    fastify.get(
        "/disponibilidades",
        {
            schema: {
                tags: ["Disponibilidad"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return disponibilidadControlador.listarDisponibilidades(reply);
        }
    );

    fastify.put(
        "/disponibilidades/:id",
        {
            schema: {
                tags: ["Disponibilidad"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return disponibilidadControlador.actualizarDisponibilidad(
                request,
                reply
            );
        }
    );

    fastify.delete(
        "/disponibilidades/:id",
        {
            schema: {
                tags: ["Disponibilidad"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return disponibilidadControlador.eliminarDisponibilidad(
                request,
                reply
            );
        }
    );

    // Endpoints específicos por relaciones
    fastify.get(
        "/disponibilidades/medico/:idMedico",
        {
            schema: {
                tags: ["Disponibilidad"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return disponibilidadControlador.obtenerDisponibilidadesPorMedico(
                request,
                reply
            );
        }
    );

    fastify.get(
        "/disponibilidades/consultorio/:idConsultorio",
        {
            schema: {
                tags: ["Disponibilidad"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return disponibilidadControlador.obtenerDisponibilidadesPorConsultorio(
                request,
                reply
            );
        }
    );
}
