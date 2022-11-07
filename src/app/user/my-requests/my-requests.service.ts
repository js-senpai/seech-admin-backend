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
import { ActionMyRequestsDto, MyRequestsDto } from './my-requests.dto';
import {
  GetRequestsInterface,
  ISuccessfulRequest,
  ITotalRequests,
} from '../../../common/interfaces/requests.interfaces';

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
  }): Promise<ITotalRequests> {
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
          deleted: false,
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
      const filteredTotalSellTickets =
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
          : getTotalSellTickets;
      const getTotalBuyTickets = await this.ticketModel.find(
        {
          sale: false,
          deleted: false,
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
      const filteredTotalBuyTickets =
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
          : getTotalBuyTickets;
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
  }): Promise<GetRequestsInterface> {
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
          deleted: false,
          sale: isSale,
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
      const filteredTotalTickets =
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
          : getTotalTickets;
      const response: GetRequestsInterface = {
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
        photoUrl,
        date,
      } of filteredTotalTickets) {
        if (createdAt) {
          response.items.push({
            _id,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            active: Date.now() - date <= 24 * 60 * 60 * 1000,
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
            ...(isSale && {
              img: photoUrl,
            }),
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
  }: ActionMyRequestsDto & {
    user: User;
  }): Promise<ISuccessfulRequest> {
    try {
      await this.ticketModel.updateOne(
        {
          _id: id,
          authorId: user.userId,
        },
        {
          active: false,
          completed: true,
          waitingForReview: true,
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
  }: ActionMyRequestsDto & {
    user: User;
  }): Promise<ISuccessfulRequest> {
    try {
      await this.ticketModel.updateOne(
        {
          _id: id,
          authorId: user.userId,
        },
        {
          active: false,
          deleted: true,
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
  }: ActionMyRequestsDto & {
    user: User;
  }): Promise<ISuccessfulRequest> {
    try {
      const ticket = await this.ticketModel.findOne({
        _id: id,
        authorId: user.userId,
      });
      if (!ticket) {
        throw new NotFoundException(`Ticket with id ${id} not found`);
      }
      await this.ticketModel.updateOne(
        {
          _id: id,
          authorId: user.userId,
        },
        {
          date: new Date(),
          active: true,
          numberOfExtends: ticket.numberOfExtends + 1,
        },
      );
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
