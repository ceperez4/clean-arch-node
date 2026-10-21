import { IEmailSender, SendMailOptions } from './email-sender.interface';

export class BrevoEmailSender extends IEmailSender {
    constructor() {
        super();
    }

    send(options: SendMailOptions): Promise<boolean> {
        void options;
        //TODO conectar api de brevo
        return Promise.resolve(true);
    }
}
