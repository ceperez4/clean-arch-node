import { BaseMysqlRepository } from 'src/config/db/mysql/base-mysql.repository';
import { AuthChallengeRepository } from '../../domain/repositories/auth-challenge.repository';
import { AuthChallengeTypeEnum } from 'src/common/enums/auth-challenge.enum';
import { AuthChallenge } from '../../domain/entities/auth-challenge.entity';
import { IAuthChallengeRow } from './auth-challenge-mysql.interface';
import { ResultSetHeader } from 'mysql2/promise';

export class AuthChallengeMysqlImpl extends BaseMysqlRepository implements AuthChallengeRepository {
    /************************************************************* */
    /************************************************************* */
    async save(challenge: AuthChallenge): Promise<void> {
        const query = `
            INSERT INTO auth_challenges (
                challenge_id, user_id, challenge_code, challenge_type,
                challenge_attempts, challenge_expires_at, challenge_used_at, challenge_created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;
        await this.conn.query(query, [
            challenge.attributes.id,
            challenge.attributes.userId,
            challenge.attributes.code,
            challenge.attributes.type,
            challenge.attributes.attempts,
            challenge.attributes.expiresAt,
            challenge.attributes.usedAt,
            challenge.attributes.createdAt,
        ]);
    }

    /************************************************************* */
    /************************************************************* */
    async findById(id: string): Promise<AuthChallenge | null> {
        const query = `
            SELECT
                challenge_id,
                user_id,
                challenge_code,
                challenge_type,
                challenge_attempts,
                challenge_expires_at,
                challenge_used_at,
                challenge_created_at
            FROM auth_challenges
            WHERE challenge_id = ?;
        `;
        const [rows] = await this.conn.query<IAuthChallengeRow[]>(query, [id]);
        if (!rows.length) return null;
        const row = rows[0];

        const entity = new AuthChallenge({
            id: row.challenge_id,
            userId: row.user_id,
            code: row.challenge_code,
            type: row.challenge_type,
            attempts: row.challenge_attempts,
            expiresAt: row.challenge_expires_at,
            usedAt: row.challenge_used_at,
            createdAt: row.challenge_created_at,
        });
        return entity;
    }

    /************************************************************* */
    /************************************************************* */
    async findLatestActive(userId: number, type: AuthChallengeTypeEnum): Promise<AuthChallenge | null> {
        const query = `
            SELECT
                challenge_id,
                user_id,
                challenge_code,
                challenge_type,
                challenge_attempts,
                challenge_expires_at,
                challenge_used_at,
                challenge_created_at
            FROM auth_challenges
            WHERE user_id = ? AND challenge_type = ? AND challenge_used_at IS NULL
            ORDER BY challenge_created_at DESC
            LIMIT 1;
        `;
        const [rows] = await this.conn.query<IAuthChallengeRow[]>(query, [userId, type]);
        if (!rows.length) return null;
        const row = rows[0];

        const entity = new AuthChallenge({
            id: row.challenge_id,
            userId: row.user_id,
            code: row.challenge_code,
            type: row.challenge_type,
            attempts: row.challenge_attempts,
            expiresAt: row.challenge_expires_at,
            usedAt: row.challenge_used_at,
            createdAt: row.challenge_created_at,
        });
        return entity;
    }

    /************************************************************* */
    /************************************************************* */
    async update(challenge: AuthChallenge): Promise<void> {
        const query = `
            UPDATE auth_challenges SET
                challenge_attempts = ?,
                challenge_used_at = ?
            WHERE challenge_id = ?;
        `;
        await this.conn.query(query, [
            challenge.attributes.attempts,
            challenge.attributes.usedAt,
            challenge.attributes.id,
        ]);
    }

    /************************************************************* */
    /************************************************************* */
    async deleteExpired(now: Date): Promise<number> {
        const query = `DELETE FROM auth_challenges WHERE challenge_expires_at < ?;`;
        const [res] = await this.conn.query<ResultSetHeader>(query, [now]);
        return res.affectedRows;
    }
}
