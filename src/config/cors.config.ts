import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const createCorsOptions = (corsOrigins: string[], isProd: boolean = false): CorsOptions => {
    if (isProd && corsOrigins.includes('*')) {
        throw new Error('CORS_ORIGINS no puede contener "*" en producción cuando credentials está habilitado');
    }

    return {
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            // Permitir peticiones sin origen (same-origin, aplicaciones móviles nativas, server-to-server)
            if (!origin) {
                return callback(null, true);
            }

            // En entornos no productivos, permitir comodín '*' si fue configurado expresamente
            if (!isProd && corsOrigins.includes('*')) {
                return callback(null, true);
            }

            // Validar contra la lista blanca explícita
            if (corsOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Denegar el origen no permitido de forma limpia
            return callback(null, false);
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
    };
};
