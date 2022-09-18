import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../common/schemas/users.schema';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from '../../../common/schemas/ticket.schema';
import * as moment from 'moment';
import SellProductsDto from './sell-products.dto';
import { GetProductsInterface } from '../../../common/interfaces/products.interfaces';
import { RoleDecorator } from '../../../common/decorators/role.decorator';

@Injectable()
export class SellProductsService {
  private readonly logger = new Logger(SellProductsService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
  ) {}

  @RoleDecorator(['user'])
  async get({
    startDate = '',
    endDate = '',
    regions = '',
    states = '',
    otg = '',
    types = '',
    subtypes = '',
    user,
  }: SellProductsDto & {
    user: User;
  }): Promise<GetProductsInterface> {
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
        !regions && !states && !otg
          ? getUsers.sort((a) => {
              if (a?.region === user?.region) {
                if (a?.countryState === user?.countryState) {
                  if (a?.countryOtg === user?.countryOtg) {
                    return 1;
                  } else {
                    return -1;
                  }
                } else {
                  return -1;
                }
              } else {
                return -1;
              }
            })
          : getUsers;
      const getTotalBuyTickets = await this.ticketModel.find(
        {
          sale: true,
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
      const response: GetProductsInterface = {
        items: [],
      };
      for (const {
        authorId,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        createdAt,
        culture,
        description = '',
        weight,
        _id,
        weightType = 'not set',
        photoUrl,
        price,
      } of filteredTotalBuyTickets) {
        if (createdAt) {
          const getUser = await this.userModel.findOne({
            userId: authorId,
          });
          if (getUser) {
            const { region, countryState, countryOtg, name, phone } = getUser;
            response.items.push({
              _id,
              img: photoUrl,
              createdAt,
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
              ownTicket: authorId === user.userId,
            });
          }
        }
      }
      return response;
    } catch (e) {
      this.logger.error(`Error in get buy products method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in get buy products method.  ${e}`,
      );
    }
  }
}