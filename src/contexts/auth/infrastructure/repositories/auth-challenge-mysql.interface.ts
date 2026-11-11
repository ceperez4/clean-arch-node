import { RowDataPacket } from 'mysql2/promise';
import { AuthChallengeTypeEnum } from 'src/common/enums/auth-challenge.enum';

export interface IAuthChallengeRow extends RowDataPacket {
    challenge_id: string;
    user_id: number;
    challenge_code: string;
    challenge_type: AuthChallengeTypeEnum;
    challenge_attempts: number;
    challenge_expires_at: Date;
    challenge_used_at: Date | null;
    challenge_created_at: Date;
}
