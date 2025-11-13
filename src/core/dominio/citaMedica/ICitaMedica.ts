// src/core/dominio/citaMedica/ICitaMedica.ts

export interface ICitaMedica {
  idCita: number | null; 
  idPaciente: number; 
  idDisponibilidad: number;         
  fecha: Date; 
  estado: string;
  motivo: string | null; 
  observaciones: string;
}