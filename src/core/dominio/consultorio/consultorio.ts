import type { IConsultorio } from "./IConsultorio.js";

export class Consultorio implements IConsultorio {
    idConsultorio: number | null;
    nombreConsultorio: string;
    ubicacionConsultorio?: string | null;
    capacidadConsultorio?: number | null;

    constructor(datosConsultorio: IConsultorio) {
        this.idConsultorio = datosConsultorio.idConsultorio;
        this.nombreConsultorio = datosConsultorio.nombreConsultorio;
        this.ubicacionConsultorio =
            datosConsultorio.ubicacionConsultorio ?? null;
        this.capacidadConsultorio =
            datosConsultorio.capacidadConsultorio ?? null;
    }

    static crear(
        nombre: string,
        ubicacion?: string | null,
        capacidad?: number | null
    ): Consultorio {
        return new Consultorio({
            idConsultorio: null,
            nombreConsultorio: nombre,
            ubicacionConsultorio: ubicacion ?? null,
            capacidadConsultorio: capacidad ?? null,
        });
    }

    static desdeBD(
        id: number,
        nombre: string,
        ubicacion?: string | null,
        capacidad?: number | null
    ): Consultorio {
        return new Consultorio({
            idConsultorio: id,
            nombreConsultorio: nombre,
            ubicacionConsultorio: ubicacion ?? null,
            capacidadConsultorio: capacidad ?? null,
        });
    }

    toObject(): IConsultorio {
        return {
            idConsultorio: this.idConsultorio,
            nombreConsultorio: this.nombreConsultorio,
            ubicacionConsultorio: this.ubicacionConsultorio ?? null,
            capacidadConsultorio: this.capacidadConsultorio ?? null,
        };
    };
};
