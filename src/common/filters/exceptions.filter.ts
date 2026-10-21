import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger, Injectable } from '@nestjs/common';
import { Response, Request } from 'express';
import { ValidationError } from '../errors/validation.error';
import { AlreadyExistError } from '../errors/already-exist.error';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { UnexpectedError } from '../errors/unexpected.error';
import { STATUS_ERROR } from '../constants/http.constant';
import { NotFoundError } from '../errors/not-found.error';

@Catch()
@Injectable()
export class ExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(ExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';

        if (exception instanceof NotFoundError) {
            status = HttpStatus.NOT_FOUND;
            message = exception.message;
        }
        if (exception instanceof ValidationError || exception instanceof AlreadyExistError) {
            status = HttpStatus.BAD_REQUEST;
            message = exception.message;
        }
        if (exception instanceof UnauthorizedError) {
            status = HttpStatus.UNAUTHORIZED;
            message = exception.message;
        }
        if (exception instanceof UnexpectedError) {
            status = HttpStatus.SERVICE_UNAVAILABLE;
            message = exception.message;
        }

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
            } else if (typeof res === 'object' && res !== null && 'message' in res) {
                message = (res as { message: string | string[] }).message;
            }
        }

        //Solo respondemos con error 500 controlado
        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            const stack = exception instanceof Error ? exception.stack : '';
            this.logger.error(
                `HTTP ${status} | ${request.method} ${request.url}`,
                message,
                stack,
                'AllExceptionsFilter',
            );

            response.status(status).json({ status: STATUS_ERROR, message: 'Internal server error' });
        } else {
            response.status(status).json({ status: STATUS_ERROR, message });
        }
    }
}
