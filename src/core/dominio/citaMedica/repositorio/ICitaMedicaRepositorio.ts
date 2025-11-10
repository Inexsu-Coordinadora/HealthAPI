import type { ICitaMedica } from "../ICitaMedica.js";
import type { ICitaMedicaConDetalles } from "../ICitaMedicaConDetalles.js";

export interface ICitaMedicaRepositorio {
    crear(cita: Omit<ICitaMedica, `idCita`>): Promise<ICitaMedica>;
    obtenerCitaPorId(id: number): Promise<ICitaMedica | null>;
    listarCitas(): Promise<ICitaMedica[]>;
    actualizarCita(id: number, cita: Partial<Omit<ICitaMedica, `id_cita`>>): Promise<ICitaMedica | null>;
    eliminarCita(id: number): Promise<boolean>;
    obtenerPorPaciente(idPaciente: number): Promise<ICitaMedica[]>;
    obtenerPorMedico(idMedico: number): Promise<ICitaMedica[]>;
    obtenerPorEstado(estado: string): Promise<ICitaMedica[]>;
    obtenerCitasConDetallesPorPaciente(idPaciente: number): Promise<ICitaMedicaConDetalles[]>;
    verificarCitasSuperpuestasMedico(idDisponibilidad: number, fecha: Date): Promise<boolean>;
}