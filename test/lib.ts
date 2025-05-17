import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from '../src/database/schema';
import 'dotenv/config';
import * as jwt from 'jsonwebtoken';
import 'dotenv/config';

export const pgConnection = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env['DATABASE_URL'],
    }),
  }),
});

export const loginAs = async (email: string): Promise<string> => {
  const user = await pgConnection
    .selectFrom('users')
    .where('email', '=', email)
    .selectAll()
    .executeTakeFirstOrThrow();

  const payload = {
    sub: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
  };
  const secret = process.env['JWT_SECRET'];
  return jwt.sign(payload, secret);
};
