import type { FastifyRequest, FastifyReply } from "fastify";
import { MedicoServicio } from "../../core/aplicacion/casos-uso-medico/MedicoServicio.js";
import type { IMedico } from "../../core/dominio/medico/IMedico.js";
import {
    esquemaCrearMedico,
    esquemaMedicoPorId,
    esquemaActualizarMedico,
} from "../esquemas/MedicoEsquemas.js";
import { validadorEsquemas } from "../esquemas/ValidadorZod.js";

enum Mensajes {
    "200_POST_OK" = "Médico creado exitosamente",
    "200_GET_OK" = "Médico obtenido exitosamente",
    "200_GET_ALL_OK" = "Lista de médicos obtenida exitosamente",
    "200_PUT_OK" = "Médico actualizado exitosamente",
    "200_DELETE_OK" = "Médico eliminado exitosamente",
    "404_NOT_FOUND" = "No se encontró un médico con el ID",
}

export class MedicoControlador {
    constructor(private readonly medicoServicio: MedicoServicio) {}

    async crearMedico(request: FastifyRequest, reply: FastifyReply) {
        const medico = validadorEsquemas(
            esquemaCrearMedico,
            request.body,
            reply
        );

        const medicoCreado = await this.medicoServicio.crearMedico(medico);

        return reply.status(201).send({
            mensaje: Mensajes["200_POST_OK"],
            data: medicoCreado,
        });
    }

    async listarMedicos(reply: FastifyReply) {
        const medicos = await this.medicoServicio.listarMedicos();

        return reply.status(200).send({
            mensaje: Mensajes["200_GET_ALL_OK"],
            data: medicos,
            total: medicos.length,
        });
    }

    async obtenerMedicoPorId(request: FastifyRequest, reply: FastifyReply) {
        const { id: idMedico } = validadorEsquemas(
            esquemaMedicoPorId,
            request.params,
            reply
        );

        const medico = await this.medicoServicio.obtenerMedicoPorId(idMedico);

        const statusCode = medico ? 200 : 404;
        const mensaje = medico
            ? Mensajes["200_GET_OK"]
            : `${Mensajes["404_NOT_FOUND"]} ${idMedico}`;
        return reply.status(statusCode).send({
            mensaje,
            data: medico,
        });
    }

    async actualizarMedico(request: FastifyRequest, reply: FastifyReply) {
        const { id: idMedico } = validadorEsquemas(
            esquemaMedicoPorId,
            request.params,
            reply
        );
        const datos = validadorEsquemas(
            esquemaActualizarMedico,
            request.body,
            reply
        );

        const medicoActualizado = await this.medicoServicio.actualizarMedico(
            idMedico,
            datos as Partial<IMedico>
        );

        const statusCode = medicoActualizado ? 200 : 404;
        const mensaje = medicoActualizado
            ? Mensajes["200_PUT_OK"]
            : `${Mensajes["404_NOT_FOUND"]} ${idMedico}`;
        return reply.status(statusCode).send({
            mensaje,
            data: medicoActualizado,
        });
    }

    async eliminarMedico(request: FastifyRequest, reply: FastifyReply) {
        const { id: idMedico } = validadorEsquemas(
            esquemaMedicoPorId,
            request.params,
            reply
        );

        const eliminado = await this.medicoServicio.eliminarMedico(idMedico);

        const statusCode = eliminado ? 200 : 404;
        const mensaje = eliminado
            ? Mensajes["200_DELETE_OK"]
            : `${Mensajes["404_NOT_FOUND"]} ${idMedico}`;
        return reply.status(statusCode).send({ mensaje });
    }
}
