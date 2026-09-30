import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
export class CreateProjectDto {
  @IsString() @MinLength(1) @MaxLength(150) name!: string;
  @IsOptional() @IsString() description?: string;
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsOptional() @IsUrl() webhookUrl?: string;
}
