import { Module } from '@nestjs/common';
import { BuyProductsService } from './buy-products.service';
import { BuyProductsController } from './buy-products.controller';
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
  providers: [BuyProductsService],
  controllers: [BuyProductsController],
})
export class BuyProductsModule {}
