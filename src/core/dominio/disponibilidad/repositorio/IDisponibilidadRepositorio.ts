import type { IDisponibilidad } from "../IDisponibilidad.js";

export interface IDisponibilidadRepositorio {
    crearDisponibilidad(
        datosDisponibilidad: IDisponibilidad
    ): Promise<IDisponibilidad>;
    obtenerDisponibilidadPorId(
        idDisponibilidad: number
    ): Promise<IDisponibilidad | null>;
    listarDisponibilidades(): Promise<IDisponibilidad[]>;
    obtenerDisponibilidadesPorMedico(
        idMedico: number
    ): Promise<IDisponibilidad[]>;
    obtenerDisponibilidadesPorConsultorio(
        idConsultorio: number
    ): Promise<IDisponibilidad[]>;
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

    /**
     * Verifica si un médico ya tiene disponibilidad en otro consultorio
     * que se solape con el horario propuesto
     */
    verificarConflictoMedicoEnOtroConsultorio(
        idMedico: number,
        idConsultorio: number | null,
        diaSemana: string,
        horaInicio: string,
        horaFin: string,
        idDisponibilidadActual?: number
    ): Promise<boolean>;

    /**
     * Verifica si un consultorio ya está ocupado por otro médico
     * en el mismo horario
     */
    verificarConflictoConsultorioOcupado(
        idConsultorio: number,
        diaSemana: string,
        horaInicio: string,
        horaFin: string,
        idDisponibilidadActual?: number
    ): Promise<boolean>;
}