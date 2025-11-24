import * as z from "zod";
import { CitaMedica } from "../../core/dominio/citaMedica/CitaMedica.js";
import { esquemaIdParam, esquemaIdPositivo } from "./ValidacionesComunes.js";

export interface CrearCitaDTO {
    idPaciente: number;
    idDisponibilidad: number;
    fecha: Date;
    estado: string;
    motivo?: string | null;
    observaciones?: string;
}

export const esquemaCrearCita = z.object({
    idPaciente: esquemaIdPositivo("del paciente"),
    idDisponibilidad: esquemaIdPositivo("de disponibilidad"),
    fecha: z
        .string("La fecha es obligatoria")
        .or(z.date())
        .transform((val) => (typeof val === "string" ? new Date(val) : val))
        .refine((date) => !isNaN(date.getTime()), {
            message: "La fecha debe tener un formato válido",
        }),
    estado: z
        .string("El estado es obligatorio y debe ser texto")
        .min(1, "El estado no puede estar vacío")
        .refine((val) => CitaMedica.validarEstado(val), {
            message:
                "El estado de la cita es inválido (programada, cancelada, realizada)",
        }),
    motivo: z.string("El motivo debe ser texto").nullable().optional(),
    observaciones: z.string("Las observaciones deben ser texto").optional(),
});

export const esquemaCitaPorId = z.object({
    id: esquemaIdParam,
});
export interface ActualizarCitaDTO {
    idPaciente?: number;
    idDisponibilidad?: number;
    fecha?: Date ;
    estado?: string;
    motivo?: string | null;
    observaciones?: string;
}

export interface AgendarCitaDTO {
    idPaciente: number;
    fecha: Date ;
    idDisponibilidad: number;
    motivo?: string | null;
    observaciones?: string;
}


export const esquemaActualizarCita = z.object({
    idPaciente: esquemaIdPositivo("del paciente").optional(),
    idDisponibilidad: esquemaIdPositivo("de disponibilidad").optional(),
    fecha: z
        .string("La fecha debe tener un formato válido")
        .or(z.date())
        .transform((val) => (typeof val === "string" ? new Date(val) : val))
        .refine((date) => !isNaN(date.getTime()), {
            message: "La fecha debe tener un formato válido",
        })
        .optional(),
    estado: z
        .string("El estado debe ser texto")
        .min(1, "El estado no puede estar vacío")
        .refine((val) => CitaMedica.validarEstado(val), {
            message:
                "El estado de la cita es inválido (programada, cancelada, realizada)",
        })
        .optional(),
    motivo: z.string("El motivo debe ser texto").nullable().optional(),
    observaciones: z.string("Las observaciones deben ser texto").optional(),
});




