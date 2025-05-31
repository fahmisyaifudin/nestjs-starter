import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from '../controller';
import { EventService } from '../service';
import { Api } from '../schema';
import { factories } from '../factory';
import { AuthService } from '../../auth/service';

describe('EventController', () => {
  let controller: EventController;
  let service: EventService;

  const mockEventService = {
    get: jest.fn(),
    detail: jest.fn(),
    getForm: jest.fn(),
    register: jest.fn(),
  };

  const mockAuthService = {
    createAnonymous: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: mockEventService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
    service = module.get<EventService>(EventService);
  });

  describe('get', () => {
    it('should return active events', async () => {
      const query: Api['get']['query'] = {
        start_date: 0,
        end_date: new Date().getTime(),
        page: 1,
        size: 10,
      };

      const expectedResult = Array(3)
        .fill(null)
        .map(() => factories.events());

      mockEventService.get.mockResolvedValue({
        events: expectedResult,
        pagination: { page: 1, size: 10 },
      });
      const result = await controller.get(query);

      expect(service.get).toHaveBeenCalledWith(query);
      expect(result.events).toEqual(expectedResult);
    });
  });

  describe('detail', () => {
    it('should return event detail', async () => {
      const params: Api['detail']['params'] = {
        id: '1',
      };

      const expectedResult = factories.events();

      mockEventService.detail.mockResolvedValue({ event: expectedResult });

      const result = await controller.detail(params);

      expect(service.detail).toHaveBeenCalledWith(params);
      expect(result.event).toEqual(expectedResult);
    });
  });

  describe('getForm', () => {
    it('should return event forms', async () => {
      const params: Api['form']['params'] = {
        event_id: '1',
      };

      const expectedResult = factories.event_form({ event_id: '1' });

      mockEventService.getForm.mockResolvedValue({ forms: expectedResult });

      const result = await controller.getForm(params);

      expect(service.getForm).toHaveBeenCalledWith(params);
      expect(result.forms).toEqual(expectedResult);
    });
  });

  describe('register', () => {
    const mockEventId = 'test-event-id-123';
    const mockRequestBody: Api['register']['body'] = {
      email: 'test@example.com',
      name: 'Test User',
      tickets: [
        {
          event_ticket_id: 'tkt_001',
          name: 'Attendee One',
          email: 'attendee1@example.com',
          forms: [{ event_form_id: 'form_a', value: 'value_a' }],
        },
      ],
    };

    const mockServiceResult: Api['register']['response'] = {
      tickets: [
        {
          id: 'ticket-uuid-1',
          code: 'ABCDE1234',
          name: 'Attendee One',
          email: '',
          event_ticket_id: 'tkt_001',
          created_at: new Date().getTime(),
          updated_at: new Date().getTime(),
        },
      ],
      payment_url: 'http://mock.payment.url/checkout',
    };

    beforeEach(() => {
      mockEventService.register.mockResolvedValue(mockServiceResult);
      mockAuthService.createAnonymous.mockResolvedValue({
        user: { id: 'mock-user-uuid-1' },
      });
    });

    it('should call eventService.register with correct params and body and return its result', async () => {
      const mockParams: Api['register']['params'] = { event_id: mockEventId };
      const result = await controller.register(mockParams, mockRequestBody);

      expect(mockEventService.register).toHaveBeenCalledTimes(1);
      expect(mockEventService.register).toHaveBeenCalledWith(
        mockEventId,
        mockRequestBody,
      );

      expect(result).toEqual(mockServiceResult);
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
});
