import { Global, Module } from '@nestjs/common';
import { BrevoEmailSender } from './brevo';
import { IEmailSender } from './email-sender.interface';

@Global()
@Module({
    providers: [
        {
            provide: IEmailSender,
            useFactory: () => {
                return new BrevoEmailSender();
            },
        },
    ],
    exports: [IEmailSender],
})
export class EmailSenderGlobalModule {}
