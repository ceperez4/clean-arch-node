import { AuthServiceContainer } from "../auth.container";
import { FastifyAuthController } from "../controllers/fastifyAuthController";
import { FastifyPluginAsync } from "fastify";

export class FastifyAuthRoutes {
    public static get routes(): FastifyPluginAsync {
        return async (fastify, opts) => {
            const fastifyAuthController = new FastifyAuthController(AuthServiceContainer);
            fastify.post('/sign-in', fastifyAuthController.singIn);
        }
    }
}