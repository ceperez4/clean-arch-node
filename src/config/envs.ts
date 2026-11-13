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
    trustProxy: string;
}

export const loadEnvs = (): IEnvs => {
    const isProd = get('NODE_ENV').default('dev').asEnum(['dev', 'production', 'test']) === 'production';

    const jwtAccessSecret = isProd
        ? get('JWT_ACCESS_SECRET').required().asString()
        : get('JWT_ACCESS_SECRET').default('DEV_ACCESS_SECRET_KEY_CHANGE_IN_PRODUCTION').asString();

    const jwtRefreshSecret = isProd
        ? get('JWT_REFRESH_SECRET').required().asString()
        : get('JWT_REFRESH_SECRET').default('DEV_REFRESH_SECRET_KEY_CHANGE_IN_PRODUCTION').asString();

    const dbName = isProd ? get('DB_NAME').required().asString() : get('DB_NAME').default('node_app').asString();

    const googleClientId = isProd
        ? get('GOOGLE_CLIENT_ID').required().asString()
        : get('GOOGLE_CLIENT_ID').default('dev-google-client-id').asString();

    const corsOrigins = get('CORS_ORIGINS')
        .default('http://localhost:3000,http://localhost:5173,http://localhost:4200')
        .asArray(',');

    if (isProd) {
        if (jwtAccessSecret === jwtRefreshSecret) {
            throw new Error('JWT_ACCESS_SECRET y JWT_REFRESH_SECRET deben ser diferentes en producción');
        }
        if (jwtAccessSecret.length < 32 || jwtRefreshSecret.length < 32) {
            throw new Error('Los secretos JWT deben tener al menos 32 caracteres en producción');
        }
        if (corsOrigins.includes('*')) {
            throw new Error('CORS_ORIGINS no puede contener "*" en producción cuando credentials está habilitado');
        }
    }

    return {
        appPort: get('APP_PORT').default(3000).asPortNumber(),
        waitForConnections: true,
        dbConnectionLimit: get('DB_CONNECTION_LIMIT').default(10).asIntPositive(),
        dbName: dbName,
        dbHost: get('DB_HOST').default('localhost').asString(),
        dbPassword: get('DB_PASS').default('').asString(),
        dbPort: get('DB_PORT').default(3306).asPortNumber(),
        dbUser: get('DB_USER').default('root').asString(),
        jwtAccessSecret: jwtAccessSecret,
        jwtRefreshSecret: jwtRefreshSecret,
        jwtAccessExpiresIn: get('JWT_ACCESS_EXPIRES_IN').default('15Min').asString(),
        jwtRefreshExpiresIn: get('JWT_REFRESH_EXPIRES_IN').default('7D').asString(),
        googleClientId: googleClientId,
        corsOrigins: corsOrigins,
        isProd: isProd,
        maxAgeRefreshCookie: get('MAX_AGE_REFRESH_COOKIE').default(86400000).asIntPositive(),
        appUrl: get('APP_URL').default('http://localhost:3000').asUrlString(),
        trustProxy: get('TRUST_PROXY').default('loopback').asString(),
    };
};

export const envs = registerAs<IEnvs>('envs', loadEnvs);
