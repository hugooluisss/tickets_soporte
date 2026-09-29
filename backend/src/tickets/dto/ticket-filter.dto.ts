import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { TicketKind } from '../ticket-kind.enum';
import { TicketPriority } from '../ticket-priority.enum';
import { TicketStatus } from '../ticket-status.enum';
import { TicketFilter } from '../ticket-filter';
export class TicketFilterDto implements TicketFilter {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsEnum(TicketPriority) priority?: TicketPriority;
  @IsOptional() @IsEnum(TicketStatus) status?: TicketStatus;
  @IsOptional() @IsEnum(TicketKind) kind?: TicketKind;
  @IsOptional() @IsDateString() dateFrom?: string;
  @IsOptional() @IsDateString() dateTo?: string;
}
