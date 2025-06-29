import { Router } from "express";
import { FastifyPluginAsync } from "fastify";
import { ExpressUserRoutes } from "@modules/users/infrastructure/routes/expressUserRoutes";
import { ExpressAuthRoutes } from "@modules/auth/infrastructure/routes/expressAuthRoutes";
import { FastifyAuthRoutes } from "@modules/auth/infrastructure/routes/fastifyAuthRoutes";
import { FastifyUserRoutes } from "./modules/users/infrastructure/routes/fastifyUserRoutes";

export class HttpExpressRoutes {

    static get routes(): Router {

        const router = Router();

        router.use('/api/users', ExpressUserRoutes.routes)
        router.use('/api/auth', ExpressAuthRoutes.routes)


        return router;
    }
}

export class HttpFastifyRoutes {

    static get routes(): FastifyPluginAsync {
        return async (fastify, ops) => {

            fastify.register(FastifyAuthRoutes.routes, { prefix: '/auth' });

            fastify.register(FastifyUserRoutes.routes, { prefix: '/users' });
        }
    }
}