import { Module } from '@nestjs/common';
import { IAuditLogEngine } from '../application/engines/audit-log-engine/audit-log-engine.contract';
import { AuditLogEngine } from '../application/engines/audit-log-engine/audit-log.engine';
import { GetAuditLogsUseCase } from '../application/use-cases/get-audit-logs-use-case/get-audit-logs.use-case';
import { AuditQueryController } from './controllers/audit-query.controller';

@Module({
    controllers: [AuditQueryController],
    providers: [
        GetAuditLogsUseCase,
        {
            provide: IAuditLogEngine,
            useClass: AuditLogEngine,
        },
    ],
    exports: [IAuditLogEngine],
})
export class AuditModule {}
