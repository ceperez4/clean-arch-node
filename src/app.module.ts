import { Module, ValidationPipe } from '@nestjs/common';
import { envs } from './config/envs';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './config/db/db.module';
import { AuthModule } from './contexts/auth/infrastructure/auth.module';
import { PasswordHasherGlobalModule } from './common/libs/password-hasher/password-hasher.module';
import { JwtGeneratorGlobalModule } from './common/libs/jwt-generator/jwt-generator.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ExceptionsFilter } from './common/filters/exceptions.filter';
import { OtpGeneratorGlobalModule } from './common/libs/otp-generator/otp-generator.module';
import { UserModule } from './contexts/users/infrastructure/user.module';
import { DatesFormatterGlobalModule } from './common/libs/dates-formatter/dates-formatter.module';
import { EmailSenderGlobalModule } from './common/libs/email-sender/email-sender.module';
import { FilesStorageGlobalModule } from './common/libs/files-storage/files-storage.module';
import { CacheManagerGlobalModule } from './common/libs/cache-manager/cache-manager.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [envs] }),
        ThrottlerModule.forRoot([
            {
                name: 'default',
                ttl: 1000,
                limit: 30,
            },
        ]),
        ScheduleModule.forRoot(),
        DatabaseModule,
        CacheManagerGlobalModule,
        PasswordHasherGlobalModule,
        JwtGeneratorGlobalModule,
        OtpGeneratorGlobalModule,
        DatesFormatterGlobalModule,
        EmailSenderGlobalModule,
        FilesStorageGlobalModule,
        AuthModule,
        UserModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        {
            provide: APP_FILTER,
            useClass: ExceptionsFilter,
        },
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        },
    ],
})
export class AppModule {}
