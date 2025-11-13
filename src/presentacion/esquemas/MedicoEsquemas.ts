import * as z from "zod";
import { Medico } from "../../core/dominio/medico/Medico.js";
import { esquemaIdParam } from "./ValidacionesComunes.js";

export interface CrearMedicoDTO {
    nombreMedico: string;
    correoMedico: string;
    especialidadMedico: string;
}

export const esquemaCrearMedico = z.object({
    nombreMedico: z
        .string("El nombre del médico es obligatorio y debe ser texto")
        .min(1, "El nombre del médico no puede estar vacío"),
    correoMedico: z
        .string("El correo del médico es obligatorio y debe ser texto")
        .refine((val) => Medico.validarCorreo(val), {
            message: "El formato del correo electrónico es inválido",
        }),
    especialidadMedico: z
        .string("La especialidad del médico es obligatoria y debe ser texto")
        .min(1, "La especialidad del médico no puede estar vacía"),
});

export const esquemaMedicoPorId = z.object({
    id: esquemaIdParam,
});

export const esquemaActualizarMedico = z.object({
    nombreMedico: z
        .string("El nombre del médico debe ser texto")
        .min(1, "El nombre del médico no puede estar vacío")
        .optional(),
    correoMedico: z
        .string("El correo del médico debe ser texto")
        .refine((val) => Medico.validarCorreo(val), {
            message: "El formato del correo electrónico es inválido",
        })
        .optional(),
    especialidadMedico: z
        .string("La especialidad del médico debe ser texto")
        .min(1, "La especialidad del médico no puede estar vacía")
        .optional(),
});
