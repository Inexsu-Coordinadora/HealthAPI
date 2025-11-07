import { Pool } from "pg";
import { configuracion } from "../../common/configuracion.js";

export const pool = new Pool({
    host: configuracion.baseDatos.host,
    user: configuracion.baseDatos.usuario,
    database: configuracion.baseDatos.nombreDB,
    port: configuracion.baseDatos.puerto,
    password: configuracion.baseDatos.contrasena,
});

export async function ejecutarConsulta(consulta: string, parametros?: Array<string | number | Date | null>) {
    return await pool.query(consulta, parametros);
}