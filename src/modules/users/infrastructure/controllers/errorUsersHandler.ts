import { Response } from "express";
import { z } from "zod";
import { ApiResponse } from "@/modules/shared/application/interfaces/api-response.interface";
import { UserAlreadyExistsError } from "@modules/users/application/errors/user-already-exists.error";
import { UserNotFoundError } from "@modules/users/application/errors/user-not-found.error";
import { FastifyReply } from "fastify";

const errorHandler = (error: unknown) => {
    let response: ApiResponse<null> | null = null

    if (error instanceof z.ZodError) {
        response = {
            status: 'error',
            message: 'Validation failed',
            data: error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message,
            })) as any,
        }
        return { statusCode: 400, response };
    }
    if (error instanceof UserAlreadyExistsError) {
        response = { status: 'error', message: error.message };
        return { statusCode: 400, response };
    }
    if (error instanceof UserNotFoundError) {
        response = { status: 'error', message: error.message };
        return { statusCode: 404, response };
    }
    console.error('Unhandled Server Error:', error);
    response = { status: 'error', message: 'Internal server error' };
    return { statusCode: 500, response };
}
export const expressErrorUserHandler = (res: Response, error: unknown) => {
    const data = errorHandler(error);
    return res.status(data.statusCode).json(data.response);
}

export const fastifyErrorUserHandler = (reply: FastifyReply, error: unknown) => {
    const data = errorHandler(error);
    return reply.status(data.statusCode).send(data.response);
}