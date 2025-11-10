import type { IDisponibilidad } from "./IDisponibilidad.js";

export class Disponibilidad implements IDisponibilidad {
    idDisponibilidad: number | null;
    idMedico: number;
    idConsultorio?: number | null;
    diaSemana: string;
    horaInicio: string;
    horaFin: string;

    constructor(datosDisponibilidad: IDisponibilidad) {
        this.idDisponibilidad = datosDisponibilidad.idDisponibilidad;
        this.idMedico = datosDisponibilidad.idMedico;
        this.idConsultorio = datosDisponibilidad.idConsultorio ?? null;
        this.diaSemana = datosDisponibilidad.diaSemana;
        this.horaInicio = datosDisponibilidad.horaInicio;
        this.horaFin = datosDisponibilidad.horaFin;
    }

    static crear(
        idMedico: number,
        diaSemana: string,
        horaInicio: string,
        horaFin: string,
        idConsultorio?: number | null
    ): Disponibilidad {
        return new Disponibilidad({
            idDisponibilidad: null,
            idMedico,
            idConsultorio: idConsultorio ?? null,
            diaSemana,
            horaInicio,
            horaFin,
        });
    }

    static desdeBD(
        id: number,
        idMedico: number,
        diaSemana: string,
        horaInicio: string,
        horaFin: string,
        idConsultorio?: number | null
    ): Disponibilidad {
        return new Disponibilidad({
            idDisponibilidad: id,
            idMedico,
            idConsultorio: idConsultorio ?? null,
            diaSemana,
            horaInicio,
            horaFin,
        });
    }

        static validarDiaSemana(dia: string): boolean {
        const diasValidos = [
            "lunes",
            "martes",
            "miércoles",
            "miercoles", 
            "jueves",
            "viernes",
            "sábado",
            "sabado", 
            "domingo",
        ];
        return diasValidos.includes(dia.toLowerCase());
    }

    //VALIDACION DE FORMATO CORRECTO DE HORA HH:MM O HH:MM:SS
    static validarFormatoHora(hora: string): boolean {
        const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        return regex.test(hora);
    }

    //VALIDACION DE QUE HORA INICIO SEA MENOR A HORA FIN
    static validarRangoHorario(horaInicio: string, horaFin: string): boolean {
    const partesInicio = horaInicio.split(":");
    const partesFin = horaFin.split(":");

    // Validar que tengamos al menos horas y minutos
        if (partesInicio.length < 2 || partesFin.length < 2) {
         return false;
        };

        const minutosInicio = parseInt(partesInicio[0]!) * 60 + parseInt(partesInicio[1]!);
        const minutosFin = parseInt(partesFin[0]!) * 60 + parseInt(partesFin[1]!);

        return minutosInicio < minutosFin;
    };

    toObject(): IDisponibilidad {
        return {
            idDisponibilidad: this.idDisponibilidad,
            idMedico: this.idMedico,
            idConsultorio: this.idConsultorio ?? null,
            diaSemana: this.diaSemana,
            horaInicio: this.horaInicio,
            horaFin: this.horaFin,
        };
    };
};