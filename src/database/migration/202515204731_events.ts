import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('events')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('title', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('start_date', 'bigint', (col) => col.notNull())
    .addColumn('end_date', 'bigint', (col) => col.notNull())
    .addColumn('images', sql.raw('text[]'))
    .addColumn('venue_name', 'varchar(255)')
    .addColumn('venue_address', 'text')
    .addColumn('created_at', 'bigint', (col) =>
      col.defaultTo(sql`EXTRACT(EPOCH FROM NOW()) * 1000`).notNull(),
    )
    .addColumn('updated_at', 'bigint', (col) =>
      col.defaultTo(sql`EXTRACT(EPOCH FROM NOW()) * 1000`).notNull(),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('events').execute();
}
