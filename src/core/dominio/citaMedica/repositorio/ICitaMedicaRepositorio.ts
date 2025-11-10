// src/core/dominio/citaMedica/repositorio/ICitaMedicaRepositorio.ts

import type { ICitaMedica } from "../ICitaMedica.js";

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
  
  verificarTraslapePaciente(
    idPaciente: number,
    fechaInicio: Date,
    fechaFin: Date,
    excluirCitaId?: number
  ): Promise<ICitaMedica | null>;
  
  verificarTraslapeMedico(
    idDisponibilidad: number,
    fechaInicio: Date,
    fechaFin: Date,
    excluirCitaId?: number
  ): Promise<ICitaMedica | null>;
  
  verificarTraslapeConsultorio(
    idConsultorio: number,
    fechaInicio: Date,
    fechaFin: Date,
    excluirCitaId?: number
  ): Promise<ICitaMedica | null>;
}