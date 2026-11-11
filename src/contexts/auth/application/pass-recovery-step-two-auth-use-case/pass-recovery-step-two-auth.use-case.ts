import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { TransactionalDBConnection } from 'src/common/decorators/db-connection.decorator';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { UserStatusEnum } from 'src/common/enums/user.enum';
import { ValidationError } from 'src/common/errors/validation.error';
import { PassRecoveryStepTwoAuthDto } from './pass-recovery-step-two-auth.dto';
import { timingSafeEqual } from 'node:crypto';
import { UserRepository } from 'src/contexts/users/domain/repositories/user.repository';
import { IPasswordHasher } from 'src/common/libs/password-hasher/password-hasher.interface';
import { IEmailSender } from 'src/common/libs/email-sender/email-sender.interface';
import { ICacheManager } from 'src/common/libs/cache-manager/cache-manager.interface';
import { AuthChallengeRepository } from '../../domain/repositories/auth-challenge.repository';
import { AuthChallengeTypeEnum } from 'src/common/enums/auth-challenge.enum';

@CustomInjectable()
export class PassRecoveryStepTwoAuthUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly userRepository: UserRepository,
        private readonly emailSender: IEmailSender,
        private readonly passwordHasher: IPasswordHasher,
        private readonly cacheManager: ICacheManager,
        private readonly authChallengeRepository: AuthChallengeRepository,
    ) {}

    @TransactionalDBConnection()
    async execute(payload: PassRecoveryStepTwoAuthDto) {
        const user = await this.userRepository.findOneByCriteria({
            type: 'email',
            value: payload.email,
        });
        if (!user) throw new NotFoundError('Usuario no encontrado');

        if (user.attributes.status !== UserStatusEnum.ACTIVE)
            throw new ValidationError('El usuario no se encuentra activo');

        const challenge = await this.authChallengeRepository.findLatestActive(
            user.attributes.id,
            AuthChallengeTypeEnum.PASSWORD_RECOVERY,
        );
        if (!challenge) throw new NotFoundError('El código de recuperación no fue encontrado');

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
            await this.authChallengeRepository.update(challenge);
            throw new ValidationError('Código de verificación incorrecto');
        }

        challenge.markAsUsed();
        await this.authChallengeRepository.update(challenge);

        const passwordHashed = await this.passwordHasher.hash(payload.password);

        await this.userRepository.updatePassword(user.attributes.id, passwordHashed);
        await this.cacheManager.del(`auth_user:${user.attributes.id}`);

        void this.emailSender
            .send({
                to: payload.email,
                subject: 'Cambio de contraseña',
                htmlBody: `La contraseña fue actualizada correctamente`,
            })
            .catch(() => undefined);

        return;
    }
}
