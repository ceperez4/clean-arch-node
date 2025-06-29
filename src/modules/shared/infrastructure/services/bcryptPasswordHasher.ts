import * as bcrypt from 'bcryptjs'
import { IPasswordHasher } from '@modules/shared/domain/services/iPasswordHasher';

export class BcryptPasswordHasher implements IPasswordHasher {
    
    private readonly saltRounds = 10

    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    compare(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

}