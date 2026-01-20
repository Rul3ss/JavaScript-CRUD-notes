import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const passwordHash = await this.hashingService.hash(
        createUserDto.password,
      );

      const userData = {
        name: createUserDto.name,
        passwordHash,
        email: createUserDto.email,
      };

      const newUser = this.userRepository.create(userData);
      await this.userRepository.save(newUser);
      return newUser;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('E-mail already in use');
      }
      throw error;
    }
  }

  async findAll() {
    const user = await this.userRepository.find({
      order: {
        id: 'desc',
      },
    });

    return user;
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({
      id,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const userData = {
      name: updateUserDto.name,
    };

    if (updateUserDto?.password) {
      const passwordHash = await this.hashingService.hash(
        updateUserDto.password,
      );

      userData['passwordHash'] = passwordHash;
    }

    const user = await this.userRepository.preload({
      id,
      ...userData,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id !== tokenPayload.sub) {
      throw new ForbiddenException('U cant access another user');
    }

    return this.userRepository.save(user);
  }

  async remove(id: number, tokenPayload: TokenPayloadDto) {
    const user = await this.findOne(id);

    if (user.id !== tokenPayload.sub) {
      throw new ForbiddenException('U cant access another user');
    }

    return this.userRepository.remove(user);
  }

  async uploadPicture(
    file: Express.Multer.File,
    tokenPayLoad: TokenPayloadDto,
  ) {
    if (file.size < 1024) {
      throw new BadRequestException('File too small');
    }

    const user = await this.findOne(tokenPayLoad.sub);

    const fileExtension = path
      .extname(file.originalname)
      .toLocaleLowerCase()
      .substring(1);

    const filename = `${tokenPayLoad.sub}.${fileExtension}`;
    const fileFullPath = path.resolve(process.cwd(), 'pictures', filename);

    await fs.writeFile(fileFullPath, file.buffer);

    user.picture = filename;

    await this.userRepository.save(user);

    return user;
  }
}
