// src/core/dominio/citaMedica/CitaMedica.ts

import type { ICitaMedica } from './ICitaMedica.ts';

export class CitaMedica implements ICitaMedica {
  idCita: number | null;
  idPaciente: number;
  idDisponibilidad: number;
  idConsultorio: number;           
  fecha: Date;
  horaFin: Date;                  
  estado: string;
  motivo: string | null;
  observaciones: string;

  constructor(datosCita: ICitaMedica) {
    this.idCita = datosCita.idCita;
    this.idPaciente = datosCita.idPaciente;
    this.idDisponibilidad = datosCita.idDisponibilidad;
    this.idConsultorio = datosCita.idConsultorio;        
    this.fecha = datosCita.fecha;
    this.horaFin = datosCita.horaFin;                    
    this.estado = datosCita.estado;
    this.motivo = datosCita.motivo;
    this.observaciones = datosCita.observaciones;
  }

  static crear(
    idPaciente: number,
    idDisponibilidad: number,
    idConsultorio: number,         
    fecha: Date,
    horaFin: Date,                  
    estado: string,
    motivo: string | null,
    observaciones: string
  ) {
    return {
      idPaciente,
      idDisponibilidad,
      idConsultorio,
      fecha,
      horaFin,                      
      estado,
      motivo,
      observaciones
    };
  }

  static desdeBD(
    idCita: number,
    idPaciente: number,
    idDisponibilidad: number,
    idConsultorio: number,          
    fecha: Date,
    horaFin: Date,                  
    estado: string,
    motivo: string,
    observaciones: string
  ): CitaMedica {
    return new CitaMedica({
      idCita,
      idPaciente,
      idDisponibilidad,
      idConsultorio,                
      fecha,
      horaFin,                      
      estado,
      motivo,
      observaciones
    });
  }

  validarEstado(estado: string): boolean {
    const estadosValidos = ['programada', 'cancelada', 'realizada'];
    return estadosValidos.includes(estado.toLowerCase());
  }

  toObject(): ICitaMedica {
    return {
      idCita: this.idCita,
      idPaciente: this.idPaciente,
      idDisponibilidad: this.idDisponibilidad,
      idConsultorio: this.idConsultorio,     
      fecha: this.fecha,
      horaFin: this.horaFin,                 
      estado: this.estado,
      motivo: this.motivo,
      observaciones: this.observaciones
    };
  }
}