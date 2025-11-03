import type { ICitaMedica } from "../ICitaMedica.js";

export interface ICitaMedicaRepositorio{
    crear(cita:Omit<ICitaMedica,`id_cita`>): Promise <ICitaMedica>;
    obtenerCitaPorId(id:number): Promise <ICitaMedica|null>; 
    listarCitas(): Promise <ICitaMedica[]>; 
    actualizarCita(id:number, cita: Partial<Omit<ICitaMedica,`id_cita`>> ): Promise <ICitaMedica|null>; 
    eliminarCita(id:number): Promise<boolean>; 
    obtenerPorPaciente(idPaciente: number): Promise<ICitaMedica[]>;
    obtenerPorMedico(idMedico: number): Promise<ICitaMedica[]>;
    obtenerPorEstado(estado: string): Promise<ICitaMedica[]>;
}