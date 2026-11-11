import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { VerifyTwoFactorAuthDto, VerifyTwoFactorResponseDto } from './verify-two-factor-auth.dto';
import { TransactionalDBConnection } from 'src/common/decorators/db-connection.decorator';
import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { AuthChallengeRepository } from '../../domain/repositories/auth-challenge.repository';
import { UserRepository } from 'src/contexts/users/domain/repositories/user.repository';
import { IJwtGenerator } from 'src/common/libs/jwt-generator/jwt-generator.interface';
import { FileStorageEnum, IFileStorage } from 'src/common/libs/files-storage/file-storage.interface';
import { IJwtPayload, ITwoFactorTempPayload } from 'src/common/interfaces/jwt-payload.interface';
import { UnauthorizedError } from 'src/common/errors/unauthorized.error';
import { AuthChallengeTypeEnum } from 'src/common/enums/auth-challenge.enum';
import { ValidationError } from 'src/common/errors/validation.error';
import { timingSafeEqual } from 'node:crypto';

@CustomInjectable()
export class VerifyTwoFactorAuthUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly challengeRepository: AuthChallengeRepository,
        private readonly userRepository: UserRepository,
        private readonly tokenGenerator: IJwtGenerator,
        private readonly fileStorage: IFileStorage,
    ) {}

    @TransactionalDBConnection()
    async execute(payload: VerifyTwoFactorAuthDto): Promise<VerifyTwoFactorResponseDto> {
        const decoded = this.tokenGenerator.verify<ITwoFactorTempPayload>(payload.tempToken, 'temporal');
        if (!decoded || decoded.purpose !== '2FA_CHALLENGE' || !decoded.challengeId) {
            throw new UnauthorizedError('Token de verificación inválido');
        }

        const challenge = await this.challengeRepository.findById(decoded.challengeId);
        if (!challenge || challenge.attributes.type !== AuthChallengeTypeEnum.LOGIN_2FA || challenge.isUsed()) {
            throw new UnauthorizedError('Desafío de seguridad no encontrado o ya utilizado');
        }

        if (challenge.isExpired()) {
            throw new ValidationError('El código de verificación ha expirado. Inicia sesión de nuevo.');
        }

        if (challenge.isExceededAttempts(3)) {
            throw new ValidationError('Has superado el número máximo de intentos permitidos. Inicia sesión de nuevo.');
        }

        const bufProvided = Buffer.from(payload.otp);
        const bufExpected = Buffer.from(challenge.attributes.code);
        const isMatch = bufProvided.length === bufExpected.length && timingSafeEqual(bufProvided, bufExpected);

        if (!isMatch) {
            challenge.incrementAttempts();
            await this.challengeRepository.update(challenge);
            throw new ValidationError('Código de verificación incorrecto');
        }

        challenge.markAsUsed();
        await this.challengeRepository.update(challenge);

        const user = await this.userRepository.findOneByCriteria({ type: 'id', value: challenge.attributes.userId });
        if (!user) throw new UnauthorizedError('Usuario no encontrado');

        const tokenData: IJwtPayload = {
            sub: user.attributes.id,
            name: user.attributes.name,
            tokenVersion: user.attributes.tokenVersion,
            email: user.attributes.email,
            role: user.attributes.role,
        };

        const accessToken = this.tokenGenerator.sign<IJwtPayload>(tokenData, 'access');
        const refreshToken = this.tokenGenerator.sign<IJwtPayload>(tokenData, 'refresh');
        const avatarUrl = this.fileStorage.url(user.attributes.avatar, FileStorageEnum.AVATAR);

        return {
            id: user.attributes.id,
            name: user.attributes.name,
            email: user.attributes.email,
            role: user.attributes.role,
            accessToken,
            refreshToken,
            avatar: avatarUrl ?? '',
        };
    }
}
