import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { NotesService } from 'src/notes/notes.service';
import { ResponseNoteDto } from 'src/notes/dto/response-note.dto';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { CreateNoteDto } from 'src/notes/dto/create-note.dto';
import { UpdateNoteDto } from 'src/notes/dto/update-note.dto';

@ApiTags('notes') // Tag usada para organizar os endpoints
@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'get all notes with pagination' }) // Descrição do endpoint
  @ApiQuery({
    name: 'offset',
    required: false,
    example: 1,
    description: 'itens to jump',
  }) // Parâmetros da query
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'limit ',
  })
  @ApiResponse({
    status: 200,
    description: 'notes returned with success.',
    type: [ResponseNoteDto],
  }) // Resposta bem-sucedida
  async findAll(@Query() paginationDto: PaginationDto) {
    const notes = await this.noteService.findAll(paginationDto);
    return notes;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one Note with ID' }) // Descrição da operação
  @ApiParam({ name: 'id', description: 'Note ID', example: 1 }) // Parâmetro da rota
  @ApiResponse({
    status: 200,
    description: 'note returned with success.',
    type: ResponseNoteDto,
  }) // Resposta bem-sucedida
  @ApiResponse({ status: 404, description: 'Note notFound.' }) // Resposta de erro
  findOne(@Param('id') id: string) {
    return this.noteService.findOne(+id);
  }

  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth() // Autenticação via token
  @Post()
  @ApiOperation({ summary: 'Create New Note' }) // Descrição do endpoint
  @ApiResponse({
    status: 201,
    description: 'note created with success.',
    type: ResponseNoteDto,
    // example: {
    //   id: 19,
    //   texto: 'EXEMPLO',
    //   lido: true,
    //   data: '2024-09-14T10:00:00.000Z',
    //   createdAt: '2024-09-10T12:34:56.000Z',
    //   updatedAt: '2024-09-11T15:20:10.000Z',
    //   de: {
    //     id: 0,
    //     nome: 'string',
    //   },
    //   para: {
    //     id: 0,
    //     nome: 'string',
    //   },
    // },
  }) // Resposta de criação bem-sucedida
  @ApiResponse({
    status: 400,
    description: 'Invalid date.',
    type: BadRequestException,
    example: new BadRequestException('Error message').getResponse(),
  }) // Resposta de erro
  create(
    @Body() createNoteDto: CreateNoteDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.noteService.create(createNoteDto, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'update a note' }) // Descrição da operação
  @ApiParam({ name: 'id', description: 'Note ID', example: 1 }) // Parâmetro da rota
  @ApiResponse({ status: 200, description: 'note updated with success' }) // Resposta de sucesso
  @ApiResponse({ status: 404, description: 'Note notFound.' }) // Resposta de erro
  update(
    @Param('id') id: number,
    @Body() updateNoteDto: UpdateNoteDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.noteService.update(id, updateNoteDto, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'delete a note' }) // Descrição do endpoint
  @ApiParam({ name: 'id', description: 'Note id', example: 1 }) // Parâmetro da rota
  @ApiResponse({ status: 200, description: 'Note deleted with success.' }) // Resposta de sucesso
  @ApiResponse({ status: 404, description: 'Note notFound' }) // Resposta de erro
  remove(
    @Param('id') id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.noteService.remove(id, tokenPayload);
  }
}
