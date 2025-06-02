import { MailerSend } from 'mailersend';

export const MailSendProvider = {
  provide: 'MailSend',
  useFactory: () => {
    const mailerSend = new MailerSend({
      apiKey: process.env['MAILERSEND_API_KEY'],
    });
    return mailerSend;
  },
};
