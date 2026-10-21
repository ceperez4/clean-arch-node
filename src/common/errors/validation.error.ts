export class ValidationError extends Error {
    constructor(msg = 'Is not Valid') {
        super(msg);
        this.name = 'ValidationError';
    }
}
