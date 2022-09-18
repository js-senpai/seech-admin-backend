import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { SellProductsService } from './sell-products.service';
import { GetProductsInterface } from '../../../common/interfaces/products.interfaces';
import SellProductsDto from './sell-products.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('sell-products')
@UseGuards(AuthGuard())
export class SellProductsController {
  constructor(private readonly buyProductsService: SellProductsService) {}

  @Get()
  async get(
    @Query() query: SellProductsDto,
    @Req() { user },
  ): Promise<GetProductsInterface> {
    return await this.buyProductsService.get({ ...query, user });
  }
}
