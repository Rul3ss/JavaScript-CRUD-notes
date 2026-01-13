import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  readonly text: string;

  @IsPositive()
  forId: number;
}
