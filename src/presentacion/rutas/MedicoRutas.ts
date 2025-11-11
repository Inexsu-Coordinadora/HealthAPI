import type { FastifyInstance } from "fastify";
import { MedicoControlador } from "../controladores/MedicoControlador.js";
import { MedicoServicio } from "../../core/aplicacion/casos-uso-medico/MedicoServicio.js";
import { MedicoRepositorioPostgres } from "../../core/infraestructura/medico/MedicoRepository.js";

export async function medicoRutas(fastify: FastifyInstance) {
    const medicoRepositorio = new MedicoRepositorioPostgres();
    const medicoServicio = new MedicoServicio(medicoRepositorio);
    const medicoControlador = new MedicoControlador(medicoServicio);

    fastify.post("/medicos", async (request, reply) => {
        return medicoControlador.crearMedico(request, reply);
    });

    fastify.get("/medicos/:id", async (request, reply) => {
        return medicoControlador.obtenerMedicoPorId(request, reply);
    });

    fastify.get("/medicos", async (request, reply) => {
        return medicoControlador.listarMedicos(request, reply);
    });

    fastify.put("/medicos/:id", async (request, reply) => {
        return medicoControlador.actualizarMedico(request, reply);
    });

    fastify.delete("/medicos/:id", async (request, reply) => {
        return medicoControlador.eliminarMedico(request, reply);
    });
}
