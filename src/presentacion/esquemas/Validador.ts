import * as z from "zod";
import type { FastifyReply, FastifyRequest, RequestBodyDefault } from "fastify";

export function validadorEsquemas<T>(
  esquema: z.ZodSchema<T>,
  datos: RequestBodyDefault,
  reply: FastifyReply,
): T {
  try {
    return esquema.parse(datos);
  } catch (e) {
    const err = e as z.ZodError;
    const detalles = err.issues.map((issue) => issue.message).join(", ");
    throw reply.status(400).send({
      error: "Datos inválidos",
      detalles,
    });
  }
}
