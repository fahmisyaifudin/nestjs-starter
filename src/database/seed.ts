import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import 'dotenv/config';
import { Database } from './schema';
import { factories as authFactory } from '../../src/modules/auth/factory';
import * as bcrypt from 'bcryptjs';
import { factories as eventFactory } from '../../src/modules/event/factory';

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env['DATABASE_URL'],
    }),
  }),
});

async function seed() {
  try {
    await db
      .insertInto('users')
      .values(
        authFactory.users({
          email: 'admin@medayoh.id',
          password_hash: bcrypt.hashSync('Password123'),
        }),
      )
      .execute();

    // Seed tickets
    const event = await db
      .insertInto('events')
      .values(eventFactory.events())
      .returning('id')
      .executeTakeFirstOrThrow();

    // Seed ticket form
    await db
      .insertInto('event_forms')
      .values(
        Array(5)
          .fill(null)
          .map(() => eventFactory.event_form({ event_id: event.id })),
      )
      .execute();

    await db
      .insertInto('event_tickets')
      .values(
        Array(3)
          .fill(null)
          .map(() => eventFactory.event_ticket({ event_id: event.id })),
      )
      .execute();

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await db.destroy();
  }
}

// Run the seed function
seed();
