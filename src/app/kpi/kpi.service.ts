import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../common/schemas/users.schema';
import { Model } from 'mongoose';
import {
  ReviewOfService,
  ReviewOfServiceDocument,
} from '../../common/schemas/reviewOfService.schema';
import { Ticket, TicketDocument } from '../../common/schemas/ticket.schema';
import { GetKpiStatisticInterface } from './kpi.interfaces';
import * as moment from 'moment';

@Injectable()
export class KpiService {
  private readonly logger = new Logger(KpiService.name);
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
    @InjectModel(ReviewOfService.name)
    private readonly reviewOfServiceModel: Model<ReviewOfServiceDocument>,
  ) {}

  async get({
    startDate = moment().set('date', 1),
    endDate = moment(),
    region,
    state,
    otg,
    types,
    subtypes,
    active,
  }): Promise<GetKpiStatisticInterface> {
    try {
      const getReviewsIds = await this.reviewOfServiceModel.find();
      const filteredReviewsIds = getReviewsIds.filter(
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
      );
      const getAvgReview = getReviewsIds.length
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
          ])
        : [];
      const { rate = 0 } = filteredReviewsIds.length
        ? getAvgReview[0]
        : { rate: 0 };
      const getUsers = await this.userModel.find({
        ...(region && {
          region: {
            $in: region.split(','),
          },
        }),
        ...(state && {
          countryState: {
            $in: state.split(','),
          },
        }),
        ...(otg && {
          countryOtg: {
            $in: otg.split(','),
          },
        }),
      });
      const filteredUsers = getUsers.filter(
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
      );
      const getTotalBuyTickets = await this.ticketModel.find({
        sale: false,
        ...(typeof active !== 'undefined' && {
          active,
        }),
        authorId: {
          $in: filteredUsers.map(({ userId }) => userId),
        },
        ...((types || subtypes) && {
          culture: {
            $in: [...types.split(','), ...subtypes.split(',')],
          },
        }),
      });
      const filteredTotalBuyTickets = getTotalBuyTickets.filter(
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
      );
      const getTotalSaleTickets = await this.ticketModel.find({
        sale: true,
        ...(typeof active !== 'undefined' && {
          active,
        }),
        authorId: {
          $in: filteredUsers.map(({ userId }) => userId),
        },
        ...((types || subtypes) && {
          culture: {
            $in: [...types.split(','), ...subtypes.split(',')],
          },
        }),
      });
      const filteredTotalSaleTickets = getTotalSaleTickets.filter(
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
      );
      const getActiveUsers =
        filteredTotalBuyTickets.length && filteredTotalSaleTickets.length
          ? await this.userModel.find({
              userId: {
                $in: [
                  ...filteredTotalSaleTickets.map(({ authorId }) => authorId),
                  ...filteredTotalBuyTickets.map(({ authorId }) => authorId),
                ],
              },
              ...(region && {
                region: {
                  $in: region.split(','),
                },
              }),
              ...(state && {
                countryState: {
                  $in: state.split(','),
                },
              }),
              ...(otg && {
                countryOtg: {
                  $in: otg.split(','),
                },
              }),
            })
          : [];
      const filteredActiveUsers = getActiveUsers.filter(
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
      );
      return {
        items: [
          {
            totalBuyTickets: filteredTotalBuyTickets.length,
            totalSaleTickets: filteredTotalSaleTickets.length,
            totalUsers: filteredUsers.length,
            activeUsers: filteredActiveUsers.length,
            ratingOfService: +rate.toFixed(2),
          },
        ],
      };
    } catch (e) {
      this.logger.error(`Error in get kpi statistic method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in get kpi statistic method.  ${e}`,
      );
    }
  }
}
