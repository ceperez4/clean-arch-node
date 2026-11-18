export const AuditResourceEnum = {
    USER: 'USER',
    AUTH: 'AUTH',
} as const;
export type AuditResourceEnum = (typeof AuditResourceEnum)[keyof typeof AuditResourceEnum];

export const AuditActionEnum = {
    STATUS_CHANGE: 'STATUS_CHANGE',
    ROLE_CHANGE: 'ROLE_CHANGE',
    PASSWORD_CHANGE: 'PASSWORD_CHANGE',
    TWO_FACTOR_TOGGLE: 'TWO_FACTOR_TOGGLE',
} as const;
export type AuditActionEnum = (typeof AuditActionEnum)[keyof typeof AuditActionEnum];
