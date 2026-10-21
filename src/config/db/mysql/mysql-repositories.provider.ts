import { Provider } from '@nestjs/common';
import { UserRepository } from 'src/contexts/users/domain/repositories/user.repository';
import { UserMysqlImplements } from 'src/contexts/users/infrastructure/repositories/user-mysql.impl';
import { InvalidTokenRepository } from 'src/contexts/auth/domain/repositories/invalid-token.repository';
import { InvalidTokenMysqlImpl } from 'src/contexts/auth/infrastructure/repositories/invalid-token-mysql.impl';

export const mysqlRepositoryProviders: Provider[] = [
    {
        provide: UserRepository,
        useClass: UserMysqlImplements,
    },
    {
        provide: InvalidTokenRepository,
        useClass: InvalidTokenMysqlImpl,
    },
];
