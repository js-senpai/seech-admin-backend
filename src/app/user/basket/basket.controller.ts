import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BasketService } from './basket.service';
import { BasketDto } from './basket.dto';
import { AuthGuard } from '@nestjs/passport';
import { IAddToBasket, ITotalInBasket } from './basket.interface';
import {
  GetRequestsInterface,
  ISuccessfulRequest,
  ITotalRequests,
} from '../../../common/interfaces/requests.interfaces';

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

  @Get('/total-by-types')
  async getTotalByTypes(@Req() { user }): Promise<ITotalRequests> {
    return await this.basketService.getTotalByTypes({ user });
  }

  @Delete(':id')
  async removeFromBasket(
    @Param('id') ticketId,
    @Req() { user },
  ): Promise<IAddToBasket> {
    return await this.basketService.delete({ ticketId, user });
  }

  @Put(':id')
  async complete(
    @Param('id') id,
    @Req() { user },
  ): Promise<ISuccessfulRequest> {
    return await this.basketService.complete({ id, user });
  }

  @Get('sell')
  async getSell(
    @Param('id') id,
    @Req() { user },
  ): Promise<GetRequestsInterface> {
    return await this.basketService.get({ isSell: true, user });
  }

  @Get('buy')
  async getBuy(
    @Param('id') id,
    @Req() { user },
  ): Promise<GetRequestsInterface> {
    return await this.basketService.get({ isSell: false, user });
  }
}
