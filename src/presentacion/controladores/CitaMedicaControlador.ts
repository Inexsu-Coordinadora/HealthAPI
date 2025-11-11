import type { FastifyRequest, FastifyReply } from "fastify";
import * as z from "zod";
import { CitaMedicaServicio } from "../../core/aplicacion/casos-uso-cita/CitaMedicaServicio.js";
import type { ICitaMedica } from "../../core/dominio/citaMedica/ICitaMedica.js";
import {
    esquemaCrearCita,
    esquemaCitaPorId,
    esquemaActualizarCita,
    crearCitaConValidacionRepositorios,
} from "../esquemas/CitaMedicaEsquemas.js";
import { validadorEsquemas } from "../esquemas/Validador.js";
import { PacienteRepositorioPostgres } from "../../core/infraestructura/paciente/PacienteRepository.js";
import { DisponibilidadRepositorioPostgres } from "../../core/infraestructura/disponibilidad/DisponibilidadRepository.js";

enum Mensajes {
    "200_POST_OK" = "Cita médica creada exitosamente",
    "200_GET_OK" = "Cita médica obtenida exitosamente",
    "200_GET_ALL_OK" = "Lista de citas obtenida exitosamente",
    "200_PUT_OK" = "Cita médica actualizada exitosamente",
    "200_DELETE_OK" = "Cita médica eliminada exitosamente",
    "404_NOT_FOUND" = "No se encontró una cita con el ID",
}

export class CitaControlador {
    constructor(private readonly citaServicio: CitaMedicaServicio) {}

    async crearCita(request: FastifyRequest, reply: FastifyReply) {
        try {
            const pacienteRepo = new PacienteRepositorioPostgres();
            const disponibilidadRepo = new DisponibilidadRepositorioPostgres();
            const esquemaConValidaciones = crearCitaConValidacionRepositorios(
                pacienteRepo,
                disponibilidadRepo
            );

            const citaValidada = await esquemaConValidaciones.parseAsync(
                request.body
            );

            const citaCreada = await this.citaServicio.CrearCitaMedica(
                citaValidada as Omit<ICitaMedica, "idCita">
            );

            return reply.status(201).send({
                mensaje: Mensajes["200_POST_OK"],
                data: citaCreada,
            });
        } catch (error: any) {
            if (error.name === "ZodError") {
                return reply.status(400).send({
                    error: "Datos inválidos",
                    detalles: error.errors.map((e: z.ZodIssue) => e.message),
                });
            }

            // Error de duplicado desde el servicio
            if (error.message.includes("Ya existe")) {
                return reply.status(409).send({
                    error: "Conflicto",
                    mensaje: error.message,
                });
            }

            return reply.status(500).send({
                error: "Error al crear la cita médica",
                mensaje: error.message,
            });
        }
    }

    async listarCitas(request: FastifyRequest, reply: FastifyReply) {
        const citas = await this.citaServicio.listarCitas();

        return reply.status(200).send({
            mensaje: Mensajes["200_GET_ALL_OK"],
            data: citas,
            total: citas.length,
        });
    }

    async obtenerCitaPorId(request: FastifyRequest, reply: FastifyReply) {
        const { id: idCita } = validadorEsquemas(
            esquemaCitaPorId,
            request.params,
            reply
        );

        const cita = await this.citaServicio.obtenerCitaMedicaPorId(idCita);

        const statusCode = cita ? 200 : 404;
        const mensaje = cita
            ? Mensajes["200_GET_OK"]
            : `${Mensajes["404_NOT_FOUND"]} ${idCita}`;
        return reply.status(statusCode).send({
            mensaje,
            data: cita,
        });
    }

    async actualizarCita(request: FastifyRequest, reply: FastifyReply) {
        const { id: idCita } = validadorEsquemas(
            esquemaCitaPorId,
            request.params,
            reply
        );
        const datos = validadorEsquemas(
            esquemaActualizarCita,
            request.body,
            reply
        );

        const citaActualizada = await this.citaServicio.actualizarCita(
            idCita,
            datos as Partial<ICitaMedica>
        );

        const statusCode = citaActualizada ? 200 : 404;
        const mensaje = citaActualizada
            ? Mensajes["200_PUT_OK"]
            : `${Mensajes["404_NOT_FOUND"]} ${idCita}`;
        return reply.status(statusCode).send({
            mensaje,
            data: citaActualizada,
        });
    }

    async eliminarCita(request: FastifyRequest, reply: FastifyReply) {
        const { id: idCita } = validadorEsquemas(
            esquemaCitaPorId,
            request.params,
            reply
        );

        const eliminado = await this.citaServicio.eliminarCitaMedica(idCita);

        const statusCode = eliminado ? 200 : 404;
        const mensaje = eliminado
            ? Mensajes["200_DELETE_OK"]
            : `${Mensajes["404_NOT_FOUND"]} ${idCita}`;
        return reply.status(statusCode).send({ mensaje });
    }
}
