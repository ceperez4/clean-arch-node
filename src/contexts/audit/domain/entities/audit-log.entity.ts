import { AuditActionEnum, AuditResourceEnum } from 'src/common/enums/audit.enum';

export interface PrimitiveAuditLog {
    id: number;
    resource: AuditResourceEnum;
    resourceId: string;
    action: AuditActionEnum;
    actorId: number | null;
    beforeState: Record<string, unknown> | null;
    afterState: Record<string, unknown> | null;
    ip: string;
    createdAt: Date;
}

export class AuditLog {
    public attributes: PrimitiveAuditLog;

    constructor(attributes: {
        id: number | string;
        resource: AuditResourceEnum;
        resourceId: string | number;
        action: AuditActionEnum;
        actorId?: number | string | null;
        beforeState?: Record<string, unknown> | string | null;
        afterState?: Record<string, unknown> | string | null;
        ip?: string;
        createdAt?: Date | string;
    }) {
        let parsedBefore: Record<string, unknown> | null = null;
        if (typeof attributes.beforeState === 'string') {
            try {
                parsedBefore = JSON.parse(attributes.beforeState) as Record<string, unknown>;
            } catch {
                parsedBefore = null;
            }
        } else if (typeof attributes.beforeState === 'object' && attributes.beforeState !== null) {
            parsedBefore = attributes.beforeState;
        }

        let parsedAfter: Record<string, unknown> | null = null;
        if (typeof attributes.afterState === 'string') {
            try {
                parsedAfter = JSON.parse(attributes.afterState) as Record<string, unknown>;
            } catch {
                parsedAfter = null;
            }
        } else if (typeof attributes.afterState === 'object' && attributes.afterState !== null) {
            parsedAfter = attributes.afterState;
        }

        this.attributes = {
            id: Number(attributes.id) || 0,
            resource: attributes.resource,
            resourceId: String(attributes.resourceId),
            action: attributes.action,
            actorId:
                attributes.actorId !== undefined && attributes.actorId !== null ? Number(attributes.actorId) : null,
            beforeState: parsedBefore,
            afterState: parsedAfter,
            ip: attributes.ip ?? '',
            createdAt: attributes.createdAt ? new Date(attributes.createdAt) : new Date(),
        };
    }

    static create(attributes: {
        resource: AuditResourceEnum;
        resourceId: string | number;
        action: AuditActionEnum;
        actorId?: number | null;
        beforeState?: Record<string, unknown> | null;
        afterState?: Record<string, unknown> | null;
        ip?: string;
    }): AuditLog {
        return new AuditLog({
            id: 0,
            resource: attributes.resource,
            resourceId: attributes.resourceId,
            action: attributes.action,
            actorId: attributes.actorId ?? null,
            beforeState: attributes.beforeState ?? null,
            afterState: attributes.afterState ?? null,
            ip: attributes.ip ?? '',
            createdAt: new Date(),
        });
    }
}
