import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { loginAs, pgConnection } from './lib';
import { factories } from '../src/modules/event/factory';
import { Api } from 'src/modules/event/schema';

describe('Get Event Module (e2e)', () => {
  let app: INestApplication<App>;
  const db = pgConnection;
  let token: string;
  let event_id: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    token = await loginAs('admin@medayoh.id');
    const event = await db
      .selectFrom('events')
      .limit(1)
      .select('id')
      .executeTakeFirstOrThrow();
    event_id = event.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /event', async () => {
    const get = await request(app.getHttpServer())
      .get('/event')
      .set('Authorization', `Bearer ${token}`);

    console.debug(JSON.stringify(get.body));

    expect(get.statusCode).toBe(200);
  });
  it('GET /event/:id', async () => {
    const get = await request(app.getHttpServer())
      .get(`/event/${event_id}`)
      .set('Authorization', `Bearer ${token}`);

    console.debug(JSON.stringify(get.body));
    expect(get.statusCode).toBe(200);
  });
  it('GET /event/:id/form', async () => {
    const get = await request(app.getHttpServer())
      .get(`/event/${event_id}/form`)
      .set('Authorization', `Bearer ${token}`);

    console.debug(JSON.stringify(get.body));
    expect(get.statusCode).toBe(200);
  });
});

describe('Register Event Module (e2e)', () => {
  let app: INestApplication<App>;
  const db = pgConnection;
  let event: { id: string };
  let eventForm: { id: string }[];
  let eventTicket: { id: string };
  const userEmail = 'main.registrant@example.com';

  beforeAll(async () => {
    //seed data
    event = await db
      .insertInto('events')
      .values(factories.events())
      .returning('id')
      .executeTakeFirstOrThrow();

    // Seed ticket form
    eventForm = await db
      .insertInto('event_forms')
      .values(
        Array(2)
          .fill(null)
          .map(() =>
            factories.event_form({
              event_id: event.id,
              datatype: 'text',
              options: null,
            }),
          ),
      )
      .returning('id')
      .execute();

    eventTicket = await db
      .insertInto('event_tickets')
      .values(factories.event_ticket({ event_id: event.id, price: 10000 }))
      .returning('id')
      .executeTakeFirstOrThrow();

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await db
      .deleteFrom('transactions')
      .where('user_id', 'in', (qb) =>
        qb.selectFrom('users').where('email', '=', userEmail).select('id'),
      )
      .execute();

    await db
      .deleteFrom('event_form_tickets')
      .where(
        'event_form_id',
        'in',
        eventForm.map((x) => x.id),
      )
      .execute();

    await db
      .deleteFrom('tickets')
      .where('event_ticket_id', '=', eventTicket.id)
      .execute();

    await db
      .deleteFrom('event_tickets')
      .where('id', '=', eventTicket.id)
      .execute();
    await db
      .deleteFrom('event_forms')
      .where(
        'id',
        'in',
        eventForm.map((x) => x.id),
      )
      .execute();
    await db.deleteFrom('events').where('id', '=', event.id).execute();
    await db.deleteFrom('users').where('email', '=', userEmail).execute();
    await app.close();
  });
  it('POST /event/:id/register', async () => {
    const requestBody: Api['register']['body'] = {
      email: userEmail,
      name: 'Main Registrant',
      tickets: [
        {
          email: 'attendee1@example.com',
          name: 'Attendee One',
          event_ticket_id: eventTicket.id,
          forms: [
            { event_form_id: eventForm[0].id, value: 'Value for Form 1' },
            { event_form_id: eventForm[1].id, value: 'Value for Form 2' },
          ],
        },
      ],
    };

    await request(app.getHttpServer())
      .post(`/event/${event.id}/register`)
      .send(requestBody)
      .expect(201);

    const checkUser = await db
      .selectFrom('users')
      .where('email', '=', userEmail)
      .selectAll()
      .executeTakeFirst();
    expect(checkUser).toBeDefined();

    const checkTicket = await db
      .selectFrom('tickets')
      .where('email', '=', requestBody.tickets[0].email)
      .selectAll()
      .executeTakeFirst();
    expect(checkTicket).toBeDefined();

    const checkForm = await db
      .selectFrom('event_form_tickets')
      .where('ticket_id', '=', checkTicket.id)
      .selectAll()
      .execute();
    expect(checkForm).toHaveLength(2);

    const checkTransaction = await db
      .selectFrom('transactions')
      .where('user_id', '=', checkUser.id)
      .selectAll()
      .executeTakeFirst();
    expect(checkTransaction).toBeDefined();
    expect(checkTransaction.amount).toBe(10000);
  });
});
