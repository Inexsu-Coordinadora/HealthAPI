import type { ICitaMedica } from "../../dominio/citaMedica/ICitaMedica.js";
import type { ICitaMedicaConDetalles } from "../../dominio/citaMedica/ICitaMedicaConDetalles.js";
import { CitaMedica } from "../../dominio/citaMedica/CitaMedica.js";
import type { ICitaMedicaRepositorio } from "../../dominio/citaMedica/repositorio/ICitaMedicaRepositorio.js";
import type { IPacienteRepositorio } from "../../dominio/paciente/repo/IPacienteRepo.js"; 

export class CitaMedicaServicio {
    constructor(
        private citaMedicaRepositorio: ICitaMedicaRepositorio,
        private pacienteRepositorio: IPacienteRepositorio  
    ) {}

    async CrearCitaMedica(datos: {
        idPaciente: number;
        idDisponibilidad: number;
        fecha: Date;
        estado: string;
        motivo: string | null;
        observaciones: string;
    }): Promise<ICitaMedica> {
        if (!CitaMedica.validarEstado(datos.estado)) {
            throw new Error("Estado de cita inválido");
        }

        const medicoOcupado = await this.citaMedicaRepositorio.verificarCitasSuperpuestasMedico(
            datos.idDisponibilidad,
            datos.fecha
            );
    
            if (medicoOcupado) {
                throw new Error(`El médico ya tiene una cita programada en ese horario`);
            }

        const nuevaCita: Omit<ICitaMedica, "idCita"> = {
            idPaciente: datos.idPaciente,
            idDisponibilidad: datos.idDisponibilidad,
            fecha: datos.fecha,
            estado: datos.estado,
            motivo: datos.motivo,
            observaciones: datos.observaciones,
        };

        const consultorioOcupado = await this.citaMedicaRepositorio.verificarCitasSuperpuestasConsultorio(
            datos.idDisponibilidad,
            datos.fecha
        );
    
        if (consultorioOcupado) {
            throw new Error(`El consultorio ya está ocupado en ese horario`);
        }

        return await this.citaMedicaRepositorio.crear(nuevaCita);
    }

    async obtenerCitaMedicaPorId(id: number): Promise<ICitaMedica> {
        if (id <= 0) {
            throw new Error("El ID de la cita médica debe ser un número positivo");
        }

        const cita = await this.citaMedicaRepositorio.obtenerCitaPorId(id);

        if (!cita) {
            throw new Error("No se encontró una cita médica con el ID ${id}");
        }

        return cita;
    }

    async listarCitas(): Promise<ICitaMedica[]> {
        return await this.citaMedicaRepositorio.listarCitas();
    }

    async actualizarCita(id: number, datosActualizados: Partial<Omit<ICitaMedica, "id_cita">>): Promise<ICitaMedica> {
        if (id <= 0) {
            throw new Error("El ID de la cita médica debe ser un número positivo");
        }

        const citaExistente = await this.citaMedicaRepositorio.obtenerCitaPorId(id);
        if (!citaExistente) {
            throw new Error("No se encontró una cita médica con el ID ${id}");
        }

        if (datosActualizados.idDisponibilidad !== undefined) {
            if (datosActualizados.idDisponibilidad <= 0) {
                throw new Error("El ID de disponibilidad debe ser un número positivo");
            }
        }

        if (datosActualizados.fecha !== undefined) {
            if (!datosActualizados.fecha) {
                throw new Error("La fecha no puede estar vacía");
            }
        }

        if (datosActualizados.estado !== undefined) {
            if (datosActualizados.estado.trim() === "") {
                throw new Error("El estado no puede estar vacío");
            }
            if (!CitaMedica.validarEstado(datosActualizados.estado)) {
                throw new Error("El estado de la cita es inválido");
            }
        }

        const citaActualizada = await this.citaMedicaRepositorio.actualizarCita(id, datosActualizados);

        if (!citaActualizada) {
            throw new Error("Error al actualizar la cita médica");
        }

        return citaActualizada;
    }

    async eliminarCitaMedica(id: number): Promise<boolean> {
        if (id <= 0) {
            throw new Error("El ID de la cita médica debe ser un número positivo");
        }

        const citaExistente = await this.citaMedicaRepositorio.obtenerCitaPorId(id);
        if (!citaExistente) {
            throw new Error("No se encontró una cita médica con el ID ${id}");
        }

        return await this.citaMedicaRepositorio.eliminarCita(id);
    }

    
    async obtenerCitasPorPaciente(idPaciente: number): Promise<ICitaMedicaConDetalles[]> {
    
        if (idPaciente <= 0) {
            throw new Error("El ID del paciente debe ser un número positivo");
        }

    
        const paciente = await this.pacienteRepositorio.obtenerPacientePorId(idPaciente);
        if (!paciente) {
            throw new Error(`No se encontró un paciente con el ID ${idPaciente}`);
        }

    
        const citas = await this.citaMedicaRepositorio.obtenerCitasConDetallesPorPaciente(idPaciente);

    
        return citas;
    };
};
