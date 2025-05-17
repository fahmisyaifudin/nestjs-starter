import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
} from 'src/modules/auth/schema';
import { pgConnection } from './lib';

describe('Auth Module (e2e)', () => {
  let app: INestApplication<App>;
  const db = pgConnection;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await db.destroy();
    await app.close();
  });

  it('POST /auth/login', async () => {
    const login: LoginRequest = {
      email: 'admin@medayoh.id',
      password: 'Password123',
    };

    const post = await request(app.getHttpServer())
      .post('/auth/login')
      .send(login);

    console.debug(post.body);
    expect(post.statusCode).toBe(200);
  });

  it('POST /auth/register', async () => {
    const register: RegisterRequest = {
      email: 'test@example.com',
      password: 'Password123',
      full_name: 'Test User',
    };

    const post = await request(app.getHttpServer())
      .post('/auth/register')
      .send(register);

    console.debug(post.body);
    expect(post.statusCode).toBe(201);

    const postBody: RegisterResponse = post.body;
    await db.deleteFrom('users').where('id', '=', postBody.user.id).execute();
  });
});
