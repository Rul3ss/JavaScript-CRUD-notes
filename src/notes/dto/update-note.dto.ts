import { PartialType } from '@nestjs/mapped-types';
import { CreateNoteDto } from './create-note.dto';
import { IsBoolean } from 'class-validator';

export class UpdateNoteDto extends PartialType(CreateNoteDto) {
  readonly text?: string;
  @IsBoolean()
  readonly read?: boolean;
}
