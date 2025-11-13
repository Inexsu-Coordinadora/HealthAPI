import type { ICitaMedica } from "../ICitaMedica.js";
import type { ICitaMedicaConDetalles } from "../ICitaMedicaConDetalles.js";

export interface ICitaMedicaRepositorio {
  crear(cita: Omit<ICitaMedica, 'idCita'>): Promise<ICitaMedica>;
  obtenerCitaPorId(id: number): Promise<ICitaMedica | null>;
  listarCitas(): Promise<ICitaMedica[]>;
  actualizarCita(id: number, cita: Partial<Omit<ICitaMedica, 'idCita'>>): Promise<ICitaMedica | null>;
  eliminarCita(id: number): Promise<boolean>;
  obtenerPorPaciente(idPaciente: number): Promise<ICitaMedica[]>;
  obtenerPorMedico(idMedico: number): Promise<ICitaMedica[]>;
  obtenerPorEstado(estado: string): Promise<ICitaMedica[]>;
   obtenerCitasConDetallesPorPaciente(idPaciente: number): Promise<ICitaMedicaConDetalles[]>;
    verificarCitasSuperpuestasPaciente(idPaciente: number, fecha: Date): Promise<boolean>;
    verificarCitasSuperpuestasMedico(idDisponibilidad: number, fecha: Date): Promise<boolean>;
    verificarCitasSuperpuestasConsultorio(idDisponibilidad: number, fecha: Date): Promise<boolean>;


  verificarPacienteExiste(idPaciente: number): Promise<boolean>;
  verificarMedicoExiste(idMedico: number): Promise<boolean>;
  verificarConsultorioExiste(idConsultorio: number): Promise<boolean>;
  verificarDisponibilidadExiste(idDisponibilidad: number): Promise<boolean>;
  
  verificarTraslapePaciente(
    idPaciente: number,
    horaInicio: string,
    horaFin: string,
    fecha?: Date,
    excluirCitaId?: number
  ): Promise<ICitaMedica | null>;
  
  verificarTraslapeMedico(
    idMedico: number,
    horaInicio: string,
    horaFin: string,
    fecha?: Date,
    excluirCitaId?: number
  ): Promise<ICitaMedica | null>;
  
  verificarTraslapeConsultorio(
    idConsultorio: number,
    horaInicio: string,
    horaFin: string,
    fecha?: Date,
    excluirCitaId?: number
  ): Promise<ICitaMedica | null>;
}