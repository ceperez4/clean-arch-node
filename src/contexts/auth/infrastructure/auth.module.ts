import { Module } from '@nestjs/common';
import { AuthCommandController } from './controllers/auth-command.controller';
import { LoginAuthUseCase } from '../application/login-auth-use-case/login-auth.use-case';
import { RefreshTokenAuthUseCase } from '../application/refresh-token-auth-use-case/refresh-token-auth.use-case';
import { EmptyInvalidTokensAuthUseCase } from '../application/empty-invalid-tokens-auth-use-cases/empty-invalid-tokens-auth.use-case';
import { EmptyInvalidTokenAuthJob } from './jobs/empty-invalid-tokens-auth.job';
import { RegisterAuthUseCase } from '../application/register-auth-use-case/register-auth.use-case';
import { LoginGoogleAuthUseCase } from '../application/login-google-auth-use-case/login-google-auth.use-case';
import { PassRecoveryStepOneAuthUseCase } from '../application/pass-recovery-step-one-auth-use-case/pass-recovery-step-one-auth.use-case';
import { PassRecoveryStepTwoAuthUseCase } from '../application/pass-recovery-step-two-auth-use-case/pass-recovery-step-two-auth.use-case';
import { LogoutAuthUseCase } from '../application/logout-auth-use-case/logout-auth.use-case';
import { CookieManagerModule } from 'src/common/libs/cookie-manager/cookie-manager.module';

@Module({
    imports: [CookieManagerModule],
    controllers: [AuthCommandController],
    providers: [
        LoginAuthUseCase,
        RefreshTokenAuthUseCase,
        EmptyInvalidTokensAuthUseCase,
        EmptyInvalidTokenAuthJob,
        RegisterAuthUseCase,
        LoginGoogleAuthUseCase,
        PassRecoveryStepOneAuthUseCase,
        PassRecoveryStepTwoAuthUseCase,
        LogoutAuthUseCase,
    ],
})
export class AuthModule {}
