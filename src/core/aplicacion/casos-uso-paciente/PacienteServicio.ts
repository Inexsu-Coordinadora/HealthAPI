import type { IPacienteRepositorio } from "../../dominio/paciente/repositorio/IPacienteRepositorio.js";
import type { IPaciente, IPacienteActualizar } from "../../dominio/paciente/IPaciente.js";
import { Paciente } from "../../dominio/paciente/Paciente.js";

export class PacienteServicio {
    constructor(private readonly pacienteRepositorio: IPacienteRepositorio) {}

    async crearPaciente(datos: Omit<IPaciente, "idPaciente">): Promise<IPaciente> {
        // Crear instancia de Paciente
        const nuevoPaciente = Paciente.crear(datos.nombrePaciente, datos.correoPaciente, datos.telefonoPaciente || "");

        return await this.pacienteRepositorio.crearPaciente(nuevoPaciente);
    }
    // Obtener un paciente por ID
    async obtenerPacientePorId(id: number): Promise<IPaciente | null> {
        return await this.pacienteRepositorio.obtenerPacientePorId(id);
    }

    // Obtener todos los pacientes
    async listarPacientes(): Promise<IPaciente[]> {
        return await this.pacienteRepositorio.listarPacientes();
    }

    // Actualizar un paciente
    async actualizarPaciente(id: number, datosActualizados: IPacienteActualizar): Promise<IPaciente | null> {
        // Verificar que el paciente existe
        const pacienteExistente = await this.pacienteRepositorio.obtenerPacientePorId(id);
        if (!pacienteExistente) return null;

        // Actualizar en el repositorio
        return await this.pacienteRepositorio.actualizarPaciente(id, datosActualizados);
    }

    // Eliminar un paciente
    async eliminarPaciente(id: number): Promise<boolean> {
        return await this.pacienteRepositorio.eliminarPaciente(id);
    }
}
