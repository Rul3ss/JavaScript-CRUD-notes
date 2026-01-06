import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  readonly text: string;

  @IsPositive()
  fromId: number;

  @IsPositive()
  forId: number;
}
