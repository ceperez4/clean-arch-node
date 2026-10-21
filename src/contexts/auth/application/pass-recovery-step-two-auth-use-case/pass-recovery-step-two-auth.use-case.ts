import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { TransactionalDBConnection } from 'src/common/decorators/db-connection.decorator';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { UserStatusEnum } from 'src/common/enums/user.enum';
import { ValidationError } from 'src/common/errors/validation.error';
import { PassRecoveryStepTwoAuthDto } from './pass-recovery-step-two-auth.dto';
import { timingSafeEqual } from 'node:crypto';
import { UserRepository } from 'src/contexts/users/domain/repositories/user.repository';
import { IDatesFormatter } from 'src/common/libs/dates-formatter/dates-formatter.interface';
import { IPasswordHasher } from 'src/common/libs/password-hasher/password-hasher.interface';
import { IEmailSender } from 'src/common/libs/email-sender/email-sender.interface';
import { ICacheManager } from 'src/common/libs/cache-manager/cache-manager.interface';

@CustomInjectable()
export class PassRecoveryStepTwoAuthUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly userRepository: UserRepository,
        private readonly datesFormatter: IDatesFormatter,
        private readonly emailSender: IEmailSender,
        private readonly passwordHasher: IPasswordHasher,
        private readonly cacheManager: ICacheManager,
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

        const otpData = await this.userRepository.findOneOtp(user.attributes.id);
        if (!otpData) throw new NotFoundError('El código de recuperación no fue encontrado');

        const otpSaved = otpData.otp ?? '';
        const bufPayload = Buffer.from(payload.otp);
        const bufSaved = Buffer.from(otpSaved);

        if (
            bufPayload.length === 0 ||
            bufSaved.length === 0 ||
            bufPayload.length !== bufSaved.length ||
            !timingSafeEqual(bufPayload, bufSaved) //TODO: no depender directamente de node timingSafeEqual
        ) {
            throw new ValidationError('El código de recuperación es incorrecto');
        }

        const currentDate = new Date();
        const expirationDate = new Date(otpData.expiration);
        if (
            !otpData.expiration ||
            Number.isNaN(expirationDate.getTime()) ||
            expirationDate.getTime() < currentDate.getTime()
        ) {
            throw new ValidationError('El código de recuperación ya expiró');
        }

        const passwordHashed = await this.passwordHasher.hash(payload.password);

        await this.userRepository.updatePassword(user.attributes.id, passwordHashed);
        await this.cacheManager.del(`auth_user:${user.attributes.id}`);

        await this.userRepository.updateOtp({
            otp: '',
            id: user.attributes.id,
            expiration: this.datesFormatter.toString(currentDate),
        });

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
