import { Module } from '@nestjs/common';
import { SellProductsService } from './sell-products.service';
import { SellProductsController } from './sell-products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../../common/schemas/users.schema';
import { Ticket, TicketSchema } from '../../../common/schemas/ticket.schema';
import { AuthModule } from '../../auth/auth.module';
import {
  ReviewOfSeller,
  ReviewOfSellerSchema,
} from '../../../common/schemas/reviewOfSeller.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Ticket.name, schema: TicketSchema },
      { name: ReviewOfSeller.name, schema: ReviewOfSellerSchema },
    ]),
    AuthModule,
  ],
  providers: [SellProductsService],
  controllers: [SellProductsController],
})
export class SellProductsModule {}
