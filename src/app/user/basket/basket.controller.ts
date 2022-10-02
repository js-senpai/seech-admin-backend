import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { BasketService } from './basket.service';
import { BasketDto } from './basket.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('basket')
@UseGuards(AuthGuard())
export class BasketController {
  constructor(protected readonly basketService: BasketService) {}

  @Post()
  async addToBasket(@Body() data: BasketDto, @Req() { user }) {
    return await this.basketService.addToBasket({ ...data, user });
  }

  @Get('/total')
  async getTotal(@Req() { user }) {
    return await this.basketService.getTotal({ user });
  }
}
