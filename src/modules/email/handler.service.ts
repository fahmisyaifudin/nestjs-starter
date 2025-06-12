import { Inject, Injectable } from '@nestjs/common';
import { SendEmailOptions } from './schema';
import { ConfigService } from '@nestjs/config';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

@Injectable()
export class EmailHandlerService {
  private readonly defaultSender: Sender;
  constructor(
    @Inject('MailSend') private mailerSend: MailerSend,
    private configService: ConfigService,
  ) {
    const defaultFromEmail = this.configService.get<string>(
      'MAILERSEND_FROM_EMAIL',
    );
    const defaultFromName = this.configService.get<string>(
      'MAILERSEND_FROM_NAME',
      'Medayoh Admin',
    );
    this.defaultSender = new Sender(defaultFromEmail, defaultFromName);
  }
  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      const { to, toName, subject, templateId, variables } = options;

      const sentFrom = this.defaultSender;
      const recipients = [new Recipient(to, toName)];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject(subject)
        .setTemplateId(templateId)
        .setPersonalization([{ email: to, data: variables }]);

      await this.mailerSend.email.send(emailParams);
    } catch (error) {
      console.log(error);
    }
  }
}
