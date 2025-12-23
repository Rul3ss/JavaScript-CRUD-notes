import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { notesModule } from 'src/notes/notes.module';

@Module({
  imports: [notesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
