import { Test, TestingModule } from '@nestjs/testing';
import { KpiMonthlyService } from './kpi-monthly.service';

describe('KpiMonthlyService', () => {
  let service: KpiMonthlyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KpiMonthlyService],
    }).compile();

    service = module.get<KpiMonthlyService>(KpiMonthlyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
