import { Static, Type } from '@sinclair/typebox';
import { Insertable, Selectable, Updateable } from 'kysely';

export interface Database {
  users: UserTable;
}

export const UserSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
  password_hash: Type.String(),
  full_name: Type.String(),
  auth_provider: Type.Union([Type.Literal('email'), Type.Literal('google')]),
  google_id: Type.Union([Type.String(), Type.Null()]),
  is_email_verified: Type.Boolean(),
  email_verification_token: Type.Union([Type.String(), Type.Null()]),
  email_verification_expires_at: Type.Union([Type.Date(), Type.Null()]),
  password_reset_token: Type.Union([Type.String(), Type.Null()]),
  password_reset_expires_at: Type.Union([Type.Date(), Type.Null()]),
  created_at: Type.Date(),
  updated_at: Type.Date(),
});

export type UserTable = Static<typeof UserSchema>;

type Entity<T> = {
  table: T;
  select: Selectable<T>;
  insert: Insertable<T>;
  update: Updateable<T>;
};

export type Entities = {
  [Key in keyof Database]: Entity<Database[Key]>;
};
