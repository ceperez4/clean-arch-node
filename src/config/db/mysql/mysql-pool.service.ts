import { Inject, Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { MYSQL_POOL_PROVIDER } from './mysql-pool.provider';

@Injectable()
export class MysqlPoolService implements OnApplicationShutdown {
    private readonly logger = new Logger(MysqlPoolService.name);

    constructor(
        @Inject(MYSQL_POOL_PROVIDER)
        private readonly pool: Pool,
    ) {}

    async onApplicationShutdown(signal?: string): Promise<void> {
        this.logger.log(
            `Señal de apagado recibida (${signal ?? 'SHUTDOWN'}). Cerrando pool de MySQL de forma segura...`,
        );
        try {
            await this.pool.end();
            this.logger.log('Pool de MySQL cerrado correctamente sin pérdida de datos.');
        } catch (error) {
            this.logger.error('Error al cerrar el pool de MySQL:', error);
        }
    }
}
