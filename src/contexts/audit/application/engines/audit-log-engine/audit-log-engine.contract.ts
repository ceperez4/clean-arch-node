import { RecordAuditLogInput } from './audit-log-engine.dto';

export abstract class IAuditLogEngine {
    abstract record(input: RecordAuditLogInput): Promise<void>;
}
