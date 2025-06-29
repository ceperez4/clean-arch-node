export class UserInvalidArgumentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UserInvalidArgumentError';
    }
}