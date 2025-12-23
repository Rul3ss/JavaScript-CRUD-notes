import { Injectable, NotFoundException } from '@nestjs/common';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  private lastId = 1;
  private notes: Note[] = [
    {
      id: 1,
      text: 'this is a test',
      from: 'joana',
      for: 'Lucas',
      read: false,
      date: new Date(),
    },
  ];

  findall() {
    return this.notes;
  }

  findOne(id: number) {
    const recado = this.notes.find(item => item.id === id);

    if (recado) return recado;

    throw new NotFoundException(`Note not found`);
  }

  create(createNoteDto: CreateNoteDto) {
    this.lastId++;
    const id = this.lastId;
    const newNote = {
      id,
      ...createNoteDto,
      read: false,
      date: new Date(),
    };
    this.notes.push(newNote);

    return newNote;
  }

  update(id: string, updateNoteDto: UpdateNoteDto) {
    const noteIndex = this.notes.findIndex(item => item.id === +id);

    if (noteIndex < 0) {
      throw new NotFoundException(`Note not found`);
    }

    if (noteIndex >= 0) {
      const noteFind = this.notes[noteIndex];

      this.notes[noteIndex] = {
        ...noteFind,
        ...updateNoteDto,
      };
    }

    return this.notes[noteIndex];
  }

  remove(id: number) {
    const noteIndex = this.notes.findIndex(item => item.id === +id);

    if (noteIndex < 0) {
      throw new NotFoundException(`Note not found`);
    }
    const note = this.notes[noteIndex];
    this.notes.splice(noteIndex, 1);
    return note;
  }
}
