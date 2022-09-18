import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../common/schemas/users.schema';
import { Model } from 'mongoose';
import {
  ReviewOfService,
  ReviewOfServiceDocument,
} from '../../../common/schemas/reviewOfService.schema';
import { Ticket, TicketDocument } from '../../../common/schemas/ticket.schema';
import { GetKpiStatisticInterface } from './kpi.interfaces';
import * as moment from 'moment';
import KpiDto from './kpi.dto';
import { RoleDecorator } from '../../../common/decorators/role.decorator';

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
  }: KpiDto & {
    user: User;
  }): Promise<GetKpiStatisticInterface> {
    try {
      const getReviewsIds = await this.reviewOfServiceModel.find();
      const filteredReviewsIds =
        startDate && endDate
          ? getReviewsIds.filter(
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
          : getReviewsIds;
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
      const getTotalBuyTickets = await this.ticketModel.find({
        sale: false,
        authorId: {
          $in: filteredUsers.map(({ userId }) => userId),
        },
        ...((types || subtypes) && {
          culture: {
            $in: [...types.split(','), ...subtypes.split(',')],
          },
        }),
      });
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
      const getTotalSaleTickets = await this.ticketModel.find({
        sale: true,
        authorId: {
          $in: filteredUsers.map(({ userId }) => userId),
        },
        ...((types || subtypes) && {
          culture: {
            $in: [...types.split(','), ...subtypes.split(',')],
          },
        }),
      });
      const filteredTotalSaleTickets = (
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
          : getTotalSaleTickets
      ).filter(({ date }) =>
        active === 'true'
          ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            Date.now() - date <= 24 * 60 * 60 * 1000
          : true,
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
            })
          : [];
      const filteredActiveUsers =
        startDate && endDate
          ? getActiveUsers.filter(
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
          : getActiveUsers;
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
