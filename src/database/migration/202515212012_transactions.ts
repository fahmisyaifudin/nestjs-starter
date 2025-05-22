import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType('transaction_status')
    .asEnum(['pending', 'paid', 'cancelled', 'expired'])
    .execute();

  // Create the transactions table
  await db.schema
    .createTable('transactions')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('event_id', 'uuid', (col) =>
      col.notNull().references('events.id'),
    )
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id'))
    .addColumn('status', sql`transaction_status`, (col) =>
      col.notNull().defaultTo('pending'),
    )
    .addColumn('amount', 'double precision', (col) => col.notNull())
    .addColumn('payment_reference', 'varchar(255)')
    .addColumn('payment_url', 'text')
    .addColumn('payment_expired_at', 'timestamp')
    .addColumn('created_at', 'bigint', (col) =>
      col.defaultTo(sql`EXTRACT(EPOCH FROM NOW()) * 1000`).notNull(),
    )
    .addColumn('updated_at', 'bigint', (col) =>
      col.defaultTo(sql`EXTRACT(EPOCH FROM NOW()) * 1000`).notNull(),
    )
    .execute();

  await db.schema
    .createIndex('idx_transactions_event_id')
    .on('transactions')
    .column('event_id')
    .execute();

  await db.schema
    .createIndex('idx_transactions_user_id')
    .on('transactions')
    .column('user_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('transactions').execute();
  await db.schema.dropType('transaction_status').execute();
}
