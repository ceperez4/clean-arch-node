import { sign, verify, decode, TokenExpiredError, JsonWebTokenError, NotBeforeError } from 'jsonwebtoken';
import { UnauthorizedError } from 'src/common/errors/unauthorized.error';
import { IJwtGenerator, JwtClaims, TokenType } from './jwt-generator.interface';

type Unit =
    | 'Years'
    | 'Year'
    | 'Yrs'
    | 'Yr'
    | 'Y'
    | 'Weeks'
    | 'Week'
    | 'W'
    | 'Days'
    | 'Day'
    | 'D'
    | 'Hours'
    | 'Hour'
    | 'Hrs'
    | 'Hr'
    | 'H'
    | 'Minutes'
    | 'Minute'
    | 'Mins'
    | 'Min'
    | 'M'
    | 'Seconds'
    | 'Second'
    | 'Secs'
    | 'Sec'
    | 's'
    | 'Milliseconds'
    | 'Millisecond'
    | 'Msecs'
    | 'Msec'
    | 'Ms';

type UnitAnyCase = Unit | Uppercase<Unit> | Lowercase<Unit>;

export type StringValue = `${number}` | `${number}${UnitAnyCase}` | `${number} ${UnitAnyCase}`;

export interface JwtGeneratorConfig {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
}

export class JwtGenerator extends IJwtGenerator {
    private readonly accessSecret: string;
    private readonly refreshSecret: string;
    private readonly accessExpiresIn: StringValue;
    private readonly refreshExpiresIn: StringValue;

    constructor(props: JwtGeneratorConfig) {
        super();
        this.accessSecret = props.accessSecret;
        this.refreshSecret = props.refreshSecret;
        this.accessExpiresIn = props.accessExpiresIn as StringValue;
        this.refreshExpiresIn = props.refreshExpiresIn as StringValue;
    }

    sign<T extends object>(payload: T, type: TokenType): string {
        const secret = this.getSecret(type);
        const expiresIn = this.getExpiresIn(type);
        return sign(payload, secret, { expiresIn });
    }

    verify<T extends object = Record<string, unknown>>(token: string, type: TokenType): JwtClaims<T> {
        const secret = this.getSecret(type);

        try {
            const decoded = verify(token, secret);
            return decoded as T;
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new UnauthorizedError('El token ha expirado');
            }
            if (error instanceof NotBeforeError) {
                throw new UnauthorizedError('El token no es activo todavía');
            }
            if (error instanceof JsonWebTokenError) {
                throw new UnauthorizedError('Token inválido');
            }
            throw new UnauthorizedError('Error desconocido al verificar el token');
        }
    }

    decode<T extends object = Record<string, unknown>>(token: string): JwtClaims<T> | null {
        try {
            return decode(token) as unknown as T;
        } catch {
            return null;
        }
    }

    private getSecret(type: TokenType): string {
        switch (type) {
            case 'access':
                return this.accessSecret;
            case 'refresh':
                return this.refreshSecret;
            case 'temporal':
                return this.refreshSecret + this.accessSecret;
        }
    }

    private getExpiresIn(type: TokenType): StringValue {
        switch (type) {
            case 'access':
                return this.accessExpiresIn;
            case 'refresh':
                return this.refreshExpiresIn;
            case 'temporal':
                return '5Min';
        }
    }
}
