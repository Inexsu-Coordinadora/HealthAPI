import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ConsultorioControlador } from "../controladores/ConsultorioControlador.js";
import { ConsultorioServicio } from "../../core/aplicacion/casos-uso-consultorio/ConsultorioServicio.js";
import { ConsultorioRepositorioPostgres } from "../../core/infraestructura/consultorio/ConsultorioRepository.js";

export async function consultorioRutas(fastify: FastifyInstance) {
    const consultorioRepositorio = new ConsultorioRepositorioPostgres();
    const consultorioServicio = new ConsultorioServicio(consultorioRepositorio);
    const consultorioControlador = new ConsultorioControlador(
        consultorioServicio
    );

    fastify.post(
        "/consultorios",
        {
            schema: {
                tags: ["Consultorios"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return consultorioControlador.crearConsultorio(request, reply);
        }
    );

    fastify.get(
        "/consultorios/:id",
        {
            schema: {
                tags: ["Consultorios"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return consultorioControlador.obtenerConsultorioPorId(
                request,
                reply
            );
        }
    );

    fastify.get(
        "/consultorios",
        {
            schema: {
                tags: ["Consultorios"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return consultorioControlador.listarConsultorios(reply);
        }
    );

    fastify.put(
        "/consultorios/:id",
        {
            schema: {
                tags: ["Consultorios"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return consultorioControlador.actualizarConsultorio(request, reply);
        }
    );

    fastify.delete(
        "/consultorios/:id",
        {
            schema: {
                tags: ["Consultorios"],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return consultorioControlador.eliminarConsultorio(request, reply);
        }
    );
}
