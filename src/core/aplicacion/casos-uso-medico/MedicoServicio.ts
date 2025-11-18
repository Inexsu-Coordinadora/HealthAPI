import type { IMedicoRepositorio } from "../../dominio/medico/repositorio/IMedicoRepositorio.js";
import type { IMedico } from "../../dominio/medico/IMedico.js";
import { Medico } from "../../dominio/medico/Medico.js";

export class MedicoServicio {
    constructor(private readonly medicoRepositorio: IMedicoRepositorio) {}

    async crearMedico(datos: Omit<IMedico, "idMedico">): Promise<IMedico> {
        const nuevoMedico = Medico.crear(
            datos.nombreMedico,
            datos.correoMedico,
            datos.especialidadMedico
        );

        return await this.medicoRepositorio.crearMedico(nuevoMedico);
    }

    async obtenerMedicoPorId(id: number): Promise<IMedico | null> {
        return await this.medicoRepositorio.obtenerMedicoPorId(id);
    }

    async listarMedicos(): Promise<IMedico[]> {
        return await this.medicoRepositorio.listarMedicos();
    }

    async actualizarMedico(
        id: number,
        datosActualizados: Partial<IMedico>
    ): Promise<IMedico | null> {
        const medicoExistente =
            await this.medicoRepositorio.obtenerMedicoPorId(id);
        if (!medicoExistente) {return null;}

        return await this.medicoRepositorio.actualizarMedico(
            id,
            datosActualizados
        );
    }

    async eliminarMedico(id: number): Promise<boolean> {
        return await this.medicoRepositorio.eliminarMedico(id);
    }
}
