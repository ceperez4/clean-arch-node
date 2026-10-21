import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthCookieHelper } from './auth-cookie.helper';
import { IAuthCookieHelper } from './auth-cookie.interface';

@Module({
    providers: [
        {
            provide: IAuthCookieHelper,
            useFactory: (config: ConfigService) => {
                return new AuthCookieHelper({
                    httpOnly: true,
                    secure: config.get<boolean>('envs.isProd')!,
                    sameSite: 'lax',
                    path: '/api/auth',
                    maxAge: config.get<number>('envs.maxAgeRefreshCookie')!,
                });
            },
            inject: [ConfigService],
        },
    ],
    exports: [IAuthCookieHelper],
})
export class CookieManagerModule {}
