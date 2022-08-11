import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { KpiMonthlyService } from './kpi-monthly.service';
import KpiMonthlyDto from './kpi-monthly.dto';
import { GetKpiMonthlyStatisticInterface } from './kpi-monthly.interfaces';

@Controller('kpi-monthly')
@UseGuards(AuthGuard())
export class KpiMonthlyController {
  constructor(private readonly kpiMonthlyService: KpiMonthlyService) {}

  @Get()
  async get(
    @Query() query: KpiMonthlyDto,
  ): Promise<GetKpiMonthlyStatisticInterface> {
    return await this.kpiMonthlyService.get({ ...query });
  }
}
