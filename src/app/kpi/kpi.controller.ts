import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { KpiService } from './kpi.service';
import { GetKpiStatisticInterface } from './kpi.interfaces';
import { AuthGuard } from '@nestjs/passport';

@Controller('kpi')
@UseGuards(AuthGuard())
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}

  @Get()
  async get(@Query() query): Promise<GetKpiStatisticInterface> {
    return await this.kpiService.get({ ...query });
  }
}
