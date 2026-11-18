import { RowDataPacket } from 'mysql2/promise';
import { AuditActionEnum, AuditResourceEnum } from 'src/common/enums/audit.enum';

export interface IAuditLogRow extends RowDataPacket {
    audit_id: number;
    audit_resource: AuditResourceEnum;
    audit_resource_id: string;
    audit_action: AuditActionEnum;
    audit_actor_id: number | null;
    audit_before_state: string | null;
    audit_after_state: string | null;
    audit_ip: string;
    audit_created_at: Date;
}
