import dotenv from "dotenv";
dotenv.config();

export const configuracion = {
  httpPuerto: Number(process.env.PUERTO),
  baseDatos: {
    host: process.env.PGHOST,
    puerto: Number(process.env.PGPORT),
    usuario: process.env.PGUSER,
    contrasena: process.env.PGPASSWORD,
    nombreDb: process.env.PGDBNAME,
  },
};