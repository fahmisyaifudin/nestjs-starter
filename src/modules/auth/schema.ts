import { Type, Static } from '@sinclair/typebox';
import { UserSchema } from '../../database/schema';

export const LoginRequestSchema = Type.Object({
  email: Type.String(),
  password: Type.String({ minLength: 8 }),
});

export const LoginResponseSchema = Type.Object({
  token: Type.String(),
  user: Type.Pick(UserSchema, ['id', 'email', 'full_name']),
});

export const RegisterRequestSchema = Type.Object({
  email: Type.String(),
  password: Type.String({
    minLength: 8,
    pattern: '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)[A-Za-z\\d]+$',
  }),
  full_name: Type.String(),
});

export const RegisterResponseSchema = Type.Pick(LoginResponseSchema, ['user']);

export type LoginRequest = Static<typeof LoginRequestSchema>;
export type LoginResponse = Static<typeof LoginResponseSchema>;
export type RegisterRequest = Static<typeof RegisterRequestSchema>;
export type RegisterResponse = Static<typeof RegisterResponseSchema>;
