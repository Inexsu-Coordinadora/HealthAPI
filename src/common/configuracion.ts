import { config } from "dotenv";

config();

export const configuracion = {
    baseDatos: {
        host: process.env.DB_HOST,
        puerto: Number(process.env.DB_PORT),
        nombreDB: process.env.DB_NAME,
        usuario: process.env.DB_USER,
        contrasena: process.env.DB_PASSWORD,
    },
    servidor: {
        puerto: Number(process.env.PUERTO),
        entorno: process.env.NODE_ENV,
    },
};
