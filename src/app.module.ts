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

@Module({
  imports: [
    AuthModule,
    EventModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .exclude(
        { path: 'auth/{*splat}', method: RequestMethod.ALL },
        { path: '/', method: RequestMethod.GET },
        { path: '/event/{*splat}', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
