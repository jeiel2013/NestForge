import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export const MAIL_QUEUE = 'mail';

export enum MailJob {
    VerifyEmail = 'verify-email',
    ResetPassword = 'reset-password',
}

@Injectable()
export class MailService {
    constructor(@InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue) { }

    queueVerificationEmail(to: string, name: string, token: string) {
        return this.mailQueue.add(MailJob.VerifyEmail, { to, name, token });
    }

    queuePasswordResetEmail(to: string, name: string, token: string) {
        return this.mailQueue.add(MailJob.ResetPassword, { to, name, token });
    }
}