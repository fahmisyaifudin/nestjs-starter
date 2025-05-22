import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Database, Entities } from 'src/database/schema';
import { Api } from './schema';

@Injectable()
export class EventRepository {
  constructor(@Inject('Kysely') private db: Kysely<Database>) {}

  async getEventById(id: string): Promise<Api['detail']['response']['event']> {
    const event = await this.db
      .selectFrom('events')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    if (!event) {
      return null;
    }

    const tickets = await this.db
      .selectFrom('event_tickets')
      .where('event_id', '=', id)
      .selectAll()
      .execute();

    return {
      ...event,
      tickets,
    };
  }

  async getActiveEvents(payload: {
    start?: number;
    end?: number;
    page?: number;
    size?: number;
  }): Promise<Database['events'][]> {
    return this.db
      .selectFrom('events')
      .$if(payload.start !== undefined, (qb) =>
        qb.where('start_date', '>', payload.start ?? 0),
      )
      .$if(payload.end !== undefined, (qb) =>
        qb.where('end_date', '<', payload.end ?? new Date().getTime()),
      )
      .limit(payload.size ?? 10)
      .offset((payload.page ?? 0) * (payload.size ?? 10))
      .selectAll()
      .execute();
  }

  async getEventForm(event_id: string): Promise<Database['event_forms'][]> {
    return this.db
      .selectFrom('event_forms')
      .where('event_id', '=', event_id)
      .selectAll()
      .execute();
  }
  async storeTicket(
    payload: Entities['tickets']['insert'][],
  ): Promise<Database['tickets'][]> {
    return this.db
      .insertInto('tickets')
      .values(payload)
      .returningAll()
      .execute();
  }
  async storeTicketForm(
    payload: Entities['event_form_ticket']['insert'][],
  ): Promise<Database['event_form_ticket'][]> {
    return this.db
      .insertInto('event_form_ticket')
      .values(payload)
      .returningAll()
      .execute();
  }
}
