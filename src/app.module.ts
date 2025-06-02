import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/module';
import { ConfigModule } from '@nestjs/config';
import { JwtMiddleware } from './middleware/jwt';
import { EventModule } from './modules/event/modules';
import { BullModule } from '@nestjs/bullmq';
import { EmailModule } from './modules/email/module';
import { EmailProcessor } from './modules/email/processor';

@Module({
  imports: [
    AuthModule,
    EventModule,
    EmailModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRoot({
      connection: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, EmailProcessor],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .exclude(
        { path: 'auth/{*splat}', method: RequestMethod.ALL },
        { path: '/', method: RequestMethod.GET },
        { path: 'event/{*splat}', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
