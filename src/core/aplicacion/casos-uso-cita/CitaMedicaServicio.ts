import type { ICitaMedica } from "../../dominio/citaMedica/ICitaMedica.js";
import { CitaMedica } from "../../dominio/citaMedica/CitaMedica.js";
import type { ICitaMedicaRepositorio } from "../../dominio/citaMedica/repositorio/ICitaMedicaRepositorio.js";

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

/**
 * Excepción lanzada cuando un consultorio no existe
 */
export class ConsultorioNoExisteError extends Error {
    constructor(idConsultorio: number) {
        super(`El consultorio con ID ${idConsultorio} no existe`);
        this.name = "ConsultorioNoExisteError";
        Object.setPrototypeOf(this, ConsultorioNoExisteError.prototype);
    }
}

/**
 * Excepción lanzada cuando hay un traslape en las citas del paciente
 */
export class TraslapePacienteError extends Error {
    constructor(idPaciente: number, fechaInicio: Date, fechaFin: Date) {
        super(
            `El paciente ${idPaciente} ya tiene una cita entre ${fechaInicio.toISOString()} y ${fechaFin.toISOString()}`
        );
        this.name = "TraslapePacienteError";
        Object.setPrototypeOf(this, TraslapePacienteError.prototype);
    }
}

/**
 * Excepción lanzada cuando hay un traslape en las citas del médico
 */
export class TraslapeMedicoError extends Error {
    constructor(idMedico: number, fechaInicio: Date, fechaFin: Date) {
        super(
            `El médico ${idMedico} ya tiene una cita entre ${fechaInicio.toISOString()} y ${fechaFin.toISOString()}`
        );
        this.name = "TraslapeMedicoError";
        Object.setPrototypeOf(this, TraslapeMedicoError.prototype);
    }
}

/**
 * Excepción lanzada cuando hay un traslape en las citas del consultorio
 */
export class TraslapeConsultorioError extends Error {
    constructor(idConsultorio: number, fechaInicio: Date, fechaFin: Date) {
        super(
            `El consultorio ${idConsultorio} ya tiene citas entre ${fechaInicio.toISOString()} y ${fechaFin.toISOString()}`
        );
        this.name = "TraslapeConsultorioError";
        Object.setPrototypeOf(this, TraslapeConsultorioError.prototype);
    }
}

/**
 * Excepción lanzada cuando la disponibilidad no existe
 */
export class DisponibilidadNoExisteError extends Error {
    constructor(idDisponibilidad: number) {
        super(`La disponibilidad con ID ${idDisponibilidad} no existe`);
        this.name = "DisponibilidadNoExisteError";
        Object.setPrototypeOf(this, DisponibilidadNoExisteError.prototype);
    }
}

// Función auxiliar para validar estado
function validarEstado(estado: string): boolean {
    const estadosValidos = ["programada", "cancelada", "realizada"];
    return estadosValidos.includes(estado.toLowerCase());
}


export class CitaMedicaServicio {
    constructor(private citaMedicaRepositorio: ICitaMedicaRepositorio) {}

    async CrearCitaMedica(datos: {
        idPaciente: number;
        idDisponibilidad: number;
        fecha: Date;
        estado: string;
        motivo: string | null;
        observaciones: string;
    }): Promise<ICitaMedica> {
        if (!validarEstado(datos.estado)) {
            throw new Error("Estado de cita inválido");
        }

        const nuevaCita: Omit<ICitaMedica, "idCita"> = {
            idPaciente: datos.idPaciente,
            idDisponibilidad: datos.idDisponibilidad,
            idConsultorio: null,
            fecha: datos.fecha,
            estado: datos.estado,
            motivo: datos.motivo,
            observaciones: datos.observaciones,
        };

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
            if (!validarEstado(datosActualizados.estado)) {
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

        // VALIDACIÓN 1: Verificar que el Paciente existe
        console.log(`[1] Verificando existencia del Paciente ID: ${datos.idPaciente}`);
        const pacienteExiste = await this.citaMedicaRepositorio.verificarPacienteExiste(datos.idPaciente);
        if (!pacienteExiste) {
            throw new Error(`Paciente inexistente: El paciente con ID ${datos.idPaciente} no existe en el sistema`);
        }
        console.log("✓ Paciente existe");

        // VALIDACIÓN 2: Verificar que el Médico existe
        console.log(`[2] Verificando existencia del Médico ID: ${datos.idMedico}`);
        const medicoExiste = await this.citaMedicaRepositorio.verificarMedicoExiste(datos.idMedico);
        if (!medicoExiste) {
            throw new Error(`Médico inexistente: El médico con ID ${datos.idMedico} no existe en el sistema`);
        }
        console.log("✓ Médico existe");

        // VALIDACIÓN 3: Verificar que la Disponibilidad existe
        console.log(`[3] Verificando existencia de la Disponibilidad ID: ${datos.idDisponibilidad}`);
        const disponibilidadExiste = await this.citaMedicaRepositorio.verificarDisponibilidadExiste(
            datos.idDisponibilidad
        );
        if (!disponibilidadExiste) {
            throw new Error(
                `Disponibilidad inexistente: La disponibilidad con ID ${datos.idDisponibilidad} no existe`
            );
        }
        console.log("✓ Disponibilidad existe");

        // VALIDACIÓN 4: Verificar que el Consultorio existe (si se proporciona)
        let idConsultorioFinal = datos.idConsultorio;
        if (idConsultorioFinal) {
            console.log(`[4] Verificando existencia del Consultorio ID: ${idConsultorioFinal}`);
            const consultorioExiste = await this.citaMedicaRepositorio.verificarConsultorioExiste(
                idConsultorioFinal
            );
            if (!consultorioExiste) {
                throw new Error(
                    `Consultorio inexistente: El consultorio con ID ${idConsultorioFinal} no existe`
                );
            }
            console.log("✓ Consultorio existe");
        } else {
            console.log("[4] Consultorio no especificado (se asignará automáticamente)");
        }

        // VALIDACIÓN 5: Verificar traslape de citas del PACIENTE
        console.log(
            `[5] Validando traslape para Paciente ID: ${datos.idPaciente} en fecha ${fecha.toISOString()}`
        );
        const traslapePaciente = await this.citaMedicaRepositorio.verificarTraslapePaciente(
            datos.idPaciente,
            fecha,
            fecha
        );
        if (traslapePaciente) {
            throw new Error(
                `Solicitud de hora con traslape para el Paciente: El paciente ${datos.idPaciente} ya tiene una cita en ${fecha.toISOString()}`
            );
        }
        console.log("✓ Sin traslape para el Paciente");

        // VALIDACIÓN 6: Verificar traslape de citas del MÉDICO
        console.log(
            `[6] Validando traslape para Médico ID: ${datos.idMedico} en Disponibilidad ID: ${datos.idDisponibilidad}`
        );
        const traslapeMedico = await this.citaMedicaRepositorio.verificarTraslapeMedico(
            datos.idDisponibilidad,
            fecha,
            fecha
        );
        if (traslapeMedico) {
            throw new Error(
                `Solicitud de hora con traslape para el Médico: El médico ${datos.idMedico} ya tiene una cita en ${fecha.toISOString()}`
            );
        }
        console.log("✓ Sin traslape para el Médico");

        // VALIDACIÓN 7: Verificar traslape de citas del CONSULTORIO (si se proporciona)
        if (idConsultorioFinal) {
            console.log(
                `[7] Validando traslape para Consultorio ID: ${idConsultorioFinal} en fecha ${fecha.toISOString()}`
            );
            const traslapeConsultorio = await this.citaMedicaRepositorio.verificarTraslapeConsultorio(
                idConsultorioFinal,
                fecha,
                fecha
            );
            if (traslapeConsultorio) {
                throw new Error(
                    `Solicitud de hora con traslape para el Consultorio: El consultorio ${idConsultorioFinal} ya tiene una cita en ${fecha.toISOString()}`
                );
            }
            console.log("✓ Sin traslape para el Consultorio");
        } else {
            console.log("[7] Validación de traslape del Consultorio omitida (no especificado)");
        }

        // VALIDACIÓN 8: Crear la cita con estado "programada"
        console.log("[8] Registrando cita con estado 'programada'");
        const nuevaCita: Omit<ICitaMedica, "idCita"> = {
            idPaciente: datos.idPaciente,
            idDisponibilidad: datos.idDisponibilidad,
            idConsultorio: idConsultorioFinal || null,
            fecha: fecha,
            estado: "programada",
            motivo: datos.motivo || null,
            observaciones: datos.observaciones || "",
        };

        const citaRegistrada = await this.citaMedicaRepositorio.crear(nuevaCita);
        console.log(`✓ Cita registrada exitosamente con ID: ${citaRegistrada.idCita}`);

        return citaRegistrada;
    }
}