import { Test } from '@nestjs/testing';
import { UserRepository } from '../repository';
import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import { Database, Entities } from 'src/database/schema';
import 'dotenv/config';
import { factories } from '../factory';

describe('UserRepository', () => {
  let userRepository: UserRepository;
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
        UserRepository,
        {
          provide: 'Kysely',
          useValue: db,
        },
      ],
    }).compile();

    userRepository = moduleRef.get<UserRepository>(UserRepository);
  });

  afterEach(async () => {
    await db.deleteFrom('transactions').execute();
    await db.deleteFrom('event_form_tickets').execute();
    await db.deleteFrom('tickets').execute();
    await db.deleteFrom('event_tickets').execute();
    await db.deleteFrom('event_forms').execute();
    await db.deleteFrom('events').execute();
    await db.deleteFrom('users').execute();
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('login', () => {
    it('should return empty array when no users exist', async () => {
      const user = await db
        .insertInto('users')
        .values(factories.users())
        .returningAll()
        .executeTakeFirstOrThrow();
      const result = await userRepository.getByEmail(user.email);
      expect(result).toEqual(user);
    });
  });
  describe('register', () => {
    it('should create user', async () => {
      const inserted: Entities['users']['insert'] = factories.users();
      const result = await userRepository.create(inserted);
      expect(result.email).toEqual(inserted.email);
      const { count } = await db
        .selectFrom('users')
        .where('email', '=', inserted.email)
        .select(sql<number>`COUNT(*)`.as('count'))
        .executeTakeFirstOrThrow();
      expect(Number(count)).toEqual(1);
    });
    it('should create anonymous user', async () => {
      const inserted: Entities['users']['insert'] = factories.users();
      const result = await userRepository.create(inserted);
      expect(result.email).toEqual(inserted.email);
      const { count } = await db
        .selectFrom('users')
        .where('email', '=', inserted.email)
        .select(sql<number>`COUNT(*)`.as('count'))
        .executeTakeFirstOrThrow();
      expect(Number(count)).toEqual(1);
    });
  });
});
