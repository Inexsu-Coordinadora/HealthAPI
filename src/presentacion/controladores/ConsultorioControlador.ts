import type { FastifyRequest, FastifyReply } from "fastify";
import { ConsultorioServicio } from "../../core/aplicacion/casos-uso-consultorio/ConsultorioServicio.js";
import { validarCrearConsultorio, validarActualizarConsultorio } from "../esquemas/ConsultorioEsquemas.js";

export class ConsultorioControlador {
    constructor(private readonly consultorioServicio: ConsultorioServicio) {}

    async crearConsultorio(request: FastifyRequest, reply: FastifyReply) {
        try {
            const validacion = validarCrearConsultorio(request.body);

            if (!validacion.valido) {
                return reply.status(400).send({
                    error: "Datos inválidos",
                    detalles: validacion.errores,
                });
            }

            const datos: any = request.body;
            const consultorioCreado = await this.consultorioServicio.crearConsultorio({
                nombreConsultorio: datos.nombreConsultorio,
                ubicacionConsultorio: datos.ubicacionConsultorio,
                capacidadConsultorio: datos.capacidadConsultorio,
            });

            return reply.status(201).send({
                mensaje: "Consultorio creado exitosamente",
                data: consultorioCreado,
            });
        } catch (error: any) {
            return reply.status(500).send({
                error: "Error al crear el consultorio",
                mensaje: error.message,
            });
        }
    }

    async listarConsultorios(request: FastifyRequest, reply: FastifyReply) {
        try {
            const consultorios = await this.consultorioServicio.listarConsultorios();

            return reply.status(200).send({
                mensaje: "Lista de consultorios obtenida exitosamente",
                data: consultorios,
                total: consultorios.length,
            });
        } catch (error: any) {
            return reply.status(500).send({
                error: "Error al obtener la lista de consultorios",
                mensaje: error.message,
            });
        }
    }

    async obtenerConsultorioPorId(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const idConsultorio = parseInt(id, 10);

            if (isNaN(idConsultorio)) {
                return reply.status(400).send({
                    error: "ID inválido",
                    mensaje: "El ID debe ser un número válido",
                });
            }

            const consultorio = await this.consultorioServicio.obtenerConsultorioPorId(idConsultorio);

            return reply.status(200).send({
                mensaje: "Consultorio obtenido exitosamente",
                data: consultorio,
            });
        } catch (error: any) {
            if (error.message.includes("No se encontró")) {
                return reply.status(404).send({
                    error: "Consultorio no encontrado",
                    mensaje: error.message,
                });
            }

            return reply.status(500).send({
                error: "Error al obtener el consultorio",
                mensaje: error.message,
            });
        }
    }

    async actualizarConsultorio(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const idConsultorio = parseInt(id, 10);

            if (isNaN(idConsultorio)) {
                return reply.status(400).send({
                    error: "ID inválido",
                    mensaje: "El ID debe ser un número válido",
                });
            }

            const validacion = validarActualizarConsultorio(request.body);

            if (!validacion.valido) {
                return reply.status(400).send({
                    error: "Datos inválidos",
                    detalles: validacion.errores,
                });
            }

            const datos: any = request.body;
            const consultorioActualizado = await this.consultorioServicio.actualizarConsultorio(idConsultorio, datos);

            return reply.status(200).send({
                mensaje: "Consultorio actualizado exitosamente",
                data: consultorioActualizado,
            });
        } catch (error: any) {
            if (error.message.includes("No se encontró")) {
                return reply.status(404).send({
                    error: "Consultorio no encontrado",
                    mensaje: error.message,
                });
            }

            return reply.status(500).send({
                error: "Error al actualizar el consultorio",
                mensaje: error.message,
            });
        }
    }

    async eliminarConsultorio(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const idConsultorio = parseInt(id, 10);

            if (isNaN(idConsultorio)) {
                return reply.status(400).send({
                    error: "ID inválido",
                    mensaje: "El ID debe ser un número válido",
                });
            }

            const eliminado = await this.consultorioServicio.eliminarConsultorio(idConsultorio);

            if (eliminado) {
                return reply.status(200).send({
                    mensaje: "Consultorio eliminado exitosamente",
                });
            } else {
                return reply.status(404).send({
                    error: "Consultorio no encontrado",
                    mensaje: `No se encontró un consultorio con el ID ${idConsultorio}`,
                });
            }
        } catch (error: any) {
            if (error.message.includes("No se encontró")) {
                return reply.status(404).send({
                    error: "Consultorio no encontrado",
                    mensaje: error.message,
                });
            }

            return reply.status(500).send({
                error: "Error al eliminar el consultorio",
                mensaje: error.message,
            });
        }
    }
}