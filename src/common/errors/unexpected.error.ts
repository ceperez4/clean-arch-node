export class UnexpectedError extends Error {
    constructor(msg = 'Unexpected') {
        super(msg);
        this.name = 'UnexpectedError';
    }
}
