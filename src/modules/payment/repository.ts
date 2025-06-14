import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { catchError, map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { QrCodeCreated, QrCodeSimulatedPayment } from './schema';
import { Kysely } from 'kysely';
import { Database } from 'src/database/schema';

@Injectable()
export class PaymentRepository {
  constructor(
    private readonly httpService: HttpService,
    @Inject('Kysely') private db: Kysely<Database>,
  ) {}

  async createQr(params: {
    amount: number;
    id: string;
  }): Promise<QrCodeCreated> {
    const response: AxiosResponse<QrCodeCreated> = await lastValueFrom(
      this.httpService
        .post('qr_codes', {
          reference_id: params.id,
          type: 'DYNAMIC',
          currency: 'IDR',
          amount: params.amount,
        })
        .pipe(
          map((res) => res),
          catchError((error: AxiosError) => {
            throw new InternalServerErrorException(
              'Failed to create QR code with Xendit. ' + error.message,
            );
          }),
        ),
    );

    return response.data;
  }
  async simulateQrPayment(id: string) {
    const response: AxiosResponse<QrCodeSimulatedPayment> = await lastValueFrom(
      this.httpService.post(`qr_codes/${id}/payments/simulate`).pipe(
        map((res) => res),
        catchError((error: AxiosError) => {
          throw new InternalServerErrorException(
            'Failed to simulate QR payment with Xendit. ' + error.message,
          );
        }),
      ),
    );

    return response.data;
  }
  async getTransactionPayment(payment_reference: string) {
    return this.db
      .selectFrom('transactions')
      .where('payment_reference', '=', payment_reference)
      .selectAll()
      .executeTakeFirst();
  }
  async updateTransactionStatus(id: string, status: 'success' | 'failed') {
    return this.db
      .updateTable('transactions')
      .set({ status })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
