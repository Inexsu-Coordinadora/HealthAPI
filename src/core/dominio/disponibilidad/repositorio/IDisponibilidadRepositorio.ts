import type { IDisponibilidad } from "../IDisponibilidad.js";

export interface IDisponibilidadRepositorio {
    crearDisponibilidad(datosDisponibilidad: IDisponibilidad): Promise<IDisponibilidad>;
    obtenerDisponibilidadPorId(idDisponibilidad: number): Promise<IDisponibilidad | null>;
    listarDisponibilidades(): Promise<IDisponibilidad[]>;
    obtenerDisponibilidadesPorMedico(idMedico: number): Promise<IDisponibilidad[]>;
    obtenerDisponibilidadesPorConsultorio(idConsultorio: number): Promise<IDisponibilidad[]>;
    actualizarDisponibilidad(
        idDisponibilidad: number,
        datosDisponibilidad: Partial<IDisponibilidad>
    ): Promise<IDisponibilidad>;
    eliminarDisponibilidad(idDisponibilidad: number): Promise<boolean>;
    

    verificarDisponibilidadDuplicada(
        idMedico: number,
        idConsultorio: number | null,
        diaSemana: string,
        horaInicio: string,
        horaFin: string
    ): Promise<boolean>;
};