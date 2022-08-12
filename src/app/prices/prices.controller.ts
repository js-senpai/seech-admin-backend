import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PricesService } from './prices.service';
import PricesDto from './prices.dto';
import { GetPricesInterface } from './prices.interfaces';

@Controller('prices')
@UseGuards(AuthGuard())
export class PricesController {
  constructor(private readonly priceService: PricesService) {}

  @Get()
  async get(@Query() query: PricesDto): Promise<GetPricesInterface> {
    return this.priceService.get({ ...query });
  }
}
