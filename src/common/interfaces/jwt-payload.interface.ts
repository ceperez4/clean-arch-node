import { UserRoleEnum } from '../enums/user.enum';

export interface IJwtPayload {
    sub: number;
    name: string;
    tokenVersion: number;
    email: string;
    role: UserRoleEnum;
}

export interface ICurrentUser {
    id: number;
    name: string;
    email: string;
    ip: string;
    userAgent: string;
    role: UserRoleEnum;
    isAdmin: () => boolean;
}
