import { AsyncLocalStorage } from 'node:async_hooks';
import type { PoolConnection } from 'mysql2/promise';

export interface IMysqlContextStore {
    connection: PoolConnection;
    isTransactional: boolean;
}

export const mysqlContext = new AsyncLocalStorage<IMysqlContextStore>();
