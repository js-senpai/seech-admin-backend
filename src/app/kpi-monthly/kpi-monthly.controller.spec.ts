import { Test, TestingModule } from '@nestjs/testing';
import { KpiMonthlyController } from './kpi-monthly.controller';

describe('KpiMonthlyController', () => {
  let controller: KpiMonthlyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KpiMonthlyController],
    }).compile();

    controller = module.get<KpiMonthlyController>(KpiMonthlyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
