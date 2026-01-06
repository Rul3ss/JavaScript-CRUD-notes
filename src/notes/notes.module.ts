import { Module } from '@nestjs/common';
import { notesController } from './notes.controller';
import { NotesService } from './notes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Note]), UserModule],
  controllers: [notesController],
  providers: [NotesService],
})
export class notesModule {}
