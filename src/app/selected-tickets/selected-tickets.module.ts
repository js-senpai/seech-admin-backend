import { Module } from '@nestjs/common';
import { SelectedTicketsService } from './selected-tickets.service';
import { SelectedTicketsController } from './selected-tickets.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import {
  SelectedSaleTickets,
  SelectedSaleTicketsSchema,
} from '../../common/schemas/selectedSaleTickets.schema';
import {
  SelectedBuyTickets,
  SelectedBuyTicketsSchema,
} from '../../common/schemas/selectedBuyTickets.schema';
import { User, UserSchema } from '../../common/schemas/users.schema';
import { Ticket, TicketSchema } from '../../common/schemas/ticket.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SelectedSaleTickets.name, schema: SelectedSaleTicketsSchema },
      { name: SelectedBuyTickets.name, schema: SelectedBuyTicketsSchema },
      { name: User.name, schema: UserSchema },
      { name: Ticket.name, schema: TicketSchema },
    ]),
    AuthModule,
  ],
  providers: [SelectedTicketsService],
  controllers: [SelectedTicketsController],
})
export class SelectedTicketsModule {}
