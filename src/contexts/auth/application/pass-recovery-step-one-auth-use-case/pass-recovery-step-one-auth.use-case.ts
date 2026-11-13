import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { PassRecoveryStepOneAuthDto } from './pass-recovery-step-one-auth.dto';
import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { TransactionalDBConnection } from 'src/common/decorators/db-connection.decorator';
import { UserOauthEnum, UserStatusEnum } from 'src/common/enums/user.enum';
import { ValidationError } from 'src/common/errors/validation.error';
import { UserRepository } from 'src/contexts/users/domain/repositories/user.repository';
import { IDatesFormatter } from 'src/common/libs/dates-formatter/dates-formatter.interface';
import { IOtpGenerator } from 'src/common/libs/otp-generator/otp-generator.interface';
import { IEmailSender } from 'src/common/libs/email-sender/email-sender.interface';
import { AuthChallengeRepository } from '../../domain/repositories/auth-challenge.repository';
import { AuthChallenge } from '../../domain/entities/auth-challenge.entity';
import { AuthChallengeTypeEnum } from 'src/common/enums/auth-challenge.enum';

@CustomInjectable()
export class PassRecoveryStepOneAuthUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly userRepository: UserRepository,
        private readonly datesFormatter: IDatesFormatter,
        private readonly otpGenerator: IOtpGenerator,
        private readonly emailSender: IEmailSender,
        private readonly authChallengeRepository: AuthChallengeRepository,
    ) {}

    @TransactionalDBConnection()
    async execute(payload: PassRecoveryStepOneAuthDto): Promise<void> {
        const user = await this.userRepository.findOneByCriteria({
            type: 'email',
            value: payload.email,
        });

        if (
            !user ||
            user.attributes.status !== UserStatusEnum.ACTIVE ||
            user.attributes.oauth !== UserOauthEnum.MANUAL
        ) {
            return;
        }

        const otp = this.otpGenerator.otp(5, 2);
        const hashedOtp = this.otpGenerator.sha256(otp);
        const expiration = this.datesFormatter.currentDatePlusMinutes(5);

        const challenge = AuthChallenge.create({
            userId: user.attributes.id,
            code: hashedOtp,
            type: AuthChallengeTypeEnum.PASSWORD_RECOVERY,
            expiresAt: expiration,
        });
        await this.authChallengeRepository.save(challenge);

        const res = await this.emailSender.send({
            to: payload.email,
            subject: 'Recuperación de contraseña',
            htmlBody: `Codigo de recuperación ${otp}`,
        });
        if (!res) throw new ValidationError('Ocurrio un error al enviar el correo');

        return;
    }
}
