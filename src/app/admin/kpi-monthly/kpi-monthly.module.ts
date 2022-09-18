import { Module } from '@nestjs/common';
import { KpiMonthlyController } from './kpi-monthly.controller';
import { KpiMonthlyService } from './kpi-monthly.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../../common/schemas/users.schema';
import { Ticket, TicketSchema } from '../../../common/schemas/ticket.schema';
import {
  ReviewOfService,
  ReviewOfServiceSchema,
} from '../../../common/schemas/reviewOfService.schema';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Ticket.name, schema: TicketSchema },
      { name: ReviewOfService.name, schema: ReviewOfServiceSchema },
    ]),
    AuthModule,
  ],
  controllers: [KpiMonthlyController],
  providers: [KpiMonthlyService],
})
export class KpiMonthlyModule {}
