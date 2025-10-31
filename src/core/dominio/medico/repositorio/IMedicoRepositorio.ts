import type { IMedico } from "../IMedico.js";
import { Pool } from "pg";

export interface IMedicoRepositorio {
    crearMedico(datosMedico: IMedico): Promise<IMedico>;
    obtenerMedicoPorId(idMedico: number): Promise<IMedico | null>;
    actualizarMedico(idMedico: number, datosMedico:Partial<IMedico>): Promise<IMedico>;
    listarMedicos(): Promise<IMedico[]>;
    eliminarMedico(idMedico: number): Promise<boolean>;
}