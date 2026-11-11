import { TransactionalDBConnection } from 'src/common/decorators/db-connection.decorator';
import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { ToggleTwoFactorUserDto } from './toggle-two-factor-user.dto';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { UserRepository } from '../../domain/repositories/user.repository';
import { ICacheManager } from 'src/common/libs/cache-manager/cache-manager.interface';
import type { ICurrentUser } from 'src/common/interfaces/jwt-payload.interface';
import { UnauthorizedError } from 'src/common/errors/unauthorized.error';
import { NotFoundError } from 'src/common/errors/not-found.error';

@CustomInjectable()
export class ToggleTwoFactorUserUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly userRepository: UserRepository,
        private readonly cacheManager: ICacheManager,
    ) {}

    @TransactionalDBConnection()
    async execute(userId: number, payload: ToggleTwoFactorUserDto, currentUser: ICurrentUser): Promise<void> {
        if (!currentUser.isAdmin() && userId !== currentUser.id) {
            throw new UnauthorizedError('No tiene permisos para modificar este usuario');
        }

        const user = await this.userRepository.findOneByCriteria({ type: 'id', value: userId });
        if (!user) throw new NotFoundError('Usuario no encontrado');

        await this.userRepository.updateTwoFactor(userId, payload.enabled);

        await this.cacheManager.del(`auth_user:${userId}`);
    }
}
