import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('event_form_tickets')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('event_form_id', 'uuid', (col) =>
      col.notNull().references('event_forms.id'),
    )
    .addColumn('ticket_id', 'uuid', (col) =>
      col.notNull().references('tickets.id'),
    )
    .addColumn('value', 'text')
    .addColumn('created_at', 'bigint', (col) =>
      col.defaultTo(sql`EXTRACT(EPOCH FROM NOW()) * 1000`).notNull(),
    )
    .addColumn('updated_at', 'bigint', (col) =>
      col.defaultTo(sql`EXTRACT(EPOCH FROM NOW()) * 1000`).notNull(),
    )
    .execute();

  await db.schema
    .createIndex('idx_event_form_ticket_form_id')
    .on('event_form_tickets')
    .column('event_form_id')
    .execute();

  await db.schema
    .createIndex('idx_event_form_ticket_ticket_id')
    .on('event_form_tickets')
    .column('ticket_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('event_form_tickets').execute();
}
