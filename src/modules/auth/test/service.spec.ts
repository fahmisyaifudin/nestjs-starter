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
    createAnonymous: jest.fn(),
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
        is_email_verified: expect.any(Boolean),
        email_verification_expires_at: expect.any(Number),
        email_verification_token: expect.any(String),
        auth_provider: expect.any(String),
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

    it('should successfully create anonymous user', async () => {
      // Arrange
      mockUserRepository.getByEmail.mockResolvedValue(null);
      mockUserRepository.createAnonymous.mockResolvedValue(mockUser);

      const anonymousRegister = {
        email: 'michael@yoloo.co.id',
        full_name: 'Michael Kaiser',
      };
      //Act & Assert
      const result = await service.createAnonymous(anonymousRegister);
      expect(userRepository.getByEmail).toHaveBeenCalledWith(
        anonymousRegister.email,
      );
      expect(userRepository.createAnonymous).toHaveBeenCalledWith(
        anonymousRegister,
      );
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          full_name: mockUser.full_name,
        },
      });
    });
    it('should not create anonymous user but still return existing user if exists', async () => {
      // Arrange
      mockUserRepository.getByEmail.mockResolvedValue(mockUser);
      const anonymousRegister = {
        email: 'michael@yoloo.co.id',
        full_name: 'Michael Kaiser',
      };

      const result = await service.createAnonymous(anonymousRegister);
      expect(userRepository.getByEmail).toHaveBeenCalledWith(
        anonymousRegister.email,
      );
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          full_name: mockUser.full_name,
        },
      });
    });
  });
});
