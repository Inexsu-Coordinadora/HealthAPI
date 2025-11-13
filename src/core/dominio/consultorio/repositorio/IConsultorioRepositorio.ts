import type { IConsultorio } from "../IConsultorio.js";

export interface IConsultorioRepositorio {
    crearConsultorio(datosConsultorio: IConsultorio): Promise<IConsultorio>;
    obtenerConsultorioPorId(idConsultorio: number): Promise<IConsultorio | null>;
    listarConsultorios(): Promise<IConsultorio[]>;
    actualizarConsultorio(idConsultorio: number, datosConsultorio: Partial<IConsultorio>): Promise<IConsultorio>;
    eliminarConsultorio(idConsultorio: number): Promise<boolean>;
    obtenerPorNombre(nombre: string): Promise<IConsultorio | null>;
}