import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AuthDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  auth_date: number;

  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  hash: string;
}
