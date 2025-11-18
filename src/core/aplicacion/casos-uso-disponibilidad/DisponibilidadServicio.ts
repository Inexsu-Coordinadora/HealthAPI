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
        // 1. Verificar disponibilidad duplicada exacta
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

        // 2. Verificar que el médico no esté en otro consultorio al mismo tiempo
        const medicoEnOtroConsultorio =
            await this.disponibilidadRepositorio.verificarConflictoMedicoEnOtroConsultorio(
                datos.idMedico,
                datos.idConsultorio ?? null,
                datos.diaSemana,
                datos.horaInicio,
                datos.horaFin
            );

        if (medicoEnOtroConsultorio) {
            throw new Error(
                "El médico ya tiene disponibilidad en otro consultorio en este horario"
            );
        }

        // 3. Verificar que el consultorio no esté ocupado por otro médico
        if (datos.idConsultorio !== null && datos.idConsultorio !== undefined) {
            const consultorioOcupado =
                await this.disponibilidadRepositorio.verificarConflictoConsultorioOcupado(
                    datos.idConsultorio,
                    datos.diaSemana,
                    datos.horaInicio,
                    datos.horaFin
                );

            if (consultorioOcupado) {
                throw new Error(
                    "El consultorio ya está ocupado por otro médico en este horario"
                );
            }
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
        if (!disponibilidadExistente) {
            return null;
        }

        // Combinar datos existentes con actualizaciones para validar
        const datosCompletos = {
            ...disponibilidadExistente,
            ...datosActualizados,
        };

        // Solo validar si se están modificando campos relacionados con horarios o consultorios
        const cambiaHorarioOConsultorio =
            datosActualizados.diaSemana !== undefined ||
            datosActualizados.horaInicio !== undefined ||
            datosActualizados.horaFin !== undefined ||
            datosActualizados.idConsultorio !== undefined;

        if (cambiaHorarioOConsultorio) {
            // 1. Verificar que el médico no esté en otro consultorio al mismo tiempo
            const medicoEnOtroConsultorio =
                await this.disponibilidadRepositorio.verificarConflictoMedicoEnOtroConsultorio(
                    datosCompletos.idMedico,
                    datosCompletos.idConsultorio ?? null,
                    datosCompletos.diaSemana,
                    datosCompletos.horaInicio,
                    datosCompletos.horaFin,
                    id // Excluir la disponibilidad actual
                );

            if (medicoEnOtroConsultorio) {
                throw new Error(
                    "El médico ya tiene disponibilidad en otro consultorio en este horario"
                );
            }

            // 2. Verificar que el consultorio no esté ocupado por otro médico
            if (
                datosCompletos.idConsultorio !== null &&
                datosCompletos.idConsultorio !== undefined
            ) {
                const consultorioOcupado =
                    await this.disponibilidadRepositorio.verificarConflictoConsultorioOcupado(
                        datosCompletos.idConsultorio,
                        datosCompletos.diaSemana,
                        datosCompletos.horaInicio,
                        datosCompletos.horaFin,
                        id // Excluir la disponibilidad actual
                    );

                if (consultorioOcupado) {
                    throw new Error(
                        "El consultorio ya está ocupado por otro médico en este horario"
                    );
                }
            }
        }

        return await this.disponibilidadRepositorio.actualizarDisponibilidad(
            id,
            datosActualizados
        );
    }

    async eliminarDisponibilidad(id: number): Promise<boolean> {
        return await this.disponibilidadRepositorio.eliminarDisponibilidad(id);
    }
}