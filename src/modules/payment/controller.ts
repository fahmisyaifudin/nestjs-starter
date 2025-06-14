import { Controller, Post, Param, Body, Headers } from '@nestjs/common';
import { PaymentRepository } from './repository';
import { PaymentService } from './service';
import { ValidationPipe } from '../../pipe/validation';
import { Api, ApiSchema } from './schema';

@Controller('event')
export class PaymentController {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly paymentService: PaymentService,
  ) {}

  @Post('/payment/simulate/:id')
  async simulatePayment(
    @Param(new ValidationPipe(ApiSchema['simulate']['params']))
    params: Api['simulate']['params'],
  ) {
    return this.paymentRepo.simulateQrPayment(params.id);
  }
  @Post('/payment/callback')
  async callback(
    @Body(new ValidationPipe(ApiSchema['callback']['body']))
    body: Api['callback']['body'],
    @Headers()
    headers: Api['callback']['headers'],
  ) {
    return this.paymentService.handleCallback(headers, body.data);
  }
}
