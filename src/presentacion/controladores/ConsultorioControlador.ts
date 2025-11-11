import type { FastifyRequest, FastifyReply } from "fastify";
import { ConsultorioServicio } from "../../core/aplicacion/casos-uso-consultorio/ConsultorioServicio.js";
import type { IConsultorio } from "../../core/dominio/consultorio/IConsultorio.js";
import {
    esquemaCrearConsultorio,
    esquemaConsultorioPorId,
    esquemaActualizarConsultorio,
} from "../esquemas/ConsultorioEsquemas.js";
import { validadorEsquemas } from "../esquemas/Validador.js";

enum Mensajes {
    "200_POST_OK" = "Consultorio creado exitosamente",
    "200_GET_OK" = "Consultorio obtenido exitosamente",
    "200_GET_ALL_OK" = "Lista de consultorios obtenida exitosamente",
    "200_PUT_OK" = "Consultorio actualizado exitosamente",
    "200_DELETE_OK" = "Consultorio eliminado exitosamente",
    "404_NOT_FOUND" = "No se encontró un consultorio con el ID",
}

export class ConsultorioControlador {
    constructor(private readonly consultorioServicio: ConsultorioServicio) {}

    async crearConsultorio(request: FastifyRequest, reply: FastifyReply) {
        const consultorio = validadorEsquemas(
            esquemaCrearConsultorio,
            request.body,
            reply
        );

        // Type assertion necesario: Zod genera T | null | undefined pero la interfaz espera T | null
        const consultorioCreado =
            await this.consultorioServicio.crearConsultorio(
                consultorio as Omit<IConsultorio, "idConsultorio">
            );

        return reply.status(201).send({
            mensaje: Mensajes["200_POST_OK"],
            data: consultorioCreado,
        });
    }

    async listarConsultorios(request: FastifyRequest, reply: FastifyReply) {
        const consultorios =
            await this.consultorioServicio.listarConsultorios();

        return reply.status(200).send({
            mensaje: Mensajes["200_GET_ALL_OK"],
            data: consultorios,
            total: consultorios.length,
        });
    }

    async obtenerConsultorioPorId(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        const { id: idConsultorio } = validadorEsquemas(
            esquemaConsultorioPorId,
            request.params,
            reply
        );

        const consultorio =
            await this.consultorioServicio.obtenerConsultorioPorId(
                idConsultorio
            );

        const statusCode = consultorio ? 200 : 404;
        const mensaje = consultorio
            ? Mensajes["200_GET_OK"]
            : `${Mensajes["404_NOT_FOUND"]} ${idConsultorio}`;
        return reply.status(statusCode).send({
            mensaje,
            data: consultorio,
        });
    }

    async actualizarConsultorio(request: FastifyRequest, reply: FastifyReply) {
        const { id: idConsultorio } = validadorEsquemas(
            esquemaConsultorioPorId,
            request.params,
            reply
        );
        const datos = validadorEsquemas(
            esquemaActualizarConsultorio,
            request.body,
            reply
        );

        const consultorioActualizado =
            await this.consultorioServicio.actualizarConsultorio(
                idConsultorio,
                datos as Partial<IConsultorio>
            );

        const statusCode = consultorioActualizado ? 200 : 404;
        const mensaje = consultorioActualizado
            ? Mensajes["200_PUT_OK"]
            : `${Mensajes["404_NOT_FOUND"]} ${idConsultorio}`;
        return reply.status(statusCode).send({
            mensaje,
            data: consultorioActualizado,
        });
    }

    async eliminarConsultorio(request: FastifyRequest, reply: FastifyReply) {
        const { id: idConsultorio } = validadorEsquemas(
            esquemaConsultorioPorId,
            request.params,
            reply
        );

        const eliminado =
            await this.consultorioServicio.eliminarConsultorio(idConsultorio);

        const statusCode = eliminado ? 200 : 404;
        const mensaje = eliminado
            ? Mensajes["200_DELETE_OK"]
            : `${Mensajes["404_NOT_FOUND"]} ${idConsultorio}`;
        return reply.status(statusCode).send({ mensaje });
    }
}
