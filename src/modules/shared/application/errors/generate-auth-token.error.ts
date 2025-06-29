export class GenerateAuthTokenError extends Error {
    constructor(
        public readonly message: string,
    ) {
        super(message);
        this.name = 'AuthTokenError'
    }

    static invalidTokenSecretKey() {
        return new GenerateAuthTokenError("JWT secret key must be provided and be sufficiently long.")
    }
    static failedGenerateAuthToken() {
        return new GenerateAuthTokenError("Failed to generate authentication token")
    }
}