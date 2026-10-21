import { mkdir, unlink, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { ISecureFile } from 'src/common/interfaces/files.interface';
import { fileRollbackContext } from './file-rollback.context';
import { FileStorageEnum, IFileStorage } from './file-storage.interface';

const localStorage: Record<FileStorageEnum, string> = {
    [FileStorageEnum.AVATAR]: './uploads/avatars',
    [FileStorageEnum.COMPANIES]: './uploads/companies',
};

const publicRoutes: Record<FileStorageEnum, string> = {
    [FileStorageEnum.AVATAR]: 'public/avatars',
    [FileStorageEnum.COMPANIES]: 'public/companies',
};

export class LocalFileStorage extends IFileStorage {
    private appUrl: string;

    constructor({ appUrl }: { appUrl: string }) {
        super();
        this.appUrl = appUrl;
    }

    async save(file: ISecureFile, storage: FileStorageEnum): Promise<string> {
        const destination = localStorage[storage];
        await mkdir(destination, { recursive: true });

        const safeFilename = path.basename(file.filename);
        const fullPath = path.join(destination, safeFilename);

        await writeFile(fullPath, file.buffer);

        // Si estamos dentro del decorador de rollback, registramos la función de borrado
        const store = fileRollbackContext.getStore();
        if (store) {
            store.filesToDelete.push(async () => {
                await this.delete(file.filename, storage);
            });
        }

        return safeFilename;
    }

    async delete(filename: string, storage: FileStorageEnum): Promise<void> {
        const destination = localStorage[storage];
        const safeFilename = path.basename(filename);
        const fullPath = path.join(destination, safeFilename);
        try {
            await unlink(fullPath);
        } catch (error: unknown) {
            // Ignoramos el error si el archivo no existe (ENOENT),
            // puede pasar si el error ocurrió antes de que se terminara de escribir
            const errnoError = error as NodeJS.ErrnoException;
            if (errnoError.code !== 'ENOENT') {
                console.error(`[LocalFileStorage] Error al hacer rollback del archivo ${fullPath}:`, error);
            }
        }
    }

    async get(filename: string, storage: FileStorageEnum): Promise<Buffer | null> {
        const destination = localStorage[storage];
        const safeFilename = path.basename(filename);
        const fullPath = path.join(destination, safeFilename);
        try {
            return await readFile(fullPath);
        } catch {
            return null;
        }
    }

    url(filename: string, storage: FileStorageEnum): string | null {
        if (!filename) return null;
        const safeFilename = path.basename(filename);
        const publicRoute = publicRoutes[storage];
        return `${this.appUrl}${publicRoute}/${encodeURIComponent(safeFilename)}`;
    }
}
