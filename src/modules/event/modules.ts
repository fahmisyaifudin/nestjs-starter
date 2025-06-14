import { Module } from '@nestjs/common';
import { EventController } from './controller';
import { EventService } from './service';
import { EventRepository } from './repository';
import { DatabaseProvider } from '../../provider/database';
import 'dotenv/config';
import { AuthModule } from '../auth/module';
import { EmailModule } from '../email/module';
import { PaymentModule } from '../payment/module';

@Module({
  imports: [AuthModule, EmailModule, PaymentModule],
  controllers: [EventController],
  providers: [EventService, EventRepository, DatabaseProvider],
  exports: [EventService],
})
export class EventModule {}
