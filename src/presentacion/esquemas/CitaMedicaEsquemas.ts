import * as z from "zod";
import type { IPacienteRepositorio } from "../../core/dominio/paciente/repo/IPacienteRepo.js";
import type { IDisponibilidadRepositorio } from "../../core/dominio/disponibilidad/repositorio/IDisponibilidadRepositorio.js";
import { CitaMedica } from "../../core/dominio/citaMedica/CitaMedica.js";

export interface CrearCitaDTO {
    idPaciente: number;
    idDisponibilidad: number;
    fecha: Date | string;
    estado: string;
    motivo?: string | null;
    observaciones?: string;
}

const REGEX_STRING_NUMERICO = /^\d+$/;

export const esquemaCrearCita = z.object({
    idPaciente: z
        .number("El ID del paciente es obligatorio y debe ser un número")
        .positive("El ID del paciente debe ser un número positivo"),
    idDisponibilidad: z
        .number("El ID de disponibilidad es obligatorio y debe ser un número")
        .positive("El ID de disponibilidad debe ser un número positivo"),
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
                "El estado de la cita es inválido (programada, cancelada, completada)",
        }),
    motivo: z.string("El motivo debe ser texto").nullable().optional(),
    observaciones: z.string("Las observaciones deben ser texto").optional(),
});

export const esquemaCitaPorId = z.object({
    id: z
        .string()
        .regex(
            REGEX_STRING_NUMERICO,
            "El ID de la cita debe ser un número válido"
        )
        .transform((val) => Number(val)),
});

export const esquemaActualizarCita = z.object({
    idPaciente: z
        .number("El ID del paciente debe ser un número")
        .positive("El ID del paciente debe ser un número positivo")
        .optional(),
    idDisponibilidad: z
        .number("El ID de disponibilidad debe ser un número")
        .positive("El ID de disponibilidad debe ser un número positivo")
        .optional(),
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
                "El estado de la cita es inválido (programada, cancelada, completada)",
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
