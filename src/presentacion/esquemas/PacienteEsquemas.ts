import * as z from "zod";
import { Paciente } from "../../core/dominio/paciente/Paciente.js";
import { esquemaIdParam } from "./ValidacionesComunes.js";

export interface CrearPacienteDTO {
    nombrePaciente: string;
    correoPaciente: string;
    telefonoPaciente?: string | null;
}

export const esquemaCrearPaciente = z.object({
    nombrePaciente: z
        .string("El nombre del paciente es obligatorio y debe ser texto")
        .min(1, "El nombre no puede estar vacío"),
    correoPaciente: z
        .string("El correo del paciente es obligatorio y debe ser texto")
        .refine((val) => Paciente.validarCorreo(val), {
            message: "El formato del correo electrónico es inválido",
        }),
    telefonoPaciente: z
        .string("El teléfono del paciente es obligatorio y debe ser texto")
        .refine((val) => Paciente.validarTelefono(val), {
            message:
                "El teléfono del paciente debe tener al menos 7 caracteres",
        }),
});

export const esquemaPacientePorId = z.object({
    id: esquemaIdParam,
});

export const esquemaActualizarPaciente = z.object({
    nombrePaciente: z
        .string("El nombre del paciente debe ser texto")
        .min(1, "El nombre no puede estar vacío")
        .optional(),
    correoPaciente: z
        .string("El correo del paciente debe ser texto")
        .refine((val) => Paciente.validarCorreo(val), {
            message: "El formato del correo electrónico es inválido",
        })
        .optional(),
    telefonoPaciente: z
        .string("El teléfono del paciente debe ser texto")
        .refine((val) => Paciente.validarTelefono(val), {
            message:
                "El teléfono del paciente debe tener al menos 7 caracteres",
        })
        .optional(),
});
