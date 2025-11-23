import * as z from "zod";
import type { IPacienteRepositorio } from "../../core/dominio/paciente/repositorio/IPacienteRepositorio.js";
import type { IDisponibilidadRepositorio } from "../../core/dominio/disponibilidad/repositorio/IDisponibilidadRepositorio.js";
import { CitaMedica } from "../../core/dominio/citaMedica/CitaMedica.js";
import { esquemaIdParam, esquemaIdPositivo } from "./ValidacionesComunes.js";


export interface CrearCitaDTO {
    idPaciente: number;
    idDisponibilidad: number;
    idConsultorio?: number | null; 
    fecha: Date;
    estado: string;
    motivo?: string | null;
    observaciones?: string;
}

export interface ActualizarCitaDTO {
    idPaciente?: number;
    idDisponibilidad?: number;
    idConsultorio?: number | null; 
    fecha?: Date;
    estado?: string;
    motivo?: string | null;
    observaciones?: string;
}

export interface AgendarCitaDTO {
    idPaciente: number;
    idDisponibilidad: number;
    idConsultorio?: number | null; 
    fecha: Date;
    motivo?: string | null;
    observaciones?: string;
}

const esquemaFecha = z
    .string()
    .min(1, { message: "La fecha es obligatoria" })
    .datetime({ message: "La fecha debe estar en formato ISO 8601 con zona horaria (ej: 2025-11-15T10:00:00Z)" })
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), {
        message: "La fecha debe ser válida",
    })
    .refine((date) => date > new Date(), {
        message: "La fecha debe ser futura",
    });

export const esquemaCrearCita = z.object({
    idPaciente: esquemaIdPositivo("del paciente"),
    idDisponibilidad: esquemaIdPositivo("de disponibilidad"),
    idConsultorio: esquemaIdPositivo("del consultorio").nullable().optional(),
    fecha: esquemaFecha,
    estado: z
        .string()
        .min(1, "El estado no puede estar vacío")
        .refine((val) => CitaMedica.validarEstado(val), {
            message: "El estado debe ser: programada, cancelada o realizada",
        }),
    motivo: z.string().nullable().optional(),
    observaciones: z.string().optional().default(""),
});

export const esquemaActualizarCita = z
    .object({
        idPaciente: esquemaIdPositivo("del paciente").optional(),
        idDisponibilidad: esquemaIdPositivo("de disponibilidad").optional(),
        idConsultorio: esquemaIdPositivo("del consultorio").nullable().optional(),
        fecha: esquemaFecha.optional(),
        estado: z
            .string()
            .min(1, "El estado no puede estar vacío")
            .refine((val) => CitaMedica.validarEstado(val), {
                message: "El estado debe ser: programada, cancelada o realizada",
            })
            .optional(),
        motivo: z.string().nullable().optional(),
        observaciones: z.string().optional(),
    })
    .refine(
        (data) =>
            data.idPaciente !== undefined ||
            data.idDisponibilidad !== undefined ||
            data.idConsultorio !== undefined ||
            data.fecha !== undefined ||
            data.estado !== undefined ||
            data.motivo !== undefined ||
            data.observaciones !== undefined,
        {
            message: "Debe proporcionar al menos un campo para actualizar",
        }
    );

export const esquemaAgendarCita = z.object({
    idPaciente: esquemaIdPositivo("del paciente"),
    idDisponibilidad: esquemaIdPositivo("de disponibilidad"),
    idConsultorio: esquemaIdPositivo("del consultorio").nullable().optional(),
    fecha: esquemaFecha,
    motivo: z.string().nullable().optional(),
    observaciones: z.string().optional().default(""),
});

export const esquemaCitaPorId = z.object({
    id: esquemaIdParam,
});

export const crearCitaConValidacionRepositorios = (
    pacienteRepo: IPacienteRepositorio,
    disponibilidadRepo: IDisponibilidadRepositorio
) => {
    return esquemaCrearCita
        .refine(
            async (data) => {
                const paciente = await pacienteRepo.obtenerPacientePorId(data.idPaciente);
                return paciente !== null;
            },
            {
                message: "No se encontró el paciente con el ID especificado",
                path: ["idPaciente"],
            }
        )
        .refine(
            async (data) => {
                const disponibilidad = await disponibilidadRepo.obtenerDisponibilidadPorId(
                    data.idDisponibilidad
                );
                return disponibilidad !== null;
            },
            {
                message: "No se encontró la disponibilidad con el ID especificado",
                path: ["idDisponibilidad"],
            }
        );
        
};
