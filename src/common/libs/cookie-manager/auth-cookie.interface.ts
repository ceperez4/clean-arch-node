export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

/**
 * Opciones de configuración para la serialización de cookies HTTP según el estándar RFC 6265.
 */
export interface CookieSerializeOptions {
    /** Indica si la cookie solo debe transmitirse a través de HTTP/HTTPS (no accesible vía JavaScript) */
    httpOnly?: boolean;
    /** Indica si la cookie solo debe enviarse sobre conexiones HTTPS cifradas */
    secure?: boolean;
    /** Controla si la cookie se envía en peticiones cross-site ('lax', 'strict' o 'none') */
    sameSite?: 'lax' | 'strict' | 'none';
    /** Ruta de la URL para la que la cookie es válida (ej. `/api/auth`) */
    path?: string;
    /** Tiempo de vida de la cookie en milisegundos */
    maxAge?: number;
    /** Dominio específico para el que la cookie es válida */
    domain?: string;
}

/**
 * Contrato base agnóstico para la gestión y manipulación de cookies de autenticación.
 * Desacoplado de frameworks HTTP (Express, Fastify, etc.) mediante el estándar de cabeceras RFC 6265.
 */
export abstract class IAuthCookieHelper {
    /**
     * Genera la cabecera 'Set-Cookie' formateada para almacenar el refresh token de forma segura.
     *
     * @param token - Cadena del refresh token a persistir.
     * @returns Cadena formateada para la cabecera Set-Cookie.
     *
     * @example
     * const cookieHeader = authCookieHelper.createRefreshTokenCookie('xyz.token.jwt');
     * res.setHeader('Set-Cookie', cookieHeader);
     */
    abstract createRefreshTokenCookie(token: string): string;

    /**
     * Genera la cabecera 'Set-Cookie' formateada para expirar e invalidar la cookie del refresh token.
     *
     * @returns Cadena formateada para la cabecera Set-Cookie con maxAge=0 y fecha en el pasado.
     *
     * @example
     * const clearCookie = authCookieHelper.createClearRefreshTokenCookie();
     * res.setHeader('Set-Cookie', clearCookie);
     */
    abstract createClearRefreshTokenCookie(): string;

    /**
     * Extrae el valor del refresh token a partir de la cabecera 'Cookie' de la petición.
     *
     * @param cookieHeader - Cadena cruda de la cabecera 'Cookie' (ej. `req.headers.cookie`).
     * @returns El valor del token si está presente, o `undefined` en caso contrario.
     *
     * @example
     * const refreshToken = authCookieHelper.extractRefreshToken(req.headers.cookie);
     */
    abstract extractRefreshToken(cookieHeader?: string): string | undefined;
}
