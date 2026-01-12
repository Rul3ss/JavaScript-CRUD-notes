import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AddHeaderInterceptor } from 'src/common/interceptors/add-header.interceptor';
import { ErrorHandlingInterceptor } from 'src/common/interceptors/error-handling.interceptor';
import { AuthTokenInterceptor } from 'src/common/interceptors/auth-token.interceptor';

@Controller('notes')
//@UseInterceptors(ChangeDataInterceptor)
//@UseInterceptors(AuthTokenInterceptor)
export class notesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  //@UseInterceptors(AddHeaderInterceptor, ErrorHandlingInterceptor, SimpleCacheInterceptor)
  async findAll(@Query() paginationDto: PaginationDto) {
    //console.log('NoteController', req['user']);
    //return `This route return all notes. Limit = ${limit}, offset = ${offset}`;
    return await this.notesService.findall(paginationDto);
  }

  @Get(':id')
  @UseInterceptors(AddHeaderInterceptor, ErrorHandlingInterceptor)
  async findOne(@Param('id') id: number) {
    return await this.notesService.findOne(id);
  }

  @Post()
  async create(@Body() createNoteDto: CreateNoteDto) {
    return await this.notesService.create(createNoteDto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesService.update(id, updateNoteDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.notesService.remove(id);
  }
}
