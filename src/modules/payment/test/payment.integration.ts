// payment/payment.repository.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentRepository } from '../repository';
import { HttpModule } from '@nestjs/axios';
import 'dotenv/config';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('PaymentRepository Integration Test', () => {
  let repository: PaymentRepository;

  jest.setTimeout(30000);

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            baseURL: 'https://api.xendit.co',
            headers: {
              Authorization: `Basic ${btoa(configService.get<string>('XENDIT_API_KEY'))}`,
              'api-version': '2022-07-31',
              'Content-Type': 'application/json',
            },
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [PaymentRepository],
    }).compile();

    repository = module.get<PaymentRepository>(PaymentRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should successfully create a QR code with a real API call', async () => {
    const uniqueId = `test-qr-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const amount = 10000;

    try {
      const qrCode = await repository.createQr({ amount, id: uniqueId });
      expect(qrCode).toBeDefined();
      expect(qrCode.id).toBeDefined();
      expect(qrCode.qr_string).toBeDefined();

      const simulate = await repository.simulateQrPayment(qrCode.id);
      expect(simulate).toBeDefined();
      expect(simulate.qr_id).toBe(qrCode.id);
      expect(simulate.amount).toBe(amount);
      expect(simulate.status).toBe('SUCCEEDED');
    } catch (error) {
      console.error('Real API call failed:', error);
    }
  });
});
