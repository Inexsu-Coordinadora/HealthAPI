import type { ICitaMedica } from "./ICitaMedica.ts";

export class CitaMedica implements ICitaMedica {
    idCita: number | null;
    idPaciente: number;
    idDisponibilidad: number;
    fecha: Date;
    estado: string;
    motivo: string | null;
    observaciones: string;

    constructor(datosCita: ICitaMedica) {
        this.idCita = datosCita.idCita;
        this.idPaciente = datosCita.idPaciente;
        this.idDisponibilidad = datosCita.idDisponibilidad;
        this.fecha = datosCita.fecha;
        this.estado = datosCita.estado;
        this.motivo = datosCita.motivo;
        this.observaciones = datosCita.observaciones;
    }
    static crear(
        idPaciente: number,
        idDisponibilidad: number,
        fecha: Date,
        estado: string,
        motivo: string | null,
        observaciones: string,
    ) {
        return {
            idPaciente: idPaciente,
            idDisponibilidad: idDisponibilidad,
            fecha: fecha,
            estado: estado,
            motivo: motivo,
            observaciones: observaciones,
        };
    }
    static desdeBD(
        idCita: number,
        idPaciente: number,
        idDisponibilidad: number,
        fecha: Date,
        estado: string,
        motivo: string,
        observaciones: string,
    ): CitaMedica {
        return new CitaMedica({
            idCita,
            idPaciente,
            idDisponibilidad,
            fecha,
            estado,
            motivo,
            observaciones: observaciones,
        });
    }
    static validarEstado(estado: string): boolean {
        const estadosValidos = ["programada", "cancelada", "realizada"];
        return estadosValidos.includes(estado.toLowerCase());
    }
    toObject(): ICitaMedica {
        return {
            idCita: this.idCita,
            idPaciente: this.idPaciente,
            idDisponibilidad: this.idDisponibilidad,
            fecha: this.fecha,
            estado: this.estado,
            motivo: this.motivo,
            observaciones: this.observaciones,
        };
    }
}