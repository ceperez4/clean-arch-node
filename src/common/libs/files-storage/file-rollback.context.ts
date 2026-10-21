import { AsyncLocalStorage } from 'node:async_hooks';

export interface FileRollbackState {
    // Guardamos un arreglo de promesas de borrado
    filesToDelete: (() => Promise<void>)[];
}

export const fileRollbackContext = new AsyncLocalStorage<FileRollbackState>();
