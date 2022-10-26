import { Module } from '@nestjs/common';
import { MyRequestsController } from './my-requests.controller';
import { MyRequestsService } from './my-requests.service';
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
  controllers: [MyRequestsController],
  providers: [MyRequestsService],
})
export class MyRequestsModule {}
