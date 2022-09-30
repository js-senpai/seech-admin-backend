import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../common/schemas/users.schema';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from '../../../common/schemas/ticket.schema';
import { I18nService } from 'nestjs-i18n';
import { RoleDecorator } from '../../../common/decorators/role.decorator';
import SellProductsDto from '../sell-products/sell-products.dto';
import { GetProductsInterface } from '../../../common/interfaces/products.interfaces';
import * as moment from 'moment/moment';

@Injectable()
export class BuyProductsService {
  private readonly logger = new Logger(BuyProductsService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
    private readonly i18n: I18nService,
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
      const typesList = types.split(',').flatMap((name) =>
        Object.values(
          this.i18n.translate(`index.productsList.${name}List`, {
            lang: 'ua',
          }),
        ),
      );
      const getTotalBuyTickets = await this.ticketModel.find(
        {
          sale: false,
          active: true,
          authorId: {
            $in: getUsers.map(({ userId }) => userId),
          },
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
      const response: GetProductsInterface = {
        items: [],
      };
      for (const {
        authorId,
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
