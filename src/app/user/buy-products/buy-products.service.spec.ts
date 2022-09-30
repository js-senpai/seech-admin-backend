import { Test, TestingModule } from '@nestjs/testing';
import { BuyProductsService } from './buy-products.service';

describe('BuyProductsService', () => {
  let service: BuyProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuyProductsService],
    }).compile();

    service = module.get<BuyProductsService>(BuyProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
