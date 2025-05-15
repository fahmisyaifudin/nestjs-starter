import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Database } from 'src/database/schema';

@Injectable()
export class EventRepository {
  constructor(@Inject('Kysely') private db: Kysely<Database>) {}

  async getEventById(id: string): Promise<Database['events']> {
    return this.db
      .selectFrom('events')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirstOrThrow();
  }

  async getActiveEvents(date: {
    start: number;
    end: number;
  }): Promise<Database['events'][]> {
    return this.db
      .selectFrom('events')
      .where('start_date', '>', date.start)
      .where('end_date', '<', date.end)
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
}
