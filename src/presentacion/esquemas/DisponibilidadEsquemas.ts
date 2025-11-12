import * as z from "zod";
import type { IMedicoRepositorio } from "../../core/dominio/medico/repositorio/IMedicoRepositorio.js";
import type { IConsultorioRepositorio } from "../../core/dominio/consultorio/repositorio/IConsultorioRepositorio.js";
import { Disponibilidad } from "../../core/dominio/disponibilidad/Disponibilidad.js";
import {
    esquemaIdParam,
    esquemaIdPositivo,
    esquemaIdPositivoOpcional,
} from "./ValidacionesComunes.js";

export interface CrearDisponibilidadDTO {
    idMedico: number;
    idConsultorio?: number | null;
    diaSemana: string;
    horaInicio: string;
    horaFin: string;
}

export const esquemaCrearDisponibilidad = z
    .object({
        idMedico: esquemaIdPositivo("del médico"),
        idConsultorio: esquemaIdPositivoOpcional("del consultorio"),
        diaSemana: z
            .string("El día de la semana es obligatorio y debe ser texto")
            .min(1, "El día de la semana no puede estar vacío")
            .refine((val) => Disponibilidad.validarDiaSemana(val), {
                message: "El día de la semana no es válido (lunes-domingo)",
            }),
        horaInicio: z
            .string("La hora de inicio es obligatoria y debe ser texto")
            .min(1, "La hora de inicio no puede estar vacía")
            .refine((val) => Disponibilidad.validarFormatoHora(val), {
                message:
                    "El formato de la hora de inicio es inválido (debe ser HH:MM o HH:MM:SS)",
            }),
        horaFin: z
            .string("La hora de fin es obligatoria y debe ser texto")
            .min(1, "La hora de fin no puede estar vacía")
            .refine((val) => Disponibilidad.validarFormatoHora(val), {
                message:
                    "El formato de la hora de fin es inválido (debe ser HH:MM o HH:MM:SS)",
            }),
    })
    .refine(
        (data) =>
            Disponibilidad.validarRangoHorario(data.horaInicio, data.horaFin),
        {
            message: "La hora de inicio debe ser menor que la hora de fin",
            path: ["horaFin"],
        }
    );

export const esquemaDisponibilidadPorId = z.object({
    id: esquemaIdParam,
});

export const esquemaActualizarDisponibilidad = z.object({
    idMedico: esquemaIdPositivo("del médico").optional(),
    idConsultorio: esquemaIdPositivoOpcional("del consultorio"),
    diaSemana: z
        .string("El día de la semana debe ser texto")
        .min(1, "El día de la semana no puede estar vacío")
        .refine((val) => Disponibilidad.validarDiaSemana(val), {
            message: "El día de la semana no es válido (lunes-domingo)",
        })
        .optional(),
    horaInicio: z
        .string("La hora de inicio debe ser texto")
        .min(1, "La hora de inicio no puede estar vacía")
        .refine((val) => Disponibilidad.validarFormatoHora(val), {
            message:
                "El formato de la hora de inicio es inválido (debe ser HH:MM o HH:MM:SS)",
        })
        .optional(),
    horaFin: z
        .string("La hora de fin debe ser texto")
        .min(1, "La hora de fin no puede estar vacía")
        .refine((val) => Disponibilidad.validarFormatoHora(val), {
            message:
                "El formato de la hora de fin es inválido (debe ser HH:MM o HH:MM:SS)",
        })
        .optional(),
});

// Validación refinada para verificar existencia de médico y consultorio
export const crearDisponibilidadConValidacionRepositorios = (
    medicoRepo: IMedicoRepositorio,
    consultorioRepo: IConsultorioRepositorio
) => {
    return esquemaCrearDisponibilidad
        .refine(
            async (data) => {
                const medicoExiste = await medicoRepo.obtenerMedicoPorId(
                    data.idMedico
                );
                return medicoExiste !== null;
            },
            {
                message: "No se encontró el médico con el ID especificado",
                path: ["idMedico"],
            }
        )
        .refine(
            async (data) => {
                if (!data.idConsultorio) {
                    return true;
                }
                const consultorioExiste =
                    await consultorioRepo.obtenerConsultorioPorId(
                        data.idConsultorio
                    );
                return consultorioExiste !== null;
            },
            {
                message: "No se encontró el consultorio con el ID especificado",
                path: ["idConsultorio"],
            }
        );
};
