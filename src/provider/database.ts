import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from '../database/schema';

export const DatabaseProvider = {
  provide: 'Kysely',
  useFactory: () => {
    const dialect = new PostgresDialect({
      pool: new Pool({
        connectionString: process.env['DATABASE_URL'],
      }),
    });

    return new Kysely<Database>({ dialect });
  },
};
