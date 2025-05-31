import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Body,
  HttpCode,
} from '@nestjs/common';
import { EventService } from './service';
import { Api, ApiSchema } from './schema';
import { ValidationPipe } from '../../pipe/validation';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('/')
  async get(
    @Query(new ValidationPipe(ApiSchema['get']['query']))
    query: Api['get']['query'],
  ) {
    return this.eventService.get(query);
  }
  @Get(':id')
  async detail(
    @Param(new ValidationPipe(ApiSchema['detail']['params']))
    payload: Api['detail']['params'],
  ) {
    return this.eventService.detail(payload);
  }
  @Get(':event_id/form')
  async getForm(
    @Param(new ValidationPipe(ApiSchema['form']['params']))
    params: Api['form']['params'],
  ) {
    return this.eventService.getForm(params);
  }
  @Post(':event_id/register')
  @HttpCode(201)
  async register(
    @Param(new ValidationPipe(ApiSchema['register']['params']))
    params: Api['register']['params'],
    @Body(new ValidationPipe(ApiSchema['register']['body']))
    body: Api['register']['body'],
  ) {
    return this.eventService.register(params.event_id, body);
  }
}
