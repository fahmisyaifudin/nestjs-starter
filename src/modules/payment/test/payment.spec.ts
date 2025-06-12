import { Test, TestingModule } from '@nestjs/testing';
import { PaymentRepository } from '../repository';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { QrCodeCreated, QrCodeSimulatedPayment } from '../schema';
import { factories } from '../factory';
import { Kysely } from 'kysely';
import { Database } from 'src/database/schema';

describe('PaymentRepository', () => {
  let repository: PaymentRepository;
  let httpService: HttpService;
  let db: Kysely<Database>;

  beforeEach(async () => {
    const mockHttpService = {
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentRepository,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: 'Kysely',
          useValue: db,
        },
      ],
    }).compile();

    repository = module.get<PaymentRepository>(PaymentRepository);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should successfully create a QR code', async () => {
    const mockQrCodeData = factories.qrCodeCreated();
    const mockAxiosResponse: AxiosResponse<QrCodeCreated> = {
      data: mockQrCodeData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {} as AxiosRequestHeaders,
      },
      request: {},
    };

    (httpService.post as jest.Mock).mockReturnValue(of(mockAxiosResponse));

    const qrCode = await repository.createQr({
      amount: mockQrCodeData.amount,
      id: mockQrCodeData.id,
    });

    expect(httpService.post).toHaveBeenCalledWith('qr_codes', {
      reference_id: mockQrCodeData.id,
      type: 'DYNAMIC',
      currency: 'IDR',
      amount: mockQrCodeData.amount,
    });

    expect(qrCode).toEqual(mockAxiosResponse.data);
  });
  it('should simulate QR payment successfully', async () => {
    const mockSimulateQRData = factories.qrCodeSimulated();
    const mockAxiosResponse: AxiosResponse<QrCodeSimulatedPayment> = {
      data: mockSimulateQRData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {} as AxiosRequestHeaders,
      },
      request: {},
    };

    (httpService.post as jest.Mock).mockReturnValue(of(mockAxiosResponse));

    const qrCode = await repository.simulateQrPayment(mockSimulateQRData.qr_id);

    expect(httpService.post).toHaveBeenCalledWith(
      `qr_codes/${mockSimulateQRData.qr_id}/payments/simulate`,
    );

    expect(qrCode).toEqual(mockAxiosResponse.data);
  });
});
