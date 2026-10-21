import { TransactionalDBConnection } from 'src/common/decorators/db-connection.decorator';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { LoginGoogleAuthDto, LoginGoogleAuthResponseDto } from './login-google-auth.dto';
import { UserOauthEnum, UserRoleEnum, UserStatusEnum } from 'src/common/enums/user.enum';
import { UnauthorizedError } from 'src/common/errors/unauthorized.error';
import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { InvalidToken } from '../../domain/entities/invalid-token.entity';
import { User } from 'src/contexts/users/domain/entities/user.entity';
import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { UserRepository } from 'src/contexts/users/domain/repositories/user.repository';
import { InvalidTokenRepository } from '../../domain/repositories/invalid-token.repository';
import { IOtpGenerator } from 'src/common/libs/otp-generator/otp-generator.interface';
import { IPasswordHasher } from 'src/common/libs/password-hasher/password-hasher.interface';
import { IJwtGenerator } from 'src/common/libs/jwt-generator/jwt-generator.interface';
import { FileStorageEnum, IFileStorage } from 'src/common/libs/files-storage/file-storage.interface';

@CustomInjectable()
export class LoginGoogleAuthUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly userRepository: UserRepository,
        private readonly invalidTokenRepository: InvalidTokenRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly tokenGenerator: IJwtGenerator,
        private readonly otpGenerator: IOtpGenerator,
        private readonly fileStorage: IFileStorage,
    ) {}

    @TransactionalDBConnection()
    async execute(payload: LoginGoogleAuthDto): Promise<LoginGoogleAuthResponseDto> {
        const isBlacklisted = await this.invalidTokenRepository.isBlackList(payload.token);
        if (isBlacklisted) {
            throw new UnauthorizedError('El token de Google ya ha sido utilizado');
        }

        const data: IJwtPayload = {
            sub: 0,
            name: '',
            tokenVersion: 0,
            email: '',
            role: UserRoleEnum.USER,
        };

        const user = await this.userRepository.findOneByCriteria({
            type: 'email',
            value: payload.email,
        });
        let avatar: string = '';
        if (!user) {
            const passHash = await this.passwordHasher.hash(this.otpGenerator.uuidv4());

            const newUser = await this.userRepository.save(
                User.create({
                    name: payload.name,
                    email: payload.email,
                    role: UserRoleEnum.USER,
                    password: passHash,
                    oauth: UserOauthEnum.GOOGLE,
                    status: UserStatusEnum.ACTIVE,
                    avatar: '',
                }),
            );

            data.sub = newUser.attributes.id;
            data.name = newUser.attributes.name;
            data.tokenVersion = newUser.attributes.tokenVersion;
            data.email = newUser.attributes.email;
            data.role = newUser.attributes.role;
        } else {
            if (user.attributes.status !== UserStatusEnum.ACTIVE)
                throw new UnauthorizedError('La cuenta se encuentra desactivada');
            if (user.attributes.oauth !== UserOauthEnum.GOOGLE)
                throw new UnauthorizedError('Tipo de inicio de sesión incorrecto');

            data.sub = user.attributes.id;
            data.name = user.attributes.name;
            data.tokenVersion = user.attributes.tokenVersion;
            data.email = user.attributes.email;
            data.role = user.attributes.role;
            avatar = user.attributes.avatar;
        }

        const expirationDate = payload.expiration
            ? new Date(payload.expiration * 1000)
            : new Date(Date.now() + 60 * 60 * 1000);

        await this.invalidTokenRepository.add(
            InvalidToken.create({
                payload: payload.token,
                expiration: expirationDate,
            }),
        );

        const accessToken = this.tokenGenerator.sign<IJwtPayload>(data, 'access');
        const refreshToken = this.tokenGenerator.sign<IJwtPayload>(data, 'refresh');
        const avatarUrl = this.fileStorage.url(avatar, FileStorageEnum.AVATAR);
        return {
            id: data.sub,
            name: data.name,
            email: data.email,
            role: data.role,
            accessToken: accessToken,
            refreshToken: refreshToken,
            avatar: avatarUrl ?? '',
        };
    }
}
