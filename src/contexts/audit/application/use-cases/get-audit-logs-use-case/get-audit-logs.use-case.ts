import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { SimpleDBConnection } from 'src/common/decorators/db-connection.decorator';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { AuditLogRepository } from '../../../domain/repositories/audit-log.repository';
import { AuditLogItemResponseDto, GetAuditLogsParamDto } from './get-audit-logs.dto';

@CustomInjectable()
export class GetAuditLogsUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly auditLogRepository: AuditLogRepository,
    ) {}

    @SimpleDBConnection()
    async execute(payload: GetAuditLogsParamDto): Promise<AuditLogItemResponseDto[]> {
        const logs = await this.auditLogRepository.findByResource({
            resource: payload.resource,
            resourceId: payload.resourceId,
        });

        return logs.map((log) => ({
            id: log.attributes.id,
            resource: log.attributes.resource,
            resourceId: log.attributes.resourceId,
            action: log.attributes.action,
            actorId: log.attributes.actorId,
            beforeState: log.attributes.beforeState,
            afterState: log.attributes.afterState,
            ip: log.attributes.ip,
            createdAt: log.attributes.createdAt,
        }));
    }
}
