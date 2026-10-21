import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { MYSQL_POOL_PROVIDER } from './mysql-pool.provider';

@Injectable()
export class MysqlUnitOfWork extends IUnitOfWork {
    private readonly pool: Pool;

    constructor(@Inject(MYSQL_POOL_PROVIDER) pool: Pool) {
        super();
        this.pool = pool;
    }

    getPool(): Pool {
        return this.pool;
    }
}
