import type { ICitaMedica } from "../../dominio/citaMedica/ICitaMedica.js";
import type { ICitaMedicaConDetalles } from "../../dominio/citaMedica/ICitaMedicaConDetalles.js";
import type { ICitaMedicaRepositorio } from "../../dominio/citaMedica/repositorio/ICitaMedicaRepositorio.js";
import type { IDisponibilidadRepositorio } from "../../dominio/disponibilidad/repositorio/IDisponibilidadRepositorio.js";
import type { IPacienteRepositorio } from "../../dominio/paciente/repositorio/IPacienteRepositorio.js"; 

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


export class TraslapePacienteError extends Error {
    constructor(idPaciente: number, fechaInicio: Date, fechaFin: Date) {
        super(
            `El paciente ${idPaciente} ya tiene una cita entre ${fechaInicio.toISOString()} y ${fechaFin.toISOString()}`
        );
        this.name = "TraslapePacienteError";
        Object.setPrototypeOf(this, TraslapePacienteError.prototype);
    }
}


export class TraslapeMedicoError extends Error {
    constructor(idMedico: number, fechaInicio: Date, fechaFin: Date) {
        super(
            `El médico ${idMedico} ya tiene una cita entre ${fechaInicio.toISOString()} y ${fechaFin.toISOString()}`
        );
        this.name = "TraslapeMedicoError";
        Object.setPrototypeOf(this, TraslapeMedicoError.prototype);
    }
}


export class TraslapeConsultorioError extends Error {
    constructor(idConsultorio: number, fechaInicio: Date, fechaFin: Date) {
        super(
            `El consultorio ${idConsultorio} ya tiene citas entre ${fechaInicio.toISOString()} y ${fechaFin.toISOString()}`
        );
        this.name = "TraslapeConsultorioError";
        Object.setPrototypeOf(this, TraslapeConsultorioError.prototype);
    }
}


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
    constructor(
        private citaMedicaRepositorio: ICitaMedicaRepositorio,
        private disponibilidadRepositorio: IDisponibilidadRepositorio,
        private pacienteRepositorio: IPacienteRepositorio  
    ) {}

    async CrearCitaMedica(
        datos: Omit<ICitaMedica, "idCita">
    ): Promise<ICitaMedica> {
        // Validar que la disponibilidad existe
        const disponibilidad =
            await this.disponibilidadRepositorio.obtenerDisponibilidadPorId(
                datos.idDisponibilidad
            );

        if (!disponibilidad) {
            throw new Error(
                `No se encontró una disponibilidad con el ID ${datos.idDisponibilidad}`
            );
        }

        // Validar que la fecha de la cita coincida con la disponibilidad
        this.validarFechaConDisponibilidad(datos.fecha, disponibilidad);

        const nuevaCita: Omit<ICitaMedica, "idCita"> = {
            idPaciente: datos.idPaciente,
            idDisponibilidad: datos.idDisponibilidad,
            fecha: datos.fecha,
            estado: datos.estado,
            motivo: datos.motivo,
            observaciones: datos.observaciones,
        };

        const medicoOcupado = await this.citaMedicaRepositorio.verificarCitasSuperpuestasMedico(
            datos.idDisponibilidad,
            datos.fecha
            );
    
            if (medicoOcupado) {
                throw new Error(`El médico ya tiene una cita programada en ese horario`);
            }

            const pacienteTieneCita = await this.citaMedicaRepositorio.verificarCitasSuperpuestasPaciente(
                datos.idPaciente,
                datos.fecha
            );
            
            if (pacienteTieneCita) {
                throw new Error("El paciente ya tiene una cita programada en ese horario");
            }


        const consultorioOcupado = await this.citaMedicaRepositorio.verificarCitasSuperpuestasConsultorio(
            datos.idDisponibilidad,
            datos.fecha
        );
    
        if (consultorioOcupado) {
            throw new Error(`El consultorio ya está ocupado en ese horario`);
        }

        return await this.citaMedicaRepositorio.crear(nuevaCita);
    }

    private validarFechaConDisponibilidad(
        fecha: Date,
        disponibilidad: {
            diaSemana: string;
            horaInicio: string;
            horaFin: string;
        }
    ): void {
        // Extraer día de semana de la fecha
        const diasSemana = [
            "domingo",
            "lunes",
            "martes",
            "miércoles",
            "jueves",
            "viernes",
            "sábado",
        ];
        const diaCita = diasSemana[fecha.getDay()];

        // Validar día de semana
        if (
            diaCita?.toLowerCase() !==
            disponibilidad.diaSemana
                .toLowerCase()
                .replace("á", "a")
                .replace("é", "e")
        ) {
            throw new Error(
                `La fecha de la cita (${diaCita}) no coincide con el día de disponibilidad (${disponibilidad.diaSemana})`
            );
        }

        // Extraer hora de la fecha (formato HH:MM:SS)
        const horaCita = fecha.toISOString().split("T")[1]?.substring(0, 8);
        if (!horaCita) {
            throw new Error("Formato de fecha inválido");
        }

        // Validar que la hora esté dentro del rango
        if (
            !this.estaEnRangoHorario(
                horaCita,
                disponibilidad.horaInicio,
                disponibilidad.horaFin
            )
        ) {
            throw new Error(
                `La hora de la cita (${horaCita}) no está dentro del rango de disponibilidad (${disponibilidad.horaInicio} - ${disponibilidad.horaFin})`
            );
        }
    }

    private estaEnRangoHorario(
        hora: string,
        horaInicio: string,
        horaFin: string
    ): boolean {
        const convertirAMinutos = (tiempo: string): number => {
            const partes = tiempo.split(":");
            const horas = partes[0] ?? "0";
            const minutos = partes[1] ?? "0";
            return parseInt(horas) * 60 + parseInt(minutos);
        };

        const minutosCita = convertirAMinutos(hora);
        const minutosInicio = convertirAMinutos(horaInicio);
        const minutosFin = convertirAMinutos(horaFin);

        return minutosCita >= minutosInicio && minutosCita < minutosFin;
    }

    async obtenerCitaMedicaPorId(id: number): Promise<ICitaMedica | null> {
        return await this.citaMedicaRepositorio.obtenerCitaPorId(id);
    }

    async listarCitas(): Promise<ICitaMedica[]> {
        return await this.citaMedicaRepositorio.listarCitas();
    }

    async actualizarCita(
        id: number,
        datosActualizados: Partial<Omit<ICitaMedica, "id_cita">>
    ): Promise<ICitaMedica | null> {
        const citaExistente =
            await this.citaMedicaRepositorio.obtenerCitaPorId(id);
        if (!citaExistente) {
            return null;
        }

        return await this.citaMedicaRepositorio.actualizarCita(
            id,
            datosActualizados
        );
    }

    async eliminarCitaMedica(id: number): Promise<boolean> {
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
        console.log(" Paciente existe");

        // VALIDACIÓN 2: Verificar que el Médico existe
        console.log(`[2] Verificando existencia del Médico ID: ${datos.idMedico}`);
        const medicoExiste = await this.citaMedicaRepositorio.verificarMedicoExiste(datos.idMedico);
        if (!medicoExiste) {
            throw new Error(`Médico inexistente: El médico con ID ${datos.idMedico} no existe en el sistema`);
        }
        console.log(" Médico existe");

        // VALIDACIÓN 3: Verificar que la Disponibilidad existe Y obtener sus horarios
        console.log(`[3] Verificando existencia de la Disponibilidad ID: ${datos.idDisponibilidad}`);
        const disponibilidadExiste = await this.citaMedicaRepositorio.verificarDisponibilidadExiste(
            datos.idDisponibilidad
        );
        if (!disponibilidadExiste) {
            throw new Error(
                `Disponibilidad inexistente: La disponibilidad con ID ${datos.idDisponibilidad} no existe`
            );
        }
        console.log(" Disponibilidad existe");

        // Obtener la disponibilidad para extraer horarios
        let horaInicio = "09:00";
        let horaFin = "17:00";
        
        if (this.disponibilidadRepositorio) {
            try {
                const disponibilidad = await this.disponibilidadRepositorio.obtenerDisponibilidadPorId(
                    datos.idDisponibilidad
                );
                if (disponibilidad) {
                    horaInicio = disponibilidad.horaInicio;
                    horaFin = disponibilidad.horaFin;
                    console.log(`✓ Horarios obtenidos: ${horaInicio} - ${horaFin}`);
                }
            } catch (error) {
                console.warn("No se pudo obtener la disponibilidad, usando horarios por defecto");
            }
        }

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
            horaInicio,
            horaFin,
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
            datos.idMedico,
            horaInicio,
            horaFin,
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
                horaInicio,
                horaFin,
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
            fecha: fecha,
            estado: "programada",
            motivo: datos.motivo || null,
            observaciones: datos.observaciones || "",
        };

        const citaRegistrada = await this.citaMedicaRepositorio.crear(nuevaCita);
        console.log(`✓ Cita registrada exitosamente con ID: ${citaRegistrada.idCita}`);

        return citaRegistrada;
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
