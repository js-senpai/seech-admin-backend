import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../common/schemas/users.schema';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from '../../common/schemas/ticket.schema';
import * as moment from 'moment';
import { GetTicketsInterface } from '../../common/interfaces/tickets.interfaces';

@Injectable()
export class TicketsSaleService {
  private readonly logger = new Logger(TicketsSaleService.name);
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
  ) {}

  async get({
    startDate = '',
    endDate = '',
    regions = '',
    states = '',
    otg = '',
    types = '',
    subtypes = '',
    active = '',
    orderByDate = 'desc',
    orderByCol,
  }): Promise<GetTicketsInterface> {
    try {
      const getUsers = await this.userModel.find({
        ...(regions && {
          region: {
            $in: regions.split(','),
          },
        }),
        ...(states && {
          countryState: {
            $in: states.split(','),
          },
        }),
        ...(otg && {
          countryOtg: {
            $in: otg.split(','),
          },
        }),
      });
      const filteredUsers =
        startDate && endDate
          ? getUsers.filter(
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
          : getUsers;
      const getTotalSaleTickets = await this.ticketModel.find(
        {
          sale: true,
          ...(active && {
            active: active === 'true',
          }),
          authorId: {
            $in: filteredUsers.map(({ userId }) => userId),
          },
          ...((types || subtypes) && {
            culture: {
              $in: [...types.split(','), ...subtypes.split(',')],
            },
          }),
        },
        null,
        orderByDate || orderByCol
          ? {
              sort: {
                ...(orderByDate && {
                  createdAt: orderByDate === 'desc' ? -1 : 1,
                }),
                ...(orderByCol && {
                  weight: orderByCol === 'desc' ? -1 : 1,
                }),
              },
            }
          : null,
      );
      const filteredTotalBuyTickets =
        startDate && endDate
          ? getTotalSaleTickets.filter(
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
          : getTotalSaleTickets;
      const items = [];
      for (const {
        authorId,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        createdAt,
        culture,
        active = false,
        description = '',
        weight,
        price,
        weightType = 'not set',
      } of filteredTotalBuyTickets) {
        if (createdAt) {
          const getUser = await this.userModel.findOne({
            userId: authorId,
          });
          if (getUser) {
            const { region, countryState, countryOtg, name, phone } = getUser;
            items.push({
              date: moment(createdAt).format('DD.MM.YYYY'),
              dateTime: moment(createdAt).format('HH:mm:ss'),
              type: culture,
              col: weight,
              price,
              weightType,
              active,
              region,
              state: countryState,
              otg: countryOtg,
              name,
              phone,
              description,
            });
          }
        }
      }
      return {
        items,
      };
    } catch (e) {
      this.logger.error(`Error in get tickets sale statistic method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in get tickets sale statistic method.  ${e}`,
      );
    }
  }
}
