import { Test, TestingModule } from '@nestjs/testing';
import { TicketsSaleService } from './tickets-sale.service';

describe('TicketsSaleService', () => {
  let service: TicketsSaleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketsSaleService],
    }).compile();

    service = module.get<TicketsSaleService>(TicketsSaleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
