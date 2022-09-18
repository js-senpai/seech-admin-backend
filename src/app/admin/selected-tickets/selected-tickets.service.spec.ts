import { Test, TestingModule } from '@nestjs/testing';
import { SelectedTicketsService } from './selected-tickets.service';

describe('SelectedTicketsService', () => {
  let service: SelectedTicketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SelectedTicketsService],
    }).compile();

    service = module.get<SelectedTicketsService>(SelectedTicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
