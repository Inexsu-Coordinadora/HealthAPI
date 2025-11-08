export interface CrearDisponibilidadDTO {
    idMedico: number;
    idConsultorio?: number | null;
    diaSemana: string;
    horaInicio: string;
    horaFin: string;
}

export interface ActualizarDisponibilidadDTO {
    idMedico?: number;
    idConsultorio?: number | null;
    diaSemana?: string;
    horaInicio?: string;
    horaFin?: string;
}

export function validarCrearDisponibilidad(datos: any): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!datos.idMedico || typeof datos.idMedico !== "number" || datos.idMedico <= 0) {
        errores.push("El ID del médico es obligatorio y debe ser un número positivo");
    }

    if (!datos.diaSemana || typeof datos.diaSemana !== "string" || datos.diaSemana.trim() === "") {
        errores.push("El día de la semana es obligatorio y debe ser texto");
    }

    if (!datos.horaInicio || typeof datos.horaInicio !== "string" || datos.horaInicio.trim() === "") {
        errores.push("La hora de inicio es obligatoria y debe ser texto");
    }

    if (!datos.horaFin || typeof datos.horaFin !== "string" || datos.horaFin.trim() === "") {
        errores.push("La hora de fin es obligatoria y debe ser texto");
    }

    if (datos.idConsultorio !== undefined && datos.idConsultorio !== null) {
        if (typeof datos.idConsultorio !== "number" || datos.idConsultorio <= 0) {
            errores.push("El ID del consultorio debe ser un número positivo");
        }
    }

    return {
        valido: errores.length === 0,
        errores,
    };
}

export function validarActualizarDisponibilidad(datos: any): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (
        !datos.idMedico &&
        !datos.diaSemana &&
        !datos.horaInicio &&
        !datos.horaFin &&
        datos.idConsultorio === undefined
    ) {
        errores.push("Debe proporcionar al menos un campo para actualizar");
        return { valido: false, errores };
    }

    if (datos.idMedico !== undefined) {
        if (typeof datos.idMedico !== "number" || datos.idMedico <= 0) {
            errores.push("El ID del médico debe ser un número positivo");
        }
    }

    if (datos.diaSemana !== undefined) {
        if (typeof datos.diaSemana !== "string" || datos.diaSemana.trim() === "") {
            errores.push("El día de la semana debe ser texto y no puede estar vacío");
        }
    }

    if (datos.horaInicio !== undefined) {
        if (typeof datos.horaInicio !== "string" || datos.horaInicio.trim() === "") {
            errores.push("La hora de inicio debe ser texto y no puede estar vacía");
        }
    }

    if (datos.horaFin !== undefined) {
        if (typeof datos.horaFin !== "string" || datos.horaFin.trim() === "") {
            errores.push("La hora de fin debe ser texto y no puede estar vacía");
        }
    }

    if (datos.idConsultorio !== undefined && datos.idConsultorio !== null) {
        if (typeof datos.idConsultorio !== "number" || datos.idConsultorio <= 0) {
            errores.push("El ID del consultorio debe ser un número positivo");
        }
    }

    return {
        valido: errores.length === 0,
        errores,
    };
}