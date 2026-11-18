import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { TransactionalDBConnection } from 'src/common/decorators/db-connection.decorator';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { ICacheManager } from 'src/common/libs/cache-manager/cache-manager.interface';
import { IAuditLogEngine } from 'src/contexts/audit/application/engines/audit-log-engine/audit-log-engine.contract';
import { ChangeStatusUserDto, ChangeStatusUserResponseDto } from './change-status-user.dto';
import type { ICurrentUser } from 'src/common/interfaces/jwt-payload.interface';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { ValidationError } from 'src/common/errors/validation.error';
import { UserStatusEnum } from 'src/common/enums/user.enum';
import { AuditActionEnum, AuditResourceEnum } from 'src/common/enums/audit.enum';

@CustomInjectable()
export class ChangeStatusUserUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly userRepository: UserRepository,
        private readonly cacheManager: ICacheManager,
        private readonly auditLogEngine: IAuditLogEngine,
    ) {}

    @TransactionalDBConnection()
    async execute(
        targetUserId: number,
        payload: ChangeStatusUserDto,
        currentUser: ICurrentUser,
        ip = '',
    ): Promise<ChangeStatusUserResponseDto> {
        if (!currentUser.isAdmin()) {
            throw new ValidationError('Solo los administradores pueden cambiar el estado de un usuario');
        }

        if (targetUserId === currentUser.id) {
            throw new ValidationError('No puedes cambiar tu propio estado de usuario');
        }

        const user = await this.userRepository.findOneByCriteria({
            type: 'id',
            value: targetUserId,
        });

        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        if (user.attributes.status === payload.status) {
            throw new ValidationError(`El usuario ya se encuentra en estado ${payload.status}`);
        }

        const previousStatus = user.attributes.status;
        const previousTokenVersion = user.attributes.tokenVersion;

        user.attributes.status = payload.status;
        let newTokenVersion: number | undefined;

        // Si se inhabilita al usuario, se incrementa su tokenVersion para revocar sesiones activas
        if (payload.status === UserStatusEnum.INACTIVE) {
            newTokenVersion = previousTokenVersion + 1;
            user.attributes.tokenVersion = newTokenVersion;
        }

        await this.userRepository.updateStatus(targetUserId, payload.status, newTokenVersion);
        await this.cacheManager.del(`auth_user:${targetUserId}`);

        // Orquestación con el Engine de Auditoría (comparte la misma transacción abierta por @TransactionalDBConnection)
        await this.auditLogEngine.record({
            resource: AuditResourceEnum.USER,
            resourceId: String(targetUserId),
            action: AuditActionEnum.STATUS_CHANGE,
            actorId: currentUser.id,
            beforeState: {
                status: previousStatus,
                tokenVersion: previousTokenVersion,
            },
            afterState: {
                status: user.attributes.status,
                tokenVersion: user.attributes.tokenVersion,
            },
            ip,
        });

        return {
            id: user.attributes.id,
            status: user.attributes.status,
        };
    }
}
