import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('event_tickets')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('event_id', 'uuid', (col) =>
      col.notNull().references('events.id'),
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('price', 'double precision', (col) => col.notNull())
    .addColumn('quota', 'integer', (col) => col.notNull())
    .addColumn('start_date', 'bigint', (col) => col.notNull())
    .addColumn('end_date', 'bigint', (col) => col.notNull())
    .addColumn('created_at', 'bigint', (col) =>
      col.defaultTo(sql`EXTRACT(EPOCH FROM NOW()) * 1000`).notNull(),
    )
    .addColumn('updated_at', 'bigint', (col) =>
      col.defaultTo(sql`EXTRACT(EPOCH FROM NOW()) * 1000`).notNull(),
    )
    .execute();

  await db.schema
    .createIndex('idx_event_tickets_event_id')
    .on('event_tickets')
    .column('event_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('idx_event_tickets_event_id').execute();

  await db.schema.dropTable('event_tickets').execute();
}
