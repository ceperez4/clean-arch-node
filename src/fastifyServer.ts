import fastifyCors from "@fastify/cors";
import fastifyFormbody from "@fastify/formbody";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import Fastify, { FastifyInstance, FastifyPluginAsync } from "fastify";
import path from "node:path";

export class FastifyServer {
    private port: number;
    app: FastifyInstance;

    constructor(port: number) {
        this.port = port;
        this.app = Fastify({
            logger: false,
            bodyLimit: 1000 * 1024 * 1024

        });
        this.initializeMiddlewares();
    }

    private initializeMiddlewares() {
        // Registra el plugin @fastify/formbody para parsear cuerpos de solicitud
        // con el Content-Type 'application/x-www-form-urlencoded'.
        this.app.register(fastifyFormbody);

        // Registra el plugin @fastify/cors para configurar las cabeceras Cross-Origin Resource Sharing.
        this.app.register(fastifyCors, {
            origin: "*",
            methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
        });
        this.app.register(fastifyMultipart, {
            limits: {
                fileSize: 10 * 1024 * 1024
            }
        })
    }


    public initializeRoutes(apiPlugin: FastifyPluginAsync) {
        // Registra el plugin de rutas API bajo el prefijo '/api'.
        this.app.register(apiPlugin, { prefix: '/api' });

        const publicPath = path.join(__dirname, '../public');

        this.app.register(fastifyStatic, {
            root: publicPath,
            prefix: '/files/', // El prefijo URL desde el que se servirán los archivos estáticos (ej: /files/imagen.jpg).
            decorateReply: false, // Evita conflictos si se registran múltiples plugins estáticos.
            setHeaders: (res) => { // Opcional: añade cabeceras HTTP a los archivos estáticos (ej: para caching).
                res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cachea los archivos por 1 año.
            }
        });

        // Configura un manejador para rutas que no son encontradas (equivalente al 404).
        this.app.setNotFoundHandler((request, reply) => {
            reply.status(404).send({ message: `route not found: ${request.originalUrl}` });
        });

    }

    public async listen() {
        try {
            await this.app.listen({ port: this.port, host: '0.0.0.0' });
            console.log(`Server with Fastify listening on port ${this.port}`);
        } catch (err) {
            this.app.log.error(err);
            process.exit(1);
        }
    }

}