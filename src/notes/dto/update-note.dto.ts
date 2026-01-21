import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateNoteDto } from './create-note.dto';

export class UpdateNoteDto extends PartialType(CreateNoteDto) {
  @ApiProperty({
    example: true,
    description: 'sign if note as read',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly read?: boolean;

  // @ApiHideProperty()
  // readonly testando?: string;
}
