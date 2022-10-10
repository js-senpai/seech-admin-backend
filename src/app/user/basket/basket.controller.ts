import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BasketService } from './basket.service';
import { BasketDto } from './basket.dto';
import { AuthGuard } from '@nestjs/passport';
import { IAddToBasket, ITotalInBasket } from './basket.interface';

@Controller('basket')
@UseGuards(AuthGuard())
export class BasketController {
  constructor(protected readonly basketService: BasketService) {}

  @Post()
  async addToBasket(
    @Body() data: BasketDto,
    @Req() { user },
  ): Promise<IAddToBasket> {
    return await this.basketService.addToBasket({ ...data, user });
  }

  @Get('/total')
  async getTotal(@Req() { user }): Promise<ITotalInBasket> {
    return await this.basketService.getTotal({ user });
  }

  @Delete(':id')
  async removeFromBasket(
    @Param('id') ticketId,
    @Req() { user },
  ): Promise<IAddToBasket> {
    return await this.basketService.delete({ ticketId, user });
  }
}
