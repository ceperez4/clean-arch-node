import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ICurrentUser } from '../interfaces/jwt-payload.interface';

interface RequestWithUser extends Request {
    user?: ICurrentUser;
}

export const CurrentUser = createParamDecorator((data: keyof ICurrentUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    return data && user ? user[data] : user;
});
