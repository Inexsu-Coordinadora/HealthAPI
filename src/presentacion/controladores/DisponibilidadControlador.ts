import type { FastifyRequest, FastifyReply } from "fastify";
import { DisponibilidadServicio } from "../../core/aplicacion/casos-uso-disponibilidad/DisponibilidadServicio.js";
import { validarCrearDisponibilidad, validarActualizarDisponibilidad } from "../esquemas/DisponibilidadEsquemas.js";

export class DisponibilidadControlador {
    constructor(private readonly disponibilidadServicio: DisponibilidadServicio) {}

    async crearDisponibilidad(request: FastifyRequest, reply: FastifyReply) {
        try {
            const validacion = validarCrearDisponibilidad(request.body);

            if (!validacion.valido) {
                return reply.status(400).send({
                    error: "Datos inválidos",
                    detalles: validacion.errores,
                });
            }

            const datos: any = request.body;
            const disponibilidadCreada = await this.disponibilidadServicio.crearDisponibilidad({
                idMedico: datos.idMedico,
                idConsultorio: datos.idConsultorio ?? null,
                diaSemana: datos.diaSemana,
                horaInicio: datos.horaInicio,
                horaFin: datos.horaFin,
            });

            return reply.status(201).send({
                mensaje: "Disponibilidad creada exitosamente",
                data: disponibilidadCreada,
            });
        } catch (error: any) {
            // Error: Disponibilidad duplicada
            if (error.message.includes("Ya existe una disponibilidad idéntica")) {
                return reply.status(409).send({
                    error: "Disponibilidad duplicada",
                    mensaje: error.message,
                });
            }

            return reply.status(500).send({
                error: "Error al crear la disponibilidad",
                mensaje: error.message,
            });
        }
    }

    async listarDisponibilidades(request: FastifyRequest, reply: FastifyReply) {
        try {
            const disponibilidades = await this.disponibilidadServicio.listarDisponibilidades();

            return reply.status(200).send({
                mensaje: "Lista de disponibilidades obtenida exitosamente",
                data: disponibilidades,
                total: disponibilidades.length,
            });
        } catch (error: any) {
            return reply.status(500).send({
                error: "Error al obtener la lista de disponibilidades",
                mensaje: error.message,
            });
        }
    }

    async obtenerDisponibilidadPorId(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const idDisponibilidad = parseInt(id, 10);

            if (isNaN(idDisponibilidad)) {
                return reply.status(400).send({
                    error: "ID inválido",
                    mensaje: "El ID debe ser un número válido",
                });
            }

            const disponibilidad = await this.disponibilidadServicio.obtenerDisponibilidadPorId(idDisponibilidad);

            return reply.status(200).send({
                mensaje: "Disponibilidad obtenida exitosamente",
                data: disponibilidad,
            });
        } catch (error: any) {
            if (error.message.includes("No se encontró")) {
                return reply.status(404).send({
                    error: "Disponibilidad no encontrada",
                    mensaje: error.message,
                });
            }

            return reply.status(500).send({
                error: "Error al obtener la disponibilidad",
                mensaje: error.message,
            });
        }
    }

    async obtenerDisponibilidadesPorMedico(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { idMedico } = request.params as { idMedico: string };
            const id = parseInt(idMedico, 10);

            if (isNaN(id)) {
                return reply.status(400).send({
                    error: "ID inválido",
                    mensaje: "El ID del médico debe ser un número válido",
                });
            }

            const disponibilidades = await this.disponibilidadServicio.obtenerDisponibilidadesPorMedico(id);

            return reply.status(200).send({
                mensaje: "Disponibilidades del médico obtenidas exitosamente",
                data: disponibilidades,
                total: disponibilidades.length,
            });
        } catch (error: any) {
            return reply.status(500).send({
                error: "Error al obtener las disponibilidades del médico",
                mensaje: error.message,
            });
        }
    }

    async obtenerDisponibilidadesPorConsultorio(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { idConsultorio } = request.params as { idConsultorio: string };
            const id = parseInt(idConsultorio, 10);

            if (isNaN(id)) {
                return reply.status(400).send({
                    error: "ID inválido",
                    mensaje: "El ID del consultorio debe ser un número válido",
                });
            }

            const disponibilidades = await this.disponibilidadServicio.obtenerDisponibilidadesPorConsultorio(id);

            return reply.status(200).send({
                mensaje: "Disponibilidades del consultorio obtenidas exitosamente",
                data: disponibilidades,
                total: disponibilidades.length,
            });
        } catch (error: any) {
            return reply.status(500).send({
                error: "Error al obtener las disponibilidades del consultorio",
                mensaje: error.message,
            });
        }
    }

    async actualizarDisponibilidad(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const idDisponibilidad = parseInt(id, 10);

            if (isNaN(idDisponibilidad)) {
                return reply.status(400).send({
                    error: "ID inválido",
                    mensaje: "El ID debe ser un número válido",
                });
            }

            const validacion = validarActualizarDisponibilidad(request.body);

            if (!validacion.valido) {
                return reply.status(400).send({
                    error: "Datos inválidos",
                    detalles: validacion.errores,
                });
            }

            const datos: any = request.body;
            const disponibilidadActualizada = await this.disponibilidadServicio.actualizarDisponibilidad(
                idDisponibilidad,
                datos
            );

            return reply.status(200).send({
                mensaje: "Disponibilidad actualizada exitosamente",
                data: disponibilidadActualizada,
            });
        } catch (error: any) {
            if (error.message.includes("No se encontró")) {
                return reply.status(404).send({
                    error: "Disponibilidad no encontrada",
                    mensaje: error.message,
                });
            }

            return reply.status(500).send({
                error: "Error al actualizar la disponibilidad",
                mensaje: error.message,
            });
        }
    }

    async eliminarDisponibilidad(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const idDisponibilidad = parseInt(id, 10);

            if (isNaN(idDisponibilidad)) {
                return reply.status(400).send({
                    error: "ID inválido",
                    mensaje: "El ID debe ser un número válido",
                });
            }

            const eliminado = await this.disponibilidadServicio.eliminarDisponibilidad(idDisponibilidad);

            if (eliminado) {
                return reply.status(200).send({
                    mensaje: "Disponibilidad eliminada exitosamente",
                });
            } else {
                return reply.status(404).send({
                    error: "Disponibilidad no encontrada",
                    mensaje: `No se encontró una disponibilidad con el ID ${idDisponibilidad}`,
                });
            }
        } catch (error: any) {
            if (error.message.includes("No se encontró")) {
                return reply.status(404).send({
                    error: "Disponibilidad no encontrada",
                    mensaje: error.message,
                });
            }

            return reply.status(500).send({
                error: "Error al eliminar la disponibilidad",
                mensaje: error.message,
            });
        }
    }
}