import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { MYSQL_POOL_PROVIDER } from 'src/config/db/mysql/mysql-pool.provider';
import { Request } from 'express';
import { UserRoleEnum, UserStatusEnum } from '../enums/user.enum';
import { KEY_ROLE } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ICurrentUser, IJwtPayload } from '../interfaces/jwt-payload.interface';
import { IJwtGenerator } from '../libs/jwt-generator/jwt-generator.interface';
import { ICacheManager } from '../libs/cache-manager/cache-manager.interface';

interface GuardUserRow extends RowDataPacket {
    user_status: UserStatusEnum;
    user_role: UserRoleEnum;
    user_first_name: string;
    user_email: string;
    user_token_version: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtGenerator: IJwtGenerator,
        private reflector: Reflector,
        private cacheManager: ICacheManager,
        @Inject(MYSQL_POOL_PROVIDER) private pool: Pool,
    ) {}

    /************************************************************ */
    /************************************************************ */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(KEY_ROLE, [
            context.getHandler(),
            context.getClass(),
        ]);

        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);
        const ip = this.getClientIp(request);
        const userAgent = this.getUserAgent(request);

        if (!token) {
            throw new UnauthorizedException('No se proporcionó un token de autenticación');
        }

        const payload = this.jwtGenerator.verify<IJwtPayload>(token, 'access');

        const user = await this.validateUser(payload.sub, payload.tokenVersion);

        const data: ICurrentUser = {
            id: payload.sub,
            name: user.user_first_name,
            email: user.user_email,
            role: user.user_role,
            ip: ip,
            userAgent: userAgent,
            isAdmin: () => user.user_role === UserRoleEnum.ADMIN,
        };

        (request as unknown as { user: ICurrentUser })['user'] = data;

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const hasRole = requiredRoles.includes(data.role);
        if (!hasRole) {
            throw new ForbiddenException('No tienes permisos para acceder a este recurso');
        }

        return true;
    }

    /************************************************************ */
    /************************************************************ */
    private async validateUser(userId: number, tokenVersion?: number): Promise<GuardUserRow> {
        const cacheKey = `auth_user:${userId}`;

        let user = await this.cacheManager.get<GuardUserRow>(cacheKey);

        if (!user) {
            const query = `
                SELECT user_status, user_role, user_first_name, user_email, user_token_version
                FROM users 
                WHERE user_id = ? LIMIT 1
            `;
            const [rows] = await this.pool.query<GuardUserRow[]>(query, [userId]);
            if (rows.length === 0) {
                throw new UnauthorizedException('No fue posible validar la identidad del usuario');
            }

            user = rows[0];
            await this.cacheManager.set(cacheKey, user, 60 * 1000);
        }

        if (user.user_status !== UserStatusEnum.ACTIVE) {
            await this.cacheManager.del(cacheKey);
            throw new UnauthorizedException('La cuenta de usuario se encuentra inactiva o suspendida');
        }

        if (tokenVersion !== user.user_token_version) {
            await this.cacheManager.del(cacheKey);
            throw new UnauthorizedException('El token de autenticación ha sido revocado o ya no es válido');
        }

        return user;
    }

    /************************************************************ */
    /************************************************************ */
    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        if (type === 'Bearer' && token) {
            return token;
        }
        return undefined;
    }

    /************************************************************ */
    /************************************************************ */
    private getClientIp(req: Request): string {
        try {
            const forwardedFor = req.headers['x-forwarded-for'];
            if (typeof forwardedFor === 'string') {
                // Puede contener múltiples IPs separadas por coma, tomamos la primera
                return forwardedFor.split(',')[0].trim();
            }
            const realIp = req.headers['x-real-ip'];
            if (typeof realIp === 'string') return realIp.trim();

            const ip = req.ip || req.socket?.remoteAddress;

            return typeof ip === 'string' ? ip.replace('::ffff:', '') : '0.0.0.0';
        } catch {
            return '0.0.0.0';
        }
    }

    /************************************************************ */
    /************************************************************ */
    private getUserAgent(req: Request): string {
        try {
            const uaHeaders = ['user-agent', 'x-user-agent', 'x-original-user-agent', 'device-user-agent'];

            for (const header of uaHeaders) {
                const ua = req.headers[header];
                if (typeof ua === 'string' && ua.trim().length > 0) {
                    return ua.trim();
                }
            }

            // fallback
            return 'Unknown';
        } catch {
            return 'Unknown';
        }
    }
}
