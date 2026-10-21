import { UserRoleEnum, UserStatusEnum, UserOauthEnum } from 'src/common/enums/user.enum';
import { User } from './user.entity';

describe('User Entity', () => {
    it('should create a valid user instance', () => {
        const user = User.create({
            name: 'John Doe',
            email: 'john@example.com',
            role: UserRoleEnum.USER,
            password: 'hashed_password',
            oauth: UserOauthEnum.MANUAL,
            status: UserStatusEnum.ACTIVE,
        });

        expect(user).toBeDefined();
        expect(user.attributes.name).toBe('John Doe');
        expect(user.attributes.email).toBe('john@example.com');
        expect(user.attributes.role).toBe(UserRoleEnum.USER);
        expect(user.attributes.tokenVersion).toBe(1);
    });
});
