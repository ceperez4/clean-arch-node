import { ResultSetHeader } from 'mysql2/promise';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditLogRepository, IAuditLogFindByResourceCriteria } from '../../domain/repositories/audit-log.repository';
import { IAuditLogRow } from './audit-log-mysql.interface';
import { BaseMysqlRepository } from 'src/config/db/mysql/base-mysql.repository';

export class AuditLogMysqlImpl extends BaseMysqlRepository implements AuditLogRepository {
    async save(entity: AuditLog): Promise<AuditLog> {
        const query = `
            INSERT INTO audit_logs (
                audit_resource,
                audit_resource_id,
                audit_action,
                audit_actor_id,
                audit_before_state,
                audit_after_state,
                audit_ip,
                audit_created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await this.conn.query<ResultSetHeader>(query, [
            entity.attributes.resource,
            entity.attributes.resourceId,
            entity.attributes.action,
            entity.attributes.actorId,
            entity.attributes.beforeState ? JSON.stringify(entity.attributes.beforeState) : null,
            entity.attributes.afterState ? JSON.stringify(entity.attributes.afterState) : null,
            entity.attributes.ip,
            entity.attributes.createdAt,
        ]);

        entity.attributes.id = result.insertId;
        return entity;
    }

    async findByResource(criteria: IAuditLogFindByResourceCriteria): Promise<AuditLog[]> {
        const query = `
            SELECT
                audit_id,
                audit_resource,
                audit_resource_id,
                audit_action,
                audit_actor_id,
                audit_before_state,
                audit_after_state,
                audit_ip,
                audit_created_at
            FROM audit_logs
            WHERE audit_resource = ? AND audit_resource_id = ?
            ORDER BY audit_created_at DESC
        `;

        const [rows] = await this.conn.query<IAuditLogRow[]>(query, [criteria.resource, criteria.resourceId]);

        return rows.map(
            (row) =>
                new AuditLog({
                    id: row.audit_id,
                    resource: row.audit_resource,
                    resourceId: row.audit_resource_id,
                    action: row.audit_action,
                    actorId: row.audit_actor_id,
                    beforeState: row.audit_before_state,
                    afterState: row.audit_after_state,
                    ip: row.audit_ip,
                    createdAt: row.audit_created_at,
                }),
        );
    }
}
