import { Module } from '@nestjs/common';
import { AuthCommandController } from './controllers/auth-command.controller';
import { LoginAuthUseCase } from '../application/use-cases/login-auth-use-case/login-auth.use-case';
import { RefreshTokenAuthUseCase } from '../application/use-cases/refresh-token-auth-use-case/refresh-token-auth.use-case';
import { EmptyInvalidTokensAuthUseCase } from '../application/use-cases/empty-invalid-tokens-auth-use-cases/empty-invalid-tokens-auth.use-case';
import { EmptyInvalidTokenAuthJob } from './jobs/empty-invalid-tokens-auth.job';
import { RegisterAuthUseCase } from '../application/use-cases/register-auth-use-case/register-auth.use-case';
import { LoginGoogleAuthUseCase } from '../application/use-cases/login-google-auth-use-case/login-google-auth.use-case';
import { PassRecoveryStepOneAuthUseCase } from '../application/use-cases/pass-recovery-step-one-auth-use-case/pass-recovery-step-one-auth.use-case';
import { PassRecoveryStepTwoAuthUseCase } from '../application/use-cases/pass-recovery-step-two-auth-use-case/pass-recovery-step-two-auth.use-case';
import { LogoutAuthUseCase } from '../application/use-cases/logout-auth-use-case/logout-auth.use-case';
import { CookieManagerModule } from 'src/common/libs/cookie-manager/cookie-manager.module';
import { VerifyTwoFactorAuthUseCase } from '../application/use-cases/verify-two-factor-auth-use-case/verify-two-factor-auth.use-case';

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
        VerifyTwoFactorAuthUseCase,
    ],
})
export class AuthModule {}
