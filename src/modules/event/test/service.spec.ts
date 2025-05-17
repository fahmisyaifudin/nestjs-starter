import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from '../service';
import { EventRepository } from '../repository';
import { factories } from '../factory';
import { Api } from '../schema';

describe('EventService', () => {
  let service: EventService;
  let eventRepository: EventRepository;

  const mockEventRepository = {
    getEventById: jest.fn(),
    getActiveEvents: jest.fn(),
    getEventForm: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: EventRepository,
          useValue: mockEventRepository,
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
});
