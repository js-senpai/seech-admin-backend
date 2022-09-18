import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../common/schemas/users.schema';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from '../../../common/schemas/ticket.schema';
import {
  ReviewOfService,
  ReviewOfServiceDocument,
} from '../../../common/schemas/reviewOfService.schema';
import * as moment from 'moment/moment';
import { GetKpiMonthlyStatisticInterface } from './kpi-monthly.interfaces';
import KpiMonthlyDto from './kpi-monthly.dto';
import { RoleDecorator } from '../../../common/decorators/role.decorator';

@Injectable()
export class KpiMonthlyService {
  private readonly logger = new Logger(KpiMonthlyService.name);
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
    @InjectModel(ReviewOfService.name)
    private readonly reviewOfServiceModel: Model<ReviewOfServiceDocument>,
  ) {}

  @RoleDecorator(['admin', 'moderator'])
  async get({
    regions = '',
    states = '',
    otg = '',
    types = '',
    subtypes = '',
  }: KpiMonthlyDto & {
    user: User;
  }): Promise<GetKpiMonthlyStatisticInterface> {
    try {
      const response: GetKpiMonthlyStatisticInterface = {
        items: [],
      };
      const getAllMonths = moment.months();
      const findCurrentMonth = getAllMonths.findIndex(
        (item) => item === moment().format('MMMM'),
      );
      const getPrevMonths = getAllMonths.slice(0, findCurrentMonth + 1);
      const getReviewsIds = await this.reviewOfServiceModel.find({}, null, {
        sort: {
          createdAt: -1,
        },
      });
      const getUsers = await this.userModel.find(
        {
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
        },
        null,
        {
          sort: {
            createdAt: -1,
          },
        },
      );
      for (const month of getPrevMonths) {
        const getDate = moment(month, 'MMMM');
        const filteredReviewsIds = getReviewsIds.filter(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ({ createdAt }) =>
            createdAt &&
            moment(createdAt).isSame(getDate, 'year') &&
            moment(createdAt).isSame(getDate, 'month'),
        );
        const getAvgReview = filteredReviewsIds.length
          ? await this.reviewOfServiceModel.aggregate([
              {
                $match: {
                  _id: {
                    $in: filteredReviewsIds.map(({ _id }) => _id),
                  },
                },
              },
              {
                $group: {
                  _id: 'userId',
                  rate: { $avg: '$value' },
                },
              },
              {
                $sort: {
                  createdAt: -1,
                },
              },
            ])
          : [];
        const { rate = 0 } = filteredReviewsIds.length
          ? getAvgReview[0]
          : { rate: 0 };
        const filteredUsers = getUsers.filter(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ({ createdAt }) =>
            createdAt &&
            moment(createdAt).isSame(getDate, 'year') &&
            moment(createdAt).isSame(getDate, 'month'),
        );
        const getTotalBuyTickets = await this.ticketModel.find(
          {
            sale: false,
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
            sort: {
              createdAt: -1,
            },
          },
        );
        const filteredTotalBuyTickets = getTotalBuyTickets.filter(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ({ createdAt }) =>
            createdAt &&
            moment(createdAt).isSame(getDate, 'year') &&
            moment(createdAt).isSame(getDate, 'month'),
        );
        const getTotalSaleTickets = await this.ticketModel.find(
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
            sort: {
              createdAt: -1,
            },
          },
        );
        const filteredTotalSaleTickets = getTotalSaleTickets.filter(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ({ createdAt }) =>
            createdAt &&
            moment(createdAt).isSame(getDate, 'year') &&
            moment(createdAt).isSame(getDate, 'month'),
        );
        const getActiveUsers =
          filteredTotalBuyTickets.length && filteredTotalSaleTickets.length
            ? await this.userModel.find(
                {
                  userId: {
                    $in: [
                      ...filteredTotalSaleTickets.map(
                        ({ authorId }) => authorId,
                      ),
                      ...filteredTotalBuyTickets.map(
                        ({ authorId }) => authorId,
                      ),
                    ],
                  },
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
                },
                null,
                {
                  sort: {
                    createdAt: -1,
                  },
                },
              )
            : [];
        const filteredActiveUsers = getActiveUsers.filter(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ({ createdAt }) =>
            createdAt &&
            moment(createdAt).isSame(getDate, 'year') &&
            moment(createdAt).isSame(getDate, 'month'),
        );
        response.items.push({
          date: getDate.format('MM.YYYY'),
          totalBuyTickets: filteredTotalBuyTickets.length,
          totalSaleTickets: filteredTotalSaleTickets.length,
          totalUsers: filteredUsers.length,
          activeUsers: filteredActiveUsers.length,
          ratingOfService: +rate.toFixed(2),
        });
      }
      return response;
    } catch (e) {
      this.logger.error(`Error in get kpi statistic method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in get kpi statistic method.  ${e}`,
      );
    }
  }
}
