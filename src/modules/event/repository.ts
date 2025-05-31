import { Inject, Injectable } from '@nestjs/common';
import { Kysely, sql, Transaction } from 'kysely';
import { Database, Entities } from 'src/database/schema';
import { Api } from './schema';

@Injectable()
export class EventRepository {
  constructor(@Inject('Kysely') private db: Kysely<Database>) {}

  getDB(): Kysely<Database> {
    return this.db;
  }
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
    trx?: Transaction<Database>,
  ): Promise<Database['tickets'][]> {
    const query = trx || this.db;
    return query.insertInto('tickets').values(payload).returningAll().execute();
  }
  async storeTicketForm(
    payload: Entities['event_form_ticket']['insert'][],
    trx?: Transaction<Database>,
  ): Promise<Database['event_form_ticket'][]> {
    const query = trx || this.db;
    return query
      .insertInto('event_form_ticket')
      .values(payload)
      .returningAll()
      .execute();
  }
  async storeTransaction(
    payload: Entities['transactions']['insert'],
    trx?: Transaction<Database>,
  ): Promise<Database['transactions']> {
    const query = trx || this.db;
    return query
      .insertInto('transactions')
      .values(payload)
      .returningAll()
      .executeTakeFirstOrThrow();
  }
  async getAmountOfTickets(
    ticketIds: string[],
  ): Promise<{ amount: number; event_id: string }> {
    return this.db
      .selectFrom('event_tickets')
      .where('id', 'in', ticketIds)
      .select([sql<number>`SUM(price)`.as('amount'), 'event_id'])
      .groupBy('event_id')
      .execute()
      .then((result) => {
        return {
          amount: result[0]?.amount ?? 0,
          event_id: result[0]?.event_id ?? '',
        };
      });
  }
}
