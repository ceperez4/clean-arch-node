import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { AuditLog } from '../../../domain/entities/audit-log.entity';
import { AuditLogRepository } from '../../../domain/repositories/audit-log.repository';
import { IAuditLogEngine } from './audit-log-engine.contract';
import { RecordAuditLogInput } from './audit-log-engine.dto';

@CustomInjectable()
export class AuditLogEngine implements IAuditLogEngine {
    constructor(private readonly auditLogRepository: AuditLogRepository) {}

    async record(input: RecordAuditLogInput): Promise<void> {
        const auditLog = AuditLog.create({
            resource: input.resource,
            resourceId: input.resourceId,
            action: input.action,
            actorId: input.actorId ?? null,
            beforeState: input.beforeState ?? null,
            afterState: input.afterState ?? null,
            ip: input.ip ?? '',
        });

        await this.auditLogRepository.save(auditLog);
    }
}
