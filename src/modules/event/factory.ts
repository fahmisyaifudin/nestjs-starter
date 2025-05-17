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

export const factories = {
  events: eventFactory,
  event_form: eventFormFactory,
  event_ticket: eventTicketFactory,
};
