import type { StringValue } from "ms";
import { JsonWebTokenError, sign, TokenExpiredError, verify, } from 'jsonwebtoken'
import { IAuthToken } from "@modules/shared/domain/services/iAuthToken";
import { GenerateAuthTokenError } from "@modules/shared/application/errors/generate-auth-token.error";
import { VerifyAuthTokenError } from "@modules/shared/application/errors/verify-auth-token";

export class JwtAuthToken implements IAuthToken {
    
    private readonly secretKey: string;
    private readonly expiresIn: StringValue;

    constructor(secretKey: string, expiresIn: StringValue) {
        if (!secretKey || secretKey.length < 10) {
            throw GenerateAuthTokenError.invalidTokenSecretKey();
        }
        this.secretKey = secretKey;
        this.expiresIn = expiresIn
    }

    async generateToken<T extends object>(payload: T): Promise<string> {
        try {
            return sign(payload, this.secretKey, { expiresIn: this.expiresIn });
        } catch (error) {
            console.error('Error generating token:', error);
            throw GenerateAuthTokenError.failedGenerateAuthToken();
        }
    }

    async verifyToken<T extends object>(token: string): Promise<T> {
        return new Promise((resolve, reject) => {
            verify(token, this.secretKey, (err, decoded) => {
                if (err) {

                    if (err instanceof TokenExpiredError) {
                        return reject(VerifyAuthTokenError.authTokenExpired());
                    }
                    if (err instanceof JsonWebTokenError) {
                        return reject(VerifyAuthTokenError.invalidAuthToken());
                    }
                    console.error('Unexpected error during token verification:', err);
                    return reject(new Error('An unexpected error occurred during token verification.'));
                }

                if (typeof decoded !== 'object' || decoded === null) {
                    return reject(VerifyAuthTokenError.invalidTokenPayload());
                }
                resolve(decoded as T);
            });
        });
    }

}