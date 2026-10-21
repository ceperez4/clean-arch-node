export class NotFoundError extends Error {
    constructor(msg = 'Not Found') {
        super(msg);
        this.name = 'NotFoundError';
    }
}
