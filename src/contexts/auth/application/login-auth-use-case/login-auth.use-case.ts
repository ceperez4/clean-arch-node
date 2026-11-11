import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { LoginAuthDto, LoginAuthResponseDto } from './login-auth.dto';
import { TransactionalDBConnection } from 'src/common/decorators/db-connection.decorator';
import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { UnauthorizedError } from 'src/common/errors/unauthorized.error';
import { IJwtPayload, ITwoFactorTempPayload } from 'src/common/interfaces/jwt-payload.interface';
import { UserOauthEnum, UserStatusEnum } from 'src/common/enums/user.enum';
import { UserRepository } from 'src/contexts/users/domain/repositories/user.repository';
import { IPasswordHasher } from 'src/common/libs/password-hasher/password-hasher.interface';
import { IJwtGenerator } from 'src/common/libs/jwt-generator/jwt-generator.interface';
import { FileStorageEnum, IFileStorage } from 'src/common/libs/files-storage/file-storage.interface';
import { AuthChallengeRepository } from '../../domain/repositories/auth-challenge.repository';
import { IOtpGenerator } from 'src/common/libs/otp-generator/otp-generator.interface';
import { IDatesFormatter } from 'src/common/libs/dates-formatter/dates-formatter.interface';
import { IEmailSender } from 'src/common/libs/email-sender/email-sender.interface';
import { AuthChallenge } from '../../domain/entities/auth-challenge.entity';
import { AuthChallengeTypeEnum } from 'src/common/enums/auth-challenge.enum';
import { UnexpectedError } from 'src/common/errors/unexpected.error';

@CustomInjectable()
export class LoginAuthUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly userRepository: UserRepository,
        private readonly authChallengeRepository: AuthChallengeRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly tokenGenerator: IJwtGenerator,
        private readonly fileStorage: IFileStorage,
        private readonly otpGenerator: IOtpGenerator,
        private readonly datesFormatter: IDatesFormatter,
        private readonly emailSender: IEmailSender,
    ) {}

    @TransactionalDBConnection()
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

        if (!user.attributes.twoFactorEnabled) {
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
                requiresTwoFactor: false,
            };
        }

        const otp = this.otpGenerator.otp(6, 2);

        const expiresAt = this.datesFormatter.currentDatePlusMinutes(5);

        const challenge = AuthChallenge.create({
            userId: user.attributes.id,
            code: otp,
            expiresAt: expiresAt,
            type: AuthChallengeTypeEnum.LOGIN_2FA,
        });
        await this.authChallengeRepository.save(challenge);

        const tempToken = this.tokenGenerator.sign<ITwoFactorTempPayload>(
            {
                sub: user.attributes.id,
                challengeId: challenge.attributes.id,
                purpose: '2FA_CHALLENGE',
            },
            'temporal',
        );

        const isSend = await this.emailSender.send({
            to: user.attributes.email,
            subject: 'Tu código de acceso (2FA)',
            htmlBody: `Tu código de verificación es: <b>${otp}</b>. Vence en 5 minutos.`,
        });
        if (!isSend) {
            throw new UnexpectedError('Ocurrio un error al iniciar sesión, intentelo mas tarde');
        }

        return {
            requiresTwoFactor: true,
            email: user.attributes.email,
            tempToken: tempToken,
        };
    }
}
