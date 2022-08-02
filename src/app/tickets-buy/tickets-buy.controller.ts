import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TicketsBuyService } from './tickets-buy.service';
import { AuthGuard } from '@nestjs/passport';
import { GetTicketsInterface } from '../../common/interfaces/tickets.interfaces';

@Controller('tickets-buy')
@UseGuards(AuthGuard())
export class TicketsBuyController {
  constructor(private readonly ticketsBuyService: TicketsBuyService) {}

  @Get()
  async get(@Query() query): Promise<GetTicketsInterface> {
    return await this.ticketsBuyService.get({ ...query });
  }
}
