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
      if (getTicket.authorId.toString() === user.userId.toString()) {
        throw new ForbiddenException('You cant add own ticket to basket!');
      }
      if (user.basket.findIndex(({ id }) => ticketId === id) !== -1) {
        throw new ForbiddenException('The ticket has already added to basket!');
      }
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

  @RoleDecorator(['user'])
  async delete({
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
        throw new ForbiddenException('You cant delete own ticket from basket!');
      }
      await this.userModel.updateOne(
        {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          _id: user._id,
        },
        {
          $pull: {
            basket: {
              id: ticketId,
            },
          },
        },
      );
      return {
        ok: 'Ticket has successfully removed basket',
      };
    } catch (e) {
      this.logger.error(`Error in delete ticket from basket method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in delete ticket from basket method.  ${e}`,
      );
    }
  }
}
