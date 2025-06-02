import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailQueueService } from './queue.service';
import { EmailHandlerService } from './handler.service';
import { MailSendProvider } from '../../provider/mailsend';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-queue',
    }),
  ],
  providers: [EmailQueueService, EmailHandlerService, MailSendProvider],
  exports: [EmailQueueService, EmailHandlerService],
})
export class EmailModule {}
