import Fastify from 'fastify';
import { configuracion } from '../common/configuracion.js';
import { citaRutas } from './rutas/CitaMedicaRutas.js';


const app = Fastify({ logger: true });


await app.register(citaRutas, { prefix: '/api' });


export const startServer = async (): Promise<void> => {
  try {
    await app.listen({
      port: configuracion.servidor.puerto,
      host: '0.0.0.0'
    });
    app.log.info('El servidor se esta ejecutando correctamente...');


    app.printRoutes();
  } catch (err) {
    app.log.error('Error al ejecutar el servidor\n ${(err as Error).message}');

    const serverError = {
      code: 'FST_ERR_INIT_SERVER',
      name: 'ServidorError',
      statusCode: 500,
      message: 'El servidor no se pudo iniciar: ${(err as Error).message}',
    };

    throw serverError;
  };
};