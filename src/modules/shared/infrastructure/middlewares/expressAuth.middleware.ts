import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "@modules/shared/application/interfaces/api-response.interface";
import { JwtAuthToken } from "../services";
import { envs } from "@/config/envs";
import { VerifyAuthTokenError } from "@modules/shared/application/errors/verify-auth-token";

export const expressAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const response: ApiResponse<null> = {
            status: 'error',
            message: 'No authentication token provided.'
        }
        res.status(401).json(response);
        return;
    }
    const token = authHeader.split(' ').at(1);

    try {
        const jwtAuthToken = new JwtAuthToken(envs.authTokenSecretKey, '1d');
        jwtAuthToken.verifyToken(token!)
            .then(jwt => next())
            .catch(error => {
                if (error instanceof VerifyAuthTokenError) {
                    const response: ApiResponse<null> = {
                        status: 'error',
                        message: error.message
                    }
                    res.status(401).json(response);
                    return;
                }
                res.status(500).json({ status: 'error', message: 'An unexpected error occurred during token verification.' });
                return;
            })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 'error', message: 'An unexpected error occurred during token verification.' });
        return;
    }

}