import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../common/schemas/users.schema';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from '../../../common/schemas/ticket.schema';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { BasketDto } from './basket.dto';
import { IAddToBasket, ITotalInBasket } from './basket.interface';
import { RoleDecorator } from '../../../common/decorators/role.decorator';

@Injectable()
export class BasketService {
  private readonly logger = new Logger(BasketService.name);
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
  ) {}

  @RoleDecorator(['user'])
  async addToBasket({
    ticketId,
    user,
  }: BasketDto & {
    user: User;
  }): Promise<IAddToBasket> {
    try {
      const getTicket = await this.ticketModel.findById(ticketId);
      if (!getTicket) {
        throw new NotFoundException(`Ticket with id ${ticketId} not found!`);
      }
      if (getTicket.authorId === user.userId) {
        throw new ForbiddenException('You cant add own ticket to basket!');
      }
      await this.ticketModel.updateOne(
        {
          _id: ticketId,
        },
        {
          active: false,
        },
      );
      await this.userModel.updateOne(
        {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          _id: user._id,
        },
        {
          $addToSet: {
            basket: {
              id: ticketId,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              date: new Date(),
            },
          },
        },
      );
      const callback = async () => {
        await this.ticketModel.updateOne(
          {
            _id: ticketId,
          },
          {
            active: true,
          },
        );
      };
      const interval = setTimeout(callback, 15 * 60000);
      this.schedulerRegistry.addTimeout(
        `checkActiveBuyTicket_${ticketId}`,
        interval,
      );
      return {
        ok: 'Ticket has successfully added to basket',
      };
    } catch (e) {
      this.logger.error(`Error in create add ticket to basket method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in add ticket to basket method.  ${e}`,
      );
    }
  }

  @RoleDecorator(['user'])
  async getTotal({ user }: { user: User }): Promise<ITotalInBasket> {
    try {
      return {
        total: user.basket.length,
      };
    } catch (e) {
      this.logger.error(`Error in get total tickets in basket method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in get total tickets in basket method.  ${e}`,
      );
    }
  }
}
