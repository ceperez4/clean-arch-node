export const UserStatusEnum = {
    ACTIVE: 'ACTIVO',
    INACTIVE: 'INACTIVO',
} as const;
export type UserStatusEnum = (typeof UserStatusEnum)[keyof typeof UserStatusEnum];

export const UserRoleEnum = {
    ADMIN: 'ADMIN',
    USER: 'USUARIO',
} as const;
export type UserRoleEnum = (typeof UserRoleEnum)[keyof typeof UserRoleEnum];

export const UserOauthEnum = {
    MANUAL: 'MANUAL',
    GOOGLE: 'GOOGLE',
} as const;
export type UserOauthEnum = (typeof UserOauthEnum)[keyof typeof UserOauthEnum];
