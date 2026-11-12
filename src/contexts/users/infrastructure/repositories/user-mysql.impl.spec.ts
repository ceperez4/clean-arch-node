import { UserMysqlImplements } from './user-mysql.impl';
import { User } from '../../domain/entities/user.entity';
import { UserOauthEnum, UserRoleEnum, UserStatusEnum } from 'src/common/enums/user.enum';
import { mysqlContext } from 'src/config/db/mysql/mysql-context';
import type { PoolConnection } from 'mysql2/promise';

describe('UserMysqlImplements', () => {
    let repository: UserMysqlImplements;
    let mockConnection: Partial<PoolConnection>;

    beforeEach(() => {
        repository = new UserMysqlImplements();
        mockConnection = {
            query: jest.fn().mockResolvedValue([{ insertId: 42 }]),
        };
    });

    it('should save a new user with user_two_factor_enabled in the SQL query', async () => {
        const user = User.create({
            name: 'Jane Doe',
            email: 'jane@example.com',
            role: UserRoleEnum.USER,
            password: 'hashed_password',
            oauth: UserOauthEnum.MANUAL,
            status: UserStatusEnum.ACTIVE,
            avatar: '',
        });

        await mysqlContext.run({ connection: mockConnection as PoolConnection, isTransactional: false }, async () => {
            const savedUser = await repository.save(user);

            expect(mockConnection.query).toHaveBeenCalledTimes(1);
            expect(mockConnection.query).toHaveBeenCalledWith(
                expect.stringContaining('user_two_factor_enabled'),
                expect.arrayContaining([
                    'Jane Doe',
                    'jane@example.com',
                    UserRoleEnum.USER,
                    'hashed_password',
                    UserOauthEnum.MANUAL,
                    UserStatusEnum.ACTIVE,
                    0,
                ]),
            );

            expect(savedUser.attributes.id).toBe(42);
        });
    });
});
