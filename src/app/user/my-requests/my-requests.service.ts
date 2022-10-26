import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../common/schemas/users.schema';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from '../../../common/schemas/ticket.schema';
import { I18nService } from 'nestjs-i18n';
import { RoleDecorator } from '../../../common/decorators/role.decorator';
import * as moment from 'moment';
import {
  GetMyRequestsInterface,
  ISuccessfulMyRequest,
  ITotalMyRequests,
} from './my-requests.interface';
import { ActionMyRequestsDto, MyRequestsDto } from './my-requests.dto';

@Injectable()
export class MyRequestsService {
  private readonly logger = new Logger(MyRequestsService.name);
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
    private readonly i18n: I18nService,
  ) {}

  @RoleDecorator(['user'])
  async getTotal({
    startDate = '',
    endDate = '',
    types = '',
    subtypes = '',
    user,
  }: MyRequestsDto & {
    user: User;
  }): Promise<ITotalMyRequests> {
    try {
      const typesList = types.split(',').flatMap((name) =>
        Object.values(
          this.i18n.translate(`index.productsList.${name}List`, {
            lang: 'ua',
          }),
        ),
      );
      const getTotalSellTickets = await this.ticketModel.find(
        {
          sale: true,
          active: true,
          authorId: user.userId,
          ...((types || subtypes) && {
            culture: {
              $in: [...typesList, ...subtypes.split(',')],
            },
          }),
        },
        null,
        {
          createdAt: -1,
        },
      );
      const filteredTotalSellTickets = (
        startDate && endDate
          ? getTotalSellTickets.filter(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ({ createdAt }) =>
                createdAt &&
                moment(createdAt).isBetween(
                  moment(startDate, 'DD-MM-YYYY'),
                  moment(endDate, 'DD-MM-YYYY'),
                  'day',
                  '[]',
                ),
            )
          : getTotalSellTickets
      ).filter(
        ({ date }) =>
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          Date.now() - date <= 24 * 60 * 60 * 1000,
      );
      const getTotalBuyTickets = await this.ticketModel.find(
        {
          sale: false,
          active: true,
          authorId: user.userId,
          ...((types || subtypes) && {
            culture: {
              $in: [...typesList, ...subtypes.split(',')],
            },
          }),
        },
        null,
        {
          createdAt: -1,
        },
      );
      const filteredTotalBuyTickets = (
        startDate && endDate
          ? getTotalBuyTickets.filter(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ({ createdAt }) =>
                createdAt &&
                moment(createdAt).isBetween(
                  moment(startDate, 'DD-MM-YYYY'),
                  moment(endDate, 'DD-MM-YYYY'),
                  'day',
                  '[]',
                ),
            )
          : getTotalBuyTickets
      ).filter(
        ({ date }) =>
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          Date.now() - date <= 24 * 60 * 60 * 1000,
      );
      return {
        totalBuy: filteredTotalBuyTickets.length,
        totalSell: filteredTotalSellTickets.length,
      };
    } catch (e) {
      this.logger.error(`Error in get total my requests method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in get total my requests method.  ${e}`,
      );
    }
  }

  @RoleDecorator(['user'])
  async get({
    startDate = '',
    endDate = '',
    types = '',
    subtypes = '',
    user,
    isSale = true,
  }: MyRequestsDto & {
    user: User;
    isSale: boolean;
  }): Promise<GetMyRequestsInterface> {
    try {
      const typesList = types.split(',').flatMap((name) =>
        Object.values(
          this.i18n.translate(`index.productsList.${name}List`, {
            lang: 'ua',
          }),
        ),
      );
      const getTotalTickets = await this.ticketModel.find(
        {
          sale: isSale,
          active: true,
          authorId: user.userId,
          ...((types || subtypes) && {
            culture: {
              $in: [...typesList, ...subtypes.split(',')],
            },
          }),
        },
        null,
        {
          createdAt: -1,
        },
      );
      const filteredTotalTickets = (
        startDate && endDate
          ? getTotalTickets.filter(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ({ createdAt }) =>
                createdAt &&
                moment(createdAt).isBetween(
                  moment(startDate, 'DD-MM-YYYY'),
                  moment(endDate, 'DD-MM-YYYY'),
                  'day',
                  '[]',
                ),
            )
          : getTotalTickets
      ).filter(
        ({ date }) =>
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          Date.now() - date <= 24 * 60 * 60 * 1000,
      );
      const response: GetMyRequestsInterface = {
        items: [],
      };
      const { region, countryState, countryOtg, name, phone } = user;
      for (const {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        createdAt,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        updatedAt,
        culture,
        description = '',
        weight,
        _id,
        weightType = 'not set',
        price,
      } of filteredTotalTickets) {
        if (createdAt) {
          response.items.push({
            _id,
            updatedAt,
            title: culture,
            weight,
            weightType,
            region,
            state: countryState,
            otg: countryOtg,
            author: name,
            phone,
            description,
            price,
          });
        }
      }
      return response;
    } catch (e) {
      this.logger.error(`Error in get my requests method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in get my requests method.  ${e}`,
      );
    }
  }

  @RoleDecorator(['user'])
  async complete({
    id,
    user,
    isSale,
  }: ActionMyRequestsDto & {
    user: User;
    isSale: boolean;
  }): Promise<ISuccessfulMyRequest> {
    try {
      await this.ticketModel.updateOne(
        {
          _id: id,
          authorId: user.userId,
          sale: isSale,
        },
        {
          active: false,
          completed: true,
        },
      );
      return {
        ok: 'Ticket has successfully completed',
      };
    } catch (e) {
      this.logger.error(`Error in complete my requests method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in complete my requests method.  ${e}`,
      );
    }
  }

  @RoleDecorator(['user'])
  async delete({
    id,
    user,
    isSale,
  }: ActionMyRequestsDto & {
    user: User;
    isSale: boolean;
  }): Promise<ISuccessfulMyRequest> {
    try {
      await this.ticketModel.updateOne(
        {
          _id: id,
          authorId: user.userId,
          sale: isSale,
        },
        {
          active: false,
          completed: true,
        },
      );
      await this.userModel.updateMany(
        {
          basket: {
            id,
          },
        },
        {
          $pull: {
            basket: {
              id,
            },
          },
        },
      );
      return {
        ok: 'Ticket has successfully deleted',
      };
    } catch (e) {
      this.logger.error(`Error in delete my requests method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in delete my requests method.  ${e}`,
      );
    }
  }

  @RoleDecorator(['user'])
  async extend({
    id,
    user,
    isSale,
  }: ActionMyRequestsDto & {
    user: User;
    isSale: boolean;
  }): Promise<ISuccessfulMyRequest> {
    try {
      const ticket = await this.ticketModel.findOne({
        _id: id,
        authorId: user.userId,
        isSale,
      });
      if (!ticket) {
        throw new NotFoundException(`Ticket with id ${id} not found`);
      }
      await this.ticketModel.updateOne({
        date: new Date(),
        active: true,
        numberOfExtends: ticket.numberOfExtends + 1,
      });
      return {
        ok: 'Ticket has successfully extended',
      };
    } catch (e) {
      this.logger.error(`Error in extend my requests method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in extend my requests method.  ${e}`,
      );
    }
  }
}
