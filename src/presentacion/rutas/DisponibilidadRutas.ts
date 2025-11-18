import type { FastifyInstance } from "fastify";
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

    fastify.post("/disponibilidades", async (request, reply) => {
        return disponibilidadControlador.crearDisponibilidad(request, reply);
    });

    fastify.get("/disponibilidades/:id", async (request, reply) => {
        return disponibilidadControlador.obtenerDisponibilidadPorId(
            request,
            reply
        );
    });

    fastify.get("/disponibilidades", async (request, reply) => {
        return disponibilidadControlador.listarDisponibilidades(reply);
    });

    fastify.put("/disponibilidades/:id", async (request, reply) => {
        return disponibilidadControlador.actualizarDisponibilidad(
            request,
            reply
        );
    });

    fastify.delete("/disponibilidades/:id", async (request, reply) => {
        return disponibilidadControlador.eliminarDisponibilidad(request, reply);
    });

    // Endpoints específicos por relaciones
    fastify.get(
        "/medicos/:idMedico/disponibilidades",
        async (request, reply) => {
            return disponibilidadControlador.obtenerDisponibilidadesPorMedico(
                request,
                reply
            );
        }
    );

    fastify.get(
        "/consultorios/:idConsultorio/disponibilidades",
        async (request, reply) => {
            return disponibilidadControlador.obtenerDisponibilidadesPorConsultorio(
                request,
                reply
            );
        }
    );
}
