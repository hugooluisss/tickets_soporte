import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TicketKind } from '../ticket-kind.enum';
import { TicketPriority } from '../ticket-priority.enum';
import { TicketStatus } from '../ticket-status.enum';
export class UpdateTicketDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(255) title?: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsEnum(TicketKind) kind?: TicketKind;
  @IsOptional() @IsEnum(TicketPriority) priority?: TicketPriority;
  @IsOptional() @IsEnum(TicketStatus) status?: TicketStatus;
  @IsOptional() @IsString() projectId?: string | null;
  @IsOptional() @IsString() categoryId?: string | null;
  @IsOptional() @IsString() assignedToId?: string | null;
}
