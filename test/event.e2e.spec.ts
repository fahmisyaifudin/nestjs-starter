import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { loginAs, pgConnection } from './lib';

describe('Event Module (e2e)', () => {
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
    await db.destroy();
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
