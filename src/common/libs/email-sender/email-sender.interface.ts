/**
 * Representa un archivo adjunto que se incluirá en el envío del correo.
 */
export interface Attachments {
    /** Nombre del archivo tal como lo verá el destinatario (ej. `factura.pdf`) */
    filename: string;
    /** Ruta del sistema de archivos local, URL accesible o ubicación del recurso */
    path: string;
}

/**
 * Parámetros de configuración requeridos para el envío de un correo electrónico.
 */
export interface SendMailOptions {
    /**
     * Dirección de correo electrónico de destino o lista de direcciones para envíos múltiples.
     *
     * @example `'usuario@dominio.com'` o `['admin@dominio.com', 'soporte@dominio.com']`
     */
    to: string | string[];

    /**
     * Línea de asunto del mensaje.
     */
    subject: string;

    /**
     * Contenido del mensaje estructurado en formato HTML.
     */
    htmlBody: string;

    /**
     * Lista opcional de archivos adjuntos asociados al correo.
     */
    attachments?: Attachments[];
}

/**
 * Contrato base para los proveedores y servicios de mensajería electrónica (Email Delivery).
 * Desacopla la lógica de negocio de los proveedores externos (ej. Brevo, Resend, SendGrid, SMTP).
 */
export abstract class IEmailSender {
    /**
     * Despacha un correo electrónico con base en las opciones suministradas.
     *
     * @param options - Objeto con destinatarios, asunto, cuerpo HTML y adjuntos opcionales.
     * @returns Promesa que resuelve a `true` si el correo fue aceptado/enviado exitosamente,
     *          o `false` si la entrega falló o fue rechazada.
     *
     * @example
     * const sent = await emailSender.send({
     *   to: 'cliente@ejemplo.com',
     *   subject: 'Bienvenido al servicio',
     *   htmlBody: '<h1>Hola!</h1><p>Gracias por unirte.</p>'
     * });
     */
    abstract send(options: SendMailOptions): Promise<boolean>;
}
