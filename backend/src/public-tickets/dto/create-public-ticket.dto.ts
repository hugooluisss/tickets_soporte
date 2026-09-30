import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TicketKind } from '../../tickets/ticket-kind.enum';

export class CreatePublicTicketDto {
  @IsString() @MinLength(1) @MaxLength(150) reporterName!: string;
  @IsEmail() @MaxLength(255) reporterEmail!: string;
  @IsOptional() @IsString() @MaxLength(255) reporterLocation?: string;
  @IsString() @MinLength(1) @MaxLength(255) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(TicketKind) kind?: TicketKind;
}
