import * as z from "zod";

export interface CrearPacienteDTO {
  nombrePaciente: string;
  correoPaciente: string;
  telefonoPaciente?: string | null;
}

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_STRING_NUMERICO = /^\d+$/;

export const esquemaCrearPaciente = z.object({
  nombrePaciente: z.string(
    "El nombre del paciente es obligatorio y debe ser texto",
  ),
  correoPaciente: z
    .string("El correo del paciente es obligatorio y debe ser texto")
    .regex(REGEX_CORREO, "El formato del correo electrónico es inválido"),
  telefonoPaciente: z
    .string("El teléfono del paciente es obligatorio y debe ser texto")
    .min(7, "El teléfono del paciente debe tener al menos 7 caracteres"),
});

export const esquemaPacientePorId = z.object({
    id: z
        .string()
        .regex(REGEX_STRING_NUMERICO, "El ID del paciente debe ser un número válido")
        .transform((val) => Number(val)),
});