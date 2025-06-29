
import { ApiResponse } from "@modules/shared/application/interfaces/api-response.interface";
import { JwtAuthToken } from "../services";
import { envs } from "@/config/envs";
import { VerifyAuthTokenError } from "@modules/shared/application/errors/verify-auth-token";
import { FastifyReply, FastifyRequest } from "fastify";

export const fastifyAuthMiddleware = async (req: FastifyRequest, reply: FastifyReply) => {

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const response: ApiResponse<null> = {
            status: 'error',
            message: 'No authentication token provided.'
        }
        reply.status(401).send(response);
        return;
    }
    const token = authHeader.split(' ').at(1);

    try {
        const jwtAuthToken = new JwtAuthToken(envs.authTokenSecretKey, '1d');
        await jwtAuthToken.verifyToken(token!);
        return true;
    } catch (error) {
        if (error instanceof VerifyAuthTokenError) {
            const response: ApiResponse<null> = {
                status: 'error',
                message: error.message
            }
            reply.status(401).send(response);
            return;
        }
        console.log(error)
        reply.status(500).send({ status: 'error', message: 'An unexpected error occurred during token verification.' });
        return;
    }

}