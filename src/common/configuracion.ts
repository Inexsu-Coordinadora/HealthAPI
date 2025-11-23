import {config} from "dotenv";

config();

export const configuracion = {
    baseDatos: {
        host: process.env.DB_HOST || "localhost",
        puerto: Number(process.env.DB_PORT) || 5432,
        nombreDB: process.env.DB_NAME || "healthapi",
        usuario: process.env.DB_USER || "postgres",
        contrasena: process.env.DB_PASSWORD || "pokemon3",
    },
    servidor: {
        puerto: Number(process.env.PUERTO) || 3000,
        entorno: process.env.NODE_ENV || "development",
    },
};
