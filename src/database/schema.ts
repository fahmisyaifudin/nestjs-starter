import { Static, Type } from '@sinclair/typebox';
import { Insertable, Selectable, Updateable } from 'kysely';

export interface Database {
  users: UserTable;
  events: EventTable;
  event_forms: EventFormTable;
  event_tickets: EventTicketTable;
  tickets: TicketTable;
  event_form_ticket: EventFormTicketTable;
  transactions: TransactionTable;
}

export const UserSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
  password_hash: Type.String(),
  full_name: Type.String(),
  auth_provider: Type.Union([
    Type.Literal('email'),
    Type.Literal('google'),
    Type.Literal('anonymous'),
  ]),
  google_id: Type.Union([Type.String(), Type.Null()]),
  is_email_verified: Type.Boolean(),
  email_verification_token: Type.Union([Type.String(), Type.Null()]),
  email_verification_expires_at: Type.Union([Type.Number(), Type.Null()]),
  password_reset_token: Type.Union([Type.String(), Type.Null()]),
  password_reset_expires_at: Type.Union([Type.Number(), Type.Null()]),
  created_at: Type.Number(),
  updated_at: Type.Number(),
});

export const EventSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  start_date: Type.Number(),
  end_date: Type.Number(),
  images: Type.Array(Type.String()),
  venue_name: Type.Union([Type.String(), Type.Null()]),
  venue_address: Type.Union([Type.String(), Type.Null()]),
  created_at: Type.Number(),
  updated_at: Type.Number(),
});

export const EventFormSchema = Type.Object({
  id: Type.String(),
  event_id: Type.String(),
  label: Type.String(),
  datatype: Type.Union([
    Type.Literal('text'),
    Type.Literal('number'),
    Type.Literal('date'),
    Type.Literal('datetime'),
    Type.Literal('checkbox'),
    Type.Literal('dropdown'),
    Type.Literal('file'),
  ]),
  options: Type.Union([Type.Array(Type.String()), Type.Null()]),
});

export const EventTicketSchema = Type.Object({
  id: Type.String(),
  event_id: Type.String(),
  name: Type.String(),
  price: Type.Number(),
  quota: Type.Number(),
  start_date: Type.Number(),
  end_date: Type.Number(),
  created_at: Type.Number(),
  updated_at: Type.Number(),
});

export const TicketSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.String(),
  code: Type.String(),
  event_ticket_id: Type.String(),
  created_at: Type.Number(),
  updated_at: Type.Number(),
});

export const EventFormTicketSchema = Type.Object({
  id: Type.String(),
  event_form_id: Type.String(),
  ticket_id: Type.String(),
  value: Type.Union([Type.String(), Type.Null()]),
  created_at: Type.Number(),
  updated_at: Type.Number(),
});

export const TransactionSchema = Type.Object({
  id: Type.String(),
  event_id: Type.String(),
  user_id: Type.String(),
  status: Type.Union([
    Type.Literal('pending'),
    Type.Literal('success'),
    Type.Literal('failed'),
    Type.Literal('expired'),
  ]),
  amount: Type.Number(),
  payment_reference: Type.Union([Type.String(), Type.Null()]),
  payment_url: Type.Union([Type.String(), Type.Null()]),
  payment_expired_at: Type.Union([Type.Number(), Type.Null()]),
  created_at: Type.Number(),
  updated_at: Type.Number(),
});

export type UserTable = Static<typeof UserSchema>;
export type EventTable = Static<typeof EventSchema>;
export type EventFormTable = Static<typeof EventFormSchema>;
export type EventTicketTable = Static<typeof EventTicketSchema>;
export type TicketTable = Static<typeof TicketSchema>;
export type EventFormTicketTable = Static<typeof EventFormTicketSchema>;
export type TransactionTable = Static<typeof TransactionSchema>;

type Entity<T> = {
  table: T;
  select: Selectable<T>;
  insert: Insertable<T>;
  update: Updateable<T>;
};

export type Entities = {
  [Key in keyof Database]: Entity<Database[Key]>;
};
