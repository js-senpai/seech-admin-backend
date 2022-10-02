import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GetProductsInterface } from '../../../common/interfaces/products.interfaces';
import { BuyProductsService } from './buy-products.service';
import BuyProductsDto, { CreateBuyProductsDto } from './buy-products.dto';
import { AuthGuard } from '@nestjs/passport';
import { ICreateBuyProducts } from './buy-products.interface';

@Controller('buy-products')
@UseGuards(AuthGuard())
export class BuyProductsController {
  constructor(private readonly buyProductsService: BuyProductsService) {}

  @Get()
  async get(
    @Query() query: BuyProductsDto,
    @Req() { user },
  ): Promise<GetProductsInterface> {
    return await this.buyProductsService.get({ ...query, user });
  }

  @Post()
  async create(
    @Body() data: CreateBuyProductsDto,
    @Req() { user },
  ): Promise<ICreateBuyProducts> {
    return await this.buyProductsService.create({ ...data, user });
  }
}
