/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  EventFormParams,
  EventFormResponse,
  EventParams,
  EventQuery,
  EventResponse,
  EventSingleResponse,
} from './schema';
import { EventRepository } from './repository';

@Injectable()
export class EventService {
  constructor(private eventRepo: EventRepository) {}

  async get(query: EventQuery): Promise<EventResponse> {
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
  async detail(params: EventParams): Promise<EventSingleResponse> {
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
  async getForm(params: EventFormParams): Promise<EventFormResponse> {
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
