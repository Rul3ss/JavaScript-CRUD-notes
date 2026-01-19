import { HashingService } from 'src/auth/hashing/hashing.service';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { create } from 'domain';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { error } from 'console';
import { find } from 'rxjs';
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
});
