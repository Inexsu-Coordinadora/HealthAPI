import type { FastifyInstance } from 'fastify';
import { CitaControlador } from '../controladores/CitaMedicaControlador.js';
import { CitaMedicaServicio } from '../../core/aplicacion/casos-uso-cita/CitaMedicaServicio.js';
import { CitaMedicaRepositorioPostgres } from '../../core/infraestructura/cita/CitaMedicaRepository.js';
export async function citaRutas(fastify: FastifyInstance) {
  // 🔹 Crear instancias (inyección de dependencias)
  const citaRepositorio = new CitaMedicaRepositorioPostgres();
  const citaServicio = new CitaMedicaServicio(citaRepositorio);
  const citaControlador = new CitaControlador(citaServicio);

  // 🟢 Crear cita
  fastify.post('/citas', async (request, reply) => {
    return citaControlador.crearCita(request, reply);
  });

  // 🔵 Listar todas las citas
  fastify.get('/citas', async (request, reply) => {
    return citaControlador.listarCitas(request, reply);
  });

  // 🟡 Obtener una cita por ID
  fastify.get('/citas/:id', async (request, reply) => {
    return citaControlador.obtenerCitaPorId(request, reply);
  });

  // 🟠 Actualizar una cita
  fastify.put('/citas/:id', async (request, reply) => {
    return citaControlador.actualizarCita(request, reply);
  });

  // 🔴 Eliminar una cita
  fastify.delete('/citas/:id', async (request, reply) => {
    return citaControlador.eliminarCita(request, reply);
  });
}
