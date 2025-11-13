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
    idMedico: number;
    fecha: Date ;
    idDisponibilidad: number;
    idConsultorio: number | null;
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
export function validarCrearCita(datos: any): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (
        datos.idDisponibilidad === undefined ||
        typeof datos.idDisponibilidad !== "number" ||
        isNaN(datos.idDisponibilidad)
    ) {
        errores.push("El idDisponibilidad es obligatorio y debe ser un número válido");
    }

    if (!datos.fecha || isNaN(Date.parse(datos.fecha))) {
        errores.push("La fecha es obligatoria y debe tener un formato de fecha válido");
    }

    if (!datos.estado || typeof datos.estado !== "string" || datos.estado.trim() === "") {
        errores.push("El estado es obligatorio y debe ser texto");
    }

    if (datos.motivo !== undefined && datos.motivo !== null) {
        if (typeof datos.motivo !== "string") {
            errores.push("El motivo debe ser texto o nulo");
        }
    }

    if (datos.observaciones !== undefined && typeof datos.observaciones !== "string") {
        errores.push("Las observaciones deben ser texto");
    }

    return {
        valido: errores.length === 0,
        errores,
    };
}

export function validarActualizarCita(datos: any): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (
        datos.idPaciente === undefined &&
        datos.idDisponibilidad === undefined &&
        datos.fecha === undefined &&
        datos.estado === undefined &&
        datos.motivo === undefined &&
        datos.observaciones === undefined
    ) {
        errores.push("Debe proporcionar al menos un campo para actualizar");
        return { valido: false, errores };
    }

    if (datos.idPaciente !== undefined) {
        if (typeof datos.idPaciente !== "number" || isNaN(datos.idPaciente)) {
            errores.push("El idPaciente debe ser un número válido");
        }
    }

    if (datos.idDisponibilidad !== undefined) {
        if (typeof datos.idDisponibilidad !== "number" || isNaN(datos.idDisponibilidad)) {
            errores.push("El idDisponibilidad debe ser un número válido");
        }
    }

    if (datos.fecha !== undefined && isNaN(Date.parse(datos.fecha))) {
        errores.push("La fecha debe tener un formato válido");
    }

    if (datos.estado !== undefined) {
        if (typeof datos.estado !== "string" || datos.estado.trim() === "") {
            errores.push("El estado debe ser texto y no puede estar vacío");
        }
    }

    if (datos.motivo !== undefined && datos.motivo !== null) {
        if (typeof datos.motivo !== "string") {
            errores.push("El motivo debe ser texto o nulo");
        }
    }

    if (datos.observaciones !== undefined) {
        if (typeof datos.observaciones !== "string") {
            errores.push("Las observaciones deben ser texto");
        }
    }

    return {
        valido: errores.length === 0,
        errores,
    };
}

export function validarAgendarCita(datos: any): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    // Validar idPaciente
    if (datos.idPaciente === undefined || typeof datos.idPaciente !== "number" || isNaN(datos.idPaciente)) {
        errores.push("El idPaciente es obligatorio y debe ser un número válido");
    } else if (datos.idPaciente <= 0) {
        errores.push("El idPaciente debe ser un número positivo");
    }

    // Validar idMedico
    if (datos.idMedico === undefined || typeof datos.idMedico !== "number" || isNaN(datos.idMedico)) {
        errores.push("El idMedico es obligatorio y debe ser un número válido");
    } else if (datos.idMedico <= 0) {
        errores.push("El idMedico debe ser un número positivo");
    }

    // Validar fecha
    if (!datos.fecha) {
        errores.push("La fecha es obligatoria");
    } else if (isNaN(Date.parse(datos.fecha))) {
        errores.push("La fecha debe tener un formato de fecha válido");
    }

    // Validar idDisponibilidad
    if (datos.idDisponibilidad === undefined || typeof datos.idDisponibilidad !== "number" || isNaN(datos.idDisponibilidad)) {
        errores.push("El idDisponibilidad es obligatorio y debe ser un número válido");
    } else if (datos.idDisponibilidad <= 0) {
        errores.push("El idDisponibilidad debe ser un número positivo");
    }

    // Validar idConsultorio (opcional)
    if (datos.idConsultorio !== undefined && datos.idConsultorio !== null) {
        if (typeof datos.idConsultorio !== "number" || isNaN(datos.idConsultorio)) {
            errores.push("El idConsultorio debe ser un número válido");
        } else if (datos.idConsultorio <= 0) {
            errores.push("El idConsultorio debe ser un número positivo");
        }
    }

    // Validar motivo (opcional)
    if (datos.motivo !== undefined && datos.motivo !== null) {
        if (typeof datos.motivo !== "string") {
            errores.push("El motivo debe ser texto o nulo");
        }
    }

    // Validar observaciones (opcional)
    if (datos.observaciones !== undefined && typeof datos.observaciones !== "string") {
        errores.push("Las observaciones deben ser texto");
    }

    return {
        valido: errores.length === 0,
        errores,
    };
}