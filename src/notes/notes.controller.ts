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
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AddHeaderInterceptor } from 'src/common/interceptors/add-header.interceptor';
import { ErrorHandlingInterceptor } from 'src/common/interceptors/error-handling.interceptor';

import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Controller('notes')

//@UseInterceptors(ChangeDataInterceptor)
//@UseInterceptors(AuthTokenInterceptor)
export class notesController {
  constructor(private readonly notesService: NotesService) {}

  //@UseGuards(AuthTokenGuard)
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.notesService.findall(paginationDto);
  }

  @Get(':id')
  @UseInterceptors(AddHeaderInterceptor, ErrorHandlingInterceptor)
  async findOne(@Param('id') id: number) {
    return await this.notesService.findOne(id);
  }

  @UseGuards(AuthTokenGuard)
  @Post()
  create(
    @Body() createNoteDto: CreateNoteDto,
    @TokenPayloadParam() tokenpayload: TokenPayloadDto,
  ) {
    return this.notesService.create(createNoteDto, tokenpayload);
  }

  @UseGuards(AuthTokenGuard)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateNoteDto: UpdateNoteDto,
    @TokenPayloadParam() tokenpayload: TokenPayloadDto,
  ) {
    return this.notesService.update(id, updateNoteDto, tokenpayload);
  }

  @UseGuards(AuthTokenGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @TokenPayloadParam() tokenpayload: TokenPayloadDto,
  ) {
    return await this.notesService.remove(id, tokenpayload);
  }
}
