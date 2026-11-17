import { TransactionalDBConnection } from 'src/common/decorators/db-connection.decorator';
import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { ToggleTwoFactorUserDto } from './toggle-two-factor-user.dto';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { ICacheManager } from 'src/common/libs/cache-manager/cache-manager.interface';
import type { ICurrentUser } from 'src/common/interfaces/jwt-payload.interface';
import { UnauthorizedError } from 'src/common/errors/unauthorized.error';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { ValidationError } from 'src/common/errors/validation.error';
import { IPasswordHasher } from 'src/common/libs/password-hasher/password-hasher.interface';
import { IEmailSender } from 'src/common/libs/email-sender/email-sender.interface';
import { UserOauthEnum } from 'src/common/enums/user.enum';

@CustomInjectable()
export class ToggleTwoFactorUserUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly userRepository: UserRepository,
        private readonly cacheManager: ICacheManager,
        private readonly passwordHasher: IPasswordHasher,
        private readonly emailSender: IEmailSender,
    ) {}

    @TransactionalDBConnection()
    /**
     * TODO: implementar un flujo de verificación previa: emitir un OTP de confirmación
     * y solo activar user_two_factor_enabled = true una vez que el usuario demuestre que pudo recibirlo.
     */
    async execute(userId: number, payload: ToggleTwoFactorUserDto, currentUser: ICurrentUser): Promise<void> {
        if (!currentUser.isAdmin() && userId !== currentUser.id) {
            throw new UnauthorizedError('No tiene permisos para modificar este usuario');
        }

        const user = await this.userRepository.findOneByCriteria({ type: 'id', value: userId });
        if (!user) throw new NotFoundError('Usuario no encontrado');

        const isSelf = userId === currentUser.id;
        if (isSelf && user.attributes.oauth === UserOauthEnum.MANUAL) {
            if (!payload.currentPassword) {
                throw new ValidationError('La contraseña actual es requerida para modificar la configuración de 2FA');
            }

            const isPasswordValid = await this.passwordHasher.compare(
                payload.currentPassword,
                user.attributes.password,
            );
            if (!isPasswordValid) {
                throw new UnauthorizedError('La contraseña actual es incorrecta');
            }
        }

        await this.userRepository.updateTwoFactor(userId, payload.enabled);

        await this.cacheManager.del(`auth_user:${userId}`);

        void this.emailSender
            .send({
                to: user.attributes.email,
                subject: payload.enabled
                    ? 'Autenticación en dos pasos (2FA) activada'
                    : 'Autenticación en dos pasos (2FA) desactivada',
                htmlBody: payload.enabled
                    ? 'La autenticación en dos pasos (2FA) ha sido activada en tu cuenta.'
                    : 'La autenticación en dos pasos (2FA) ha sido desactivada en tu cuenta.',
            })
            .catch(() => undefined);
    }
}
