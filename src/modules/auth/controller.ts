import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './service';
import {
  LoginRequest,
  LoginRequestSchema,
  RegisterRequest,
  RegisterRequestSchema,
} from './schema';
import { ValidationPipe } from '../../pipe/validation';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body(new ValidationPipe(LoginRequestSchema)) payload: LoginRequest,
  ) {
    return this.authService.login(payload);
  }
  @Post('register')
  async register(
    @Body(new ValidationPipe(RegisterRequestSchema)) payload: RegisterRequest,
  ) {
    return this.authService.register(payload);
  }
}
