import type { Pool } from 'mysql2/promise';

export abstract class IUnitOfWork {
    abstract getPool(): Pool; //TODO: no depender de mysql
}
