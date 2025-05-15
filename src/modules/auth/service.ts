/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from './schema';
import { UserRepository } from './repository';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepo: UserRepository,
  ) {}

  async login(payload: LoginRequest): Promise<LoginResponse> {
    try {
      const user = await this.userRepo.getByEmail(payload['email']);
      if (!user) {
        throw new UnauthorizedException('Email not found');
      }

      if (!bcrypt.compareSync(payload.password, user.password_hash)) {
        throw new UnauthorizedException('Wrong password');
      }
      const jwtSign = {
        sub: user.id,
        email: user.email,
      };

      return {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
        },
        token: await this.jwtService.signAsync(jwtSign),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    try {
      const checkEmail = await this.userRepo.getByEmail(payload.email);
      if (checkEmail) {
        throw new BadRequestException('Email already registered');
      }
      const user = await this.userRepo.create({
        ...payload,
        password_hash: bcrypt.hashSync(payload.password),
        is_email_verified: false,
        email_verification_token: [...Array(32)]
          .map(() => Math.random().toString(36)[2])
          .join(''), // random string 32 length
        email_verification_expires_at: new Date().getTime() + 60 * 60 * 1000, // 60 minutes expired
        auth_provider: 'email',
      });
      return {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
