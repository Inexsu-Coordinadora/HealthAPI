import type { ICitaMedica } from "../../dominio/citaMedica/ICitaMedica.js";
import type { ICitaMedicaConDetalles } from "../../dominio/citaMedica/ICitaMedicaConDetalles.js";
import type { ICitaMedicaRepositorio } from "../../dominio/citaMedica/repositorio/ICitaMedicaRepositorio.js";
import type { IDisponibilidadRepositorio } from "../../dominio/disponibilidad/repositorio/IDisponibilidadRepositorio.js";
import type { IPacienteRepositorio } from "../../dominio/paciente/repositorio/IPacienteRepositorio.js";
import { FechaUtil } from "../../../common/utilidades/FormatoFecha.js"; // ✅ Corregido import

// ERRORES TIPADOS

export class PacienteNoExisteError extends Error {
    constructor(idPaciente: number) {
        super(`El paciente con ID ${idPaciente} no existe`);
        this.name = "PacienteNoExisteError";
        Object.setPrototypeOf(this, PacienteNoExisteError.prototype);
    }
}

export class MedicoNoExisteError extends Error {
    constructor(idMedico: number) {
        super(`El médico con ID ${idMedico} no existe`);
        this.name = "MedicoNoExisteError";
        Object.setPrototypeOf(this, MedicoNoExisteError.prototype);
    }
}

export class ConsultorioNoExisteError extends Error {
    constructor(idConsultorio: number) {
        super(`El consultorio con ID ${idConsultorio} no existe`);
        this.name = "ConsultorioNoExisteError";
        Object.setPrototypeOf(this, ConsultorioNoExisteError.prototype);
    }
}

export class DisponibilidadNoExisteError extends Error {
    constructor(idDisponibilidad: number) {
        super(`La disponibilidad con ID ${idDisponibilidad} no existe`);
        this.name = "DisponibilidadNoExisteError";
        Object.setPrototypeOf(this, DisponibilidadNoExisteError.prototype);
    }
}

export class TraslapeCitaError extends Error {
    constructor(mensaje: string) {
        super(mensaje);
        this.name = "TraslapeCitaError";
        Object.setPrototypeOf(this, TraslapeCitaError.prototype);
    }
}

export class FechaDisponibilidadInvalidaError extends Error {
    constructor(mensaje: string) {
        super(mensaje);
        this.name = "FechaDisponibilidadInvalidaError";
        Object.setPrototypeOf(this, FechaDisponibilidadInvalidaError.prototype);
    }
}

export class FechaInvalidaError extends Error {
    constructor(mensaje: string) {
        super(mensaje);
        this.name = "FechaInvalidaError";
        Object.setPrototypeOf(this, FechaInvalidaError.prototype);
    }
}


// SERVICIO


export class CitaMedicaServicio {
    constructor(
        private citaMedicaRepositorio: ICitaMedicaRepositorio,
        private disponibilidadRepositorio: IDisponibilidadRepositorio,
        private pacienteRepositorio: IPacienteRepositorio
    ) {}

    /*
     *  CREAR UNA CITA MÉDICA CON VALIDACIONES COMPLETAS
     */
    async CrearCitaMedica(datos: Omit<ICitaMedica, "idCita">): Promise<ICitaMedica> {
        // 1. Validar que la fecha sea futura
        if (!FechaUtil.esFechaFutura(datos.fecha)) {
            throw new FechaInvalidaError("La fecha de la cita debe ser futura");
        }

        // 2. Validar que el paciente existe
        const paciente = await this.pacienteRepositorio.obtenerPacientePorId(datos.idPaciente);
        if (!paciente) {
            throw new PacienteNoExisteError(datos.idPaciente);
        }

        // 3. Validar que la disponibilidad existe
        const disponibilidad = await this.disponibilidadRepositorio.obtenerDisponibilidadPorId(
            datos.idDisponibilidad
        );
        if (!disponibilidad) {
            throw new DisponibilidadNoExisteError(datos.idDisponibilidad);
        }

        // 4. ✅ Validar que la fecha de la cita coincida con la disponibilidad
        const citaCoincide = FechaUtil.validarCitaConDisponibilidad(
            datos.fecha,
            disponibilidad.diaSemana,
            disponibilidad.horaInicio,
            disponibilidad.horaFin
        );

        if (!citaCoincide) {
            const diaCita = FechaUtil.obtenerDiaSemana(datos.fecha);
            const horaCita = FechaUtil.extraerHora(datos.fecha);
            throw new FechaDisponibilidadInvalidaError(
                `La cita no coincide con la disponibilidad. ` +
                `La cita es el ${diaCita} a las ${horaCita}, ` +
                `pero la disponibilidad es los ${disponibilidad.diaSemana} ` +
                `de ${disponibilidad.horaInicio} a ${disponibilidad.horaFin}`
            );
        }

        // 5. Verificar traslape de paciente
        const pacienteTieneCita = await this.citaMedicaRepositorio.verificarCitasSuperpuestasPaciente(
            datos.idPaciente,
            datos.fecha
        );
        if (pacienteTieneCita) {
            throw new TraslapeCitaError(
                "El paciente ya tiene una cita programada en ese horario"
            );
        }

        // 6. Verificar traslape de médico
        const medicoOcupado = await this.citaMedicaRepositorio.verificarCitasSuperpuestasMedico(
            datos.idDisponibilidad,
            datos.fecha
        );
        if (medicoOcupado) {
            throw new TraslapeCitaError(
                "El médico ya tiene una cita programada en ese horario"
            );
        }

        // 7. Verificar traslape de consultorio (si la disponibilidad tiene consultorio)
        if (disponibilidad.idConsultorio) {
            const consultorioOcupado = await this.citaMedicaRepositorio.verificarCitasSuperpuestasConsultorio(
                datos.idDisponibilidad,
                datos.fecha
            );
            if (consultorioOcupado) {
                throw new TraslapeCitaError(
                    "El consultorio ya está ocupado en ese horario"
                );
            }
        }

        // 8. Crear la cita con fecha normalizada
        const nuevaCita: Omit<ICitaMedica, "idCita"> = {
            idPaciente: datos.idPaciente,
            idDisponibilidad: datos.idDisponibilidad,
            fecha: FechaUtil.normalizarFecha(datos.fecha),
            estado: datos.estado || "programada",
            motivo: datos.motivo ?? null,
            observaciones: datos.observaciones ?? "",
        };

        return await this.citaMedicaRepositorio.crear(nuevaCita);
    }

    /**
     * OBTENER UNA CITA MÉDICA POR ID
     */
    async obtenerCitaMedicaPorId(id: number): Promise<ICitaMedica | null> {
        if (id <= 0) {
            throw new Error("El ID de la cita debe ser un número positivo");
        }
        return await this.citaMedicaRepositorio.obtenerCitaPorId(id);
    }

    /**
     * LISTAR TODAS LAS CITAS MÉDICAS
     */
    async listarCitas(): Promise<ICitaMedica[]> {
        return await this.citaMedicaRepositorio.listarCitas();
    }

    /**
     * ACTUALIZAR UNA CITA MÉDICA
     */
    async actualizarCita(
        id: number,
        datosActualizados: Partial<Omit<ICitaMedica, "idCita">>
    ): Promise<ICitaMedica | null> {
        if (id <= 0) {
            throw new Error("El ID de la cita debe ser un número positivo");
        }

        const citaExistente = await this.citaMedicaRepositorio.obtenerCitaPorId(id);
        if (!citaExistente) {
            return null;
        }

        // Si se actualiza la fecha o disponibilidad, revalidar coherencia
        if (datosActualizados.fecha || datosActualizados.idDisponibilidad) {
            const idDisponibilidad = datosActualizados.idDisponibilidad ?? citaExistente.idDisponibilidad;
            const fecha = datosActualizados.fecha ?? citaExistente.fecha;

            // Validar que la fecha sea futura
            if (datosActualizados.fecha && !FechaUtil.esFechaFutura(fecha)) {
                throw new FechaInvalidaError("La fecha de la cita debe ser futura");
            }

            // Validar disponibilidad
            const disponibilidad = await this.disponibilidadRepositorio.obtenerDisponibilidadPorId(
                idDisponibilidad
            );
            if (!disponibilidad) {
                throw new DisponibilidadNoExisteError(idDisponibilidad);
            }

            // Validar coherencia fecha-disponibilidad
            const citaCoincide = FechaUtil.validarCitaConDisponibilidad(
                fecha,
                disponibilidad.diaSemana,
                disponibilidad.horaInicio,
                disponibilidad.horaFin
            );

            if (!citaCoincide) {
                const diaCita = FechaUtil.obtenerDiaSemana(fecha);
                const horaCita = FechaUtil.extraerHora(fecha);
                throw new FechaDisponibilidadInvalidaError(
                    `La cita no coincide con la disponibilidad. ` +
                    `La cita es el ${diaCita} a las ${horaCita}, ` +
                    `pero la disponibilidad es los ${disponibilidad.diaSemana} ` +
                    `de ${disponibilidad.horaInicio} a ${disponibilidad.horaFin}`
                );
            }

            // Normalizar fecha si se actualizó
            if (datosActualizados.fecha) {
                datosActualizados.fecha = FechaUtil.normalizarFecha(fecha);
            }
        }

        return await this.citaMedicaRepositorio.actualizarCita(id, datosActualizados);
    }

    /**
     * ELIMINAR UNA CITA MÉDICA
     */
    async eliminarCitaMedica(id: number): Promise<boolean> {
        if (id <= 0) {
            throw new Error("El ID de la cita debe ser un número positivo");
        }

        const citaExistente = await this.citaMedicaRepositorio.obtenerCitaPorId(id);
        if (!citaExistente) {
            throw new Error(`No se encontró una cita con el ID ${id}`);
        }

        return await this.citaMedicaRepositorio.eliminarCita(id);
    }

    /**
     * SERVICIO 2: OBTENER CITAS DE UN PACIENTE CON DETALLES
     */
    async obtenerCitasPorPaciente(idPaciente: number): Promise<ICitaMedicaConDetalles[]> {
        // Validar que el ID sea positivo
        if (idPaciente <= 0) {
            throw new Error("El ID del paciente debe ser un número positivo");
        }

        // Verificar que el paciente existe
        const paciente = await this.pacienteRepositorio.obtenerPacientePorId(idPaciente);
        if (!paciente) {
            throw new PacienteNoExisteError(idPaciente);
        }

        // Obtener las citas con detalles
        const citas = await this.citaMedicaRepositorio.obtenerCitasConDetallesPorPaciente(idPaciente);

        return citas;
    }

    async agendarCitaConValidacion(datos: {
        idPaciente: number;
        idMedico: number;
        fecha: Date | string;
        idDisponibilidad: number;
        idConsultorio?: number | null;
        motivo?: string | null;
        observaciones?: string;
    }): Promise<ICitaMedica> {
        // Convertir string a Date si es necesario
        const fecha = typeof datos.fecha === "string" ? new Date(datos.fecha) : datos.fecha;

        // Validar que la fecha sea futura
        if (!FechaUtil.esFechaFutura(fecha)) {
            throw new FechaInvalidaError("La fecha de la cita debe ser futura");
        }

        // Verificar que el Paciente existe
        const paciente = await this.pacienteRepositorio.obtenerPacientePorId(datos.idPaciente);
        if (!paciente) {
            throw new PacienteNoExisteError(datos.idPaciente);
        }

        // Verificar que la Disponibilidad existe
        const disponibilidad = await this.disponibilidadRepositorio.obtenerDisponibilidadPorId(
            datos.idDisponibilidad
        );
        if (!disponibilidad) {
            throw new DisponibilidadNoExisteError(datos.idDisponibilidad);
        }

        // Validar coherencia fecha-disponibilidad
        const citaCoincide = FechaUtil.validarCitaConDisponibilidad(
            fecha,
            disponibilidad.diaSemana,
            disponibilidad.horaInicio,
            disponibilidad.horaFin
        );

        if (!citaCoincide) {
            const diaCita = FechaUtil.obtenerDiaSemana(fecha);
            const horaCita = FechaUtil.extraerHora(fecha);
            throw new FechaDisponibilidadInvalidaError(
                `La cita no coincide con la disponibilidad. ` +
                `La cita es el ${diaCita} a las ${horaCita}, ` +
                `pero la disponibilidad es los ${disponibilidad.diaSemana} ` +
                `de ${disponibilidad.horaInicio} a ${disponibilidad.horaFin}`
            );
        }

        // Verificar traslape del paciente
        const pacienteTieneCita = await this.citaMedicaRepositorio.verificarCitasSuperpuestasPaciente(
            datos.idPaciente,
            fecha
        );
        if (pacienteTieneCita) {
            throw new TraslapeCitaError(
                `El paciente ya tiene una cita programada en ese horario`
            );
        }

        // Verificar traslape del médico
        const medicoOcupado = await this.citaMedicaRepositorio.verificarCitasSuperpuestasMedico(
            datos.idDisponibilidad,
            fecha
        );
        if (medicoOcupado) {
            throw new TraslapeCitaError(
                `El médico ya tiene una cita programada en ese horario`
            );
        }

        // Verificar traslape del consultorio
        if (disponibilidad.idConsultorio) {
            const consultorioOcupado = await this.citaMedicaRepositorio.verificarCitasSuperpuestasConsultorio(
                datos.idDisponibilidad,
                fecha
            );
            if (consultorioOcupado) {
                throw new TraslapeCitaError(
                    `El consultorio ya está ocupado en ese horario`
                );
            }
        }

        // Crear la cita
        const nuevaCita: Omit<ICitaMedica, "idCita"> = {
            idPaciente: datos.idPaciente,
            idDisponibilidad: datos.idDisponibilidad,
            fecha: FechaUtil.normalizarFecha(fecha),
            estado: "programada",
            motivo: datos.motivo ?? null,
            observaciones: datos.observaciones ?? "",
        };

        return await this.citaMedicaRepositorio.crear(nuevaCita);
    };
};
