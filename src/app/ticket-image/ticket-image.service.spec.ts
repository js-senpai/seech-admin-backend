import { Test, TestingModule } from '@nestjs/testing';
import { TicketImageService } from './ticket-image.service';

describe('TicketImageService', () => {
  let service: TicketImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketImageService],
    }).compile();

    service = module.get<TicketImageService>(TicketImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
