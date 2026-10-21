/**
 * Contrato base para los servicios de almacenamiento en cache.
 * Desacopla la lógica de negocio y casos de uso de cualquier tecnología concreta (Memoria, Redis, etc.).
 */
export abstract class ICacheManager {
    /**
     * Obtiene un elemento almacenado en cache por su clave.
     *
     * @param key - Clave del elemento a recuperar.
     * @returns El valor almacenado o `null` si no existe o ha expirado.
     */
    abstract get<T>(key: string): Promise<T | null>;

    /**
     * Guarda un elemento en cache con un tiempo de vida (TTL) opcional.
     *
     * @param key - Clave única para almacenar el valor.
     * @param value - Valor a almacenar.
     * @param ttlMilliseconds - Tiempo de vida en milisegundos.
     */
    abstract set<T>(key: string, value: T, ttlMilliseconds?: number): Promise<void>;

    /**
     * Elimina una clave y su valor del cache.
     *
     * @param key - Clave del elemento a eliminar.
     */
    abstract del(key: string): Promise<void>;

    /**
     * Limpia completamente todos los elementos almacenados en el cache.
     */
    abstract reset(): Promise<void>;
}
