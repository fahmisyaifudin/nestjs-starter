import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType('auth_provider')
    .asEnum(['google', 'email', 'anonymous'])
    .execute();

  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('password_hash', 'varchar(255)')
    .addColumn('full_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('auth_provider', sql`auth_provider`, (col) =>
      col.notNull().defaultTo('email'),
    )
    .addColumn('google_id', 'varchar(255)')
    .addColumn('is_email_verified', 'boolean', (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn('email_verification_token', 'varchar(255)')
    .addColumn('email_verification_expires_at', 'bigint')
    .addColumn('password_reset_token', 'varchar(255)')
    .addColumn('password_reset_expires_at', 'bigint')
    .addColumn('created_at', 'bigint', (col) =>
      col.defaultTo(sql`EXTRACT(EPOCH FROM NOW()) * 1000`).notNull(),
    )
    .addColumn('updated_at', 'bigint', (col) =>
      col.defaultTo(sql`EXTRACT(EPOCH FROM NOW()) * 1000`).notNull(),
    )
    .execute();

  await db.schema
    .createIndex('idx_users_email')
    .on('users')
    .column('email')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users').execute();
  await db.schema.dropType('auth_provider').execute();
}
