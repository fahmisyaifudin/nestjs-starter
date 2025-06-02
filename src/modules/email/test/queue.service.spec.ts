import { Test, TestingModule } from '@nestjs/testing';
import { EmailQueueService } from '../queue.service';
import { Queue } from 'bullmq';

// Define a mock for the Queue interface
const mockEmailQueue = {
  add: jest.fn(),
};

describe('EmailQueueService', () => {
  let service: EmailQueueService;
  let emailQueue: Queue; // Type for the mocked queue

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailQueueService,
        {
          provide: 'BullQueue_email-queue',
          useValue: mockEmailQueue,
        },
      ],
    }).compile();

    service = module.get<EmailQueueService>(EmailQueueService);
    emailQueue = module.get<Queue>('BullQueue_email-queue');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('queueVerificationEmail', () => {
    it('should add a verification-email job to the queue with correct data and options', async () => {
      const options = {
        to: 'test@example.com',
        toName: 'Test User',
        code: '123456',
      };

      await service.queueVerificationEmail(options);

      expect(emailQueue.add).toHaveBeenCalledTimes(1);
      expect(emailQueue.add).toHaveBeenCalledWith(
        'verification-email', // Job name
        {
          to: options.to,
          toName: options.toName,
          subject: 'Verifikasi Akunmu!',
          body: {
            verificationEmail: {
              verificationCode: options.code,
            },
          },
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    });
  });
});
