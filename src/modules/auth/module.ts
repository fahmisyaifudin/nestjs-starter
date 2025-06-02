import { Module } from '@nestjs/common';
import { AuthController } from './controller';
import { AuthService } from './service';
import { UserRepository } from './repository';
import { DatabaseProvider } from '../../provider/database';
import { JwtModule } from '@nestjs/jwt';
import 'dotenv/config';
import { EmailModule } from '../email/module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env['JWT_SECRET'],
      signOptions: { expiresIn: '1h' },
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, DatabaseProvider],
  exports: [AuthService],
})
export class AuthModule {}
