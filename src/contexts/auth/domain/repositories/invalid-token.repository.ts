import { InvalidToken } from '../entities/invalid-token.entity';

export abstract class InvalidTokenRepository {
    abstract add(entity: InvalidToken): Promise<void>;

    abstract isBlackList(payload: string): Promise<boolean>;

    abstract emptyExpired(asOfDate: Date): Promise<void>;
}
