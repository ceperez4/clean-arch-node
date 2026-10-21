export class AlreadyExistError extends Error {
    constructor(msg = 'Already Exist') {
        super(msg);
        this.name = 'AlreadyExistError';
    }
}
