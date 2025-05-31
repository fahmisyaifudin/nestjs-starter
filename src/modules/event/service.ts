/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Api } from './schema';
import { EventRepository } from './repository';
import { AuthService } from '../auth/service';
import { Entities } from 'src/database/schema';
import * as crypto from 'crypto';

@Injectable()
export class EventService {
  constructor(
    private eventRepo: EventRepository,
    private authService: AuthService,
  ) {}

  async get(query: Api['get']['query']): Promise<Api['get']['response']> {
    try {
      const events = await this.eventRepo.getActiveEvents({
        start: query.start_date,
        end: query.end_date,
        page: query.page,
        size: query.size,
      });

      return {
        events,
        pagination: {
          size: query.size ?? 10,
          page: query.page ?? 0,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async detail(
    params: Api['detail']['params'],
  ): Promise<Api['detail']['response']> {
    try {
      const event = await this.eventRepo.getEventById(params.id);
      if (!event) {
        throw new BadRequestException('Event id not found');
      }
      return {
        event,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
  async getForm(
    params: Api['form']['params'],
  ): Promise<Api['form']['response']> {
    try {
      const forms = await this.eventRepo.getEventForm(params.event_id);
      return {
        forms,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async register(
    event_id: string,
    body: Api['register']['body'],
  ): Promise<Api['register']['response']> {
    try {
      const db = this.eventRepo.getDB();
      const insertForm: Entities['event_form_tickets']['insert'][] = [];
      const ticket: Entities['tickets']['insert'][] = body.tickets.map(
        (ticket) => {
          const ticketId = crypto.randomUUID();
          const form: Entities['event_form_tickets']['insert'][] =
            ticket.forms.map((form) => ({
              ticket_id: ticketId,
              event_form_id: form.event_form_id,
              value: form.value,
            }));
          insertForm.push(...form);

          return {
            id: ticketId,
            name: ticket.name,
            email: ticket.email,
            event_ticket_id: ticket.event_ticket_id,
            code:
              Math.random().toString(36).substring(2, 7).toUpperCase() +
              Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, '0'),
          };
        },
      );
      const eventTickets = body.tickets.map((ticket) => ticket.event_ticket_id);
      const totalAmount = await this.eventRepo.getAmountOfTickets(eventTickets);

      const { insertedTicket, payment_url } = await db
        .transaction()
        .execute(async (trx) => {
          const user = await this.authService.createAnonymous(
            {
              email: body.email,
              full_name: body.name,
            },
            trx,
          );
          const insertedTicket = await this.eventRepo.storeTicket(ticket, trx);
          await this.eventRepo.storeTicketForm(insertForm, trx);
          const { payment_url } = await this.eventRepo.storeTransaction(
            {
              event_id,
              user_id: user.user.id,
              status: totalAmount > 0 ? 'pending' : 'success',
              amount: totalAmount,
              payment_url: '',
              payment_expired_at: totalAmount > 0 ? Date.now() + 900000 : null, // 15 minutes later
            },
            trx,
          );
          return { insertedTicket, payment_url };
        });

      return {
        tickets: insertedTicket,
        payment_url,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
