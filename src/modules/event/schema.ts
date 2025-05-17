import { Type, Static } from '@sinclair/typebox';
import {
  EventSchema,
  EventFormSchema,
  EventTicketSchema,
} from '../../database/schema';

export const EventQuerySchema = Type.Object({
  start_date: Type.Optional(Type.Number()),
  end_date: Type.Optional(Type.Number()),
  page: Type.Optional(Type.Number()),
  size: Type.Optional(Type.Number()),
});

export const EventParamsSchema = Type.Object({
  id: Type.String(),
});

export const EventResponseSchema = Type.Object({
  events: Type.Array(EventSchema),
  pagination: Type.Object({
    page: Type.Number(),
    size: Type.Number(),
  }),
});

export const EventFormParamsSchema = Type.Object({
  event_id: Type.String(),
});

export const EventFormResponseSchema = Type.Object({
  forms: Type.Array(EventFormSchema),
});

export const EventSingleResponseSchema = Type.Object({
  event: Type.Intersect([
    EventSchema,
    Type.Object({
      tickets: Type.Array(EventTicketSchema),
    }),
  ]),
});

export type EventQuery = Static<typeof EventQuerySchema>;
export type EventResponse = Static<typeof EventResponseSchema>;
export type EventSingleResponse = Static<typeof EventSingleResponseSchema>;
export type EventFormResponse = Static<typeof EventFormResponseSchema>;
export type EventParams = Static<typeof EventParamsSchema>;
export type EventFormParams = Static<typeof EventFormParamsSchema>;
