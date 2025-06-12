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
  let userId: string;
  let eventId: string;

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

  beforeEach(async () => {
    await db.deleteFrom('transactions').execute();
    await db.deleteFrom('events').where('id', '=', eventId).execute();
    await db.deleteFrom('users').where('id', '=', userId).execute();
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
      eventId = event.id;

      const user = await db
        .insertInto('users')
        .values(authFactories.users())
        .returningAll()
        .executeTakeFirstOrThrow();
      userId = user.id;

      const mockTransaction = factories.transaction({
        event_id: event.id,
        user_id: user.id,
      });
      await db.insertInto('transactions').values(mockTransaction).execute();

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
      eventId = event.id;

      const user = await db
        .insertInto('users')
        .values(authFactories.users())
        .returningAll()
        .executeTakeFirstOrThrow();
      userId = user.id;

      const mockTransaction = factories.transaction({
        event_id: event.id,
        user_id: user.id,
      });
      await db.insertInto('transactions').values(mockTransaction).execute();

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
