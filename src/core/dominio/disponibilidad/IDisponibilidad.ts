export interface IDisponibilidad {
    idDisponibilidad: number | null;
    idMedico: number;
    idConsultorio?: number | null;
    diaSemana: string;
    horaInicio: string;
    horaFin: string;
}