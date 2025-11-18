import type { IConsultorioRepositorio } from "../../dominio/consultorio/repositorio/IConsultorioRepositorio.js";
import type { IConsultorio } from "../../dominio/consultorio/IConsultorio.js";
import { Consultorio } from "../../dominio/consultorio/consultorio.js";

export class ConsultorioServicio {
    constructor(private readonly consultorioRepositorio: IConsultorioRepositorio) {}

    // CREACIÓN DE UN NUEVO CONSULTORIO
    async crearConsultorio(datos: Omit<IConsultorio, "idConsultorio">): Promise<IConsultorio> {
        if (!datos.nombreConsultorio || datos.nombreConsultorio.trim() === "") {
            throw new Error("El nombre del consultorio es obligatorio");
        }

        const consultorioExistente = await this.consultorioRepositorio.obtenerPorNombre(datos.nombreConsultorio);
            if (consultorioExistente) {
        throw new Error(`Ya existe un consultorio con el nombre ${datos.nombreConsultorio}`);
        }

        const nuevoConsultorio = Consultorio.crear(
            datos.nombreConsultorio,
            datos.ubicacionConsultorio,
            datos.capacidadConsultorio
        );

        return await this.consultorioRepositorio.crearConsultorio(
            nuevoConsultorio
        );
    }

    async obtenerConsultorioPorId(id: number): Promise<IConsultorio | null> {
        return await this.consultorioRepositorio.obtenerConsultorioPorId(id);
    }

    async listarConsultorios(): Promise<IConsultorio[]> {
        return await this.consultorioRepositorio.listarConsultorios();
    }

    async actualizarConsultorio(
        id: number,
        datosActualizados: Partial<IConsultorio>
    ): Promise<IConsultorio | null> {
        const consultorioExistente =
            await this.consultorioRepositorio.obtenerConsultorioPorId(id);
        if (!consultorioExistente) {return null;}

        return await this.consultorioRepositorio.actualizarConsultorio(
            id,
            datosActualizados
        );
    }

    async eliminarConsultorio(id: number): Promise<boolean> {
        return await this.consultorioRepositorio.eliminarConsultorio(id);
    }
}
