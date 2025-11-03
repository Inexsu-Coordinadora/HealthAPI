import type { IPacienteRepositorio } from "../../dominio/paciente/repo/IPacienteRepo.js";
import type { IPaciente } from "../../dominio/paciente/IPaciente.js";
import { Paciente } from "../../dominio/paciente/Paciente.js";

export class PacienteServicio {
  constructor(private readonly pacienteRepositorio: IPacienteRepositorio) {}

  async crearPaciente(
    datos: Omit<IPaciente, "idPaciente">,
  ): Promise<IPaciente> {
    // Crear instancia de Paciente
    const nuevoPaciente = Paciente.crear(
      datos.nombrePaciente,
      datos.correoPaciente,
      datos.telefonoPaciente || "",
    );

    // Guardar en el repositorio
    return await this.pacienteRepositorio.crearPaciente(nuevoPaciente);
  }
}
