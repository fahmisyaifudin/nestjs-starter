import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Database, Entities } from 'src/database/schema';

@Injectable()
export class UserRepository {
  constructor(@Inject('Kysely') private db: Kysely<Database>) {}

  async getByEmail(email: string): Promise<Database['users']> {
    return this.db
      .selectFrom('users')
      .where('email', '=', email)
      .selectAll()
      .executeTakeFirst();
  }

  async create(
    payload: Entities['users']['insert'],
  ): Promise<Database['users']> {
    return this.db
      .insertInto('users')
      .values({
        email: payload.email,
        full_name: payload.full_name,
        password_hash: payload.password_hash,
        is_email_verified: payload.is_email_verified,
        email_verification_token: payload.email_verification_token,
        email_verification_expires_at: payload.email_verification_expires_at,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}
