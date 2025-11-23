import type { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { CitaMedicaServicio } from "../../core/aplicacion/casos-uso-cita/CitaMedicaServicio.js";
import type { ICitaMedica } from "../../core/dominio/citaMedica/ICitaMedica.js";
import { FechaUtil } from "../../common/utilidades/FormatoFecha.js"; 
import {
    esquemaCitaPorId,
    esquemaActualizarCita,
    esquemaCrearCita,
} from "../esquemas/CitaMedicaEsquemas.js";
import { validadorEsquemas } from "../esquemas/ValidadorZod.js";
import {
    PacienteNoExisteError,
    DisponibilidadNoExisteError,
    TraslapePacienteError,
    FechaDisponibilidadInvalidaError,
    FechaInvalidaError,
} from "../../core/aplicacion/casos-uso-cita/CitaMedicaServicio.js";

// Enum para mensajes consistentes
enum Mensajes {
    CITA_CREADA = "Cita médica creada exitosamente",
    CITA_OBTENIDA = "Cita médica obtenida exitosamente",
    CITAS_LISTADAS = "Lista de citas obtenida exitosamente",
    CITA_ACTUALIZADA = "Cita médica actualizada exitosamente",
    CITA_ELIMINADA = "Cita médica eliminada exitosamente",
    CITA_NO_ENCONTRADA = "No se encontró una cita con el ID",
    CITAS_PACIENTE_OBTENIDAS = "Citas del paciente obtenidas exitosamente",
    PACIENTE_SIN_CITAS = "El paciente no tiene citas registradas",
}

export class CitaControlador {
    constructor(private readonly citaServicio: CitaMedicaServicio) {}

    /**
     * CREAR UNA NUEVA CITA MÉDICA
     */
    async crearCita(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            // Validar datos con Zod
            const citaValidada = validadorEsquemas(esquemaCrearCita, request.body, reply);

            const citaCreada = await this.citaServicio.CrearCitaMedica(
                citaValidada as Omit<ICitaMedica, "idCita">
            );

            // Serializar fecha en formato ISO para el cliente
            reply.status(201).send({
                mensaje: Mensajes.CITA_CREADA,
                data: {
                    ...citaCreada,
                    fecha: FechaUtil.toISO(citaCreada.fecha),
                    fechaLegible: FechaUtil.formatearParaMostrar(citaCreada.fecha),
                },
            });
        } catch (error: unknown) {
            this.manejarErrorCreacion(error, reply);
        }
    }

    /** LISTAR TODAS LAS CITAS MÉDICAS
     */
    async listarCitas(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const citas = await this.citaServicio.listarCitas();

            // Serializar fechas en todas las citas
            const citasSerializadas = citas.map((cita) => ({
                ...cita,
                fecha: FechaUtil.toISO(cita.fecha),
                fechaLegible: FechaUtil.formatearParaMostrar(cita.fecha),
            }));

            reply.status(200).send({
                mensaje: Mensajes.CITAS_LISTADAS,
                data: citasSerializadas,
                total: citas.length,
            });
        } catch (error: unknown) {
            const mensaje = error instanceof Error ? error.message : "Error desconocido";
            reply.status(500).send({
                error: "Error al listar citas",
                mensaje,
            });
        }
    }

    /** OBTENER UNA CITA MÉDICA POR ID
     */
    async obtenerCitaPorId(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const { id: idCita } = validadorEsquemas(esquemaCitaPorId, request.params, reply);

            const cita = await this.citaServicio.obtenerCitaMedicaPorId(idCita);

            if (!cita) {
                reply.status(404).send({
                    error: "Cita no encontrada",
                    mensaje: `${Mensajes.CITA_NO_ENCONTRADA} ${idCita}`,
                });
                return;
            }

            // Serializar fecha
            reply.status(200).send({
                mensaje: Mensajes.CITA_OBTENIDA,
                data: {
                    ...cita,
                    fecha: FechaUtil.toISO(cita.fecha),
                    fechaLegible: FechaUtil.formatearParaMostrar(cita.fecha),
                },
            });
        } catch (error: unknown) {
            const mensaje = error instanceof Error ? error.message : "Error desconocido";
            reply.status(500).send({
                error: "Error al obtener la cita",
                mensaje,
            });
        }
    }

    /**
     * ACTUALIZAR UNA CITA MÉDICA
     */
    async actualizarCita(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const { id: idCita } = validadorEsquemas(esquemaCitaPorId, request.params, reply);
            const datos = validadorEsquemas(esquemaActualizarCita, request.body, reply);

            const citaActualizada = await this.citaServicio.actualizarCita(
                idCita,
                datos as Partial<ICitaMedica>
            );

            if (!citaActualizada) {
                reply.status(404).send({
                    error: "Cita no encontrada",
                    mensaje: `${Mensajes.CITA_NO_ENCONTRADA} ${idCita}`,
                });
                return;
            }

            // Serializar fecha
            reply.status(200).send({
                mensaje: Mensajes.CITA_ACTUALIZADA,
                data: {
                    ...citaActualizada,
                    fecha: FechaUtil.toISO(citaActualizada.fecha),
                    fechaLegible: FechaUtil.formatearParaMostrar(citaActualizada.fecha),
                },
            });
        } catch (error: unknown) {
            this.manejarErrorActualizacion(error, reply);
        }
    }

    /**
     * ELIMINAR UNA CITA MÉDICA
     */
    async eliminarCita(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const { id: idCita } = validadorEsquemas(esquemaCitaPorId, request.params, reply);

            const eliminado = await this.citaServicio.eliminarCitaMedica(idCita);

            if (!eliminado) {
                reply.status(404).send({
                    error: "Cita no encontrada",
                    mensaje: `${Mensajes.CITA_NO_ENCONTRADA} ${idCita}`,
                });
                return;
            }

            reply.status(200).send({
                mensaje: Mensajes.CITA_ELIMINADA,
            });
        } catch (error: unknown) {
            const mensaje = error instanceof Error ? error.message : "Error desconocido";
            reply.status(500).send({
                error: "Error al eliminar la cita",
                mensaje,
            });
        }
    }

    /**
     * SERVICIO 2: CONSULTAR CITAS DE UN PACIENTE CON DETALLES
     */
    async consultarCitasPorPaciente(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const { idPaciente } = request.params as { idPaciente: string };
            const id = parseInt(idPaciente, 10);

            // Validar que el ID sea un número válido
            if (isNaN(id) || id <= 0) {
                reply.status(400).send({
                    error: "ID inválido",
                    mensaje: "El ID del paciente debe ser un número válido y positivo",
                });
                return;
            }

            const citas = await this.citaServicio.obtenerCitasPorPaciente(id);

            // Caso: paciente sin citas
            if (citas.length === 0) {
                reply.status(200).send({
                    mensaje: Mensajes.PACIENTE_SIN_CITAS,
                    data: [],
                    total: 0,
                });
                return;
            }

            // Caso: paciente con citas - Serializar fechas
            const citasSerializadas = citas.map((cita) => ({
                ...cita,
                fecha: FechaUtil.toISO(cita.fecha),
                fechaLegible: FechaUtil.formatearParaMostrar(cita.fecha),
                diaSemana: FechaUtil.obtenerDiaSemana(cita.fecha), // ✅ NUEVO: Agregar día en español
            }));

            reply.status(200).send({
                mensaje: Mensajes.CITAS_PACIENTE_OBTENIDAS,
                data: citasSerializadas,
                total: citas.length,
            });
        } catch (error: unknown) {
            this.manejarErrorConsultaCitas(error, reply);
        }
    }

    /**
     * MANEJO CENTRALIZADO DE ERRORES PARA CREACIÓN DE CITAS
     */
    private manejarErrorCreacion(error: unknown, reply: FastifyReply): void {
        // Error de validación Zod
        if (error instanceof ZodError) {
            reply.status(400).send({
                error: "Datos inválidos",
                detalles: error.issues.map((issue) => ({
                    campo: issue.path.join("."),
                    mensaje: issue.message,
                })),
            });
            return;
        }

        // NUEVO: Error de fecha inválida (fecha pasada)
        if (error instanceof FechaInvalidaError) {
            reply.status(400).send({
                error: "Fecha inválida",
                mensaje: error.message,
            });
            return;
        }

        // Error: Disponibilidad no existe
        if (error instanceof DisponibilidadNoExisteError) {
            reply.status(404).send({
                error: "Disponibilidad no encontrada",
                mensaje: error.message,
            });
            return;
        }

        // Error: Fecha no coincide con disponibilidad
        if (error instanceof FechaDisponibilidadInvalidaError) {
            reply.status(400).send({
                error: "Fecha incompatible con disponibilidad",
                mensaje: error.message,
            });
            return;
        }

        // Error: Traslape de horarios
        if (error instanceof TraslapePacienteError) {
            reply.status(409).send({
                error: "Conflicto de horario",
                mensaje:error.message,
            });
            return;
        }

        // Error: Paciente no existe
        if (error instanceof PacienteNoExisteError) {
            reply.status(404).send({
                error: "Paciente no encontrado",
                mensaje: error.message,
            });
            return;
        }

        // Error genérico
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        reply.status(500).send({
            error: "Error al crear la cita médica",
            mensaje,
        });
    }

    /**
     * MANEJO CENTRALIZADO DE ERRORES PARA ACTUALIZACIÓN DE CITAS
     */
    private manejarErrorActualizacion(error: unknown, reply: FastifyReply): void {
        // Error de validación Zod
        if (error instanceof ZodError) {
            reply.status(400).send({
                error: "Datos inválidos",
                detalles: error.issues.map((issue) => ({
                    campo: issue.path.join("."),
                    mensaje: issue.message,
                })),
            });
            return;
        }

        // NUEVO: Error de fecha inválida
        if (error instanceof FechaInvalidaError) {
            reply.status(400).send({
                error: "Fecha inválida",
                mensaje: error.message,
            });
            return;
        }

        // Error: Disponibilidad no existe
        if (error instanceof DisponibilidadNoExisteError) {
            reply.status(404).send({
                error: "Disponibilidad no encontrada",
                mensaje: error.message,
            });
            return;
        }

        // Error: Fecha no coincide con disponibilidad
        if (error instanceof FechaDisponibilidadInvalidaError) {
            reply.status(400).send({
                error: "Fecha incompatible con disponibilidad",
                mensaje: error.message,
            });
            return;
        }

        // Error genérico
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        reply.status(500).send({
            error: "Error al actualizar la cita",
            mensaje,
        });
    }

    /**
     * MANEJO CENTRALIZADO DE ERRORES PARA CONSULTA DE CITAS POR PACIENTE
     */
    private manejarErrorConsultaCitas(error: unknown, reply: FastifyReply): void {
        // Error: ID inválido
        if (error instanceof Error && error.message.includes("debe ser un número positivo")) {
            reply.status(400).send({
                error: "ID inválido",
                mensaje: error.message,
            });
            return;
        }

        // Error: Paciente no encontrado
        if (error instanceof PacienteNoExisteError) {
            reply.status(404).send({
                error: "Paciente no encontrado",
                mensaje: error.message,
            });
            return;
        }

        // Error genérico
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        reply.status(500).send({
            error: "Error al obtener las citas del paciente",
            mensaje,
        });
    }
}
