import * as z from "zod";

export interface CrearMedicoDTO {
    nombreMedico: string;
    correoMedico: string;
    especialidadMedico: string;
}

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_STRING_NUMERICO = /^\d+$/;

export const esquemaCrearMedico = z.object({
    nombreMedico: z
        .string("El nombre del médico es obligatorio y debe ser texto")
        .min(1, "El nombre del médico no puede estar vacío"),
    correoMedico: z
        .string("El correo del médico es obligatorio y debe ser texto")
        .regex(REGEX_CORREO, "El formato del correo electrónico es inválido"),
    especialidadMedico: z
        .string("La especialidad del médico es obligatoria y debe ser texto")
        .min(1, "La especialidad del médico no puede estar vacía"),
});

export const esquemaMedicoPorId = z.object({
    id: z
        .string()
        .regex(
            REGEX_STRING_NUMERICO,
            "El ID del médico debe ser un número válido"
        )
        .transform((val) => Number(val)),
});

export const esquemaActualizarMedico = z.object({
    nombreMedico: z
        .string("El nombre del médico debe ser texto")
        .min(1, "El nombre del médico no puede estar vacío")
        .optional(),
    correoMedico: z
        .string("El correo del médico debe ser texto")
        .regex(REGEX_CORREO, "El formato del correo electrónico es inválido")
        .optional(),
    especialidadMedico: z
        .string("La especialidad del médico debe ser texto")
        .min(1, "La especialidad del médico no puede estar vacía")
        .optional(),
});
