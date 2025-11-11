import type { IDisponibilidadRepositorio } from "../../dominio/disponibilidad/repositorio/IDisponibilidadRepositorio.js";
import type { IDisponibilidad } from "../../dominio/disponibilidad/IDisponibilidad.js";
import { Disponibilidad } from "../../dominio/disponibilidad/Disponibilidad.js";

export class DisponibilidadServicio {
    constructor(
        private readonly disponibilidadRepositorio: IDisponibilidadRepositorio
    ) {}

    async crearDisponibilidad(
        datos: Omit<IDisponibilidad, "idDisponibilidad">
    ): Promise<IDisponibilidad> {
        // Verificar disponibilidad duplicada (única validación en el servicio)
        const existeDuplicado =
            await this.disponibilidadRepositorio.verificarDisponibilidadDuplicada(
                datos.idMedico,
                datos.idConsultorio ?? null,
                datos.diaSemana,
                datos.horaInicio,
                datos.horaFin
            );

        if (existeDuplicado) {
            throw new Error(
                "Ya existe una disponibilidad idéntica para este médico en el mismo horario"
            );
        }

        const nuevaDisponibilidad = Disponibilidad.crear(
            datos.idMedico,
            datos.diaSemana,
            datos.horaInicio,
            datos.horaFin,
            datos.idConsultorio
        );

        return await this.disponibilidadRepositorio.crearDisponibilidad(
            nuevaDisponibilidad
        );
    }

    async obtenerDisponibilidadPorId(
        id: number
    ): Promise<IDisponibilidad | null> {
        return await this.disponibilidadRepositorio.obtenerDisponibilidadPorId(
            id
        );
    }

    async listarDisponibilidades(): Promise<IDisponibilidad[]> {
        return await this.disponibilidadRepositorio.listarDisponibilidades();
    }

    async obtenerDisponibilidadesPorMedico(
        idMedico: number
    ): Promise<IDisponibilidad[]> {
        return await this.disponibilidadRepositorio.obtenerDisponibilidadesPorMedico(
            idMedico
        );
    }

    async obtenerDisponibilidadesPorConsultorio(
        idConsultorio: number
    ): Promise<IDisponibilidad[]> {
        return await this.disponibilidadRepositorio.obtenerDisponibilidadesPorConsultorio(
            idConsultorio
        );
    }

    async actualizarDisponibilidad(
        id: number,
        datosActualizados: Partial<IDisponibilidad>
    ): Promise<IDisponibilidad | null> {
        const disponibilidadExistente =
            await this.disponibilidadRepositorio.obtenerDisponibilidadPorId(id);
        if (!disponibilidadExistente) {return null;}

        return await this.disponibilidadRepositorio.actualizarDisponibilidad(
            id,
            datosActualizados
        );
    }

    async eliminarDisponibilidad(id: number): Promise<boolean> {
        return await this.disponibilidadRepositorio.eliminarDisponibilidad(id);
    }
}
