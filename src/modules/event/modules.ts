import { Module } from '@nestjs/common';
import { EventController } from './controller';
import { EventService } from './service';
import { EventRepository } from './repository';
import { DatabaseProvider } from '../../provider/database';
import 'dotenv/config';
import { AuthService } from '../auth/service';

@Module({
  imports: [AuthService],
  controllers: [EventController],
  providers: [EventService, EventRepository, DatabaseProvider],
  exports: [EventService],
})
export class EventModule {}
