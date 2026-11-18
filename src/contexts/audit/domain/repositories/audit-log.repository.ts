import { AuditResourceEnum } from 'src/common/enums/audit.enum';
import { AuditLog } from '../entities/audit-log.entity';

export interface IAuditLogFindByResourceCriteria {
    resource: AuditResourceEnum;
    resourceId: string;
}

export abstract class AuditLogRepository {
    abstract save(entity: AuditLog): Promise<AuditLog>;
    abstract findByResource(criteria: IAuditLogFindByResourceCriteria): Promise<AuditLog[]>;
}
