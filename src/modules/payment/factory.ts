import { faker } from '@faker-js/faker';
import { QrCodeCreated, QrCodeSimulatedPayment } from './schema';
import { TransactionTable } from 'src/database/schema';

const qrCodeCreatedFactory = (
  overrides?: Partial<QrCodeCreated>,
): QrCodeCreated => {
  const defaultValues: QrCodeCreated = {
    reference_id: `test-qr-${faker.number.int()}-${faker.string.alphanumeric(8)}`,
    type: 'DYNAMIC',
    currency: 'IDR',
    channel_code: 'ID_XENDIT',
    amount: faker.number.int({ min: 1000, max: 1000000 }),
    expires_at: faker.date.future().toISOString(),
    business_id: faker.string.hexadecimal({ length: 24 }),
    id: `qr_${faker.string.uuid()}`,
    created: faker.date.recent().toISOString(),
    updated: faker.date.recent().toISOString(),
    qr_string: faker.string.alphanumeric(32),
    status: 'ACTIVE',
  };

  return {
    ...defaultValues,
    ...overrides,
  };
};

const qrCodeSimulatedFactory = (
  overrides?: Partial<QrCodeSimulatedPayment>,
): QrCodeSimulatedPayment => {
  const defaultValues = {
    id: `sim_${faker.string.uuid()}`,
    business_id: faker.string.hexadecimal({ length: 24 }),
    currency: 'IDR',
    amount: faker.number.int({ min: 1000, max: 1000000 }),
    status: 'COMPLETED',
    created: faker.date.recent().toISOString(),
    qr_id: `qr_${faker.string.uuid()}`,
    qr_string: faker.string.alphanumeric(32),
  };

  return {
    ...defaultValues,
    ...overrides,
  };
};

const transactionFactory = (
  overrides?: Partial<TransactionTable>,
): TransactionTable => {
  return {
    id: faker.string.uuid(),
    event_id: faker.string.uuid(),
    user_id: faker.string.uuid(),
    status: 'success' as TransactionTable['status'],
    amount: faker.number.int({ min: 1000, max: 1000000 }),
    payment_reference: faker.string.alphanumeric(16),
    payment_url: faker.internet.url(),
    payment_expired_at: faker.date.future().getTime(),
    created_at: faker.date.past().getTime(),
    updated_at: faker.date.recent().getTime(),
    ...overrides,
  };
};

export const factories = {
  qrCodeCreated: qrCodeCreatedFactory,
  qrCodeSimulated: qrCodeSimulatedFactory,
  transaction: transactionFactory,
};
