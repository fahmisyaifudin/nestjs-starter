import { PaymentRepository } from '../repository';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from 'src/database/schema';
import 'dotenv/config';
import { factories } from '../factory';
import { factories as eventFactories } from '../../event/factory';
import { factories as authFactories } from '../../auth/factory';
import { Pool } from 'pg';
import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';

describe('PaymentRepository', () => {
  let paymentRepository: PaymentRepository;
  let db: Kysely<Database>;

  beforeAll(async () => {
    const mockHttpService = {
      post: jest.fn(),
    };
    db = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool: new Pool({
          connectionString: process.env['DATABASE_URL'],
        }),
      }),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        PaymentRepository,
        {
          provide: 'Kysely',
          useValue: db,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    paymentRepository = moduleRef.get<PaymentRepository>(PaymentRepository);
  });

  afterEach(async () => {
    await db.deleteFrom('transactions').execute();
    await db.deleteFrom('event_form_tickets').execute();
    await db.deleteFrom('tickets').execute();
    await db.deleteFrom('event_tickets').execute();
    await db.deleteFrom('event_forms').execute();
    await db.deleteFrom('events').execute();
    await db.deleteFrom('users').execute();
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('getTransactionPayment', () => {
    it('should return transaction payment details', async () => {
      const event = await db
        .insertInto('events')
        .values(eventFactories.events())
        .returningAll()
        .executeTakeFirstOrThrow();

      const user = await db
        .insertInto('users')
        .values(authFactories.users())
        .returningAll()
        .executeTakeFirstOrThrow();

      const mockTransaction = await db
        .insertInto('transactions')
        .values(
          factories.transaction({
            event_id: event.id,
            user_id: user.id,
          }),
        )
        .returningAll()
        .executeTakeFirstOrThrow();

      const result = await paymentRepository.getTransactionPayment(
        mockTransaction.payment_reference,
      );
      expect(result.id).toEqual(mockTransaction.id);
      expect(result.event_id).toEqual(event.id);
      expect(result.user_id).toEqual(user.id);
      expect(result.payment_reference).toEqual(
        mockTransaction.payment_reference,
      );
    });

    it('should return null if transaction not found', async () => {
      const result = await paymentRepository.getTransactionPayment('999');
      expect(result).toBeUndefined();
    });
  });

  describe('updateTransactionStatus', () => {
    it('should update transaction status successfully', async () => {
      const event = await db
        .insertInto('events')
        .values(eventFactories.events())
        .returningAll()
        .executeTakeFirstOrThrow();
      const user = await db
        .insertInto('users')
        .values(authFactories.users())
        .returningAll()
        .executeTakeFirstOrThrow();

      const mockTransaction = await db
        .insertInto('transactions')
        .values(
          factories.transaction({
            event_id: event.id,
            user_id: user.id,
          }),
        )
        .returningAll()
        .executeTakeFirstOrThrow();

      const result = await paymentRepository.updateTransactionStatus(
        mockTransaction.id,
        'success',
      );

      expect(result.status).toEqual('success');

      const updatedTransaction = await paymentRepository.getTransactionPayment(
        mockTransaction.payment_reference,
      );
      expect(updatedTransaction.status).toBe('success');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
