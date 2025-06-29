export class UserNotFoundError extends Error {
    constructor(identifier: string) {
        super(`No se encontró un usuario con el identificador: ${identifier}`);
        this.name = 'UserNotFoundError';
    }
}