import {
  Module,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { notesModule } from 'src/notes/notes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { MyExceptionFilter } from 'src/common/filters/my-exception.filter';
import { ErrorExceptionFilter } from 'src/common/filters/error-exception.filter';
import { IsAdminGuard } from 'src/common/guards/is-admin.guard';
import { ConfigModule, ConfigType } from '@nestjs/config';
import appConfig from './app.config';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ConfigModule.forFeature(appConfig),
    TypeOrmModule.forRootAsync({
    imports: [ConfigModule.forFeature(appConfig)],
    inject: [appConfig.KEY],
    useFactory: async (appConfigurations: ConfigType<typeof appConfig>) =>{
      return {
        type: appConfigurations.database.type,
        host: appConfigurations.database.host,
        port: appConfigurations.database.port,
        username: appConfigurations.database.username,
        database: appConfigurations.database.database,
        password: appConfigurations.database.password,
        autoLoadEntities: appConfigurations.database.autoLoadEntities,
        synchronize: appConfigurations.database.synchronize, // não deve ser usado em produção
      }
    }
    }),
    notesModule,
    UserModule,
    AuthModule,
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
export class AppModule {
}
