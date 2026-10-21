import { randomUUID, randomInt } from 'node:crypto';
import { IOtpGenerator, OtpLevel } from './otp-generator.interface';

export class CryptoOtpGenerator extends IOtpGenerator {
    private readonly numbers = '0123456789';
    private readonly letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    private readonly symbols = '.?,;-_¡!¿*%&$/()[]{}|@><';

    uuidv4(): string {
        return randomUUID();
    }

    numericOtp(length: number = 6): string {
        return this.generateHash(this.numbers, length);
    }

    otp(length: number, level: OtpLevel): string {
        let base = '';

        switch (level) {
            case 0:
                base = this.numbers;
                break;
            case 1:
                base = this.letters;
                break;
            case 2:
                base = this.letters + this.numbers;
                break;
            case 3:
                base = this.letters + this.numbers + this.symbols;
                break;
        }

        return this.generateHash(base, length);
    }

    private generateHash(base: string, length: number): string {
        let otp = '';
        for (let x = 0; x < length; x++) {
            const random = randomInt(base.length);
            otp += base.charAt(random);
        }
        return otp;
    }
}
