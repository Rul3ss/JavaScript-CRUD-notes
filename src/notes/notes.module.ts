import { Module } from '@nestjs/common';
import { NoteController } from './notes.controller';
import { NotesService } from './notes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { UserModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';
import noteConfig from './note.config';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Note]),
    UserModule,
    ConfigModule.forFeature(noteConfig),
    EmailModule,
  ],
  controllers: [NoteController],
  providers: [NotesService],
})
export class notesModule {}
