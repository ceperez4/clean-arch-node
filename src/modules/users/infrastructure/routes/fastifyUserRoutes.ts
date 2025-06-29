import { FastifyPluginAsync } from "fastify";
import { FastifyUserController } from "../controllers/fastifyUserController";
import { UserServiceContainer } from "../user.container";
import { fastifyImageFilter, fastifySingleUpload, fileSizes } from "@/modules/shared/infrastructure/middlewares/files";
import { envs } from "@/config/envs";
import { fastifyAuthMiddleware } from "@/modules/shared/infrastructure/middlewares/fastifyAuth.middleware";



export class FastifyUserRoutes {
    public static get routes(): FastifyPluginAsync {
        return async (fastify, ops) => {

            const fastifyUserController = new FastifyUserController(
                UserServiceContainer
            );

            fastify.post(
                '/',
                {
                    preHandler: fastifySingleUpload({
                        field: 'photo',
                        fileSize: fileSizes["3MB"],
                        fileStoragePath: envs.pathUserFiles,
                        filter: fastifyImageFilter,
                        isRequired: false,
                    })
                },
                fastifyUserController.createUser
            );

            fastify.get(
                '/',
                { preHandler: fastifyAuthMiddleware },
                fastifyUserController.getAllUsers
            );

            fastify.put(
                '/photo/:id',
                {
                    preHandler: [
                        fastifyAuthMiddleware,
                        fastifySingleUpload({
                            field: 'photo',
                            fileSize: fileSizes["3MB"],
                            fileStoragePath: envs.pathUserFiles,
                            filter: fastifyImageFilter,
                            isRequired: true,
                        })
                    ],
                },
                fastifyUserController.editUserPhoto
            );
            fastify.put(
                '/:id',
                { preHandler: fastifyAuthMiddleware },
                fastifyUserController.editUser
            );
            fastify.get(
                '/:id',
                { preHandler: fastifyAuthMiddleware },
                fastifyUserController.getUserById
            );
            fastify.delete(
                '/:id',
                { preHandler: fastifyAuthMiddleware },
                fastifyUserController.deleteUser
            );
        }
    }
}