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
import { AuthGuard } from '@nestjs/passport';
import {
  GetRequestsInterface,
  ISuccessfulRequest,
  ITotalRequests,
} from '../../../common/interfaces/requests.interfaces';

@Controller('my-requests')
@UseGuards(AuthGuard())
export class MyRequestsController {
  constructor(private readonly myRequestsService: MyRequestsService) {}

  @Get('total')
  async getTotal(
    @Query() query: BuyProductsDto,
    @Req() { user },
  ): Promise<ITotalRequests> {
    return await this.myRequestsService.getTotal({ ...query, user });
  }

  @Get('buy')
  async getBuy(
    @Query() query: BuyProductsDto,
    @Req() { user },
  ): Promise<GetRequestsInterface> {
    return await this.myRequestsService.get({ ...query, user, isSale: false });
  }

  @Get('sell')
  async getSell(
    @Query() query: BuyProductsDto,
    @Req() { user },
  ): Promise<GetRequestsInterface> {
    return await this.myRequestsService.get({ ...query, user, isSale: true });
  }

  @Put('/complete/:id')
  async complete(
    @Req() { user },
    @Param('id') id: string,
  ): Promise<ISuccessfulRequest> {
    return await this.myRequestsService.complete({ user, id });
  }

  @Put('/extend/:id')
  async extend(
    @Req() { user },
    @Param('id') id: string,
  ): Promise<ISuccessfulRequest> {
    return await this.myRequestsService.extend({ user, id });
  }

  @Delete('/:id')
  async delete(
    @Req() { user },
    @Param('id') id: string,
  ): Promise<ISuccessfulRequest> {
    return await this.myRequestsService.delete({ user, id });
  }
}
