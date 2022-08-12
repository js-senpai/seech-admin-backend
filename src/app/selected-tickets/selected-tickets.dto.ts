import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export default class SelectedTicketsDto {
  @ValidateNested({ each: true })
  @IsNotEmpty()
  tickets: SelectedTicketDto[];

  @IsNotEmpty()
  @IsBoolean()
  isSale: boolean;
}

class SelectedTicketDto {
  @IsNotEmpty()
  @IsString()
  _id: string;

  @IsNotEmpty()
  @IsBoolean()
  checked: boolean;
}
