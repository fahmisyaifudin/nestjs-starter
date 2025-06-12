import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../service';
import { PaymentRepository } from '../repository';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { factories } from '../factory';
import 'dotenv/config';

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentRepository: PaymentRepository;

  const mockPaymentRepository = {
    getTransactionPayment: jest.fn(),
    updateTransactionStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PaymentRepository,
          useValue: mockPaymentRepository,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    paymentRepository = module.get<PaymentRepository>(PaymentRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleCallback', () => {
    const mockHeaders = {
      'x-callback-token': process.env.XENDIT_CALLBACK_TOKEN,
      'webhook-id': 'webhook-123',
    };

    const mockPayload = factories.qrCodeSimulated({
      status: 'SUCCEEDED',
    });

    it('should successfully handle payment callback', async () => {
      const mockTransaction = factories.transaction({
        payment_reference: mockPayload.id,
        amount: mockPayload.amount,
        status: 'pending',
      });

      mockPaymentRepository.getTransactionPayment.mockResolvedValue(
        mockTransaction,
      );
      mockPaymentRepository.updateTransactionStatus.mockResolvedValue({
        ...mockTransaction,
        status: 'success',
      });

      const result = await service.handleCallback(mockHeaders, mockPayload);

      expect(paymentRepository.getTransactionPayment).toHaveBeenCalledWith(
        mockPayload.id,
      );
      expect(paymentRepository.updateTransactionStatus).toHaveBeenCalledWith(
        mockPayload.id,
        'success',
      );
      expect(result).toEqual({
        transaction: {
          ...mockTransaction,
          status: 'success',
        },
      });
    });

    it('should throw UnauthorizedException when callback token is invalid', async () => {
      const invalidHeaders = {
        'x-callback-token': 'invalid-token',
        'webhook-id': 'invalid-webhook',
      };

      await expect(
        service.handleCallback(invalidHeaders, mockPayload),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException when payment status is not SUCCEEDED', async () => {
      const failedPayload = {
        ...mockPayload,
        status: 'FAILED',
      };

      await expect(
        service.handleCallback(mockHeaders, failedPayload),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when transaction not found', async () => {
      mockPaymentRepository.getTransactionPayment.mockResolvedValue(null);

      await expect(
        service.handleCallback(mockHeaders, mockPayload),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when amounts do not match', async () => {
      const mockTransaction = factories.transaction({
        payment_reference: mockPayload.id,
        amount: 200000, // Different amount
        status: 'pending',
      });

      mockPaymentRepository.getTransactionPayment.mockResolvedValue(
        mockTransaction,
      );

      await expect(
        service.handleCallback(mockHeaders, mockPayload),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
