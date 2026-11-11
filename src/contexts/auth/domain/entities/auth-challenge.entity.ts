import { randomUUID } from 'node:crypto';
import { AuthChallengeTypeEnum } from 'src/common/enums/auth-challenge.enum';

export interface PrimitiveAuthChallenge {
    id: string;
    userId: number;
    code: string;
    type: AuthChallengeTypeEnum;
    attempts: number;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;
}

export class AuthChallenge {
    public attributes: PrimitiveAuthChallenge;

    constructor(attributes: {
        id: string;
        userId: number;
        code: string;
        type: AuthChallengeTypeEnum;
        attempts?: number;
        expiresAt: Date | string;
        usedAt?: Date | string | null;
        createdAt?: Date | string;
    }) {
        this.attributes = {
            id: attributes.id,
            userId: attributes.userId,
            code: attributes.code,
            type: attributes.type,
            attempts: attributes.attempts ?? 0,
            expiresAt: new Date(attributes.expiresAt),
            usedAt: attributes.usedAt ? new Date(attributes.usedAt) : null,
            createdAt: attributes.createdAt ? new Date(attributes.createdAt) : new Date(),
        };
    }

    static create(props: {
        userId: number;
        code: string;
        type: AuthChallengeTypeEnum;
        expiresAt: Date | string;
    }): AuthChallenge {
        return new AuthChallenge({
            id: randomUUID(),
            userId: props.userId,
            code: props.code,
            type: props.type,
            attempts: 0,
            expiresAt: props.expiresAt,
            usedAt: null,
            createdAt: new Date(),
        });
    }

    isExpired(now: Date = new Date()): boolean {
        return this.attributes.expiresAt.getTime() < now.getTime();
    }

    isUsed(): boolean {
        return this.attributes.usedAt !== null;
    }

    isExceededAttempts(maxAttempts: number = 3): boolean {
        return this.attributes.attempts >= maxAttempts;
    }

    incrementAttempts(): void {
        this.attributes.attempts += 1;
    }

    markAsUsed(now: Date = new Date()): void {
        this.attributes.usedAt = now;
    }
}
