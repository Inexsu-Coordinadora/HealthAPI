import type { ICitaMedica } from "../../dominio/citaMedica/ICitaMedica.js";
import type { ICitaMedicaConDetalles } from "../../dominio/citaMedica/ICitaMedicaConDetalles.js";
import type { ICitaMedicaRepositorio } from "../../dominio/citaMedica/repositorio/ICitaMedicaRepositorio.js";
import type { IDisponibilidadRepositorio } from "../../dominio/disponibilidad/repositorio/IDisponibilidadRepositorio.js";
import type { IPacienteRepositorio } from "../../dominio/paciente/repositorio/IPacienteRepositorio.js"; 

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
