import * as z from "zod";
import type { IPacienteRepositorio } from "../../core/dominio/paciente/repositorio/IPacienteRepositorio.js";
import type { IDisponibilidadRepositorio } from "../../core/dominio/disponibilidad/repositorio/IDisponibilidadRepositorio.js";
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

// Validación refinada para verificar existencia de paciente y disponibilidad
export const crearCitaConValidacionRepositorios = (
    pacienteRepo: IPacienteRepositorio,
    disponibilidadRepo: IDisponibilidadRepositorio
) => {
    return esquemaCrearCita
        .refine(
            async (data) => {
                const pacienteExiste = await pacienteRepo.obtenerPacientePorId(
                    data.idPaciente
                );
                return pacienteExiste !== null;
            },
            {
                message: "No se encontró el paciente con el ID especificado",
                path: ["idPaciente"],
            }
        )
        .refine(
            async (data) => {
                const disponibilidadExiste =
                    await disponibilidadRepo.obtenerDisponibilidadPorId(
                        data.idDisponibilidad
                    );
                return disponibilidadExiste !== null;
            },
            {
                message:
                    "No se encontró la disponibilidad con el ID especificado",
                path: ["idDisponibilidad"],
            }
        );
};
