import { Module } from '@nestjs/common';
import { KpiController } from './kpi.controller';
import { KpiService } from './kpi.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../common/schemas/users.schema';
import { AuthModule } from '../auth/auth.module';
import { Ticket, TicketSchema } from '../../common/schemas/ticket.schema';
import {
  ReviewOfService,
  ReviewOfServiceSchema,
} from '../../common/schemas/reviewOfService.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Ticket.name, schema: TicketSchema },
      { name: ReviewOfService.name, schema: ReviewOfServiceSchema },
    ]),
    AuthModule,
  ],
  controllers: [KpiController],
  providers: [KpiService],
})
export class KpiModule {}
