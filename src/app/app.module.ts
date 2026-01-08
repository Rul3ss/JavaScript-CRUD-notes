import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { notesModule } from 'src/notes/notes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { SimpleMiddleware } from 'src/common/middlewares/simple.middleware';
import { AnotherMiddleware } from 'src/common/middlewares/another.middleware';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { MyExceptionFilter } from 'src/common/filters/my-exception.filter';
import { ErrorExceptionFilter } from 'src/common/filters/error-exception.filter';
import { IsAdminGuard } from 'src/common/guards/is-admin.guard';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      database: 'postgres',
      password: '123456',
      autoLoadEntities: true,
      synchronize: true, // não deve ser usado em produção
    }),
    notesModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: MyExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ErrorExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: IsAdminGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SimpleMiddleware, AnotherMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
