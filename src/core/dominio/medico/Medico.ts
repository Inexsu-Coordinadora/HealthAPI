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

    static crear(nombre: string, correo: string, especialidad: string): Medico {
  return new Medico({
    idMedico: null,
    nombreMedico: nombre,
    correoMedico: correo,
    especialidadMedico: especialidad,
  });
}


    static desdeBD(id: number, nombre: string, correo: string, especialidad: string): Medico {
    return new Medico({
    idMedico: id,
    nombreMedico: nombre,
    correoMedico: correo,
    especialidadMedico: especialidad,
  });
}

validarCorreo(): boolean {
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexCorreo.test(this.correoMedico);
  }

  toObject(): IMedico {
    return {
      idMedico: this.idMedico,
      nombreMedico: this.nombreMedico,
      correoMedico: this.correoMedico,
      especialidadMedico: this.especialidadMedico,
    };
  };
};