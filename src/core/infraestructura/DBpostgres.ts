import { Pool, type PoolClient } from "pg";
import { configuracion } from "../../common/configuracion.js";

export const pool = new Pool({
    host: configuracion.baseDatos.host,
    user: configuracion.baseDatos.usuario,
    database: configuracion.baseDatos.nombreDB,
    port: configuracion.baseDatos.puerto,
    password: configuracion.baseDatos.contrasena,
});

export async function ejecutarConsulta(
    consulta: string,
    parametros?: Array<string | number | Date | null>
) {
    return await pool.query(consulta, parametros);
}

export async function ejecutarEnTransaccion<T>(
    callback: (client: PoolClient) => Promise<T>
): Promise<T> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const resultado = await callback(client);
        await client.query("COMMIT");
        return resultado;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
