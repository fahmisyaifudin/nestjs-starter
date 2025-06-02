import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailHandlerService } from '../handler.service';
import { MailerSend } from 'mailersend';

describe('EmailHandlerService', () => {
  let service: EmailHandlerService;
  let mockMailerSend: MailerSend;
  let mockConfigService: ConfigService;

  const mockDefaultFromEmail = 'test@example.com';
  const mockDefaultFromName = 'Test Admin';

  beforeEach(async () => {
    mockMailerSend = {
      email: {
        send: jest.fn(),
      },
    } as unknown as MailerSend; // Mocking the MailerSend structure

    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'MAILERSEND_FROM_EMAIL') {
          return mockDefaultFromEmail;
        }
        if (key === 'MAILERSEND_FROM_NAME') {
          return mockDefaultFromName;
        }
        return defaultValue;
      }),
    } as unknown as ConfigService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailHandlerService,
        {
          provide: 'MailSend', // This should match the @Inject() token in your service
          useValue: mockMailerSend,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailHandlerService>(EmailHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should call mailerSend.email.send with correct parameters', async () => {
      const options = {
        to: 'recipient@example.com',
        toName: 'Recipient Name',
        subject: 'Test Subject',
        templateId: 'test-template-id',
        variables: {
          name: 'John Doe',
        },
      };

      await service.sendEmail(options);

      expect(mockMailerSend.email.send).toHaveBeenCalledTimes(1);
    });
  });
});
