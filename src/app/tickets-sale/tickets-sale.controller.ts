import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetTicketsInterface } from '../../common/interfaces/tickets.interfaces';
import { TicketsSaleService } from './tickets-sale.service';

@Controller('tickets-sale')
@UseGuards(AuthGuard())
export class TicketsSaleController {
  constructor(private readonly ticketsSaleService: TicketsSaleService) {}

  @Get()
  async get(@Query() query): Promise<GetTicketsInterface> {
    return await this.ticketsSaleService.get({ ...query });
  }
}
