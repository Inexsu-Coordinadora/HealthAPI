import type { IPaciente, IPacienteActualizar } from "../IPaciente.js";

export interface IPacienteRepositorio {
    crearPaciente(datosPaciente: IPaciente): Promise<IPaciente>;
    obtenerPacientePorId(idPaciente: number): Promise<IPaciente | null>;
    listarPacientes(): Promise<IPaciente[]>;
    actualizarPaciente(idPaciente: number, datosPaciente: IPacienteActualizar): Promise<IPaciente>;
    eliminarPaciente(idPaciente: number): Promise<boolean>;
    obtenerPorCorreo(correo: string): Promise<IPaciente | null>;
}