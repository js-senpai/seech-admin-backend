import { IsDateString, IsOptional, IsString } from 'class-validator';

export default class PricesDto {
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
  lang: string;
}
