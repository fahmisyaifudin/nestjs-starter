import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailJobData } from './schema';

@Injectable()
export class EmailQueueService {
  constructor(
    @InjectQueue('email-queue') private emailQueue: Queue<EmailJobData>,
  ) {}
  async queueVerificationEmail(options: {
    to: string;
    toName: string;
    code: string;
  }): Promise<void> {
    const jobData: EmailJobData = {
      to: options.to,
      toName: options.toName,
      subject: 'Verifikasi Akunmu!',
      body: {
        verificationEmail: {
          verificationCode: options.code,
        },
      },
    };

    await this.emailQueue.add('verification-email', jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
