import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export default class BuyProductsDto {
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

  @IsOptional()
  @IsString()
  types: string;

  @IsOptional()
  @IsString()
  subtypes: string;
}

export class CreateBuyProductsDto {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  typeCode: string;

  @IsNotEmpty()
  @IsString()
  subtype: string;

  @IsNotEmpty()
  @IsString()
  subtypeCode: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  weight: number;

  @IsString()
  @IsOptional()
  description: string;
}
