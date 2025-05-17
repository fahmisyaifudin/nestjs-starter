import { Test } from '@nestjs/testing';
import { EventRepository } from '../repository';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from 'src/database/schema';
import 'dotenv/config';
import { factories } from '../factory';

describe('EventRepository', () => {
  let eventRepository: EventRepository;
  let db: Kysely<Database>;

  beforeAll(async () => {
    db = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool: new Pool({
          connectionString: process.env['DATABASE_URL'],
        }),
      }),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        EventRepository,
        {
          provide: 'Kysely',
          useValue: db,
        },
      ],
    }).compile();

    eventRepository = moduleRef.get<EventRepository>(EventRepository);
  });

  beforeEach(async () => {
    await db.deleteFrom('event_forms').execute();
    await db.deleteFrom('event_tickets').execute();
    await db.deleteFrom('events').execute();
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('getEventById', () => {
    it('should return event by id', async () => {
      const event = await db
        .insertInto('events')
        .values(factories.events())
        .returningAll()
        .executeTakeFirstOrThrow();

      await db
        .insertInto('event_tickets')
        .values(
          Array(3)
            .fill(null)
            .map(() => factories.event_ticket({ event_id: event.id })),
        )
        .execute();

      const result = await eventRepository.getEventById(event.id);
      expect(result.id).toEqual(event.id);
      expect(result.tickets.length).toEqual(3);
      expect(Array.isArray(event.images)).toBe(true);
    });
  });

  describe('getActiveEvents', () => {
    it('should return active events between dates', async () => {
      await db
        .insertInto('events')
        .values(
          Array(3)
            .fill(null)
            .map(() => factories.events()),
        )
        .execute();

      const result = await eventRepository.getActiveEvents({
        start: 0,
        end: new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
      });
      expect(result.length).toEqual(3);
    });
  });

  describe('getEventForm', () => {
    it('should return event forms by event id', async () => {
      const event = await db
        .insertInto('events')
        .values(factories.events())
        .returningAll()
        .executeTakeFirstOrThrow();

      await db
        .insertInto('event_forms')
        .values(
          Array(3)
            .fill(null)
            .map(() => factories.event_form({ event_id: event.id })),
        )
        .execute();

      const result = await eventRepository.getEventForm(event.id);
      expect(result.length).toEqual(3);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
