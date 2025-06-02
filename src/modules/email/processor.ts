/* eslint-disable no-case-declarations */
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { EmailJobData } from './schema';
import { EmailHandlerService } from './handler.service';

@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  constructor(private readonly emailHandlerService: EmailHandlerService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<any> {
    this.logger.log(
      `Processing job ${job.id} of type ${job.name} with data: ${JSON.stringify(job.data)}`,
    );

    const { to, toName, subject, body } = job.data;

    try {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000));
      switch (job.name) {
        case 'verification-email':
          const { verificationEmail } = body;
          await this.emailHandlerService.sendEmail({
            to,
            toName,
            subject,
            templateId: '3zxk54vvewx4jy6v',
            variables: {
              name: toName,
              action_url: `https://medayoh.web.id/verify?code=${verificationEmail.verificationCode}`,
            },
          });
          break;
        default:
          break;
      }
      return { status: 'success', message: `Email sent to ${to}` };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} failed with error: ${err.message}`);
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.debug(`Job ${job.id} is active.`);
  }
}
