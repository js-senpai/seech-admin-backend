import {
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MyRequestsService } from './my-requests.service';
import BuyProductsDto from '../buy-products/buy-products.dto';
import {
  GetMyRequestsInterface,
  ISuccessfulMyRequest,
  ITotalMyRequests,
} from './my-requests.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('my-requests')
@UseGuards(AuthGuard())
export class MyRequestsController {
  constructor(private readonly myRequestsService: MyRequestsService) {}

  @Get('total')
  async getTotal(
    @Query() query: BuyProductsDto,
    @Req() { user },
  ): Promise<ITotalMyRequests> {
    return await this.myRequestsService.getTotal({ ...query, user });
  }

  @Get('buy')
  async getBuy(
    @Query() query: BuyProductsDto,
    @Req() { user },
  ): Promise<GetMyRequestsInterface> {
    return await this.myRequestsService.get({ ...query, user, isSale: false });
  }

  @Get('sell')
  async getSell(
    @Query() query: BuyProductsDto,
    @Req() { user },
  ): Promise<GetMyRequestsInterface> {
    return await this.myRequestsService.get({ ...query, user, isSale: true });
  }

  @Put('/buy/complete/:id')
  async completeBuy(
    @Req() { user },
    @Param('id') id: string,
  ): Promise<ISuccessfulMyRequest> {
    return await this.myRequestsService.complete({ user, isSale: false, id });
  }

  @Put('/sell/complete/:id')
  async completeSell(
    @Req() { user },
    @Param('id') id: string,
  ): Promise<ISuccessfulMyRequest> {
    return await this.myRequestsService.complete({ user, isSale: true, id });
  }

  @Put('/buy/extend/:id')
  async extendBuy(
    @Req() { user },
    @Param('id') id: string,
  ): Promise<ISuccessfulMyRequest> {
    return await this.myRequestsService.extend({ user, isSale: false, id });
  }

  @Put('/sell/extend/:id')
  async extendSell(
    @Req() { user },
    @Param('id') id: string,
  ): Promise<ISuccessfulMyRequest> {
    return await this.myRequestsService.extend({ user, isSale: true, id });
  }

  @Delete('/buy/:id')
  async deleteBuy(
    @Req() { user },
    @Param('id') id: string,
  ): Promise<ISuccessfulMyRequest> {
    return await this.myRequestsService.delete({ user, isSale: false, id });
  }

  @Delete('/sell/:id')
  async deleteSell(
    @Req() { user },
    @Param('id') id: string,
  ): Promise<ISuccessfulMyRequest> {
    return await this.myRequestsService.delete({ user, isSale: true, id });
  }
}
