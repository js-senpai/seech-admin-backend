import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  region: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  countryOtg: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  countryState: number;
}
