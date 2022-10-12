import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class SellProductsDto {
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

export class CreateSellProductsDto {
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
  price: number;

  @IsNotEmpty()
  @IsNumber()
  weight: number;

  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  @IsUrl()
  photoUrl: string;
}
