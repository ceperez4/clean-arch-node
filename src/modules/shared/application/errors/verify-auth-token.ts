export class VerifyAuthTokenError extends Error {
    constructor(
        public readonly message: string,
    ) {
        super(message);
        this.name = 'AuthTokenError'
    }

    static authTokenExpired() {
        return new VerifyAuthTokenError("Authentication token has expired.")
    }
    static invalidAuthToken() {
        return new VerifyAuthTokenError("Failed to verify authentication token.")
    }
    static invalidTokenPayload() {
        return new VerifyAuthTokenError("Invalid token payload structure.")
    }
}