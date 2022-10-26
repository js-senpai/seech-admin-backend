import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MyRequestsDto {
  @IsOptional()
  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate: string;

  @IsOptional()
  @IsString()
  types: string;

  @IsOptional()
  @IsString()
  subtypes: string;
}

export class ActionMyRequestsDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
