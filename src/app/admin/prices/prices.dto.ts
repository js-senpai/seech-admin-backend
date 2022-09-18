import { IsOptional, IsString } from 'class-validator';

export default class PricesDto {
  @IsOptional()
  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
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
}
