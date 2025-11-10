// src/core/dominio/citaMedica/ICitaMedica.ts

export interface ICitaMedica {
  idCita: number | null; 
  idPaciente: number; 
  idDisponibilidad: number; 
  idConsultorio: number;          
  fecha: Date; 
  horaFin: Date;                  
  estado: string;
  motivo: string | null; 
  observaciones: string;
}