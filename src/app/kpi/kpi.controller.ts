import { Controller, Get, UseGuards } from '@nestjs/common';
import { KpiService } from './kpi.service';
import { GetKpiStatisticInterface } from './kpi.interfaces';
import { AuthGuard } from '@nestjs/passport';

@Controller('kpi')
@UseGuards(AuthGuard())
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}

  @Get()
  async get(): Promise<GetKpiStatisticInterface> {
    return await this.kpiService.get();
  }
}
