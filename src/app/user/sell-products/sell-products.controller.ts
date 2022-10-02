import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SellProductsService } from './sell-products.service';
import { GetProductsInterface } from '../../../common/interfaces/products.interfaces';
import { CreateSellProductsDto, SellProductsDto } from './sell-products.dto';
import { AuthGuard } from '@nestjs/passport';
import { ICreateSellProducts } from './sell-products.interface';

@Controller('sell-products')
@UseGuards(AuthGuard())
export class SellProductsController {
  constructor(private readonly sellProductsService: SellProductsService) {}

  @Get()
  async get(
    @Query() query: SellProductsDto,
    @Req() { user },
  ): Promise<GetProductsInterface> {
    return await this.sellProductsService.get({ ...query, user });
  }

  @Post()
  async create(
    @Body() data: CreateSellProductsDto,
    @Req() { user },
  ): Promise<ICreateSellProducts> {
    return await this.sellProductsService.create({ ...data, user });
  }
}
