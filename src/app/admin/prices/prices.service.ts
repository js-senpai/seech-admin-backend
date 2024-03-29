import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { GetPricesInterface } from './prices.interfaces';
import PricesDto from './prices.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../common/schemas/users.schema';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from '../../../common/schemas/ticket.schema';
import * as moment from 'moment/moment';
import { I18nService } from 'nestjs-i18n';
import { RoleDecorator } from '../../../common/decorators/role.decorator';

@Injectable()
export class PricesService {
  private readonly logger = new Logger(PricesService.name);
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
    private readonly i18n: I18nService,
  ) {}

  @RoleDecorator(['admin', 'moderator'])
  async get({
    startDate = '',
    endDate = '',
    regions = '',
    states = '',
    otg = '',
  }: PricesDto & {
    user: User;
  }): Promise<GetPricesInterface> {
    try {
      const response: GetPricesInterface = {
        items: [],
      };
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
      const getTotalSaleTickets = await this.ticketModel.find({
        authorId: {
          $in: getUsers.map(({ userId }) => userId),
        },
      });
      const filteredTotalSaleTickets =
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
      const getTicketsIds = filteredTotalSaleTickets.map(({ _id }) => _id);
      const getProducts = await this.i18n.translate('index.productsList', {
        lang: 'ua',
      });
      for (const localeName of Object.keys(getProducts)) {
        const result = {
          name: localeName,
          list: [],
        };
        if (typeof getProducts[localeName] === 'object') {
          for (const property in getProducts[localeName]) {
            const [value] = getTicketsIds.length
              ? await this.ticketModel.aggregate([
                  {
                    $match: {
                      sale: true,
                      culture: {
                        $in: [
                          getProducts[localeName][property],
                          getProducts[localeName][property].replace(
                            /[^a-zа-яё]/gi,
                            '',
                          ),
                        ],
                      },
                      _id: {
                        $in: getTicketsIds,
                      },
                    },
                  },
                  {
                    $group: {
                      _id: 'authorId',
                      avg: { $avg: '$price' },
                    },
                  },
                ])
              : [{ avg: 0 }];
            result.list.push({
              name: property,
              value: (value?.avg || 0).toFixed(2),
            });
          }
        }
        response.items.push(result);
      }
      return response;
    } catch (e) {
      this.logger.error(`Error in get price statistic method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in get price statistic method.  ${e}`,
      );
    }
  }
}
