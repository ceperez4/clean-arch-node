import { Module } from '@nestjs/common';
import { UserQueryController } from './controllers/user-query.controller';
import { UserCommandController } from './controllers/user-command.controller';
import { UserGetProfileUseCase } from '../application/use-cases/user-get-profile-use-case/user-get-profile.use-case';
import { GetAllUserUseCase } from '../application/use-cases/get-all-user-use-case/get-all-user.use-case';
import { UpdatePasswordUserUseCase } from '../application/use-cases/update-password-user-use-case/update-password-user.use-case';
import { UpdateProfileUserUseCase } from '../application/use-cases/update-profile-user-use-case/update-profile-user.use-case';
import { ToggleTwoFactorUserUseCase } from '../application/use-cases/toggle-two-factor-user-use-case/toggle-two-factor-user.use-case';
import { ChangeStatusUserUseCase } from '../application/use-cases/change-status-user-use-case/change-status-user.use-case';
import { AuditModule } from 'src/contexts/audit/infrastructure/audit.module';

@Module({
    imports: [AuditModule],
    controllers: [UserQueryController, UserCommandController],
    providers: [
        UserGetProfileUseCase,
        GetAllUserUseCase,
        UpdatePasswordUserUseCase,
        UpdateProfileUserUseCase,
        ToggleTwoFactorUserUseCase,
        ChangeStatusUserUseCase,
    ],
})
export class UserModule {}
