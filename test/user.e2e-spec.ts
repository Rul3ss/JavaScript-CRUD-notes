import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { ServeStaticModule } from '@nestjs/serve-static';
import request from 'supertest';
import * as path from 'path';
import { notesModule } from 'src/notes/notes.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from 'src/app/config/app.config';
import globalConfig from 'src/app/global.config';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        ConfigModule.forFeature(globalConfig),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          database: 'testing',
          password: '123456',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true, // não deve ser usado em produção
        }),
        ServeStaticModule.forRoot({
          rootPath: path.resolve(process.cwd(), 'pictures'),
          serveRoot: '/pictures',
        }),
        notesModule,
        UserModule,
        AuthModule,
      ],
    }).compile();

    app = module.createNestApplication();

    appConfig(app);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/user (POST)', () => {
    it('should create a user', async () => {
      const createUserDto = {
        email: 'email@email.com',
        password: '123456',
        name: 'lucas',
      };
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        id: expect.any(Number),
        active: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        picture: expect.any(String),
        email: createUserDto.email,
        passwordHash: expect.any(String),
        name: createUserDto.name,
      });
    });

    it('shout give me a error if email already exist', async () => {
      const createUserDto: CreateUserDto = {
        email: 'luiz@email.com',
        name: 'Luiz',
        password: '123456',
      };

      await request(app.getHttpServer())
        .post('/user')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .post('/user')
        .send(createUserDto)
        .expect(HttpStatus.CONFLICT);

      expect(response.body.message).toBe('E-mail already in use');
    });

    it('should give me a error if password is too small', async () => {
      const createUserDto: CreateUserDto = {
        email: 'luiz@email.com',
        name: 'Luiz',
        password: '123', // Este campo é inválido
      };

      const response = await request(app.getHttpServer())
        .post('/user')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual([
        'password must be longer than or equal to 5 characters',
      ]);
      expect(response.body.message).toContain(
        'password must be longer than or equal to 5 characters',
      );
    });
  });

  describe('/user/:id (GET)', () => {
    it('throw UNAUTHORIZED if user not logged in', async () => {
      const createUserDto: CreateUserDto = {
        email: 'email@email.com',
        password: '123456',
        name: 'lucas',
      };
      const userResponder = await request(app.getHttpServer())
        .post('/user')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      const responde = await request(app.getHttpServer())
        .get('/user/' + userResponder.body.id)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('return User if user logged in', async () => {
      const createUserDto: CreateUserDto = {
        email: 'email@email.com',
        password: '123456',
        name: 'lucas',
      };
      const userResponder = await request(app.getHttpServer())
        .post('/user')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth')
        .send({
          email: 'email@email.com',
          password: '123456',
        });
      const response = await request(app.getHttpServer())
        .get('/user/' + userResponder.body.id)
        .set('Authorization', `Bearer ${loginResponse.body.acessToken}`)
        .expect(HttpStatus.OK);
    });
  });
});
