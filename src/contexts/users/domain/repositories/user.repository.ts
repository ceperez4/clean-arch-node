import { IPaginationRepoOptions, IPaginationRepoResult } from 'src/common/interfaces/pagination-repositories.interface';
import { IUserOtp, User } from '../entities/user.entity';
import { UserRoleEnum, UserStatusEnum } from 'src/common/enums/user.enum';

export type typeUserCriteria = 'id' | 'email';

export interface IUserCriteria {
    type: typeUserCriteria;
    value: number | string;
}

export interface IUserFindAll extends IPaginationRepoOptions {
    status?: UserStatusEnum;
    role?: UserRoleEnum;
}
export abstract class UserRepository {
    abstract findOneByCriteria(criteria: IUserCriteria): Promise<User | null>;

    abstract findAll(options: IUserFindAll): Promise<IPaginationRepoResult<User>>;

    abstract findOneOtp(id: number): Promise<IUserOtp | null>;

    abstract save(entity: User): Promise<User>;

    abstract update(entity: User): Promise<void>;

    abstract updateOtp(options: IUserOtp): Promise<void>;

    abstract updatePassword(id: number, password: string): Promise<void>;

    abstract updateTokenVersion(id: number, version: number): Promise<void>;
}
