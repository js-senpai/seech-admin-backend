import { Test, TestingModule } from '@nestjs/testing';
import { SellProductsController } from './sell-products.controller';

describe('BuyProductsController', () => {
  let controller: SellProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellProductsController],
    }).compile();

    controller = module.get<SellProductsController>(SellProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
