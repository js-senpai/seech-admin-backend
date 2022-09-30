import { Test, TestingModule } from '@nestjs/testing';
import { BuyProductsController } from './buy-products.controller';

describe('BuyProductsController', () => {
  let controller: BuyProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuyProductsController],
    }).compile();

    controller = module.get<BuyProductsController>(BuyProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
