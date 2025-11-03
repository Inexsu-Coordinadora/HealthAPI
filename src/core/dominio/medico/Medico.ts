import type { IMedico } from "./IMedico.js";

export class Medico implements IMedico {
    idMedico: number | null;
    nombreMedico: string;
    correoMedico: string;
    especialidadMedico: string;

    constructor(datosMedico: IMedico) {
        this.idMedico = datosMedico.idMedico;
        this.nombreMedico = datosMedico.nombreMedico;
        this.correoMedico = datosMedico.correoMedico;
        this.especialidadMedico = datosMedico.especialidadMedico;
    }
}