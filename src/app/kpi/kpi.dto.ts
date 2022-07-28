import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export default class KpiDto {
  @IsOptional()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  region: string;

  @IsOptional()
  @IsString()
  state: string;

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
  @IsBoolean()
  active;
}
