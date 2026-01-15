import {
  BadGatewayException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import type { ConfigService, ConfigType } from '@nestjs/config';
import noteConfig from './note.config';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
    private readonly userService: UserService,
    @Inject(noteConfig.KEY)
    private readonly noteConfiguration: ConfigType<typeof noteConfig>,
  ) {
    console.log(noteConfiguration);
  }

  async findall(paginationDto?: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return await this.noteRepository.find({
      take: limit,
      skip: offset,
      relations: ['from', 'for'],
      select: {
        from: {
          id: true,
          name: true,
        },
        for: {
          id: true,
          name: true,
        },
      },
    });
  }

  async findOne(id: number) {
    //const recado = this.notes.find(item => item.id === id);

    const note = await this.noteRepository.findOne({
      where: {
        id: id,
      },
      relations: ['from', 'for'],
      select: {
        from: {
          id: true,
          name: true,
        },
        for: {
          id: true,
          name: true,
        },
      },
    });
    if (note) return note;

    throw new NotFoundException(`Note not found`);
  }

  async create(createNoteDto: CreateNoteDto, tokenPayload: TokenPayloadDto) {
    const { forId } = createNoteDto;

    const from = await this.userService.findOne(tokenPayload.sub);

    const for1 = await this.userService.findOne(forId);

    const newNote = {
      text: createNoteDto.text,
      from,
      for: for1,
      read: false,
      date: new Date(),
    };

    const note = await this.noteRepository.create(newNote);
    await this.noteRepository.save(note);

    return {
      ...note,
      from: {
        id: note.from.id,
        name: note.from.name,
      },
      for: {
        id: note.for.id,
        name: note.for.id,
      },
    };
  }

  async update(
    id: number,
    updateNoteDto: UpdateNoteDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const note = await this.findOne(id);

    if (note.from.id !== tokenPayload.sub) {
      throw new BadGatewayException('U cant delete another user note');
    }

    note.text = updateNoteDto?.text ?? note.text;
    note.read = updateNoteDto?.read ?? note.read;

    return await this.noteRepository.save(note);
  }

  async remove(id: number, tokenPayload: TokenPayloadDto) {
    const note = await this.findOne(id);

    if (note.from.id !== tokenPayload.sub) {
      throw new ForbiddenException('U cant delete another user note');
    }

    return this.noteRepository.remove(note);
  }
}
