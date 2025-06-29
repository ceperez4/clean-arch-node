export class UserAlreadyExistsError extends Error {
    constructor(email: string) {
        super(`The user whit the '${email}' already exists.`);
        this.name = 'UserAlreadyExistsError';
    }
}