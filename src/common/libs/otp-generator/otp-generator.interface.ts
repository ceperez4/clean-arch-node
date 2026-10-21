/**
 * Niveles de complejidad para la generación de OTP:
 * - `0`: Solo dígitos numéricos (ideal para SMS / 2FA).
 * - `1`: Solo letras (alfabético).
 * - `2`: Alfanumérico (letras y dígitos).
 * - `3`: Alfanumérico con caracteres especiales y símbolos.
 */
export type OtpLevel = 0 | 1 | 2 | 3;

/**
 * Contrato base para generadores de identificadores únicos y códigos OTP (One-Time Password).
 * Define las operaciones criptográficas estándar para generar tokens efímeros y UUIDs.
 */
export abstract class IOtpGenerator {
    /**
     * Genera un identificador universalmente único (UUID) en su versión 4 (aleatorio).
     *
     * @returns Cadena con el UUID v4 generado en formato canónico (ej. `f47ac10b-58cc-4372-a567-0e02b2c3d479`).
     *
     * @example
     * const id = otpGenerator.uuidv4();
     */
    abstract uuidv4(): string;

    /**
     * Genera un OTP según la longitud y el nivel de complejidad especificado.
     *
     * @param length - Cantidad de caracteres del código.
     * @param level - Nivel de complejidad (`0` = numérico, `1` = alfabético, `2` = alfanumérico, `3` = completo).
     *
     * @example
     * // Genera un código alfanumérico de 6 caracteres (ej. "a8K9z2")
     * const code = otpGenerator.otp(6, 2);
     */
    abstract otp(length: number, level: OtpLevel): string;

    /**
     * Genera un código OTP puramente numérico (ej. 6 dígitos para SMS o 2FA).
     *
     * @param length - Número de dígitos requeridos (por defecto 6).
     * @returns Cadena numérica aleatoria con ceros a la izquierda preservados.
     *
     * @example
     * // Retorna: "492018"
     * otpGenerator.numericOtp(6);
     */
    abstract numericOtp(length?: number): string;
}
