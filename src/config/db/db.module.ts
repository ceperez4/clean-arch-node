import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MYSQL_POOL_PROVIDER, MysqlPoolProvider } from './mysql/mysql-pool.provider';
import { MysqlPoolService } from './mysql/mysql-pool.service';
import { MysqlUnitOfWork } from './mysql/mysql-unit-of-work';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { mysqlRepositoryProviders } from './mysql/mysql-repositories.provider';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        MysqlPoolProvider,
        MysqlPoolService,
        ...mysqlRepositoryProviders,
        MysqlUnitOfWork,
        {
            provide: IUnitOfWork,
            useExisting: MysqlUnitOfWork,
        },
    ],
    exports: [
        MysqlPoolProvider,
        MYSQL_POOL_PROVIDER,
        MysqlPoolService,
        ...mysqlRepositoryProviders,
        MysqlUnitOfWork,
        IUnitOfWork,
    ],
})
export class DatabaseModule {}
