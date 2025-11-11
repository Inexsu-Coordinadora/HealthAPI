import * as z from "zod";

export interface CrearConsultorioDTO {
    nombreConsultorio: string;
    ubicacionConsultorio?: string | null;
    capacidadConsultorio?: number | null;
}

const REGEX_STRING_NUMERICO = /^\d+$/;

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
    id: z
        .string()
        .regex(
            REGEX_STRING_NUMERICO,
            "El ID del consultorio debe ser un número válido"
        )
        .transform((val) => Number(val)),
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
