import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from '../controller';
import { EventService } from '../service';
import { EventQuery, EventParams, EventFormParams } from '../schema';
import { factories } from '../factory';

describe('EventController', () => {
  let controller: EventController;
  let service: EventService;

  const mockEventService = {
    get: jest.fn(),
    detail: jest.fn(),
    getForm: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: mockEventService,
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
    service = module.get<EventService>(EventService);
  });

  describe('get', () => {
    it('should return active events', async () => {
      const query: EventQuery = {
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
      const params: EventParams = {
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
      const params: EventFormParams = {
        event_id: '1',
      };

      const expectedResult = factories.event_form({ event_id: '1' });

      mockEventService.getForm.mockResolvedValue({ forms: expectedResult });

      const result = await controller.getForm(params);

      expect(service.getForm).toHaveBeenCalledWith(params);
      expect(result.forms).toEqual(expectedResult);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
