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
import { CreateSellProductsDto, SellProductsDto } from './sell-products.dto';
import { GetProductsInterface } from '../../../common/interfaces/products.interfaces';
import { RoleDecorator } from '../../../common/decorators/role.decorator';
import { I18nService } from 'nestjs-i18n';
import {
  ReviewOfSeller,
  ReviewOfSellerDocument,
} from '../../../common/schemas/reviewOfSeller.schema';
import { SchedulerRegistry } from '@nestjs/schedule';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ICreateSellProducts } from './sell-products.interface';

@Injectable()
export class SellProductsService {
  private readonly logger = new Logger(SellProductsService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
    @InjectModel(ReviewOfSeller.name)
    private readonly reviewOfSellerModel: Model<ReviewOfSellerDocument>,
    private readonly i18n: I18nService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
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
      const getTotalSaleTickets = await this.ticketModel.find(
        {
          sale: true,
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
      } of filteredTotalSaleTickets) {
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
              ownTicket: authorId.toString() === user.userId.toString(),
              inBasket:
                user.basket.findIndex(
                  ({ id }) => id.toString() === _id.toString(),
                ) !== -1,
            });
          }
        }
      }
      return response;
    } catch (e) {
      this.logger.error(`Error in get sell products method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in get sell products method.  ${e}`,
      );
    }
  }

  @RoleDecorator(['user'])
  async create({
    typeCode,
    subtypeCode,
    subtype,
    price,
    weight,
    description,
    photoUrl,
    user,
  }: CreateSellProductsDto & {
    user: User;
  }): Promise<ICreateSellProducts> {
    try {
      let weightType = 'kilogram';
      const cultureWithLiters = ['honey', 'milk', 'sourCream'];
      const cultureWithTon = ['wheat', 'barley', 'corn', 'buckwheat', 'soy'];
      if (
        cultureWithLiters.includes(subtypeCode) ||
        cultureWithLiters.includes(typeCode)
      ) {
        weightType = 'liter';
      } else if (
        cultureWithTon.includes(subtypeCode) ||
        cultureWithTon.includes(typeCode)
      ) {
        weightType = 'weightTon';
      } else if (subtypeCode === 'egg') {
        weightType = 'amount';
      }
      // Create new ticket
      const newTicket = await this.ticketModel.create({
        sale: true,
        authorId: user.userId,
        weight,
        weightType,
        price,
        description,
        culture: subtype,
        photoUrl,
        active: true,
        date: new Date(),
        waitingForReview: false,
      });
      await this.userModel.updateOne(
        {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          _id: user._id,
        },
        {
          state: `createTicketFromApp_${newTicket._id}`,
        },
      );
      let weightValue;
      switch (newTicket.weightType) {
        case 'liter':
          weightValue = 'volumeValue';
          break;
        case 'weight':
          weightValue = 'weightValue';
          break;
        case 'weightTon':
          weightValue = 'weightTonValue';
          break;
        case 'amount':
          weightValue = 'amountValue';
          break;
        default:
          weightValue = 'weightValue';
      }
      let weightName;
      switch (newTicket.weightType) {
        case 'liter':
          weightName = 'volume';
          break;
        case 'weight':
        case 'weightTon':
          weightName = 'weight';
          break;
        case 'amount':
          weightName = 'amount';
          break;
        default:
          weightName = 'weight';
      }
      const ownText = this.i18n.translate(
        `index.telegram.schedule.sellingTicketOwn`,
        {
          lang: 'ua',
          args: {
            culture: subtype,
            active: newTicket.active
              ? this.i18n.translate('index.telegram.buttons.yes', {
                  lang: 'ua',
                })
              : this.i18n.translate('index.telegram.buttons.no', {
                  lang: 'ua',
                }),
            price: newTicket.price,
            weightValue: this.i18n.translate(`index.types.${weightValue}`, {
              lang: 'ua',
            }),
            weightName: this.i18n.translate(`index.types.${weightName}`, {
              lang: 'ua',
            }),
            weight: newTicket.weight,
            date: moment(newTicket.date).format('DD.MM.YYYY HH:mm'),
            description: newTicket.description,
          },
        },
      );
      const text = `${ownText}\n${this.i18n.translate(
        `index.telegram.schedule.acceptTicket`,
        {
          lang: 'ua',
        },
      )}`;
      await axios.post(
        `https://api.telegram.org/bot${this.configService.get(
          'TELEGRAM_TOKEN',
        )}/sendMessage`,
        {
          chat_id: user.userId,
          text,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: this.i18n.translate(
                    'index.telegram.buttons.acceptTicket',
                    {
                      lang: 'ua',
                    },
                  ),
                  callback_data: JSON.stringify({
                    command: 'createTicketFromApp',
                  }),
                },
              ],
            ],
          },
        },
      );
      const callback = async () => {
        const { modifiedCount } = await newTicket.updateOne({
          active: false,
        });
        if (modifiedCount) {
          await axios.post(
            `https://api.telegram.org/bot${this.configService.get(
              'TELEGRAM_TOKEN',
            )}/sendMessage`,
            {
              chat_id: user.userId,
              text: this.i18n.translate(`index.telegram.schedule.extend`, {
                lang: 'ua',
              }),
              parse_mode: 'HTML',
            },
          );
          await axios.post(
            `https://api.telegram.org/bot${this.configService.get(
              'TELEGRAM_TOKEN',
            )}/sendMessage`,
            {
              chat_id: user.userId,
              text: ownText,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboards: [
                  [
                    {
                      text: this.i18n.translate(
                        `index.telegram.buttons.completed`,
                        {
                          lang: 'ua',
                        },
                      ),
                      callback_data: `completed_${newTicket._id}`,
                      hide: false,
                    },
                  ],
                  [
                    {
                      text: this.i18n.translate(
                        `index.telegram.buttons.remove`,
                        {
                          lang: 'ua',
                        },
                      ),
                      callback_data: `remove_${newTicket._id}`,
                      hide: false,
                    },
                  ],
                ],
              },
            },
          );
        }
      };
      const interval = setTimeout(callback, 24 * 60 * 60000);
      this.schedulerRegistry.addTimeout(
        `checkActiveSellTicket__${newTicket._id}`,
        interval,
      );
      return {
        ok: 'New ticket has been created successfully',
      };
    } catch (e) {
      this.logger.error(`Error in create sell products method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in create sell products method.  ${e}`,
      );
    }
  }
}
