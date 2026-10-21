/**
 * Contrato base para los servicios de hashing y verificación de contraseñas.
 * Define las operaciones asíncronas para transformar credenciales en texto plano
 * mediante algoritmos de derivación de claves seguros y validar coincidencias.
 */
export abstract class IPasswordHasher {
    /**
     * Genera un hash criptográfico a partir de una contraseña en texto plano.
     *
     * @param password - Contraseña en texto plano que se desea proteger.
     * @returns Promesa que resuelve a la cadena del hash generado (incluyendo salt y parámetros del algoritmo).
     *
     * @example
     * const hashedPassword = await passwordHasher.hash('miClaveSegura123!');
     */
    abstract hash(password: string): Promise<string>;

    /**
     * Compara una contraseña en texto plano contra un hash previamente generado
     * para verificar si coinciden de forma segura contra ataques de temporización.
     *
     * @param password - Contraseña en texto plano a verificar.
     * @param hashedPassword - Hash almacenado contra el que se realiza la comprobación.
     * @returns Promesa que resuelve a `true` si la contraseña coincide con el hash, o `false` en caso contrario.
     *
     * @example
     * const isValid = await passwordHasher.compare('miClaveSegura123!', hashedPassword);
     */
    abstract compare(password: string, hashedPassword: string): Promise<boolean>;
}
