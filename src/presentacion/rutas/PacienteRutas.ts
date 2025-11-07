import type { FastifyInstance } from "fastify";
import { PacienteControlador } from "../controladores/PacienteControlador.js";
import { PacienteServicio } from "../../core/aplicacion/casos-uso-paciente/PacienteServicio.js";
import { PacienteRepositorioPostgres } from "../../core/infraestructura/paciente/PacienteRepository.js";

export async function pacienteRutas(fastify: FastifyInstance) {
    const pacienteRepositorio = new PacienteRepositorioPostgres();
    const pacienteServicio = new PacienteServicio(pacienteRepositorio);
    const pacienteControlador = new PacienteControlador(pacienteServicio);

    fastify.post("/pacientes", async (request, reply) => {
        return pacienteControlador.crearPaciente(request, reply);
    });

    fastify.get("/pacientes/:id", async (request, reply) => {
        return pacienteControlador.obtenerPacientePorId(request, reply);
    });

    fastify.get("/pacientes", async (request, reply) => {
        return pacienteControlador.listarPacientes(request, reply);
    });

    fastify.put("/pacientes/:id", async (request, reply) => {
        return pacienteControlador.actualizarPaciente(request, reply);
    });

    fastify.delete("/pacientes/:id", async (request, reply) => {
        return pacienteControlador.eliminarPaciente(request, reply);
    });
}
