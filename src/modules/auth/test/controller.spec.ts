import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../controller';
import { AuthService } from '../service';
import { LoginRequest } from '../schema';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call authService.login with correct parameters', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = {
        token: 'fake-token',
        user: { id: 'xx', email: 'example@mail.com', full_name: 'John Doe' },
      };
      mockAuthService.login.mockResolvedValue(expectedResult);
      const result = await controller.login(loginRequest);

      expect(service.login).toHaveBeenCalledWith(loginRequest);
      expect(result).toBe(expectedResult);
      expect(service.login).toHaveBeenCalledTimes(1);
    });
  });
  describe('register', () => {
    it('should call authService.register with correct parameters', async () => {
      const registerRequest = {
        email: 'test@example.com',
        password: 'Password123',
        full_name: 'John Doe',
      };
      const expectedResult = {
        token: 'fake-token',
        user: { id: 'xx', email: 'example@mail.com', full_name: 'John Doe' },
      };
      mockAuthService.register = jest.fn().mockResolvedValue(expectedResult);
      const result = await controller.register(registerRequest);

      expect(service.register).toHaveBeenCalledWith(registerRequest);
      expect(result).toBe(expectedResult);
      expect(service.register).toHaveBeenCalledTimes(1);
    });
  });
});
