export class UnauthorizedError extends Error {
    constructor(msg = 'Unauthorized') {
        super(msg);
        this.name = 'UnauthorizedError';
    }
}
