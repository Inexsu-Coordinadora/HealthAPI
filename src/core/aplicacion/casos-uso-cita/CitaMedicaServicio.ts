import type { ICitaMedica } from "../../dominio/citaMedica/ICitaMedica.js";
import { CitaMedica } from "../../dominio/citaMedica/CitaMedica.js";
import type { ICitaMedicaRepositorio } from "../../dominio/citaMedica/repositorio/ICitaMedicaRepositorio.js";

export class CitaMedicaServicio {
    constructor(private citaMedicaRepositorio: ICitaMedicaRepositorio) {}

    async CrearCitaMedica(
        datos: Omit<ICitaMedica, "idCita">
    ): Promise<ICitaMedica> {
        const nuevaCita = CitaMedica.crear(
            datos.idPaciente,
            datos.idDisponibilidad,
            datos.fecha,
            datos.estado,
            datos.motivo,
            datos.observaciones
        );

        return await this.citaMedicaRepositorio.crear(nuevaCita);
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
        if (!citaExistente) {return null;}

        return await this.citaMedicaRepositorio.actualizarCita(
            id,
            datosActualizados
        );
    }

    async eliminarCitaMedica(id: number): Promise<boolean> {
        return await this.citaMedicaRepositorio.eliminarCita(id);
    }
}
