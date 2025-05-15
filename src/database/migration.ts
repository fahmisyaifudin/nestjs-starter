import {
  FileMigrationProvider,
  Kysely,
  Migrator,
  PostgresDialect,
  sql,
} from 'kysely';
import * as path from 'path';
import { promises as fs } from 'fs';
import { Pool } from 'pg';
import 'dotenv/config';

const db = new Kysely({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env['DATABASE_URL'],
    }),
  }),
});
const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, 'migration'),
  }),
});

export async function migrateToLatest() {
  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('failed to migrate');
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

export async function rollbackAll() {
  const migrations = await sql`SELECT * FROM kysely_migration`.execute(db);

  for (let i = 0; i <= migrations.rows.length; i++) {
    const { error, results } = await migrator.migrateDown();
    if (results?.length !== 0) {
      results?.forEach((it) => {
        if (it.status === 'Success') {
          console.log(
            `rollback "${it.migrationName}" was executed successfully`,
          );
        } else if (it.status === 'Error') {
          console.error(`failed to execute rollback "${it.migrationName}"`);
        }
      });
    } else {
      console.log('nothing to rollback');
    }

    if (error) {
      console.error('failed to rollback');
      console.error(error);
      process.exit(1);
    }
  }

  console.log('Rollback completed! Exiting...');
  await db.destroy();
}

async function main() {
  const args = process.argv.splice(2);
  switch (args[0]) {
    case 'latest':
      await migrateToLatest();
      break;
    case 'rollback':
      await rollbackAll();
      break;
    default:
      console.log('Not yet implemented');
  }
}

main();
