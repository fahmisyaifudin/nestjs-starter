import { faker } from '@faker-js/faker';
import { Entities } from 'src/database/schema';
import * as bcrypt from 'bcryptjs';

const userFactory = (
  overrides?: Entities['users']['update'],
): Entities['users']['insert'] => {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    password_hash: bcrypt.hashSync(faker.internet.password()),
    full_name: faker.person.fullName(),
    auth_provider: 'email',
    google_id: null,
    is_email_verified: false,
    email_verification_token: null,
    email_verification_expires_at: null,
    password_reset_token: null,
    password_reset_expires_at: null,
    created_at: Date.now(),
    updated_at: Date.now(),
    ...overrides,
  };
};

export const factories = {
  users: userFactory,
};
