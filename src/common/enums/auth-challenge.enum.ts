export const AuthChallengeTypeEnum = {
    LOGIN_2FA: 'LOGIN_2FA',
    PASSWORD_RECOVERY: 'PASSWORD_RECOVERY',
} as const;
export type AuthChallengeTypeEnum = (typeof AuthChallengeTypeEnum)[keyof typeof AuthChallengeTypeEnum];
