import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../common/schemas/users.schema';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from '../../../common/schemas/ticket.schema';
import * as moment from 'moment/moment';
import { GetTicketsInterface } from '../../../common/interfaces/tickets.interfaces';
import TicketsBuyDto from './tickets-buy.dto';
import {
  SelectedBuyTickets,
  SelectedBuyTicketsDocument,
} from '../../../common/schemas/selectedBuyTickets.schema';
import { RoleDecorator } from '../../../common/decorators/role.decorator';

@Injectable()
export class TicketsBuyService {
  private readonly logger = new Logger(TicketsBuyService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
    @InjectModel(SelectedBuyTickets.name)
    private readonly selectedBuyTicketsModel: Model<SelectedBuyTicketsDocument>,
  ) {}

  @RoleDecorator(['admin', 'moderator'])
  async get({
    startDate = '',
    endDate = '',
    regions = '',
    states = '',
    otg = '',
    types = '',
    subtypes = '',
    active = '',
    sortBy = 'date',
    sortDesc = 'true',
    selected,
    user,
  }: TicketsBuyDto & {
    user: User;
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
      const getSelectedTickets = await this.selectedBuyTicketsModel.findOne({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        userId: user._id,
      });
      const getTotalBuyTickets = await this.ticketModel.find(
        {
          sale: false,
          ...(active === 'true' && {
            active: true,
          }),
          ...(getSelectedTickets?.tickets?.length &&
            selected === 'true' && {
              _id: {
                $in: getSelectedTickets.tickets,
              },
            }),
          authorId: {
            $in: getUsers.map(({ userId }) => userId),
          },
          ...((types || subtypes) && {
            culture: {
              $in: [...types.split(','), ...subtypes.split(',')],
            },
          }),
        },
        null,
        sortBy
          ? {
              sort: {
                ...(sortBy === 'date' && {
                  createdAt: sortDesc === 'true' ? -1 : 1,
                }),
                ...(sortBy === 'col' && {
                  weight: sortDesc === 'true' ? -1 : 1,
                }),
              },
            }
          : null,
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
      ).filter(({ date }) =>
        active === 'true'
          ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            Date.now() - date <= 24 * 60 * 60 * 1000
          : true,
      );
      const response: GetTicketsInterface = {
        items: [],
      };
      for (const {
        authorId,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        createdAt,
        culture,
        active = false,
        description = '',
        weight,
        _id,
        weightType = 'not set',
      } of filteredTotalBuyTickets) {
        if (createdAt) {
          const getUser = await this.userModel.findOne({
            userId: authorId,
          });
          if (getUser) {
            const { region, countryState, countryOtg, name, phone } = getUser;
            response.items.push({
              _id,
              checked: getSelectedTickets?.tickets?.includes(_id),
              date: moment(createdAt).format('DD.MM.YYYY'),
              dateTime: moment(createdAt).format('HH:mm:ss'),
              type: culture,
              col: weight,
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
      return response;
    } catch (e) {
      this.logger.error(`Error in get tickets buy statistic method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in get tickets buy statistic method.  ${e}`,
      );
    }
  }
}
