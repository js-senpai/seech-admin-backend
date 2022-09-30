import { Controller, Get, Query, Req } from '@nestjs/common';
import { SellProductsService } from '../sell-products/sell-products.service';
import SellProductsDto from '../sell-products/sell-products.dto';
import { GetProductsInterface } from '../../../common/interfaces/products.interfaces';
import { BuyProductsService } from './buy-products.service';

@Controller('buy-products')
export class BuyProductsController {
  constructor(private readonly buyProductsService: BuyProductsService) {}

  @Get()
  async get(
    @Query() query: SellProductsDto,
    @Req() { user },
  ): Promise<GetProductsInterface> {
    return await this.buyProductsService.get({ ...query, user });
  }
}
