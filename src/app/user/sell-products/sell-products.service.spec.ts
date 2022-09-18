import { Test, TestingModule } from '@nestjs/testing';
import { SellProductsService } from './sell-products.service';

describe('BuyProductsService', () => {
  let service: SellProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SellProductsService],
    }).compile();

    service = module.get<SellProductsService>(SellProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
