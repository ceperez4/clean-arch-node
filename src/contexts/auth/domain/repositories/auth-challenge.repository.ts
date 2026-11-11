import { AuthChallengeTypeEnum } from 'src/common/enums/auth-challenge.enum';
import { AuthChallenge } from '../entities/auth-challenge.entity';

export abstract class AuthChallengeRepository {
    abstract save(challenge: AuthChallenge): Promise<void>;

    abstract findById(id: string): Promise<AuthChallenge | null>;

    abstract findLatestActive(userId: number, type: AuthChallengeTypeEnum): Promise<AuthChallenge | null>;

    abstract update(challenge: AuthChallenge): Promise<void>;

    abstract deleteExpired(now: Date): Promise<number>;
}
