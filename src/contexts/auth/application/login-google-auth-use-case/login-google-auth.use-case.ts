import { TransactionalDBConnection } from 'src/common/decorators/db-connection.decorator';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { LoginGoogleAuthDto, LoginGoogleAuthResponseDto } from './login-google-auth.dto';
import { UserOauthEnum, UserRoleEnum, UserStatusEnum } from 'src/common/enums/user.enum';
import { UnauthorizedError } from 'src/common/errors/unauthorized.error';
import { IJwtPayload, ITwoFactorTempPayload } from 'src/common/interfaces/jwt-payload.interface';
import { InvalidToken } from '../../domain/entities/invalid-token.entity';
import { User } from 'src/contexts/users/domain/entities/user.entity';
import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { UserRepository } from 'src/contexts/users/domain/repositories/user.repository';
import { InvalidTokenRepository } from '../../domain/repositories/invalid-token.repository';
import { IOtpGenerator } from 'src/common/libs/otp-generator/otp-generator.interface';
import { IPasswordHasher } from 'src/common/libs/password-hasher/password-hasher.interface';
import { IJwtGenerator } from 'src/common/libs/jwt-generator/jwt-generator.interface';
import { FileStorageEnum, IFileStorage } from 'src/common/libs/files-storage/file-storage.interface';
import { IDatesFormatter } from 'src/common/libs/dates-formatter/dates-formatter.interface';
import { IEmailSender } from 'src/common/libs/email-sender/email-sender.interface';
import { AuthChallengeRepository } from '../../domain/repositories/auth-challenge.repository';
import { AuthChallenge } from '../../domain/entities/auth-challenge.entity';
import { AuthChallengeTypeEnum } from 'src/common/enums/auth-challenge.enum';
import { UnexpectedError } from 'src/common/errors/unexpected.error';

@CustomInjectable()
export class LoginGoogleAuthUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly userRepository: UserRepository,
        private readonly invalidTokenRepository: InvalidTokenRepository,
        private readonly authChallengeRepository: AuthChallengeRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly tokenGenerator: IJwtGenerator,
        private readonly otpGenerator: IOtpGenerator,
        private readonly fileStorage: IFileStorage,
        private readonly datesFormatter: IDatesFormatter,
        private readonly emailSender: IEmailSender,
    ) {}

    @TransactionalDBConnection()
    async execute(payload: LoginGoogleAuthDto): Promise<LoginGoogleAuthResponseDto> {
        const tokenHash = this.otpGenerator.sha256(payload.token);
        const isBlacklisted = await this.invalidTokenRepository.isBlackList(tokenHash);
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
        let isTwoFactorEnabled: boolean = false;
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
            isTwoFactorEnabled = user.attributes.twoFactorEnabled;
        }

        const expirationDate = payload.expiration
            ? new Date(payload.expiration * 1000)
            : new Date(Date.now() + 60 * 60 * 1000);

        await this.invalidTokenRepository.add(
            InvalidToken.create({
                payload: tokenHash,
                expiration: expirationDate,
            }),
        );

        if (!isTwoFactorEnabled) {
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
                requiresTwoFactor: false,
            };
        }

        const otp = this.otpGenerator.otp(6, 2);
        const hashedOtp = this.otpGenerator.sha256(otp);
        const expiresAt = this.datesFormatter.currentDatePlusMinutes(5);

        const challenge = AuthChallenge.create({
            userId: data.sub,
            code: hashedOtp,
            expiresAt: expiresAt,
            type: AuthChallengeTypeEnum.LOGIN_2FA,
        });
        await this.authChallengeRepository.save(challenge);

        const tempToken = this.tokenGenerator.sign<ITwoFactorTempPayload>(
            {
                sub: data.sub,
                challengeId: challenge.attributes.id,
                purpose: '2FA_CHALLENGE',
            },
            'temporal',
        );

        const isSend = await this.emailSender.send({
            to: data.email,
            subject: 'Tu código de acceso (2FA)',
            htmlBody: `Tu código de verificación es: <b>${otp}</b>. Vence en 5 minutos.`,
        });
        if (!isSend) {
            throw new UnexpectedError('Ocurrio un error al iniciar sesión, intentelo mas tarde');
        }

        return {
            requiresTwoFactor: true,
            email: data.email,
            tempToken: tempToken,
        };
    }
}
