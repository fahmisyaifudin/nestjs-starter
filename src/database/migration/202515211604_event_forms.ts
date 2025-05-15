import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType('form_datatype')
    .asEnum([
      'text',
      'number',
      'date',
      'datetime',
      'checkbox',
      'dropdown',
      'file',
    ])
    .execute();

  await db.schema
    .createTable('event_forms')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('event_id', 'uuid', (col) =>
      col.notNull().references('events.id'),
    )
    .addColumn('label', 'varchar(255)', (col) => col.notNull())
    .addColumn('datatype', sql.raw('form_datatype'), (col) => col.notNull())
    .addColumn('options', sql.raw('text[]'))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('event_forms').execute();
}
