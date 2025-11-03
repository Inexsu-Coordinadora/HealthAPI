import type { IPaciente } from "../IPaciente.js";

export interface IPacienteRepositorio {
  crearPaciente(datosPaciente: IPaciente): Promise<IPaciente>;
}
