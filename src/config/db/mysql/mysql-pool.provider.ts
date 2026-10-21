import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPool } from 'mysql2/promise';
import { IEnvs } from 'src/config/envs';

interface IPoolConnection {
    host: string;
    user: string;
    password: string;
    database: string;
    waitForConnections: boolean;
    connectionLimit: number;
    port: number;
}

const initMysql = (config: IPoolConnection) => {
    return createPool(config);
};

export const MYSQL_POOL_PROVIDER = 'MYSQL_POOL';

export const MysqlPoolProvider: Provider = {
    provide: MYSQL_POOL_PROVIDER,
    useFactory: (configService: ConfigService) => {
        const envs = configService.get<IEnvs>('envs');
        if (!envs) throw new Error('No se encontró configuración de base de datos');
        return initMysql({
            connectionLimit: envs.dbConnectionLimit,
            database: envs.dbName,
            host: envs.dbHost,
            password: envs.dbPassword,
            port: envs.dbPort,
            user: envs.dbUser,
            waitForConnections: envs.waitForConnections,
        });
    },
    inject: [ConfigService],
};
