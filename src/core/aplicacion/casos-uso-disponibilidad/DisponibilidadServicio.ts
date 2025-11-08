import type { IDisponibilidadRepositorio } from "../../dominio/disponibilidad/repositorio/IDisponibilidadRepositorio.js";
import type { IDisponibilidad } from "../../dominio/disponibilidad/IDisponibilidad.js";
import { Disponibilidad } from "../../dominio/disponibilidad/Disponibilidad.js";

export class DisponibilidadServicio {
    constructor(private readonly disponibilidadRepositorio: IDisponibilidadRepositorio) {}

    // CREACIÓN DE UNA NUEVA DISPONIBILIDAD
    async crearDisponibilidad(datos: Omit<IDisponibilidad, "idDisponibilidad">): Promise<IDisponibilidad> {
        
        if (!datos.idMedico || datos.idMedico <= 0) {
            throw new Error("El ID del médico es obligatorio y debe ser positivo");
        }

        if (!datos.diaSemana || datos.diaSemana.trim() === "") {
            throw new Error("El día de la semana es obligatorio");
        }

        if (!datos.horaInicio || datos.horaInicio.trim() === "") {
            throw new Error("La hora de inicio es obligatoria");
        }

        if (!datos.horaFin || datos.horaFin.trim() === "") {
            throw new Error("La hora de fin es obligatoria");
        }

        
        if (!Disponibilidad.validarDiaSemana(datos.diaSemana)) {
            throw new Error("El día de la semana no es válido");
        }

        
        if (!Disponibilidad.validarFormatoHora(datos.horaInicio)) {
            throw new Error("El formato de la hora de inicio es inválido (debe ser HH:MM o HH:MM:SS)");
        }

        if (!Disponibilidad.validarFormatoHora(datos.horaFin)) {
            throw new Error("El formato de la hora de fin es inválido (debe ser HH:MM o HH:MM:SS)");
        }

        
        if (!Disponibilidad.validarRangoHorario(datos.horaInicio, datos.horaFin)) {
            throw new Error("La hora de inicio debe ser menor que la hora de fin");
        }

        
        const existeDuplicado = await this.disponibilidadRepositorio.verificarDisponibilidadDuplicada(
            datos.idMedico,
            datos.idConsultorio ?? null,
            datos.diaSemana,
            datos.horaInicio,
            datos.horaFin
        );

        if (existeDuplicado) {
            throw new Error("Ya existe una disponibilidad idéntica para este médico en el mismo horario");
        }

        
        const nuevaDisponibilidad = Disponibilidad.crear(
            datos.idMedico,
            datos.diaSemana,
            datos.horaInicio,
            datos.horaFin,
            datos.idConsultorio
        );

        
        return await this.disponibilidadRepositorio.crearDisponibilidad(nuevaDisponibilidad);
    }

    
    async obtenerDisponibilidadPorId(id: number): Promise<IDisponibilidad> {
        if (id <= 0) {
            throw new Error("El ID de la disponibilidad debe ser un número positivo");
        }

        const disponibilidad = await this.disponibilidadRepositorio.obtenerDisponibilidadPorId(id);

        if (!disponibilidad) {
            throw new Error(`No se encontró una disponibilidad con el ID ${id}`);
        }

        return disponibilidad;
    }

    
    async listarDisponibilidades(): Promise<IDisponibilidad[]> {
        return await this.disponibilidadRepositorio.listarDisponibilidades();
    }

    
    async obtenerDisponibilidadesPorMedico(idMedico: number): Promise<IDisponibilidad[]> {
        if (idMedico <= 0) {
            throw new Error("El ID del médico debe ser un número positivo");
        }

        return await this.disponibilidadRepositorio.obtenerDisponibilidadesPorMedico(idMedico);
    }

    
    async obtenerDisponibilidadesPorConsultorio(idConsultorio: number): Promise<IDisponibilidad[]> {
        if (idConsultorio <= 0) {
            throw new Error("El ID del consultorio debe ser un número positivo");
        }

        return await this.disponibilidadRepositorio.obtenerDisponibilidadesPorConsultorio(idConsultorio);
    }

    
    async actualizarDisponibilidad(
        id: number,
        datosActualizados: Partial<IDisponibilidad>
    ): Promise<IDisponibilidad> {
        if (id <= 0) {
            throw new Error("El ID de la disponibilidad debe ser un número positivo");
        }

        
        const disponibilidadExistente = await this.disponibilidadRepositorio.obtenerDisponibilidadPorId(id);
        if (!disponibilidadExistente) {
            throw new Error(`No se encontró una disponibilidad con el ID ${id}`);
        }

        
        if (datosActualizados.diaSemana !== undefined) {
            if (datosActualizados.diaSemana.trim() === "") {
                throw new Error("El día de la semana no puede estar vacío");
            }
            if (!Disponibilidad.validarDiaSemana(datosActualizados.diaSemana)) {
                throw new Error("El día de la semana no es válido");
            }
        }

        if (datosActualizados.horaInicio !== undefined) {
            if (datosActualizados.horaInicio.trim() === "") {
                throw new Error("La hora de inicio no puede estar vacía");
            }
            if (!Disponibilidad.validarFormatoHora(datosActualizados.horaInicio)) {
                throw new Error("El formato de la hora de inicio es inválido");
            }
        }

        if (datosActualizados.horaFin !== undefined) {
            if (datosActualizados.horaFin.trim() === "") {
                throw new Error("La hora de fin no puede estar vacía");
            }
            if (!Disponibilidad.validarFormatoHora(datosActualizados.horaFin)) {
                throw new Error("El formato de la hora de fin es inválido");
            }
        }

        
        const horaInicio = datosActualizados.horaInicio ?? disponibilidadExistente.horaInicio;
        const horaFin = datosActualizados.horaFin ?? disponibilidadExistente.horaFin;

        if (!Disponibilidad.validarRangoHorario(horaInicio, horaFin)) {
            throw new Error("La hora de inicio debe ser menor que la hora de fin");
        }

        
        const disponibilidadActualizada = await this.disponibilidadRepositorio.actualizarDisponibilidad(
            id,
            datosActualizados
        );

        if (!disponibilidadActualizada) {
            throw new Error("Error al actualizar la disponibilidad");
        }

        return disponibilidadActualizada;
    }

    
    async eliminarDisponibilidad(id: number): Promise<boolean> {
        if (id <= 0) {
            throw new Error("El ID de la disponibilidad debe ser un número positivo");
        }

        
        const disponibilidadExistente = await this.disponibilidadRepositorio.obtenerDisponibilidadPorId(id);
        if (!disponibilidadExistente) {
            throw new Error(`No se encontró una disponibilidad con el ID ${id}`);
        }

        return await this.disponibilidadRepositorio.eliminarDisponibilidad(id);
    }
}