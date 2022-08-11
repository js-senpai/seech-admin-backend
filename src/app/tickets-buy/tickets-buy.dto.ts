import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export default class TicketsBuyDto {
  @IsOptional()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  regions: string;

  @IsOptional()
  @IsString()
  states: string;

  @IsOptional()
  @IsString()
  otg: string;

  @IsOptional()
  @IsString()
  types: string;

  @IsOptional()
  @IsString()
  subtypes: string;

  @IsOptional()
  @IsString()
  active: string;

  @IsOptional()
  @IsString()
  sortBy: string;

  @IsOptional()
  @IsString()
  sortDesc: string;
}
