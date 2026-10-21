import { fileRollbackContext } from 'src/common/libs/files-storage/file-rollback.context';

export function FileRollback() {
    return function <T, A extends unknown[], R>(
        _target: object,
        _propertyKey: string,
        descriptor: TypedPropertyDescriptor<(this: T, ...args: A) => Promise<R>>,
    ) {
        const originalMethod = descriptor.value;
        if (!originalMethod) return;

        descriptor.value = async function (this: T, ...args: A): Promise<R> {
            // Inicializamos el estado vacío para esta ejecución
            const state = { filesToDelete: [] };

            return fileRollbackContext.run<Promise<R>>(state, async (): Promise<R> => {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const result = await originalMethod.apply(this, args);
                    return result as R;
                } catch (error) {
                    // Si ocurre un error, leemos el contexto actual
                    const store = fileRollbackContext.getStore();

                    if (store && store.filesToDelete.length > 0) {
                        // Usamos Promise.allSettled para asegurar que si falla el borrado de
                        // un archivo, intente borrar los demás de todas formas.
                        await Promise.allSettled(store.filesToDelete.map((deleteAction) => deleteAction()));
                    }

                    // Volvemos a lanzar el error para que la app responda con el HTTP Status correcto
                    throw error;
                }
            });
        };
    };
}
