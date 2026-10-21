import { Global, Module } from '@nestjs/common';
import { CryptoOtpGenerator } from './crypto';
import { IOtpGenerator } from './otp-generator.interface';

@Global()
@Module({
    providers: [
        {
            provide: IOtpGenerator,
            useClass: CryptoOtpGenerator,
        },
    ],
    exports: [IOtpGenerator],
})
export class OtpGeneratorGlobalModule {}
