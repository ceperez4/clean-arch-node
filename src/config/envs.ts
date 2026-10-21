import { registerAs } from '@nestjs/config';
import { get } from 'env-var';

export interface IEnvs {
    appPort: number;
    appUrl: string;
    waitForConnections: boolean;
    dbConnectionLimit: number;
    dbName: string;
    dbHost: string;
    dbPassword: string;
    dbPort: number;
    dbUser: string;
    jwtAccessSecret: string;
    jwtRefreshSecret: string;
    jwtAccessExpiresIn: string;
    jwtRefreshExpiresIn: string;
    googleClientId: string;
    corsOrigins: string[];
    isProd: boolean;
    maxAgeRefreshCookie: number;
}

export const envs = registerAs<IEnvs>('envs', () => ({
    appPort: get('APP_PORT').default(3000).asPortNumber(),
    waitForConnections: true,
    dbConnectionLimit: get('DB_CONNECTION_LIMIT').default(10).required().asInt(),
    dbName: get('DB_NAME').default('bdd_name').required().asString(),
    dbHost: get('DB_HOST').default('localhost').required().asString(),
    dbPassword: get('DB_PASS').default('').asString(),
    dbPort: get('DB_PORT').default(3306).asPortNumber(),
    dbUser: get('DB_USER').default('root').required().asString(),
    jwtAccessSecret: get('JWT_ACCESS_SECRET').default('ACCESS_SECRET_KEY').required().asString(),
    jwtRefreshSecret: get('JWT_REFRESH_SECRET').default('REFRESH_SECRET_KEY').required().asString(),
    jwtAccessExpiresIn: get('JWT_ACCESS_EXPIRES_IN').default('15Min').required().asString(),
    jwtRefreshExpiresIn: get('JWT_REFRESH_EXPIRES_IN').default('1D').required().asString(),
    googleClientId: get('GOOGLE_CLIENT_ID').required().asString(),
    corsOrigins: get('CORS_ORIGINS')
        .default('http://localhost:3000,http://localhost:5173,http://localhost:4200')
        .asArray(','),
    isProd: get('NODE_ENV').default('dev').required().asEnum(['dev', 'production', 'test']) === 'production',
    maxAgeRefreshCookie: get('MAX_AGE_REFRESH_COOKIE').default(86400000).required().asInt(),
    appUrl: get('APP_URL').default('http://localhost:3000').asUrlString(),
}));
