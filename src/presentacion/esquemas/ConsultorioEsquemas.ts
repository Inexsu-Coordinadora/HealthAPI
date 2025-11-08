export interface CrearConsultorioDTO {
    nombreConsultorio: string;
    ubicacionConsultorio?: string | null;
    capacidadConsultorio?: number | null;
}

export interface ActualizarConsultorioDTO {
    nombreConsultorio?: string;
    ubicacionConsultorio?: string | null;
    capacidadConsultorio?: number | null;
}

export function validarCrearConsultorio(datos: any): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!datos.nombreConsultorio || typeof datos.nombreConsultorio !== "string" || datos.nombreConsultorio.trim() === "") {
        errores.push("El nombre del consultorio es obligatorio y debe ser texto");
    }

    if (datos.capacidadConsultorio !== undefined && datos.capacidadConsultorio !== null) {
        if (typeof datos.capacidadConsultorio !== "number" || datos.capacidadConsultorio <= 0) {
            errores.push("La capacidad debe ser un número positivo");
        }
    }

    return {
        valido: errores.length === 0,
        errores,
    };
}

export function validarActualizarConsultorio(datos: any): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!datos.nombreConsultorio && !datos.ubicacionConsultorio && datos.capacidadConsultorio === undefined) {
        errores.push("Debe proporcionar al menos un campo para actualizar");
        return { valido: false, errores };
    }

    if (datos.nombreConsultorio !== undefined) {
        if (typeof datos.nombreConsultorio !== "string" || datos.nombreConsultorio.trim() === "") {
            errores.push("El nombre del consultorio debe ser texto y no puede estar vacío");
        }
    }

    if (datos.capacidadConsultorio !== undefined && datos.capacidadConsultorio !== null) {
        if (typeof datos.capacidadConsultorio !== "number" || datos.capacidadConsultorio <= 0) {
            errores.push("La capacidad debe ser un número positivo");
        }
    }

    return {
        valido: errores.length === 0,
        errores,
    };
}