import { ApiProperty } from '@nestjs/swagger';

export class ResponseNoteDto {
  @ApiProperty({ example: 1, description: 'Unique id from note' })
  id: number;

  @ApiProperty({
    example: 'content from note',
    description: 'Text from note',
  })
  text: string;

  @ApiProperty({ example: true, description: 'sign if note as read' })
  read: boolean;

  @ApiProperty({
    example: '2024-09-14T10:00:00.000Z',
    description: 'Note date',
  })
  date: Date;

  @ApiProperty({
    example: '2024-09-10T12:34:56.000Z',
    description: 'date of note creation',
    required: false,
  })
  createdAt?: Date;

  @ApiProperty({
    example: '2024-09-11T15:20:10.000Z',
    description: 'date for last note update',
    required: false,
  })
  updatedAt?: Date;

  @ApiProperty({
    example: { id: 1, name: 'John Silva' },
    description: 'information about note sender',
  })
  from: {
    id: number;
    name: string;
  };

  @ApiProperty({
    example: { id: 2, name: 'Maria' },
    description: 'information about note receiver',
  })
  to: {
    id: number;
    name: string;
  };
}
