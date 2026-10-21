import { Module } from '@nestjs/common';
import { UserQueryController } from './controllers/user-query.controller';
import { UserCommandController } from './controllers/user-command.controller';
import { UserGetProfileUseCase } from '../application/user-get-profile-use-case/user-get-profile.use-case';
import { GetAllUserUseCase } from '../application/get-all-user-use-case/get-all-user.use-case';
import { UpdatePasswordUserUseCase } from '../application/update-password-user-use-case/update-password-user.use-case';
import { UpdateProfileUserUseCase } from '../application/update-profile-user-use-case/update-profile-user.use-case';

@Module({
    imports: [],
    controllers: [UserQueryController, UserCommandController],
    providers: [UserGetProfileUseCase, GetAllUserUseCase, UpdatePasswordUserUseCase, UpdateProfileUserUseCase],
})
export class UserModule {}
