import type { FastifyInstance } from "fastify";
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
    

    fastify.post("/citas", async (request, reply) => {
        return citaControlador.crearCita(request, reply);
    });

    fastify.get("/citas/:id", async (request, reply) => {
        return citaControlador.obtenerCitaPorId(request, reply);
    });

    fastify.get("/citas", async (request, reply) => {
        return citaControlador.listarCitas(reply);
    });

    fastify.put("/citas/:id", async (request, reply) => {
        return citaControlador.actualizarCita(request, reply);
    });

    fastify.delete("/citas/:id", async (request, reply) => {
        return citaControlador.eliminarCita(request, reply);
    });

    fastify.get("/pacientes/:idPaciente/citas", async (request, reply) => {
        return citaControlador.consultarCitasPorPaciente(request, reply);
    });
}
