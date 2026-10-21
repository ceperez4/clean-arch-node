import { ResultSetHeader } from 'mysql2/promise';
import { InvalidTokenRepository } from '../../domain/repositories/invalid-token.repository';
import { InvalidToken } from '../../domain/entities/invalid-token.entity';
import { IInvalidTokenRow } from './invalid-token-mysql.interface';
import { BaseMysqlRepository } from 'src/config/db/mysql/base-mysql.repository';

export class InvalidTokenMysqlImpl extends BaseMysqlRepository implements InvalidTokenRepository {
    /************************************************** */
    /************************************************** */
    async add(invalidToken: InvalidToken): Promise<void> {
        let query = 'INSERT INTO invalid_tokens (';
        query += 'inv_token_payload,inv_token_expiration';
        query += ')VALUES(?,?);';
        await this.conn.query<ResultSetHeader>(query, [
            invalidToken.attributes.payload,
            invalidToken.attributes.expiration,
        ]);
    }

    /************************************************** */
    /************************************************** */
    async isBlackList(payload: string): Promise<boolean> {
        let query = 'SELECT 1 FROM invalid_tokens ';
        query += 'WHERE inv_token_payload = ?';
        const [results] = await this.conn.query<IInvalidTokenRow[]>(query, [payload]);
        return results.length > 0;
    }

    /************************************************** */
    /************************************************** */
    async emptyExpired(asOfDate: Date): Promise<void> {
        const query = 'DELETE FROM invalid_tokens WHERE inv_token_expiration <= ?';
        await this.conn.query<ResultSetHeader>(query, [asOfDate]);
    }
}
