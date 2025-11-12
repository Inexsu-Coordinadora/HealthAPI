import * as z from "zod";
import { esquemaIdParam } from "./ValidacionesComunes.js";

export interface CrearConsultorioDTO {
    nombreConsultorio: string;
    ubicacionConsultorio?: string | null;
    capacidadConsultorio?: number | null;
}

export const esquemaCrearConsultorio = z.object({
    nombreConsultorio: z
        .string("El nombre del consultorio es obligatorio y debe ser texto")
        .min(1, "El nombre del consultorio no puede estar vacío"),
    ubicacionConsultorio: z
        .string("La ubicación del consultorio debe ser texto")
        .nullish(),
    capacidadConsultorio: z
        .number("La capacidad debe ser un número")
        .positive("La capacidad debe ser un número positivo")
        .nullish(),
});

export const esquemaConsultorioPorId = z.object({
    id: esquemaIdParam,
});

export const esquemaActualizarConsultorio = z.object({
    nombreConsultorio: z
        .string("El nombre del consultorio debe ser texto")
        .min(1, "El nombre del consultorio no puede estar vacío")
        .optional(),
    ubicacionConsultorio: z
        .string("La ubicación del consultorio debe ser texto")
        .nullish(),
    capacidadConsultorio: z
        .number("La capacidad debe ser un número")
        .positive("La capacidad debe ser un número positivo")
        .nullish(),
});
