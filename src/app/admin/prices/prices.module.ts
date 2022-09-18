import { Module } from '@nestjs/common';
import { PricesController } from './prices.controller';
import { PricesService } from './prices.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../../common/schemas/users.schema';
import { Ticket, TicketSchema } from '../../../common/schemas/ticket.schema';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Ticket.name, schema: TicketSchema },
    ]),
    AuthModule,
  ],
  controllers: [PricesController],
  providers: [PricesService],
})
export class PricesModule {}
