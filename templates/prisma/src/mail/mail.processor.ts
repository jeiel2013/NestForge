// nestforge:feature-file:redis
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';
import { MAIL_QUEUE, MailJob } from './mail.service';
import { resetPasswordTemplate, verifyEmailTemplate } from './templates/email-templates';

interface MailJobData {
    to: string;
    name: string;
    token: string;
}

@Processor(MAIL_QUEUE)
export class MailProcessor extends WorkerHost {
    private readonly logger = new Logger(MailProcessor.name);

    private readonly transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT ?? 1025),
        secure: false,
    });

    async process(job: Job<MailJobData>) {
        const { to, name, token } = job.data;

        switch (job.name) {
            case MailJob.VerifyEmail:
                await this.send(to, 'Confirm your email', verifyEmailTemplate(name, token));
                break;
            case MailJob.ResetPassword:
                await this.send(to, 'Password reset', resetPasswordTemplate(name, token));
                break;
            default:
                this.logger.warn(`Unknown email job: ${job.name}`);
        }
    }

    private async send(to: string, subject: string, html: string) {
        await this.transporter.sendMail({
            from: process.env.MAIL_FROM,
            to,
            subject,
            html,
        });
    }
}
