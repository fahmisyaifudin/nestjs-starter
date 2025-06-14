import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Api } from './schema';
import { PaymentRepository } from './repository';

@Injectable()
export class PaymentService {
  constructor(private paymentRepo: PaymentRepository) {}

  async handleCallback(
    headers: Api['callback']['headers'],
    payload: Api['callback']['body']['data'],
  ): Promise<Api['callback']['response']> {
    try {
      const xCallbackToken = headers['x-callback-token'];
      if (xCallbackToken !== process.env.XENDIT_CALLBACK_TOKEN) {
        throw new UnauthorizedException('Invalid callback token');
      }
      if (!payload || !payload.id || !payload.status) {
        throw new BadRequestException('Invalid payload');
      }
      if (payload.status !== 'SUCCEEDED') {
        throw new BadRequestException('Payment status must be SUCCESS');
      }
      const transaction = await this.paymentRepo.getTransactionPayment(
        payload.id,
      );
      if (!transaction) {
        throw new BadRequestException('Transaction not found');
      }
      if (transaction.amount !== payload.amount) {
        throw new BadRequestException(
          'Transaction amount does not match the payload amount',
        );
      }
      const updatedTranscation = await this.paymentRepo.updateTransactionStatus(
        payload.id,
        'success',
      );
      return { transaction: updatedTranscation };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
