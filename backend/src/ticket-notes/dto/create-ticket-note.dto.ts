import { IsString, MinLength } from 'class-validator';

export class CreateTicketNoteDto {
  @IsString() @MinLength(1) content!: string;
}
