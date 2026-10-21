import { UserOauthEnum, UserRoleEnum, UserStatusEnum } from 'src/common/enums/user.enum';

export interface PrimitiveUser {
    id: number;
    name: string;
    email: string;
    role: UserRoleEnum;
    password: string;
    oauth: UserOauthEnum;
    status: UserStatusEnum;
    createdAt: Date;
    avatar: string;
    tokenVersion: number;
}

export interface IUserOtp {
    id: number;
    otp: string;
    expiration: string;
}

export class User {
    public attributes: PrimitiveUser;

    constructor(attributes: {
        id: number | string;
        name: string;
        email: string;
        role: UserRoleEnum;
        password: string;
        oauth: UserOauthEnum;
        status: UserStatusEnum;
        createdAt?: Date | string;
        avatar?: string;
        tokenVersion?: number | string;
    }) {
        this.attributes = {
            id: Number(attributes.id) || 0,
            name: attributes.name,
            email: attributes.email,
            role: attributes.role,
            password: attributes.password,
            oauth: attributes.oauth,
            status: attributes.status,
            createdAt: attributes.createdAt ? new Date(attributes.createdAt) : new Date(),
            avatar: attributes.avatar ?? '',
            tokenVersion:
                attributes.tokenVersion !== undefined && attributes.tokenVersion !== null
                    ? Number(attributes.tokenVersion)
                    : 1,
        };
    }

    static create(entity: {
        name: string;
        email: string;
        role: UserRoleEnum;
        password: string;
        oauth: UserOauthEnum;
        status: UserStatusEnum;
        avatar?: string;
        tokenVersion?: number;
    }): User {
        return new User({
            id: 0,
            name: entity.name,
            email: entity.email,
            role: entity.role,
            password: entity.password,
            oauth: entity.oauth,
            status: entity.status,
            createdAt: new Date(),
            avatar: entity.avatar ?? '',
            tokenVersion: entity.tokenVersion ?? 1,
        });
    }
}
