import { Controller, Get, Query, Param } from '@nestjs/common';
import { EventService } from './service';
import {
  EventFormParams,
  EventFormParamsSchema,
  EventParams,
  EventParamsSchema,
  EventQuery,
  EventQuerySchema,
} from './schema';
import { ValidationPipe } from '../../pipe/validation';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('/')
  async get(@Query(new ValidationPipe(EventQuerySchema)) query: EventQuery) {
    return this.eventService.get(query);
  }
  @Get(':id')
  async detail(
    @Param(new ValidationPipe(EventParamsSchema)) payload: EventParams,
  ) {
    return this.eventService.detail(payload);
  }
  @Get(':event_id/form')
  async getForm(
    @Param(new ValidationPipe(EventFormParamsSchema)) params: EventFormParams,
  ) {
    return this.eventService.getForm(params);
  }
}
