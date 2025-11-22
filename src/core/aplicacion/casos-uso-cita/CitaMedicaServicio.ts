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
    };
};

export class MedicoNoExisteError extends Error {
    constructor(idMedico: number) {
        super(`El médico con ID ${idMedico} no existe`);
        this.name = "MedicoNoExisteError";
        Object.setPrototypeOf(this, MedicoNoExisteError.prototype);
    };
};

export class ConsultorioNoExisteError extends Error {
    constructor(idConsultorio: number) {
        super(`El consultorio con ID ${idConsultorio} no existe`);
        this.name = "ConsultorioNoExisteError";
        Object.setPrototypeOf(this, ConsultorioNoExisteError.prototype);
    };
};

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

export class CitaMedicaServicio {
    constructor(
        private citaMedicaRepositorio: ICitaMedicaRepositorio,
        private disponibilidadRepositorio: IDisponibilidadRepositorio,
        private pacienteRepositorio: IPacienteRepositorio
    ) {}

    /**
     * Crear una cita médica con validaciones completas
     */
    async CrearCitaMedica(
        datos: Omit<ICitaMedica, "idCita">
    ): Promise<ICitaMedica> {
        // 1. Validar que la disponibilidad existe
        const disponibilidad =
            await this.disponibilidadRepositorio.obtenerDisponibilidadPorId(
                datos.idDisponibilidad
            );

        if (!disponibilidad) {
            throw new DisponibilidadNoExisteError(datos.idDisponibilidad);
        }

        // 2. Validar que la fecha de la cita coincida con la disponibilidad
        this.validarFechaConDisponibilidad(datos.fecha, disponibilidad);

        // 3. Verificar traslapes de médico
        const medicoOcupado = await this.citaMedicaRepositorio.verificarCitasSuperpuestasMedico(
            datos.idDisponibilidad,
            datos.fecha
        );

        if (medicoOcupado) {
            throw new TraslapeCitaError(
                "El médico ya tiene una cita programada en ese horario"
            );
        }

        // 4. Verificar traslapes de paciente
        const pacienteTieneCita = await this.citaMedicaRepositorio.verificarCitasSuperpuestasPaciente(
            datos.idPaciente,
            datos.fecha
        );

        if (pacienteTieneCita) {
            throw new TraslapeCitaError(
                "El paciente ya tiene una cita programada en ese horario"
            );
        }

        // 5. Verificar traslapes de consultorio (si aplica)
        const consultorioOcupado = await this.citaMedicaRepositorio.verificarCitasSuperpuestasConsultorio(
            datos.idDisponibilidad,
            datos.fecha
        );

        if (consultorioOcupado) {
            throw new TraslapeCitaError(
                "El consultorio ya está ocupado en ese horario"
            );
        }

        // 6. Crear la cita
        const nuevaCita: Omit<ICitaMedica, "idCita"> = {
            idPaciente: datos.idPaciente,
            idDisponibilidad: datos.idDisponibilidad,
            fecha: datos.fecha,
            estado: datos.estado || "programada",
            motivo: datos.motivo,
            observaciones: datos.observaciones,
        };

        return await this.citaMedicaRepositorio.crear(nuevaCita);
    }

    /**
     * Validar que la fecha de la cita coincida con la disponibilidad
     */
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

        // Normalizar para comparación (quitar acentos)
        const normalizarDia = (dia: string): string => {
            return dia
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
        };

        // Validar día de semana
        if (!diaCita) {
            throw new Error("No se pudo obtener el día de la cita");
        }

        if (normalizarDia(diaCita) !== normalizarDia(disponibilidad.diaSemana)) {
            throw new FechaDisponibilidadInvalidaError(
                `La fecha de la cita (${diaCita}) no coincide con el día de disponibilidad (${disponibilidad.diaSemana})`
                );
        };

        // Extraer hora de la fecha (formato HH:MM:SS)
        const horaCita = fecha.toISOString().split("T")[1]?.substring(0, 8);
        if (!horaCita) {
            throw new FechaDisponibilidadInvalidaError(
                "Formato de fecha inválido"
            );
        }

        // Validar que la hora esté dentro del rango
        if (
            !this.estaEnRangoHorario(
                horaCita,
                disponibilidad.horaInicio,
                disponibilidad.horaFin
            )
        ) {
            throw new FechaDisponibilidadInvalidaError(
                `La hora de la cita (${horaCita}) no está dentro del rango de disponibilidad (${disponibilidad.horaInicio} - ${disponibilidad.horaFin})`
            );
        }
    }

    /**
     * Verificar si una hora está dentro de un rango horario
     */
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

    /**
     * Obtener una cita médica por ID
     */
    async obtenerCitaMedicaPorId(id: number): Promise<ICitaMedica | null> {
        return await this.citaMedicaRepositorio.obtenerCitaPorId(id);
    }

    /**
     * Listar todas las citas médicas
     */
    async listarCitas(): Promise<ICitaMedica[]> {
        return await this.citaMedicaRepositorio.listarCitas();
    }

    /**
     * Actualizar una cita médica
     */
    async actualizarCita(
        id: number,
        datosActualizados: Partial<Omit<ICitaMedica, "idCita">>
    ): Promise<ICitaMedica | null> {
        const citaExistente =
            await this.citaMedicaRepositorio.obtenerCitaPorId(id);
        
        if (!citaExistente) {
            return null;
        }

        // Si se actualiza la fecha o disponibilidad, revalidar
        if (datosActualizados.fecha || datosActualizados.idDisponibilidad) {
            const idDisponibilidad = datosActualizados.idDisponibilidad || citaExistente.idDisponibilidad;
            const fecha = datosActualizados.fecha || citaExistente.fecha;

            const disponibilidad =
                await this.disponibilidadRepositorio.obtenerDisponibilidadPorId(
                    idDisponibilidad
                );

            if (!disponibilidad) {
                throw new DisponibilidadNoExisteError(idDisponibilidad);
            }

            this.validarFechaConDisponibilidad(fecha, disponibilidad);
        }

        return await this.citaMedicaRepositorio.actualizarCita(
            id,
            datosActualizados
        );
    }

    /**
     * Eliminar una cita médica
     */
    async eliminarCitaMedica(id: number): Promise<boolean> {
        return await this.citaMedicaRepositorio.eliminarCita(id);
    }

    /**
     * ✅ SERVICIO 2: Obtener citas de un paciente con detalles
     * Este es el método principal para la funcionalidad de consulta de citas
     */
    async obtenerCitasPorPaciente(
        idPaciente: number
    ): Promise<ICitaMedicaConDetalles[]> {
        // Validar que el ID sea positivo
        if (idPaciente <= 0) {
            throw new Error("El ID del paciente debe ser un número positivo");
        }

        // Verificar que el paciente existe
        const paciente = await this.pacienteRepositorio.obtenerPacientePorId(
            idPaciente
        );

        if (!paciente) {
            throw new PacienteNoExisteError(idPaciente);
        }

        // Obtener las citas con detalles
        const citas = await this.citaMedicaRepositorio.obtenerCitasConDetallesPorPaciente(
            idPaciente
        );

        return citas;
    }

    /**
     * ⚠️ DEPRECADO: Usar CrearCitaMedica en su lugar
     * Este método está duplicado y será removido
     */
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
        const fecha =
            typeof datos.fecha === "string" ? new Date(datos.fecha) : datos.fecha;

        // Verificar que el Paciente existe
        const pacienteExiste =
            await this.citaMedicaRepositorio.verificarPacienteExiste(
                datos.idPaciente
            );
        if (!pacienteExiste) {
            throw new PacienteNoExisteError(datos.idPaciente);
        }

        // Verificar que el Médico existe
        const medicoExiste =
            await this.citaMedicaRepositorio.verificarMedicoExiste(datos.idMedico);
        if (!medicoExiste) {
            throw new MedicoNoExisteError(datos.idMedico);
        }

        // Verificar que la Disponibilidad existe
        const disponibilidadExiste =
            await this.citaMedicaRepositorio.verificarDisponibilidadExiste(
                datos.idDisponibilidad
            );
        if (!disponibilidadExiste) {
            throw new DisponibilidadNoExisteError(datos.idDisponibilidad);
        }

        // Obtener horarios de disponibilidad
        let horaInicio = "09:00";
        let horaFin = "17:00";

        const disponibilidad =
            await this.disponibilidadRepositorio.obtenerDisponibilidadPorId(
                datos.idDisponibilidad
            );
        if (disponibilidad) {
            horaInicio = disponibilidad.horaInicio;
            horaFin = disponibilidad.horaFin;
        }

        // Verificar traslape del paciente
        const traslapePaciente =
            await this.citaMedicaRepositorio.verificarTraslapePaciente(
                datos.idPaciente,
                horaInicio,
                horaFin,
                fecha
            );
        if (traslapePaciente) {
            throw new TraslapeCitaError(
                `El paciente ${datos.idPaciente} ya tiene una cita en ${fecha.toISOString()}`
            );
        }

        // Verificar traslape del médico
        const traslapeMedico =
            await this.citaMedicaRepositorio.verificarTraslapeMedico(
                datos.idMedico,
                horaInicio,
                horaFin,
                fecha
            );
        if (traslapeMedico) {
            throw new TraslapeCitaError(
                `El médico ${datos.idMedico} ya tiene una cita en ${fecha.toISOString()}`
            );
        }

        // Verificar traslape del consultorio (si se proporciona)
        if (datos.idConsultorio) {
            const consultorioExiste =
                await this.citaMedicaRepositorio.verificarConsultorioExiste(
                    datos.idConsultorio
                );
            if (!consultorioExiste) {
                throw new ConsultorioNoExisteError(datos.idConsultorio);
            }

            const traslapeConsultorio =
                await this.citaMedicaRepositorio.verificarTraslapeConsultorio(
                    datos.idConsultorio,
                    horaInicio,
                    horaFin,
                    fecha
                );
            if (traslapeConsultorio) {
                throw new TraslapeCitaError(
                    `El consultorio ${datos.idConsultorio} ya tiene una cita en ${fecha.toISOString()}`
                );
            }
        }

        // Crear la cita
        const nuevaCita: Omit<ICitaMedica, "idCita"> = {
            idPaciente: datos.idPaciente,
            idDisponibilidad: datos.idDisponibilidad,
            fecha: fecha,
            estado: "programada",
            motivo: datos.motivo || null,
            observaciones: datos.observaciones || "",
        };

        return await this.citaMedicaRepositorio.crear(nuevaCita);
    }
}