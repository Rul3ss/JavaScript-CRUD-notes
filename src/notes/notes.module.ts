import { Module } from '@nestjs/common';
import { notesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  controllers: [notesController],
  providers: [NotesService],
})
export class notesModule {}
