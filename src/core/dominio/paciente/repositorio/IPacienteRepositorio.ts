import type { IPaciente } from "../IPaciente.js";
import { Pool } from "pg";

export interface IPacienteRepositorio {
    crearPaciente(datosPaciente: IPaciente): Promise<IPaciente>;
    obtenerPacientePorId(idPaciente: number): Promise<IPaciente | null>;
    actualizarPaciente(idPaciente: number, datosPaciente:Partial<IPaciente>): Promise<IPaciente>;
    listarPacientes(): Promise<IPaciente[]>;
    eliminarPaciente(idPaciente: number): Promise<boolean>;
}