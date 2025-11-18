import type { IConsultorioRepositorio } from "../../dominio/consultorio/repositorio/IConsultorioRepositorio.js";
import type { IConsultorio } from "../../dominio/consultorio/IConsultorio.js";
import { Consultorio } from "../../dominio/consultorio/Consultorio.js";

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

        return await this.consultorioRepositorio.crearConsultorio(nuevoConsultorio);
    }

    

    // OBTENER CONSULTORIO POR ID
    async obtenerConsultorioPorId(id: number): Promise<IConsultorio> {
        if (id <= 0) {
            throw new Error("El ID del consultorio debe ser un número positivo");
        }

        const consultorio = await this.consultorioRepositorio.obtenerConsultorioPorId(id);

        if (!consultorio) {
            throw new Error(`No se encontró un consultorio con el ID ${id}`);
        }

        return consultorio;
    }

    // LISTAR TODOS LOS CONSULTORIOS
    async listarConsultorios(): Promise<IConsultorio[]> {
        return await this.consultorioRepositorio.listarConsultorios();
    }

    // ACTUALIZAR CONSULTORIO
    async actualizarConsultorio(id: number, datosActualizados: Partial<IConsultorio>): Promise<IConsultorio> {
        if (id <= 0) {
            throw new Error("El ID del consultorio debe ser un número positivo");
        }

        const consultorioExistente = await this.consultorioRepositorio.obtenerConsultorioPorId(id);
        if (!consultorioExistente) {
            throw new Error(`No se encontró un consultorio con el ID ${id}`);
        }

        if (datosActualizados.nombreConsultorio !== undefined) {
            if (datosActualizados.nombreConsultorio.trim() === "") {
                throw new Error("El nombre del consultorio no puede estar vacío");
            }
        }

        const consultorioActualizado = await this.consultorioRepositorio.actualizarConsultorio(id, datosActualizados);

        if (!consultorioActualizado) {
            throw new Error("Error al actualizar el consultorio");
        }

        return consultorioActualizado;
    }

    // ELIMINAR UN CONSULTORIO
    async eliminarConsultorio(id: number): Promise<boolean> {
        if (id <= 0) {
            throw new Error("El ID del consultorio debe ser un número positivo");
        }

        const consultorioExistente = await this.consultorioRepositorio.obtenerConsultorioPorId(id);
        if (!consultorioExistente) {
            throw new Error(`No se encontró un consultorio con el ID ${id}`);
        }

        return await this.consultorioRepositorio.eliminarConsultorio(id);
    }
}