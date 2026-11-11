import { RowDataPacket } from 'mysql2/promise';
import { UserOauthEnum, UserRoleEnum, UserStatusEnum } from 'src/common/enums/user.enum';

export interface IUserRow extends RowDataPacket {
    user_id: number;
    user_email: string;
    user_first_name: string;
    user_oauth: UserOauthEnum;
    user_password: string;
    user_role: UserRoleEnum;
    user_created_at: Date;
    user_status: UserStatusEnum;
    user_avatar: string;
    user_token_version: number;
    user_two_factor_enabled: number | boolean;
}

export interface ITotalRow extends RowDataPacket {
    total: number;
}
