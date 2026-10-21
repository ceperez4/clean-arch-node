import { Global, Module } from '@nestjs/common';
import { BcryptPasswordHasher } from './bcrypt';
import { IPasswordHasher } from './password-hasher.interface';

@Global()
@Module({
    providers: [
        {
            provide: IPasswordHasher,
            useClass: BcryptPasswordHasher,
        },
    ],
    exports: [IPasswordHasher],
})
export class PasswordHasherGlobalModule {}
