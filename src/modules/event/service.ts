/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Api } from './schema';
import { EventRepository } from './repository';

@Injectable()
export class EventService {
  constructor(private eventRepo: EventRepository) {}

  async get(query: Api['get']['query']): Promise<Api['get']['response']> {
    try {
      const events = await this.eventRepo.getActiveEvents({
        start: query.start_date,
        end: query.end_date,
        page: query.page,
        size: query.size,
      });

      return {
        events,
        pagination: {
          size: query.size ?? 10,
          page: query.page ?? 0,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async detail(
    params: Api['detail']['params'],
  ): Promise<Api['detail']['response']> {
    try {
      const event = await this.eventRepo.getEventById(params.id);
      if (!event) {
        throw new BadRequestException('Event id not found');
      }
      return {
        event,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
  async getForm(
    params: Api['form']['params'],
  ): Promise<Api['form']['response']> {
    try {
      const forms = await this.eventRepo.getEventForm(params.event_id);
      return {
        forms,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
