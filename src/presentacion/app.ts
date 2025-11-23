import Fastify, {
    type FastifyError,
    type FastifyRequest,
    type FastifyReply,
} from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { configuracion } from "../common/configuracion.js";
import { AppError } from "../common/errores/AppError.js";
import { pacienteRutas } from "./rutas/PacienteRutas.js";
import { medicoRutas } from "./rutas/MedicoRutas.js";
import { citaRutas } from "./rutas/CitaMedicaRutas.js";
import { consultorioRutas } from "./rutas/ConsultorioRutas.js";
import { disponibilidadRutas } from "./rutas/DisponibilidadRutas.js";

// Configuración de logger con Pino
const isDevelopment = process.env.NODE_ENV !== "production";
const app = Fastify({
    logger: isDevelopment
        ? {
              transport: {
                  target: "pino-pretty",
                  options: {
                      translateTime: "HH:MM:ss Z",
                      ignore: "pid,hostname",
                      colorize: true,
                  },
              },
          }
        : true,
});

// Configuración de Swagger
await app.register(swagger, {
    openapi: {
        info: {
            title: "HealthAPI - Sistema de Gestión de Citas Médicas",
            description:
                "API REST para la gestión de citas médicas, pacientes, médicos, consultorios y disponibilidad con arquitectura hexagonal",
            version: "1.0.0",
            contact: {
                name: "Equipo HealthAPI",
                email: "soporte@healthapi.com",
            },
        },
        servers: [
            {
                url: `http://localhost:${configuracion.servidor.puerto}`,
                description: "Servidor de desarrollo",
            },
        ],
        tags: [
            { name: "Citas", description: "Gestión de citas médicas" },
            { name: "Pacientes", description: "Gestión de pacientes" },
            { name: "Médicos", description: "Gestión de médicos" },
            {
                name: "Consultorios",
                description: "Gestión de consultorios médicos",
            },
            {
                name: "Disponibilidad",
                description:
                    "Gestión de disponibilidad de médicos y consultorios",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
});

await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
        docExpansion: "list",
        deepLinking: true,
    },
    staticCSP: true,
});

// Middleware de manejo de errores global
app.setErrorHandler(
    (error: Error | AppError, request: FastifyRequest, reply: FastifyReply) => {
        // Determinar si es un error operacional o del servidor
        const isAppError = error instanceof AppError;
        const statusCode = isAppError ? error.statusCode : 500;

        // Log diferenciado por tipo de error
        if (isAppError && error.isOperational) {
            // Errores operacionales (400, 404, 409) - nivel warn
            app.log.warn({
                error: {
                    message: error.message,
                    statusCode,
                    type: error.constructor.name,
                },
                request: {
                    method: request.method,
                    url: request.url,
                    params: request.params,
                    query: request.query,
                },
            });
        } else {
            // Errores del servidor (500) - nivel error con stack
            app.log.error({
                error: {
                    message: error.message,
                    stack: error.stack,
                    statusCode,
                },
                request: {
                    method: request.method,
                    url: request.url,
                    params: request.params,
                    query: request.query,
                    body: request.body,
                },
            });
        }

        reply.status(statusCode).send({
            error: isAppError ? error.constructor.name : "InternalServerError",
            message: error.message || "Error interno del servidor",
            statusCode,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
); // Registro de rutas
await app.register(citaRutas, { prefix: "/api" });
await app.register(pacienteRutas, { prefix: "/api" });
await app.register(medicoRutas, { prefix: "/api" });
await app.register(consultorioRutas, { prefix: "/api" });
await app.register(disponibilidadRutas, { prefix: "/api" });

export const startServer = async (): Promise<void> => {
    try {
        await app.listen({
            port: configuracion.servidor.puerto,
            host: "0.0.0.0",
        });
        app.log.info("El servidor se esta ejecutando correctamente...");
        app.printRoutes();
    } catch (err) {
        app.log.error(
            `Error al ejecutar el servidor\n ${(err as Error).message}`
        );
        const serverError = {
            code: "FST_ERR_INIT_SERVER",
            name: "ServidorError",
            statusCode: 500,
            message:
                "El servidor no se pudo iniciar: ${(err as Error).message}",
        };
        throw serverError;
    }
};
