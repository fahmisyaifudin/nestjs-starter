import { Test } from '@nestjs/testing';
import { UserRepository } from '../repository';
import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import { Database, Entities } from 'src/database/schema';
import 'dotenv/config';

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

  beforeEach(async () => {
    await db.deleteFrom('users').execute();
  });

  afterAll(async () => {
    await db.deleteFrom('users').execute();
    await db.destroy();
  });

  describe('login', () => {
    it('should return empty array when no users exist', async () => {
      const user = await db
        .insertInto('users')
        .values({
          email: 'johndoe@mail.com',
          password_hash: 'hashedpassword123',
          full_name: 'John Doe',
          auth_provider: 'email',
          is_email_verified: false,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      const result = await userRepository.getByEmail(user.email);
      expect(result).toEqual(user);
    });
  });
  describe('register', () => {
    it('should create user', async () => {
      const inserted: Entities['users']['insert'] = {
        email: 'johndoe@mail.com',
        password_hash: 'hashedpassword123',
        full_name: 'John Doe',
        auth_provider: 'email',
        is_email_verified: false,
        email_verification_expires_at: new Date().getTime(),
        email_verification_token: 'random-string-token',
      };
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
