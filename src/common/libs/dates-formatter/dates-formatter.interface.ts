/**
 * Contrato base para los servicios de formateo y manipulación de fechas.
 * Proporciona métodos para transformar instancias de `Date` en cadenas
 * de texto bajo el formato estándar `YYYY-MM-DD HH:mm:ss`.
 */
export abstract class IDatesFormatter {
    /**
     * Convierte un objeto `Date` en una cadena con formato `YYYY-MM-DD HH:mm:ss`.
     *
     * @param date - Instancia de `Date` que se desea formatear.
     * @returns Cadena con la fecha formateada. Si el parámetro no es una fecha válida,
     *          retorna `'0000-00-00 00:00:00'`.
     *
     * @example
     * // Retorna: "2026-10-08 15:30:00"
     * datesFormatter.toString(new Date());
     */
    abstract toString(date: Date): string;

    /**
     * Obtiene la fecha y hora actual del sistema en formato de texto.
     *
     * @returns Cadena representativa del instante actual en formato `YYYY-MM-DD HH:mm:ss`.
     *
     * @example
     * // Retorna: "2026-10-08 15:30:00"
     * datesFormatter.currentDateStr();
     */
    abstract currentDateStr(): string;

    /**
     * Calcula la fecha y hora actual sumando o restando una cantidad de minutos determinada,
     * devolviendo el resultado formateado en texto.
     *
     * @param minute - Número de minutos a añadir (puede ser negativo para restar).
     * @returns Cadena resultante en formato `YYYY-MM-DD HH:mm:ss`.
     *
     * @example
     * // Si son las 15:30:00 y sumamos 15 minutos:
     * // Retorna: "2026-10-08 15:45:00"
     * datesFormatter.currentDatePlusMinutes(15);
     */
    abstract currentDatePlusMinutes(minute: number): string;
}
