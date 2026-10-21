import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { LoginAuthDto, LoginAuthResponseDto } from './login-auth.dto';
import { SimpleDBConnection } from 'src/common/decorators/db-connection.decorator';
import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { UnauthorizedError } from 'src/common/errors/unauthorized.error';
import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { UserOauthEnum, UserStatusEnum } from 'src/common/enums/user.enum';
import { UserRepository } from 'src/contexts/users/domain/repositories/user.repository';
import { IPasswordHasher } from 'src/common/libs/password-hasher/password-hasher.interface';
import { IJwtGenerator } from 'src/common/libs/jwt-generator/jwt-generator.interface';
import { FileStorageEnum, IFileStorage } from 'src/common/libs/files-storage/file-storage.interface';

@CustomInjectable()
export class LoginAuthUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly tokenGenerator: IJwtGenerator,
        private readonly fileStorage: IFileStorage,
    ) {}

    @SimpleDBConnection()
    async execute(payload: LoginAuthDto): Promise<LoginAuthResponseDto> {
        const user = await this.userRepository.findOneByCriteria({
            type: 'email',
            value: payload.email,
        });
        if (!user) throw new UnauthorizedError('Credenciales Incorrectas');

        if (user.attributes.oauth !== UserOauthEnum.MANUAL) throw new UnauthorizedError('Credenciales Incorrectas');

        if (user.attributes.status !== UserStatusEnum.ACTIVE) throw new UnauthorizedError('Cuenta desactivada');

        const isCorrect = await this.passwordHasher.compare(payload.password, user.attributes.password);
        if (!isCorrect) throw new UnauthorizedError('Credenciales Incorrectas');

        const data: IJwtPayload = {
            sub: user.attributes.id,
            name: user.attributes.name,
            tokenVersion: user.attributes.tokenVersion,
            email: user.attributes.email,
            role: user.attributes.role,
        };

        const accessToken = this.tokenGenerator.sign<IJwtPayload>(data, 'access');
        const refreshToken = this.tokenGenerator.sign<IJwtPayload>(data, 'refresh');
        const avatarUrl = this.fileStorage.url(user.attributes.avatar, FileStorageEnum.AVATAR);
        return {
            id: user.attributes.id,
            name: user.attributes.name,
            email: user.attributes.email,
            role: user.attributes.role,
            accessToken: accessToken,
            refreshToken: refreshToken,
            avatar: avatarUrl ?? '',
        };
    }
}
