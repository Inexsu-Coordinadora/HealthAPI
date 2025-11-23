import type { ICitaMedica } from "../../dominio/citaMedica/ICitaMedica.js";
import type { ICitaMedicaConDetalles } from "../../dominio/citaMedica/ICitaMedicaConDetalles.js";
import type { ICitaMedicaRepositorio } from "../../dominio/citaMedica/repositorio/ICitaMedicaRepositorio.js";
import type { IDisponibilidadRepositorio } from "../../dominio/disponibilidad/repositorio/IDisponibilidadRepositorio.js";
import type { IPacienteRepositorio } from "../../dominio/paciente/repositorio/IPacienteRepositorio.js";
import { FechaUtil } from "../../../common/utilidades/FormatoFecha.js";

// ERRORES TIPADOS

export class PacienteNoExisteError extends Error {
    constructor(idPaciente: number) {
        super(`El paciente con ID ${idPaciente} no existe`);
        this.name = "PacienteNoExisteError";
        Object.setPrototypeOf(this, PacienteNoExisteError.prototype);
    }
}

export class DisponibilidadNoExisteError extends Error {
    constructor(idDisponibilidad: number) {
        super(`La disponibilidad con ID ${idDisponibilidad} no existe`);
        this.name = "DisponibilidadNoExisteError";
        Object.setPrototypeOf(this, DisponibilidadNoExisteError.prototype);
    }
}
/**
 * Excepción lanzada cuando una disponibilidad ya está ocupada
 */
export class DisponibilidadOcupadaError extends Error {
    constructor(idDisponibilidad: number, fecha: Date) {
        super(
            `La disponibilidad ${idDisponibilidad} ya está ocupada en la fecha ${fecha.toISOString()}`
        );
        this.name = "DisponibilidadOcupadaError";
        Object.setPrototypeOf(this, DisponibilidadOcupadaError.prototype);
    }
}

/**
 * Excepción lanzada cuando hay un traslape en las citas del paciente
 */
export class TraslapePacienteError extends Error {
    constructor(idPaciente: number, fecha: Date) {
        super(
            ` El paciente ${idPaciente} ya tiene una cita programada en ${fecha.toISOString()}`
        );
        this.name = "TraslapePacienteError";
        Object.setPrototypeOf(this, TraslapePacienteError.prototype);
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

export class CitaMedicaServicio {
    constructor(
        private citaMedicaRepositorio: ICitaMedicaRepositorio,
        private disponibilidadRepositorio: IDisponibilidadRepositorio,
        private pacienteRepositorio: IPacienteRepositorio
    ) {}

    /*
     *  CREAR UNA CITA MÉDICA CON VALIDACIONES COMPLETAS
     */
    async CrearCitaMedica(
        datos: Omit<ICitaMedica, "idCita">
    ): Promise<ICitaMedica> {
        // 1. Validar que la fecha sea futura
        if (!FechaUtil.esFechaFutura(datos.fecha)) {
            throw new FechaInvalidaError("La fecha de la cita debe ser futura");
        }

        // 2. Validar que el paciente existe
        const paciente = await this.pacienteRepositorio.obtenerPacientePorId(
            datos.idPaciente
        );
        if (!paciente) {
            throw new PacienteNoExisteError(datos.idPaciente);
        }

        // 3. Validar que la disponibilidad existe
        const disponibilidad =
            await this.disponibilidadRepositorio.obtenerDisponibilidadPorId(
                datos.idDisponibilidad
            );
        if (!disponibilidad) {
            throw new DisponibilidadNoExisteError(datos.idDisponibilidad);
        }

        // 4. Validar que el día y hora de la cita coinciden con la disponibilidad
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

        const nuevaCita: Omit<ICitaMedica, "idCita"> = {
            idPaciente: datos.idPaciente,
            idDisponibilidad: datos.idDisponibilidad,
            fecha: datos.fecha,
            estado: datos.estado,
            motivo: datos.motivo,
            observaciones: datos.observaciones,
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

        const citaExistente =
            await this.citaMedicaRepositorio.obtenerCitaPorId(id);
        if (!citaExistente) {
            return null;
        }

        // Si se actualiza la fecha o disponibilidad, revalidar coherencia
        if (datosActualizados.fecha || datosActualizados.idDisponibilidad) {
            const idDisponibilidad =
                datosActualizados.idDisponibilidad ??
                citaExistente.idDisponibilidad;
            const fecha = datosActualizados.fecha ?? citaExistente.fecha;

            // Validar que la fecha sea futura
            if (datosActualizados.fecha && !FechaUtil.esFechaFutura(fecha)) {
                throw new FechaInvalidaError(
                    "La fecha de la cita debe ser futura"
                );
            }

            // Validar disponibilidad
            const disponibilidad =
                await this.disponibilidadRepositorio.obtenerDisponibilidadPorId(
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

        return await this.citaMedicaRepositorio.actualizarCita(
            id,
            datosActualizados
        );
    }

    /**
     * ELIMINAR UNA CITA MÉDICA
     */
    async eliminarCitaMedica(id: number): Promise<boolean> {
        if (id <= 0) {
            throw new Error("El ID de la cita debe ser un número positivo");
        }

        const citaExistente =
            await this.citaMedicaRepositorio.obtenerCitaPorId(id);
        if (!citaExistente) {
            throw new Error(`No se encontró una cita con el ID ${id}`);
        }

        return await this.citaMedicaRepositorio.eliminarCita(id);
    }

    /**
     * SERVICIO 2: OBTENER CITAS DE UN PACIENTE CON DETALLES
     */
    async obtenerCitasPorPaciente(
        idPaciente: number
    ): Promise<ICitaMedicaConDetalles[]> {
        // Validar que el ID sea positivo
        if (idPaciente <= 0) {
            throw new Error("El ID del paciente debe ser un número positivo");
        }

        // Verificar que el paciente existe
        const paciente =
            await this.pacienteRepositorio.obtenerPacientePorId(idPaciente);
        if (!paciente) {
            throw new PacienteNoExisteError(idPaciente);
        }

        // Obtener las citas con detalles
        const citas =
            await this.citaMedicaRepositorio.obtenerCitasConDetallesPorPaciente(
                idPaciente
            );

        return citas;
    }

    async agendarCitaConValidacion(datos: {
        idPaciente: number;
        fecha: Date | string;
        idDisponibilidad: number;
        motivo?: string | null;
        observaciones?: string;
    }): Promise<ICitaMedica> {
        // Convertir string a Date si es necesario
        const fecha =
            typeof datos.fecha === "string"
                ? new Date(datos.fecha)
                : datos.fecha;

        // VALIDACIÓN 1: Verificar que el Paciente existe
        console.log(
            `[1] Verificando existencia del Paciente ID: ${datos.idPaciente}`
        );
        const pacienteExiste =
            await this.citaMedicaRepositorio.verificarPacienteExiste(
                datos.idPaciente
            );
        if (!pacienteExiste) {
            throw new PacienteNoExisteError(datos.idPaciente);
        }
        console.log(" Paciente existe");

        // Verificar que la Disponibilidad existe
        const disponibilidad =
            await this.disponibilidadRepositorio.obtenerDisponibilidadPorId(
                datos.idDisponibilidad
            );
        if (!disponibilidad) {
            throw new DisponibilidadNoExisteError(datos.idDisponibilidad);
        }
        console.log(" Disponibilidad existe");

        // Obtener la disponibilidad para extraer horarios
        let horaInicio = "09:00";
        let horaFin = "17:00";

        if (this.disponibilidadRepositorio) {
            try {
                const disponibilidad =
                    await this.disponibilidadRepositorio.obtenerDisponibilidadPorId(
                        datos.idDisponibilidad
                    );
                if (disponibilidad) {
                    horaInicio = disponibilidad.horaInicio;
                    horaFin = disponibilidad.horaFin;
                    console.log(
                        `✓ Horarios obtenidos: ${horaInicio} - ${horaFin}`
                    );
                }
            } catch (error) {
                console.warn(
                    "No se pudo obtener la disponibilidad, usando horarios por defecto"
                );
            }
        }

        // VALIDACIÓN 5: Verificar que la disponibilidad no esté ocupada
        console.log("[5] Verificando disponibilidad ocupada");
        const disponibilidadOcupada =
            await this.citaMedicaRepositorio.verificarDisponibilidadOcupada(
                datos.idDisponibilidad,
                fecha
            );

        if (disponibilidadOcupada) {
            throw new DisponibilidadOcupadaError(datos.idDisponibilidad, fecha);
        }
        console.log("✓ Disponibilidad disponible");

        // VALIDACIÓN 6: Verificar que el paciente no tenga otra cita
        console.log("[6] Verificando traslape de paciente");
        const pacienteTieneCita =
            await this.citaMedicaRepositorio.verificarTraslapePaciente(
                datos.idPaciente,
                horaInicio,
                horaFin,
                fecha
            );

        if (pacienteTieneCita) {
            throw new TraslapePacienteError(datos.idPaciente, fecha);
        }
        console.log("✓ Paciente sin traslapes");

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
    }
}
