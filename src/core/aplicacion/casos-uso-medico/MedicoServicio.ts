import type { IMedicoRepositorio } from "../../dominio/medico/repositorio/IMedicoRepositorio.js";
import type { IMedico } from "../../dominio/medico/IMedico.js";
import { Medico } from "../../dominio/medico/Medico.js";
import {
    BadRequestError,
    ConflictError,
} from "../../../common/errores/AppError.js";

export class MedicoServicio {
    constructor(private readonly medicoRepositorio: IMedicoRepositorio) {}

    async crearMedico(datos: Omit<IMedico, "idMedico">): Promise<IMedico> {
        const nuevoMedico = Medico.crear(
            datos.nombreMedico,
            datos.correoMedico,
            datos.especialidadMedico
        );

        if (!datos.correoMedico || datos.correoMedico.trim() === "") {
            throw new BadRequestError("El correo del médico es obligatorio");
        }

        if (
            !datos.especialidadMedico ||
            datos.especialidadMedico.trim() === ""
        ) {
            throw new BadRequestError(
                "La especialidad del médico es obligatoria"
            );
        }

        const medicoExistente = await this.medicoRepositorio.obtenerPorCorreo(
            datos.correoMedico
        );
        if (medicoExistente) {
            throw new ConflictError(
                `Ya existe un médico con el correo ${datos.correoMedico}`
            );
        }

        // VALIDACIÓN DEL FORMATO DEL CORREO
        if (!Medico.validarCorreo(nuevoMedico.correoMedico)) {
            throw new BadRequestError(
                "El formato del correo electrónico es inválido"
            );
        }

        // GUARDAR EN EL REPOSITORIO
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
        if (!medicoExistente) {
            return null;
        }

        return await this.medicoRepositorio.actualizarMedico(
            id,
            datosActualizados
        );
    }

    async eliminarMedico(id: number): Promise<boolean> {
        return await this.medicoRepositorio.eliminarMedico(id);
    }
}
