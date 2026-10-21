/**
 * Claims estándar registrados de un JSON Web Token según la especificación RFC 7519.
 */
export interface StandardJwtClaims {
    /** Issuer: Entidad emisora del token */
    iss?: string;
    /** Audience: Destinatarios del token */
    aud?: string | string[];
    /** Expiration Time: Timestamp Unix (en segundos) de expiración */
    exp?: number;
    /** Not Before: Timestamp Unix (en segundos) antes del cual el token no es válido */
    nbf?: number;
    /** Issued At: Timestamp Unix (en segundos) de emisión */
    iat?: number;
    /** JWT ID: Identificador único del token */
    jti?: string;
}

export type JwtClaims<T extends object> = T & StandardJwtClaims;

/**
 * Tipos de token admitidos por el sistema de autenticación:
 * - `'access'`: Token de acceso de corta duración para autorización en endpoints.
 * - `'refresh'`: Token de renovación de larga duración para emitir nuevos pares de tokens.
 * - `'temporal'`: Token efímero para operaciones puntuales (ej. recuperación de contraseña o verificación 2FA).
 */
export type TokenType = 'access' | 'refresh' | 'temporal';

/**
 * Contrato base para los servicios de gestión y ciclo de vida de JSON Web Tokens (JWT).
 */
export abstract class IJwtGenerator {
    /**
     * Firma y genera una cadena JWT en base a la carga útil (`payload`) y al tipo de token especificado.
     *
     * @typeParam T - Tipo del objeto payload (debe extender de object).
     * @param payload - Datos que se incluirán en el cuerpo del token.
     * @param type - Propósito del token (`access`, `refresh` o `temporal`).
     * @returns Token JWT firmado en formato compacto.
     */
    abstract sign<T extends object>(payload: T, type: TokenType): string;

    /**
     * Valida la firma criptográfica, la vigencia temporal y la estructura de un token JWT.
     *
     * @typeParam T - Estructura esperada del payload (por defecto `Record<string, any>`).
     * @param token - Cadena JWT que se desea validar.
     * @param type - Propósito esperado del token para aplicar el secreto correspondiente.
     * @returns Carga útil decodificada y tipada como `T`.
     * @throws {UnauthorizedError} Si el token es inválido, vencido o no activo.
     */
    abstract verify<T extends object = Record<string, unknown>>(token: string, type: TokenType): JwtClaims<T>;

    /**
     * Decodifica y extrae la carga útil del token sin verificar firma ni expiración.
     *
     * @typeParam T - Tipo de datos esperado para el payload decodificado.
     * @param token - Cadena JWT a decodificar.
     * @returns Carga útil decodificada, o `null` si el token no tiene un formato válido.
     */
    abstract decode<T extends object = Record<string, unknown>>(token: string): JwtClaims<T> | null;
}
