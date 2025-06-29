import { z } from "zod";
import { Response } from "express";
import { ApiResponse } from "@/modules/shared/application/interfaces/api-response.interface";
import { InvalidCredentials } from "../../application/errors/invalid-credentials.error";
import { GenerateAuthTokenError } from "@/modules/shared/application/errors/generate-auth-token.error";
import { FastifyReply } from "fastify";

const errorHandler = (error: unknown) => {
    let statusCode = 400;
    let response: ApiResponse<null> | null = null;

    if (error instanceof z.ZodError) {
        statusCode = 400;
        response = {
            status: 'error',
            message: 'Validation failed',
            data: error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message,
            })) as any,
        };
        return { statusCode, response, };
    }
    if (error instanceof InvalidCredentials) {
        statusCode = 400;
        response = { status: 'error', message: error.message };
        return { statusCode, response, };
    }
    if (error instanceof GenerateAuthTokenError) {
        statusCode = 500;
        response = { status: 'error', message: error.message };
        return { statusCode, response, };
    }
    console.error('Unhandled Server Error:', error);
    statusCode = 500;
    response = { status: 'error', message: 'Internal server error' };

    return { statusCode, response, };
}
/************************************************************************* */
/************************************************************************* */
/************************************************************************* */
export const expressErrorAuthHandler = (res: Response, error: unknown) => {
    const data = errorHandler(error);
    return res.status(data.statusCode).json(data.response);
}

/************************************************************************* */
/************************************************************************* */
/************************************************************************* */
export const fastifyErrorAuthHandler = (reply: FastifyReply, error: unknown) => {
    const data = errorHandler(error);
    return reply.status(data.statusCode).send(data.response);
}
