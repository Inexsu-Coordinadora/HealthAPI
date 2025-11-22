import type { ICitaMedica } from "../ICitaMedica.js";
import type { ICitaMedicaConDetalles } from "../ICitaMedicaConDetalles.js";

export type TipoEntidad = 'paciente' | 'medico' | 'consultorio';

export interface ICitaMedicaRepositorio {
  crear(cita: Omit<ICitaMedica, 'idCita'>): Promise<ICitaMedica>;
  obtenerCitaPorId(id: number): Promise<ICitaMedica | null>;
  listarCitas(): Promise<ICitaMedica[]>;
  actualizarCita(id: number, cita: Partial<Omit<ICitaMedica, 'idCita'>>): Promise<ICitaMedica | null>;
  eliminarCita(id: number): Promise<boolean>;
  obtenerPorPaciente(idPaciente: number): Promise<ICitaMedica[]>;
  obtenerPorMedico(idMedico: number): Promise<ICitaMedica[]>;
  obtenerPorEstado(estado: string): Promise<ICitaMedica[]>;
  verificarPacienteExiste(idPaciente: number): Promise<boolean>;
  verificarMedicoExiste(idMedico: number): Promise<boolean>;
  verificarConsultorioExiste(idConsultorio: number): Promise<boolean>;
  verificarDisponibilidadExiste(idDisponibilidad: number): Promise<boolean>;
  obtenerCitasConDetallesPorPaciente(idPaciente: number): Promise<ICitaMedicaConDetalles[]>;
  verificarTraslape(
    tipo: TipoEntidad,
    idEntidad: number,
    horaInicio: string,
    horaFin: string,
    fecha: Date,
    excluirCitaId?: number
  ): Promise<ICitaMedica | null>;
}