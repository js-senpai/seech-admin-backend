import { Test, TestingModule } from '@nestjs/testing';
import { TicketsBuyService } from './tickets-buy.service';

describe('TicketsBuyService', () => {
  let service: TicketsBuyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketsBuyService],
    }).compile();

    service = module.get<TicketsBuyService>(TicketsBuyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
