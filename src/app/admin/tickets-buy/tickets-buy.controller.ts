import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { TicketsBuyService } from './tickets-buy.service';
import { AuthGuard } from '@nestjs/passport';
import { GetTicketsInterface } from '../../../common/interfaces/tickets.interfaces';
import TicketsBuyDto from './tickets-buy.dto';

@Controller('tickets-buy')
@UseGuards(AuthGuard())
export class TicketsBuyController {
  constructor(private readonly ticketsBuyService: TicketsBuyService) {}

  @Get()
  async get(
    @Query() query: TicketsBuyDto,
    @Req() { user },
  ): Promise<GetTicketsInterface> {
    return await this.ticketsBuyService.get({ ...query, user });
  }
}
