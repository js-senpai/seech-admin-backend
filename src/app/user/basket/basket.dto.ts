import { IsNotEmpty, IsString } from 'class-validator';

export class BasketDto {
  @IsNotEmpty()
  @IsString()
  ticketId: string;
}
