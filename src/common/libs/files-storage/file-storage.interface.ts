import { ISecureFile } from 'src/common/interfaces/files.interface';

/**
 * Destinos o categorías lógicas de almacenamiento admitidas en el sistema.
 * Determina el directorio de persistencia y la ruta pública asociada.
 */
export const FileStorageEnum = {
    /** Almacenamiento de imágenes de perfil y avatares de usuarios */
    AVATAR: 'AVATAR',
    /** Almacenamiento de logotipos, documentos o recursos de empresas */
    COMPANIES: 'COMPANIES',
} as const;
export type FileStorageEnum = (typeof FileStorageEnum)[keyof typeof FileStorageEnum];

/**
 * Contrato base para los proveedores de persistencia y gestión de archivos (Storage Provider).
 * Abstrae el medio de almacenamiento físico (sistema de archivos local, AWS S3, Cloudinary, etc.).
 */
export abstract class IFileStorage {
    /**
     * Persiste un archivo en el medio de almacenamiento correspondiente.
     *
     * @param file - Objeto que contiene el buffer del archivo, nombre saneado y metadatos.
     * @param storage - Categoría o ubicación destino donde se guardará el archivo.
     * @returns Promesa que resuelve al nombre del archivo almacenado (saneado y seguro).
     *
     * @example
     * const filename = await fileStorage.save(secureFile, FileStorageEnum.AVATAR);
     */
    abstract save(file: ISecureFile, storage: FileStorageEnum): Promise<string>;

    /**
     * Elimina físicamente un archivo del medio de almacenamiento.
     *
     * @param filename - Nombre identificador del archivo a suprimir.
     * @param storage - Categoría o ubicación destino en la que se encuentra el archivo.
     * @returns Promesa que resuelve una vez completada la eliminación.
     *
     * @example
     * await fileStorage.delete('user-avatar-123.webp', FileStorageEnum.AVATAR);
     */
    abstract delete(filename: string, storage: FileStorageEnum): Promise<void>;

    /**
     * Recupera el contenido binario de un archivo persistido.
     *
     * @param filename - Nombre identificador del archivo que se desea leer.
     * @param storage - Categoría o ubicación destino del archivo.
     * @returns Promesa que resuelve a un `Buffer` con los datos binarios, o `null` si el archivo no existe o no pudo leerse.
     *
     * @example
     * const buffer = await fileStorage.get('logo.png', FileStorageEnum.COMPANIES);
     */
    abstract get(filename: string, storage: FileStorageEnum): Promise<Buffer | null>;

    /**
     * Construye y retorna la URL pública accesible para visualizar o descargar el archivo.
     *
     * @param filename - Nombre del archivo o identificador persistido.
     * @param storage - Categoría o ubicación destino del archivo.
     * @returns Cadena con la URL pública completa, o `null` si el nombre de archivo es vacío o no está definido.
     *
     * @example
     * const avatarUrl = fileStorage.url('user-1.webp', FileStorageEnum.AVATAR);
     */
    abstract url(filename: string, storage: FileStorageEnum): string | null;
}
