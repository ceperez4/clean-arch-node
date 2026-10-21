import { ResultSetHeader } from 'mysql2/promise';
import { IUserOtp, User } from '../../domain/entities/user.entity';
import {
    IUserCriteria,
    IUserFindAll,
    typeUserCriteria,
    UserRepository,
} from '../../domain/repositories/user.repository';
import { IPaginationRepoResult } from 'src/common/interfaces/pagination-repositories.interface';
import { ITotalRow, IUserOtpRow, IUserRow } from './user-mysql.interface';
import { BaseMysqlRepository } from 'src/config/db/mysql/base-mysql.repository';

export class UserMysqlImplements extends BaseMysqlRepository implements UserRepository {
    /************************************************************* */
    /************************************************************* */
    async findOneByCriteria(criteria: IUserCriteria): Promise<User | null> {
        const field = {
            id: 'user_id',
            email: 'user_email',
        } satisfies Record<typeUserCriteria, string>;

        const query = `
            SELECT
                user_id,
                user_email,
                user_first_name,
                user_oauth,
                user_password,
                user_role,
                user_created_at,
                user_status,
                user_avatar,
                user_token_version
            FROM users
            WHERE ${field[criteria.type]} = ?
        `;

        const [rows] = await this.conn.query<IUserRow[]>(query, [criteria.value]);
        if (!rows.length) return null;
        const row = rows[0];

        const entity = new User({
            id: row.user_id,
            name: row.user_first_name,
            email: row.user_email,
            role: row.user_role,
            password: row.user_password,
            oauth: row.user_oauth,
            status: row.user_status,
            createdAt: row.user_created_at,
            avatar: row.user_avatar,
            tokenVersion: row.user_token_version,
        });
        return entity;
    }

    /************************************************************* */
    /************************************************************* */
    async findAll(options: IUserFindAll): Promise<IPaginationRepoResult<User>> {
        const { limit, page, search, status, role } = options;

        const filterValues: (string | number)[] = [];
        const conditionals: string[] = [];

        if (status) {
            conditionals.push('user_status = ?');
            filterValues.push(status);
        }
        if (role) {
            conditionals.push('user_role = ?');
            filterValues.push(role);
        }
        if (search) {
            conditionals.push('(user_first_name LIKE ? OR user_email LIKE ?)');
            filterValues.push(`%${search}%`, `%${search}%`);
        }

        let baseQuery = '';
        if (conditionals.length > 0) {
            baseQuery = `WHERE ${conditionals.join(' AND ')}`;
        }

        const queryValues: (string | number)[] = [...filterValues];
        let paginationQuery = '';
        if (limit !== -1) {
            const safeLimit = Math.max(1, Number.parseInt(String(limit), 10) || 10);
            const safePage = Math.max(1, Number.parseInt(String(page), 10) || 1);
            const offset = (safePage - 1) * safeLimit;
            paginationQuery = ' LIMIT ? OFFSET ? ';
            queryValues.push(safeLimit, offset);
        }

        const query = `
            SELECT 
                user_id,
                user_first_name,
                user_email,
                user_role,
                user_password,
                user_status,
                user_created_at,
                user_oauth,
                user_avatar,
                user_token_version
            FROM users
            ${baseQuery}
            ${paginationQuery}
        `;
        const queryTotal = `
            SELECT count(user_id) as total
            FROM users
            ${baseQuery}
        `;
        const [[rows], [rowsTotal]] = await Promise.all([
            this.conn.query<IUserRow[]>(query, queryValues),
            this.conn.query<ITotalRow[]>(queryTotal, filterValues),
        ]);

        const total = Number(rowsTotal[0]?.total ?? 0);
        const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

        const entities = rows.map((row) => {
            const entity: User = new User({
                id: row.user_id,
                name: row.user_first_name,
                email: row.user_email,
                createdAt: row.user_created_at,
                oauth: row.user_oauth,
                password: row.user_password,
                role: row.user_role,
                status: row.user_status,
                avatar: row.user_avatar,
                tokenVersion: row.user_token_version,
            });
            return entity;
        });

        return {
            page,
            limit,
            total: total,
            totalPages: totalPages,
            data: entities,
        };
    }

    /************************************************************* */
    /************************************************************* */
    async save(entity: User): Promise<User> {
        const query = `
            INSERT INTO users (
            user_first_name,
            user_email,
            user_role,
            user_password,
            user_oauth,
            user_status,
            user_created_at,
            user_avatar,
            user_token_version
            )VALUES(?,?,?,?,?,?,?,?,?)
        `;
        const [result] = await this.conn.query<ResultSetHeader>(query, [
            entity.attributes.name,
            entity.attributes.email,
            entity.attributes.role,
            entity.attributes.password,
            entity.attributes.oauth,
            entity.attributes.status,
            entity.attributes.createdAt,
            entity.attributes.avatar,
            entity.attributes.tokenVersion,
        ]);

        const id = result.insertId;
        entity.attributes.id = id;
        return entity;
    }

    /************************************************************* */
    /************************************************************* */
    async findOneOtp(id: number): Promise<IUserOtp | null> {
        const query = `
            SELECT 
            user_id,user_otp,user_expiration_otp
            FROM users
            WHERE user_id = ?
            ;
        `;
        const [rows] = await this.conn.query<IUserOtpRow[]>(query, [id]);
        if (rows.length === 0) return null;
        const row = rows[0];

        return {
            id: row.user_id,
            otp: row.user_otp,
            expiration: row.user_expiration_otp,
        };
    }

    /************************************************************* */
    /************************************************************* */
    async updateOtp(options: IUserOtp): Promise<void> {
        const query = `
            UPDATE users SET
            user_otp = ?,
            user_expiration_otp = ?
            WHERE user_id = ?
            ;
        `;
        await this.conn.query<ResultSetHeader>(query, [options.otp, options.expiration, options.id]);
    }

    /************************************************************* */
    /************************************************************* */
    async updatePassword(id: number, password: string): Promise<void> {
        const query = `
            UPDATE users SET
            user_password = ?
            WHERE user_id = ?
            ;
        `;
        await this.conn.query<ResultSetHeader>(query, [password, id]);
    }

    /************************************************************* */
    /************************************************************* */
    async update(entity: User): Promise<void> {
        const query = `
            UPDATE users SET
            user_first_name = ?,
            user_avatar = ?
            WHERE user_id = ?
            ;
        `;
        await this.conn.query<ResultSetHeader>(query, [
            entity.attributes.name,
            entity.attributes.avatar,
            entity.attributes.id,
        ]);
    }

    /************************************************************* */
    /************************************************************* */
    async updateTokenVersion(id: number, version: number): Promise<void> {
        const query = `
            UPDATE users SET
            user_token_version = ?
            WHERE user_id = ?
            ;
        `;
        await this.conn.query<ResultSetHeader>(query, [version, id]);
    }
}
