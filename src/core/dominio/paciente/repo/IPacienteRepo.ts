import type { IPaciente } from "../IPaciente.js";

export interface IPacienteRepositorio {
  crearPaciente(datosPaciente: IPaciente): Promise<IPaciente>;
   obtenerPacientePorId(idPaciente: number): Promise<IPaciente | null>;
}
