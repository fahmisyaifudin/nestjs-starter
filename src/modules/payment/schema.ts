import { Type, Static, TSchema } from '@sinclair/typebox';
import { TransactionSchema } from 'src/database/schema';

export const QrCodeCreatedSchema = Type.Object({
  id: Type.String(),
  reference_id: Type.String(),
  business_id: Type.String(),
  type: Type.String(),
  currency: Type.String(),
  amount: Type.Number(),
  channel_code: Type.String(),
  status: Type.String(),
  qr_string: Type.String(),
  expires_at: Type.String(),
  created: Type.String(),
  updated: Type.String(),
});

export const QrCodeSimulatedPaymentSchema = Type.Object({
  id: Type.String(),
  business_id: Type.String(),
  currency: Type.String(),
  amount: Type.Number(),
  status: Type.String(),
  created: Type.String(),
  qr_id: Type.String(),
  qr_string: Type.String(),
});

export const ApiSchema = {
  simulate: {
    params: Type.Object({
      id: Type.String(),
    }),
    response: Type.Object({
      payment: QrCodeSimulatedPaymentSchema,
    }),
  },
  callback: {
    headers: Type.Object({
      'x-callback-token': Type.String(),
      'webhook-id': Type.String(),
    }),
    body: Type.Object({
      data: QrCodeSimulatedPaymentSchema,
    }),
    response: Type.Object({
      transaction: TransactionSchema,
    }),
  },
};

export type QrCodeCreated = Static<typeof QrCodeCreatedSchema>;
export type QrCodeSimulatedPayment = Static<
  typeof QrCodeSimulatedPaymentSchema
>;

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
