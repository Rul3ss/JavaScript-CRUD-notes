import { HashingService } from 'src/auth/hashing/hashing.service';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let hashingService: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
            uploadPicture: jest.fn(),
          },
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    hashingService = module.get<HashingService>(HashingService);
  });

  it('User Service should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'lucas@email.com',
        name: 'Lucas',
        password: 'password123',
      };
      const passwordHash = 'hashedPassword';
      const newUser = {
        id: 1,
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash,
      };

      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest.spyOn(userRepository, 'create').mockReturnValue(newUser as any);

      const result = await userService.create(createUserDto);

      expect(hashingService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(userRepository.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        passwordHash: passwordHash,
        email: createUserDto.email,
      });
      expect(userRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });
    it('should throw conflict exception if email already in use', async () => {
      jest.spyOn(userRepository, 'save').mockRejectedValue({ code: '23505' });

      await expect(userService.create({} as any)).rejects.toThrow(
        ConflictException,
      );
    });
    it('should throw error if other error occurs', async () => {
      jest
        .spyOn(userRepository, 'save')
        .mockRejectedValue(new Error('generic error'));

      await expect(userService.create({} as any)).rejects.toThrow(
        new Error('generic error'),
      );
    });
  });

  describe('findOne', () => {
    it('should return if a user is found', async () => {
      const userId = 1;
      const foundUser = {
        id: userId,
        nome: 'Lucas',
        email: 'lucas@email.com',
        passwordHash: 'hashedPassword',
      };

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValue(foundUser as any);

      const result = await userService.findOne(userId);

      expect(result).toEqual(foundUser);
    });

    it('should throw not found exception if user does not exist', async () => {
      await expect(userService.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const usersMock: User[] = [
        {
          id: 1,
          name: 'Lucas',
          email: 'lucas@email.com',
          passwordHash: '',
        } as User,
        {
          id: 1,
          name: 'Mari ',
          email: 'Maria@email.com',
          passwordHash: '',
        } as User,
      ];

      jest.spyOn(userRepository, 'find').mockResolvedValue(usersMock as any);

      const result = await userService.findAll();

      expect(result).toEqual(usersMock);
    });
    it('should return a empty array if no users found', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValue([] as any);
      const result = await userService.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a user if authorized', async () => {
      //arrange
      const userID = 1;
      const updateUserDto = {
        name: 'lucas updated',
        password: '164578',
      };
      const tokenPayload = {
        sub: userID,
      } as any;
      const passwordHash = 'hashedPasswordUpdated';
      const updatedUsed = {
        id: userID,
        name: updateUserDto.name,
        passwordHash,
      };

      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest
        .spyOn(userRepository, 'preload')
        .mockResolvedValue(updatedUsed as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUsed as any);

      //act

      const result = await userService.update(
        userID,
        updateUserDto,
        tokenPayload,
      );

      // assert

      expect(hashingService.hash).toHaveBeenCalledWith(updateUserDto.password);
      expect(userRepository.preload).toHaveBeenCalledWith({
        id: userID,
        name: updateUserDto.name,
        passwordHash,
      });
      expect(userRepository.save).toHaveBeenCalledWith(updatedUsed);
      expect(result).toEqual(updatedUsed);
    });
    it('should throw not forbidden exception if user not authorized', async () => {
      const userID = 1;
      const tokenPayload = { sub: 2 } as any;
      const updateUserDto = { name: 'lucas' };
      const existingUser = { id: userID, name: 'duda' };

      jest
        .spyOn(userRepository, 'preload')
        .mockResolvedValue(existingUser as any);

      await expect(
        userService.update(userID, updateUserDto, tokenPayload),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw not found exception if user to update does not exist', async () => {
      const userID = 1;
      const tokenPayload = { sub: userID } as any;
      const updateUserDto = { name: 'Lucas' };

      jest.spyOn(userRepository, 'preload').mockResolvedValue(null);

      await expect(
        userService.update(userID, updateUserDto, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should remove a user if authorized', async () => {
      const userId = 1;
      const tokenPayLoad = { sub: userId } as any;
      const existingUser = { id: userId, name: 'lucas' };

      jest.spyOn(userService, 'findOne').mockResolvedValue(existingUser as any);
      jest
        .spyOn(userRepository, 'remove')
        .mockResolvedValue(existingUser as any);

      const result = await userService.remove(userId, tokenPayLoad);

      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(userRepository.remove).toHaveBeenCalledWith(existingUser);
      expect(result).toEqual(existingUser);
    });

    it('should throw forbiddenException if user not authorized', async () => {
      const userId = 1;
      const tokenPayLoad = { sub: 2 } as any;
      const existingUser = { id: userId, name: 'lucas' };

      jest.spyOn(userService, 'findOne').mockResolvedValue(existingUser as any);

      await expect(userService.remove(userId, tokenPayLoad)).rejects.toThrow(
        ForbiddenException,
      );
    });
    it('should to throw NotFoundException if user not found', async () => {
      const userId = 1;
      const tokenPayload = { sub: userId } as any;

      jest
        .spyOn(userService, 'findOne')
        .mockRejectedValue(new NotFoundException());

      await expect(userService.remove(userId, tokenPayload)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('uploadPicture', () => {
    it('should save the picture and update the user', async () => {
      const mockFile = {
        originalname: 'test.png',
        size: 2000,
        buffer: Buffer.from('file content'),
      } as unknown as Express.Multer.File;

      const mockUser = {
        id: 1,
        name: 'lucas',
        email: 'lucas@email.com',
      } as User;

      const tokenPayload = { sub: 1 } as any;

      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue({
        ...mockUser,
        picture: '1.png',
      });
      const filePath = path.resolve(process.cwd(), 'pictures', '1.png');
      const result = await userService.uploadPicture(mockFile, tokenPayload);

      expect(fs.writeFile).toHaveBeenCalledWith(filePath, mockFile.buffer);
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        picture: '1.png',
      });
      expect(result).toEqual({
        ...mockUser,
        picture: '1.png',
      });
    });
    it('should throw a badRequestException if file is to small', async () => {
      const mockFile = {
        originalname: 'test.png',
        size: 10,
        buffer: Buffer.from('file content'),
      } as unknown as Express.Multer.File;

      const mockUser = {
        id: 1,
        name: 'lucas',
        email: 'lucas@email.com',
      } as User;

      const tokenPayload = { sub: 1 } as any;

      await expect(
        userService.uploadPicture(mockFile, tokenPayload),
      ).rejects.toThrow(BadRequestException);
    });

    it('shout throw a NotFoundException if user notFound', async () => {
      const mockFile = {
        originalname: 'test.png',
        size: 2000,
        buffer: Buffer.from('file content'),
      } as unknown as Express.Multer.File;

      const tokenPayload = { sub: 1 } as any;

      jest
        .spyOn(userService, 'findOne')
        .mockRejectedValue(new NotFoundException());

      await expect(
        userService.uploadPicture(mockFile, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
