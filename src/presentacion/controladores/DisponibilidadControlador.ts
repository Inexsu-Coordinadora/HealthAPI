import type { FastifyRequest, FastifyReply } from "fastify";
import * as z from "zod";
import { DisponibilidadServicio } from "../../core/aplicacion/casos-uso-disponibilidad/DisponibilidadServicio.js";
import type { IDisponibilidad } from "../../core/dominio/disponibilidad/IDisponibilidad.js";
import {
    esquemaDisponibilidadPorId,
    esquemaActualizarDisponibilidad,
    crearDisponibilidadConValidacionRepositorios,
} from "../esquemas/DisponibilidadEsquemas.js";
import { validadorEsquemas } from "../esquemas/ValidadorZod.js";
import { MedicoRepositorioPostgres } from "../../core/infraestructura/medico/MedicoRepository.js";
import { ConsultorioRepositorioPostgres } from "../../core/infraestructura/consultorio/ConsultorioRepository.js";

enum Mensajes {
    "200_POST_OK" = "Disponibilidad creada exitosamente",
    "200_GET_OK" = "Disponibilidad obtenida exitosamente",
    "200_GET_ALL_OK" = "Lista de disponibilidades obtenida exitosamente",
    "200_PUT_OK" = "Disponibilidad actualizada exitosamente",
    "200_DELETE_OK" = "Disponibilidad eliminada exitosamente",
    "404_NOT_FOUND" = "No se encontró una disponibilidad con el ID",
}

export class DisponibilidadControlador {
    constructor(
        private readonly disponibilidadServicio: DisponibilidadServicio
    ) {}

    async crearDisponibilidad(request: FastifyRequest, reply: FastifyReply) {
        try {
            const medicoRepo = new MedicoRepositorioPostgres();
            const consultorioRepo = new ConsultorioRepositorioPostgres();
            const esquemaConValidaciones =
                crearDisponibilidadConValidacionRepositorios(
                    medicoRepo,
                    consultorioRepo
                );

            const disponibilidadValidada =
                await esquemaConValidaciones.parseAsync(request.body);

            const disponibilidadCreada =
                await this.disponibilidadServicio.crearDisponibilidad(
                    disponibilidadValidada as Omit<
                        IDisponibilidad,
                        "idDisponibilidad"
                    >
                );

            return reply.status(201).send({
                mensaje: Mensajes["200_POST_OK"],
                data: disponibilidadCreada,
            });
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                // Detectar si es error de recurso inexistente (404)
                const errorMedicoInexistente = error.issues.find(
                    (issue) =>
                        issue.path.includes("idMedico") &&
                        issue.message.includes("No se encontró")
                );
                const errorConsultorioInexistente = error.issues.find(
                    (issue) =>
                        issue.path.includes("idConsultorio") &&
                        issue.message.includes("No se encontró")
                );

                if (errorMedicoInexistente || errorConsultorioInexistente) {
                    return reply.status(404).send({
                        error: "Recurso inexistente",
                        mensaje: error.issues
                            .map((issue) => issue.message)
                            .join(". "),
                    });
                }

                return reply.status(400).send({
                    error: "Datos inválidos",
                    mensaje: error.issues
                        .map((issue) => issue.message)
                        .join(". "),
                });
            }

            if (
                error instanceof Error &&
                error.message.includes("Ya existe una disponibilidad idéntica")
            ) {
                return reply.status(409).send({
                    error: "Asignación duplicada",
                    mensaje: error.message,
                });
            }

            const errorMessage =
                error instanceof Error ? error.message : "Error desconocido";
            return reply.status(500).send({
                error: "Error del servidor",
                mensaje: errorMessage,
            });
        }
    }

    async listarDisponibilidades(reply: FastifyReply) {
        const disponibilidades =
            await this.disponibilidadServicio.listarDisponibilidades();

        return reply.status(200).send({
            mensaje: Mensajes["200_GET_ALL_OK"],
            data: disponibilidades,
            total: disponibilidades.length,
        });
    }

    async obtenerDisponibilidadPorId(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        const { id: idDisponibilidad } = validadorEsquemas(
            esquemaDisponibilidadPorId,
            request.params,
            reply
        );

        const disponibilidad =
            await this.disponibilidadServicio.obtenerDisponibilidadPorId(
                idDisponibilidad
            );

        const statusCode = disponibilidad ? 200 : 404;
        const mensaje = disponibilidad
            ? Mensajes["200_GET_OK"]
            : `${Mensajes["404_NOT_FOUND"]} ${idDisponibilidad}`;
        return reply.status(statusCode).send({
            mensaje,
            data: disponibilidad,
        });
    }

    async obtenerDisponibilidadesPorMedico(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        const { idMedico } = request.params as { idMedico: string };
        const id = parseInt(idMedico, 10);

        const disponibilidades =
            await this.disponibilidadServicio.obtenerDisponibilidadesPorMedico(
                id
            );

        return reply.status(200).send({
            mensaje: "Disponibilidades del médico obtenidas exitosamente",
            data: disponibilidades,
            total: disponibilidades.length,
        });
    }

    async obtenerDisponibilidadesPorConsultorio(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        const { idConsultorio } = request.params as { idConsultorio: string };
        const id = parseInt(idConsultorio, 10);

        const disponibilidades =
            await this.disponibilidadServicio.obtenerDisponibilidadesPorConsultorio(
                id
            );

        return reply.status(200).send({
            mensaje: "Disponibilidades del consultorio obtenidas exitosamente",
            data: disponibilidades,
            total: disponibilidades.length,
        });
    }

    async actualizarDisponibilidad(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        const { id: idDisponibilidad } = validadorEsquemas(
            esquemaDisponibilidadPorId,
            request.params,
            reply
        );
        const datos = validadorEsquemas(
            esquemaActualizarDisponibilidad,
            request.body,
            reply
        );

        const disponibilidadActualizada =
            await this.disponibilidadServicio.actualizarDisponibilidad(
                idDisponibilidad,
                datos as Partial<IDisponibilidad>
            );

        const statusCode = disponibilidadActualizada ? 200 : 404;
        const mensaje = disponibilidadActualizada
            ? Mensajes["200_PUT_OK"]
            : `${Mensajes["404_NOT_FOUND"]} ${idDisponibilidad}`;
        return reply.status(statusCode).send({
            mensaje,
            data: disponibilidadActualizada,
        });
    }

    async eliminarDisponibilidad(request: FastifyRequest, reply: FastifyReply) {
        const { id: idDisponibilidad } = validadorEsquemas(
            esquemaDisponibilidadPorId,
            request.params,
            reply
        );

        const eliminado =
            await this.disponibilidadServicio.eliminarDisponibilidad(
                idDisponibilidad
            );

        const statusCode = eliminado ? 200 : 404;
        const mensaje = eliminado
            ? Mensajes["200_DELETE_OK"]
            : `${Mensajes["404_NOT_FOUND"]} ${idDisponibilidad}`;
        return reply.status(statusCode).send({ mensaje });
    }
}
