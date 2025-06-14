import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PaymentRepository } from './repository';
import { PaymentController } from './controller';
import { DatabaseProvider } from 'src/provider/database';

@Module({
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
  providers: [PaymentRepository, DatabaseProvider],
  exports: [PaymentRepository],
  controllers: [PaymentController],
})
export class PaymentModule {}
