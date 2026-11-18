import { AuditActionEnum, AuditResourceEnum } from 'src/common/enums/audit.enum';

export interface RecordAuditLogInput {
    resource: AuditResourceEnum;
    resourceId: string;
    action: AuditActionEnum;
    actorId?: number | null;
    beforeState?: Record<string, unknown> | null;
    afterState?: Record<string, unknown> | null;
    ip?: string;
}
