import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SelectedTicketsService } from './selected-tickets.service';

@Controller('selected-tickets')
@UseGuards(AuthGuard())
export class SelectedTicketsController {
  constructor(
    private readonly selectedTicketsService: SelectedTicketsService,
  ) {}

  @Post()
  async update(@Req() { user }, @Body() data) {
    return this.selectedTicketsService.update({
      user,
      ...data,
    });
  }
}
