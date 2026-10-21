import { IMysqlContextStore, mysqlContext } from 'src/config/db/mysql/mysql-context';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';

interface HasUow {
    uow?: IUnitOfWork;
}

function createDatabaseDecorator(isTransactional: boolean) {
    return function <T extends HasUow, A extends unknown[], R>(
        target: object,
        _propertyKey: string,
        descriptor: TypedPropertyDescriptor<(this: T, ...args: A) => Promise<R>>,
    ) {
        const originalMethod = descriptor.value;
        if (!originalMethod) return;

        descriptor.value = async function (this: T, ...args: A): Promise<R> {
            const activeStore = mysqlContext.getStore();

            if (activeStore) {
                // Ya existe una conexión activa en este contexto de ejecución/petición.
                // Si el método actual requiere transacción y la conexión activa aún no estaba en transacción:
                if (isTransactional && !activeStore.isTransactional) {
                    activeStore.isTransactional = true;
                    try {
                        await activeStore.connection.beginTransaction();
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        const result = await originalMethod.apply(this, args);
                        await activeStore.connection.commit();
                        return result as R;
                    } catch (error) {
                        try {
                            await activeStore.connection.rollback();
                        } catch (rollbackError) {
                            console.error('Error al realizar rollback:', rollbackError);
                        }
                        throw error;
                    } finally {
                        activeStore.isTransactional = false;
                    }
                }

                // Si ya está en transacción o si es una conexión simple:
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const result = await originalMethod.apply(this, args);
                return result as R;
            }

            // No existe conexión previa en el contexto: obtenemos una del pool para todo el ciclo
            const uow = this.uow;
            if (!uow || typeof uow.getPool !== 'function') {
                throw new Error(
                    `Para usar este decorador, la clase ${target.constructor.name} debe tener una propiedad 'uow' inyectada que implemente IUnitOfWork.`,
                );
            }
            const pool = uow.getPool();
            const connection = await pool.getConnection();

            const store: IMysqlContextStore = {
                connection,
                isTransactional,
            };

            return mysqlContext.run<Promise<R>>(store, async (): Promise<R> => {
                try {
                    if (isTransactional) {
                        await connection.beginTransaction();
                    }

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const result = await originalMethod.apply(this, args);

                    if (isTransactional) {
                        await connection.commit();
                    }

                    return result as R;
                } catch (error) {
                    if (isTransactional) {
                        try {
                            await connection.rollback();
                        } catch (rollbackError) {
                            console.error('Error al realizar rollback:', rollbackError);
                        }
                    }
                    throw error;
                } finally {
                    connection.release();
                }
            });
        };
    };
}

export function SimpleDBConnection() {
    return createDatabaseDecorator(false);
}

export function TransactionalDBConnection() {
    return createDatabaseDecorator(true);
}
