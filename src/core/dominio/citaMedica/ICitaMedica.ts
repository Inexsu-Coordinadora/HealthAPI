export interface ICitaMedica {
  idCita: number | null; 
  idPaciente: number; 
  idDisponibilidad: number; 
  idConsultorio?: number | null;        
  fecha: Date; 
  estado: string;
  motivo: string | null; 
  observaciones: string;
}