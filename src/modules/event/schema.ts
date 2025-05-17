import { Type, Static, TSchema } from '@sinclair/typebox';
import {
  EventSchema,
  EventFormSchema,
  EventTicketSchema,
  TicketSchema,
  EventFormTicketSchema,
} from '../../database/schema';

export const ApiSchema = {
  get: {
    query: Type.Object({
      start_date: Type.Optional(Type.Number()),
      end_date: Type.Optional(Type.Number()),
      page: Type.Optional(Type.Number()),
      size: Type.Optional(Type.Number()),
    }),
    response: Type.Object({
      events: Type.Array(EventSchema),
      pagination: Type.Object({
        page: Type.Number(),
        size: Type.Number(),
      }),
    }),
  },
  detail: {
    params: Type.Object({
      id: Type.String(),
    }),
    response: Type.Object({
      event: Type.Intersect([
        EventSchema,
        Type.Object({
          tickets: Type.Array(EventTicketSchema),
        }),
      ]),
    }),
  },
  form: {
    params: Type.Object({
      event_id: Type.String(),
    }),
    response: Type.Object({
      forms: Type.Array(EventFormSchema),
    }),
  },
  register: {
    body: Type.Object({
      email: Type.Optional(Type.String()),
      name: Type.Optional(Type.String()),
      tickets: Type.Array(
        Type.Intersect([
          Type.Pick(TicketSchema, ['email', 'name']),
          Type.Object({
            forms: Type.Array(
              Type.Pick(EventFormTicketSchema, ['event_form_id', 'value']),
            ),
          }),
        ]),
      ),
    }),
    response: Type.Object({
      tickets: Type.Array(TicketSchema),
      payment_url: Type.String(),
    }),
  },
};

type RecursiveStatic<Schemas> = {
  [Key in keyof Schemas]: Schemas[Key] extends TSchema
    ? ExpandDeep<Static<Schemas[Key]>>
    : RecursiveStatic<Schemas[Key]>;
};

type ExpandDeep<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandDeep<O[K]> }
    : never
  : T;

export type Api = RecursiveStatic<typeof ApiSchema>;
