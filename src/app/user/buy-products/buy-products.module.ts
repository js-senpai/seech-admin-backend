import { Module } from '@nestjs/common';
import { BuyProductsService } from './buy-products.service';
import { BuyProductsController } from './buy-products.controller';

@Module({
  providers: [BuyProductsService],
  controllers: [BuyProductsController]
})
export class BuyProductsModule {}
