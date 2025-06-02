export type EmailJobData = {
  to: string;
  toName: string;
  subject: string;
  body: {
    verificationEmail?: {
      verificationCode: string;
    };
  };
};

export type SendEmailOptions = {
  to: string;
  toName: string;
  subject: string;
  templateId: string;
  variables?: Record<string, string>;
};
