import { faker } from '@faker-js/faker';
import { Entities } from 'src/database/schema';

const eventFactory = (): Entities['events']['insert'] => {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    start_date: new Date().getTime() - 24 * 60 * 60 * 1000,
    end_date: new Date().getTime() + 24 * 60 * 60 * 1000,
    images: [faker.image.url(), faker.image.url()],
    venue_name: faker.location.city(),
    venue_address: faker.location.streetAddress(),
  };
};

const eventFormFactory = (overrides: {
  event_id: string;
}): Entities['event_forms']['insert'] => {
  const datatype = faker.helpers.arrayElement([
    'text',
    'number',
    'date',
    'datetime',
    'checkbox',
    'dropdown',
    'file',
  ]);
  return {
    id: faker.string.uuid(),
    event_id: overrides.event_id,
    label: faker.lorem.words(),
    datatype,
    options:
      datatype == 'dropdown'
        ? Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () =>
            faker.lorem.word(),
          )
        : null,
  };
};

const eventTicketFactory = (overrides: {
  event_id: string;
}): Entities['event_tickets']['insert'] => {
  return {
    id: faker.string.uuid(),
    event_id: overrides.event_id,
    name: faker.lorem.words(),
    price: faker.number.int({ min: 10000, max: 100000 }),
    quota: faker.number.int({ min: 1, max: 100 }),
    start_date: new Date().getTime() - 24 * 60 * 60 * 1000,
    end_date: new Date().getTime() + 24 * 60 * 60 * 1000,
  };
};

const ticketsFactory = (): Entities['tickets']['insert'] => {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.exampleEmail(),
    code: faker.string.alphanumeric({
      casing: 'upper',
      length: { min: 10, max: 10 },
    }),
  };
};

const eventFormTicketFactory = (
  overrides: Entities['event_form_ticket']['update'],
): Entities['event_form_ticket']['insert'] => {
  return {
    event_form_id: faker.string.uuid(),
    ticket_id: faker.string.uuid(),
    value: null,
    ...overrides,
  };
};

const transactionFactory = (
  overrides: Entities['transactions']['update'],
): Entities['transactions']['insert'] => {
  return {
    id: faker.string.uuid(),
    event_id: faker.string.uuid(),
    created_at: new Date().getTime(),
    updated_at: new Date().getTime(),
    user_id: faker.string.uuid(),
    status: 'pending',
    amount: faker.number.int({ min: 10000, max: 1000000 }),
    payment_reference: faker.string.alphanumeric({ length: 16 }),
    payment_url: faker.internet.url(),
    payment_expired_at: new Date().getTime() + 24 * 60 * 60 * 1000,
    ...overrides,
  };
};

export const factories = {
  events: eventFactory,
  event_form: eventFormFactory,
  event_ticket: eventTicketFactory,
  tickets: ticketsFactory,
  event_form_ticket: eventFormTicketFactory,
  transaction: transactionFactory,
};
