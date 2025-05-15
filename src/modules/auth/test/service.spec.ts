import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../service';
import { UserRepository } from '../repository';
import { LoginRequest } from '../schema';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;

  const mockUserRepository = {
    getByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password_hash: bcrypt.hashSync('password123'),
      full_name: 'Test User',
    };

    const mockToken = 'jwt-token';

    it('should successfully login and return user with token', async () => {
      // Arrange
      mockUserRepository.getByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      // Act
      const result = await service.login(loginRequest);

      // Assert
      expect(userRepository.getByEmail).toHaveBeenCalledWith(
        loginRequest.email,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          full_name: mockUser.full_name,
        },
        token: mockToken,
      });
    });
    it('should return unauthorized if email not found', async () => {
      // Arrange
      mockUserRepository.getByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginRequest)).rejects.toThrow(
        'Email not found',
      );
      expect(userRepository.getByEmail).toHaveBeenCalledWith(
        loginRequest.email,
      );
    });

    it('Should return unauthorized if wrong password', async () => {
      // Arrange
      mockUserRepository.getByEmail.mockResolvedValue(mockUser);
      // Act
      const result = service.login({
        ...loginRequest,
        password: 'wrongpassword123',
      });

      // Assert
      await expect(result).rejects.toThrow('Wrong password');
      expect(userRepository.getByEmail).toHaveBeenCalledWith(
        loginRequest.email,
      );
    });
  });
  describe('register', () => {
    const registerRequest = {
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User',
    };

    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password_hash: bcrypt.hashSync('password123'),
      full_name: 'Test User',
    };

    it('should successfully register new user', async () => {
      // Arrange
      mockUserRepository.getByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await service.register(registerRequest);

      // Assert
      expect(userRepository.getByEmail).toHaveBeenCalledWith(
        registerRequest.email,
      );
      expect(userRepository.create).toHaveBeenCalledWith({
        ...registerRequest,
        password_hash: expect.any(String),
      });
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          full_name: mockUser.full_name,
        },
      });
    });

    it('should throw BadRequestException if email already registered', async () => {
      // Arrange
      mockUserRepository.getByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.register(registerRequest)).rejects.toThrow(
        'Email already registered',
      );
      expect(userRepository.getByEmail).toHaveBeenCalledWith(
        registerRequest.email,
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });
});
