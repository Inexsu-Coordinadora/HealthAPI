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
            throw new DisponibilidadNoExisteError(datos.idDisponibilidad);
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
        fecha: Date | string;
        idDisponibilidad: number;
        motivo?: string | null;
        observaciones?: string;
    }): Promise<ICitaMedica> {
        // Convertir string a Date si es necesario
        const fecha = typeof datos.fecha === "string" ? new Date(datos.fecha) : datos.fecha;

        // VALIDACIÓN 1: Verificar que el Paciente existe
        console.log(`[1] Verificando existencia del Paciente ID: ${datos.idPaciente}`);
        const pacienteExiste = await this.citaMedicaRepositorio.verificarPacienteExiste(datos.idPaciente);
        if (!pacienteExiste) {
            throw new PacienteNoExisteError(datos.idPaciente);
        }
        console.log(" Paciente existe");


        // VALIDACIÓN 3: Verificar que la Disponibilidad existe Y obtener sus horarios
        console.log(`[3] Verificando existencia de la Disponibilidad ID: ${datos.idDisponibilidad}`);
        const disponibilidadExiste = await this.citaMedicaRepositorio.verificarDisponibilidadExiste(
            datos.idDisponibilidad
        );
        if (!disponibilidadExiste) {
            throw new DisponibilidadNoExisteError(datos.idDisponibilidad);
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


// VALIDACIÓN 5: Verificar que la disponibilidad no esté ocupada
    console.log('[5] Verificando disponibilidad ocupada');
    const disponibilidadOcupada = await this.citaMedicaRepositorio.verificarDisponibilidadOcupada(
    datos.idDisponibilidad,
    fecha
    );

    if (disponibilidadOcupada) {
    throw new DisponibilidadOcupadaError(datos.idDisponibilidad, fecha);
    }
    console.log('✓ Disponibilidad disponible');

    // VALIDACIÓN 6: Verificar que el paciente no tenga otra cita
    console.log('[6] Verificando traslape de paciente');
    const pacienteTieneCita = await this.citaMedicaRepositorio.verificarTraslapePaciente(
    datos.idPaciente,
    horaInicio,
    horaFin,
    fecha
    );

    if (pacienteTieneCita) {
    throw new TraslapePacienteError(datos.idPaciente, fecha);
    }
    console.log('✓ Paciente sin traslapes');


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
