import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { UpdatePasswordUserDto, UpdatePasswordUserResponseDto } from './update-password-user.dto';
import { TransactionalDBConnection } from 'src/common/decorators/db-connection.decorator';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { NotFoundError } from 'src/common/errors/not-found.error';
import type { ICurrentUser, IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { UnauthorizedError } from 'src/common/errors/unauthorized.error';
import { UserRepository } from '../../domain/repositories/user.repository';
import { IPasswordHasher } from 'src/common/libs/password-hasher/password-hasher.interface';
import { IJwtGenerator } from 'src/common/libs/jwt-generator/jwt-generator.interface';
import { IEmailSender } from 'src/common/libs/email-sender/email-sender.interface';
import { ICacheManager } from 'src/common/libs/cache-manager/cache-manager.interface';

@CustomInjectable()
export class UpdatePasswordUserUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly tokenGenerator: IJwtGenerator,
        private readonly emailSender: IEmailSender,
        private readonly cacheManager: ICacheManager,
    ) {}

    @TransactionalDBConnection()
    async execute(
        userId: number,
        payload: UpdatePasswordUserDto,
        currentUser: ICurrentUser,
    ): Promise<UpdatePasswordUserResponseDto> {
        if (!currentUser.isAdmin() && userId !== currentUser.id) {
            throw new UnauthorizedError('No tiene permisos para modificar la contraseña de este usuario');
        }

        const user = await this.userRepository.findOneByCriteria({
            type: 'id',
            value: userId,
        });
        if (!user) throw new NotFoundError('Usuario no encontrado');

        const isSelf = userId === currentUser.id;
        if (isSelf) {
            const isPassCorrect = await this.passwordHasher.compare(payload.currentPassword, user.attributes.password);
            if (!isPassCorrect) throw new UnauthorizedError('La contraseña actual es incorrecta');
        }

        const hashedPassword = await this.passwordHasher.hash(payload.newPassword);
        const newTokenVersion = user.attributes.tokenVersion + 1;

        await this.userRepository.updatePassword(userId, hashedPassword);
        await this.userRepository.updateTokenVersion(userId, newTokenVersion);
        await this.cacheManager.del(`auth_user:${userId}`);

        void this.emailSender
            .send({
                to: user.attributes.email,
                subject: 'Cambio de contraseña',
                htmlBody: `La contraseña fue actualizada correctamente`,
            })
            .catch(() => undefined);

        const jwtPayload: IJwtPayload = {
            sub: user.attributes.id,
            name: user.attributes.name,
            tokenVersion: newTokenVersion,
            email: user.attributes.email,
            role: user.attributes.role,
        };

        const accessToken = this.tokenGenerator.sign<IJwtPayload>(jwtPayload, 'access');
        const refreshToken = this.tokenGenerator.sign<IJwtPayload>(jwtPayload, 'refresh');

        return {
            accessToken,
            refreshToken,
        };
    }
}
