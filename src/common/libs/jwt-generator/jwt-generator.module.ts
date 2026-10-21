import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtGenerator } from './jwt';
import { IJwtGenerator } from './jwt-generator.interface';

@Global()
@Module({
    providers: [
        {
            provide: IJwtGenerator,
            useFactory: (config: ConfigService) => {
                return new JwtGenerator({
                    accessSecret: config.get<string>('envs.jwtAccessSecret')!,
                    refreshSecret: config.get<string>('envs.jwtRefreshSecret')!,
                    accessExpiresIn: config.get<string>('envs.jwtAccessExpiresIn')!,
                    refreshExpiresIn: config.get<string>('envs.jwtRefreshExpiresIn')!,
                });
            },
            inject: [ConfigService],
        },
    ],
    exports: [IJwtGenerator],
})
export class JwtGeneratorGlobalModule {}
