import { PoolConnection } from 'mysql2/promise';
import { mysqlContext } from './mysql-context';

export abstract class BaseMysqlRepository {
    protected get conn(): PoolConnection {
        const store = mysqlContext.getStore();
        if (!store?.connection) {
            throw new Error(
                'La conexión a la base de datos no ha sido inicializada. ' +
                    'Asegúrate de decorar el caso de uso con @SimpleDBConnection() o @TransactionalDBConnection()',
            );
        }
        return store.connection;
    }
}
