import { Module } from '@nestjs/common';
import { TicketsSaleController } from './tickets-sale.controller';
import { TicketsSaleService } from './tickets-sale.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../../common/schemas/users.schema';
import { Ticket, TicketSchema } from '../../../common/schemas/ticket.schema';
import { AuthModule } from '../../auth/auth.module';
import {
  SelectedSaleTickets,
  SelectedSaleTicketsSchema,
} from '../../../common/schemas/selectedSaleTickets.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Ticket.name, schema: TicketSchema },
      { name: SelectedSaleTickets.name, schema: SelectedSaleTicketsSchema },
    ]),
    AuthModule,
  ],
  controllers: [TicketsSaleController],
  providers: [TicketsSaleService],
})
export class TicketsSaleModule {}
