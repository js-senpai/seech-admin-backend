import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetTicketsInterface } from '../../../common/interfaces/tickets.interfaces';
import { TicketsSaleService } from './tickets-sale.service';
import TicketsSaleDto from './tickets-sale.dto';

@Controller('tickets-sale')
@UseGuards(AuthGuard())
export class TicketsSaleController {
  constructor(private readonly ticketsSaleService: TicketsSaleService) {}

  @Get()
  async get(
    @Query() query: TicketsSaleDto,
    @Req() { user },
  ): Promise<GetTicketsInterface> {
    return await this.ticketsSaleService.get({ ...query, user });
  }
}
