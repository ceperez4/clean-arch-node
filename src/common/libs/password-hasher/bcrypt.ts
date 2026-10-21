import * as bcrypt from 'bcryptjs';
import { IPasswordHasher } from './password-hasher.interface';

export class BcryptPasswordHasher extends IPasswordHasher {
    private readonly saltRounds = 10;

    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    async compare(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}
