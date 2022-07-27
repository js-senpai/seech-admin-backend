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

  async get(): Promise<GetKpiStatisticInterface> {
    try {
      const getReviewsIds = await this.reviewOfServiceModel.find();
      const getAvgReview = getReviewsIds.length
        ? await this.reviewOfServiceModel.aggregate([
            {
              $match: {
                _id: {
                  $in: getReviewsIds.map(({ _id }) => _id),
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
      const { rate = 0 } = getReviewsIds.length ? getAvgReview[0] : { rate: 0 };
      return {
        items: [
          {
            totalBuyTickets: await this.ticketModel.count({ sale: false }),
            totalSaleTickets: await this.ticketModel.count({ sale: true }),
            totalUsers: await this.userModel.count(),
            totalNewReg: await this.userModel.count(),
            activeUsers: await this.userModel.count(),
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
