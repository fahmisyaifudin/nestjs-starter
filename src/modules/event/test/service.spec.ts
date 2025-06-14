import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from '../service';
import { EventRepository } from '../repository';
import { factories } from '../factory';
import { Api } from '../schema';
import { AuthService } from '../../auth/service';
import { InternalServerErrorException } from '@nestjs/common';
import { PaymentRepository } from '../../payment/repository';

describe('EventService', () => {
  let service: EventService;
  let eventRepository: EventRepository;

  const mockEventRepository = {
    getEventById: jest.fn(),
    getActiveEvents: jest.fn(),
    getEventForm: jest.fn(),
    getDB: jest.fn(() => ({
      transaction: jest.fn(() => mockDbTransaction),
    })),
    getAmountOfTickets: jest.fn(),
    storeTicket: jest.fn(),
    storeTicketForm: jest.fn(),
    storeTransaction: jest.fn(),
  };

  const mockDbTransaction = {
    execute: jest.fn(async (callback) => {
      const mockTrx = {};
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await callback(mockTrx);
    }),
  };

  const mockAuthService = {
    createAnonymous: jest.fn(),
  };

  const mockPaymentRepository = {
    createQr: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: EventRepository,
          useValue: mockEventRepository,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: PaymentRepository,
          useValue: mockPaymentRepository,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    eventRepository = module.get<EventRepository>(EventRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get events', () => {
    const mockEvents = Array(5)
      .fill(null)
      .map(() => factories.events());

    it('should successfully get event', async () => {
      // Arrange
      mockEventRepository.getActiveEvents.mockResolvedValue(mockEvents);
      const query: Api['get']['query'] = {
        start_date: 0,
        end_date: new Date().getTime(),
        page: 1,
        size: 10,
      };
      // Act
      const result = await service.get(query);

      // Assert
      expect(eventRepository.getActiveEvents).toHaveBeenCalledWith({
        start: query.start_date,
        end: query.end_date,
        page: query.page,
        size: query.size,
      });

      expect(result.events).toEqual(mockEvents);
      expect(result.pagination).toEqual({ page: query.page, size: query.size });
    });
    it('should succesfully get detail event detail wrong id', async () => {
      // Arrange
      mockEventRepository.getEventById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.detail({ id: '1' })).rejects.toThrow(
        'Event id not found',
      );
      expect(eventRepository.getEventById).toHaveBeenCalledWith('1');
    });

    it('should successfully get detail event detail', async () => {
      // Arrange
      const mockEvent = factories.events();
      const mockEventTickets = Array(3)
        .fill(null)
        .map(() => factories.event_ticket({ event_id: mockEvent.id }));

      mockEventRepository.getEventById.mockResolvedValue({
        ...mockEvent,
        tickets: mockEventTickets,
      });

      // Act
      const result = await service.detail({ id: '1' });

      // Assert
      expect(eventRepository.getEventById).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        event: {
          ...mockEvent,
          tickets: mockEventTickets,
        },
      });
    });

    it('should successfully get event forms', async () => {
      // Arrange
      const mockForms = Array(3)
        .fill(null)
        .map(() => factories.event_form({ event_id: '1' }));
      mockEventRepository.getEventForm.mockResolvedValue(mockForms);

      // Act
      const result = await service.getForm({ event_id: '1' });

      // Assert
      expect(eventRepository.getEventForm).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        forms: mockForms,
      });
    });

    it('should successfully get event from with wrong event id', async () => {
      // Arrange
      mockEventRepository.getEventForm.mockResolvedValue([]);

      const result = await service.getForm({ event_id: '999' });
      // Act & Assert
      expect(result).toEqual({ forms: [] });
      expect(eventRepository.getEventForm).toHaveBeenCalledWith('999');
    });
  });

  describe('register', () => {
    const mockApiRegisterBody: Api['register']['body'] = {
      email: 'test@example.com',
      name: 'John Doe',
      tickets: [
        {
          event_ticket_id: 'evt_tkt_1',
          name: 'Attendee 1',
          email: 'attendee1@example.com',
          forms: [
            { event_form_id: 'form_1', value: 'value_1' },
            { event_form_id: 'form_2', value: 'value_2' },
          ],
        },
        {
          event_ticket_id: 'evt_tkt_2',
          name: 'Attendee 2',
          email: 'attendee2@example.com',
          forms: [{ event_form_id: 'form_3', value: 'value_3' }],
        },
      ],
    };

    const mockUserUUID = 'user-uuid-1';
    const mockPaymentUrl = 'http://mock-payment-url.com';
    const mockEventId = 'event-id-1';
    beforeEach(() => {
      mockEventRepository.getAmountOfTickets.mockResolvedValue(10000);

      mockAuthService.createAnonymous.mockResolvedValue({
        user: { id: mockUserUUID },
      });

      mockEventRepository.storeTicket.mockResolvedValue([
        { id: expect.any(String), code: expect.any(String) },
        { id: expect.any(String), code: expect.any(String) },
      ]);
      mockPaymentRepository.createQr.mockResolvedValue({
        id: mockPaymentUrl,
      });

      mockEventRepository.storeTicketForm.mockResolvedValue({});
      mockEventRepository.storeTransaction.mockResolvedValue({
        payment_url: mockPaymentUrl,
      });
    });
    it('should successfully register tickets and return payment URL for pending payment', async () => {
      const result = await service.register(mockEventId, mockApiRegisterBody);

      expect(mockEventRepository.getAmountOfTickets).toHaveBeenCalledWith([
        'evt_tkt_1',
        'evt_tkt_2',
      ]);

      expect(mockEventRepository.getDB).toHaveBeenCalled();

      expect(mockAuthService.createAnonymous).toHaveBeenCalledWith(
        {
          email: mockApiRegisterBody.email,
          full_name: mockApiRegisterBody.name,
        },
        {},
      );

      expect(mockEventRepository.storeTicket).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: mockApiRegisterBody.tickets[0].name,
            email: mockApiRegisterBody.tickets[0].email,
            event_ticket_id: mockApiRegisterBody.tickets[0].event_ticket_id,
            code: expect.any(String),
          }),
          expect.objectContaining({
            id: expect.any(String),
            name: mockApiRegisterBody.tickets[1].name,
            email: mockApiRegisterBody.tickets[1].email,
            event_ticket_id: mockApiRegisterBody.tickets[1].event_ticket_id,
            code: expect.any(String),
          }),
        ]),
        {},
      );

      expect(mockEventRepository.storeTicketForm).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            ticket_id: expect.any(String),
            event_form_id: 'form_1',
            value: 'value_1',
          }),
          expect.objectContaining({
            ticket_id: expect.any(String),
            event_form_id: 'form_2',
            value: 'value_2',
          }),
          expect.objectContaining({
            ticket_id: expect.any(String),
            event_form_id: 'form_3',
            value: 'value_3',
          }),
        ]),
        {},
      );

      expect(mockEventRepository.storeTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          event_id: mockEventId,
          user_id: mockUserUUID,
          status: 'pending',
          amount: 10000,
          payment_url: mockPaymentUrl,
          payment_expired_at: expect.any(Number),
        }),
        {},
      );

      expect(result).toEqual({
        tickets: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            code: expect.any(String),
          }),
          expect.objectContaining({
            id: expect.any(String),
            code: expect.any(String),
          }),
        ]),
        payment_url: mockPaymentUrl,
      });
    });

    it('should successfully register tickets and return no payment URL for free event', async () => {
      mockEventRepository.getAmountOfTickets.mockResolvedValue(0);

      mockEventRepository.storeTransaction.mockResolvedValue({
        payment_url: '',
      });

      const result = await service.register(mockEventId, mockApiRegisterBody);

      expect(mockEventRepository.storeTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          amount: 0,
          payment_expired_at: null,
        }),
        {},
      );

      expect(result).toEqual({
        tickets: expect.any(Array),
        payment_url: '',
      });
    });
    it('should throw InternalServerErrorException if any operation fails', async () => {
      mockAuthService.createAnonymous.mockRejectedValue(
        new Error('Auth error'),
      );

      await expect(
        service.register(mockEventId, mockApiRegisterBody),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.register(mockEventId, mockApiRegisterBody),
      ).rejects.toThrow('Auth error');
    });
  });
});
